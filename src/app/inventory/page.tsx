"use client";

import React, { useEffect, useState, useCallback } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { formatDate } from "@/lib/utils";
import {
  ArrowDownLeft,
  ArrowUpRight,
  SlidersHorizontal,
  History,
  Boxes,
  Plus,
  Minus,
  CheckCircle2,
  AlertTriangle,
  X,
} from "lucide-react";

interface Movement {
  id: string;
  movementType: string;
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  reason: string;
  referenceType?: string | null;
  createdAt: string;
  product: { id: string; name: string; productCode: string; unit: string; district: string };
  batch?: { id: string; batchNumber: string; expiryDate?: string | null } | null;
  performedBy?: { name: string; role: string } | null;
}

interface Batch {
  id: string;
  batchNumber: string;
  quantity: number;
  initialQuantity: number;
  manufactureDate?: string | null;
  expiryDate?: string | null;
  status: string;
  product: { id: string; name: string; productCode: string; unit: string; district: string };
}

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState<"movements" | "batches">("movements");
  const [movements, setMovements] = useState<Movement[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter state for movements
  const [movementFilter, setMovementFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Products lookup for modal selection
  const [productsList, setProductsList] = useState<{ id: string; name: string; productCode: string; unit: string; currentQuantity: number }[]>([]);

  // Action Modals State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"IN" | "OUT" | "ADJUST">("IN");
  const [modalForm, setModalForm] = useState({
    productId: "",
    quantity: 10,
    batchNumber: "",
    expiryDate: "",
    reason: "Routine Stock Movement",
    newQuantity: 0,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch product list for dropdowns
  useEffect(() => {
    fetch("/api/products?limit=100")
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          setProductsList(data.data);
          if (data.data[0]) {
            setModalForm((prev) => ({
              ...prev,
              productId: data.data[0].id,
              batchNumber: `BCH-${Date.now().toString().slice(-6)}`,
            }));
          }
        }
      });
  }, []);

  const fetchMovements = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "25",
      });
      if (movementFilter !== "ALL") params.append("type", movementFilter);

      const res = await fetch(`/api/inventory/movements?${params.toString()}`);
      const json = await res.json();
      if (res.ok) {
        setMovements(json.data);
        setTotalPages(json.pagination.totalPages);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [page, movementFilter]);

  const fetchBatches = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/inventory/batches");
      const json = await res.json();
      if (res.ok) {
        setBatches(json.data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "movements") {
      fetchMovements();
    } else {
      fetchBatches();
    }
  }, [activeTab, fetchMovements, fetchBatches]);

  const handleActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      let endpoint = "/api/inventory/stock-in";
      let payload: Record<string, unknown> = {};

      if (modalType === "IN") {
        endpoint = "/api/inventory/stock-in";
        payload = {
          productId: modalForm.productId,
          quantity: Number(modalForm.quantity),
          batchNumber: modalForm.batchNumber || `BCH-${Date.now().toString().slice(-6)}`,
          expiryDate: modalForm.expiryDate || undefined,
          reason: modalForm.reason,
        };
      } else if (modalType === "OUT") {
        endpoint = "/api/inventory/stock-out";
        payload = {
          productId: modalForm.productId,
          quantity: Number(modalForm.quantity),
          movementType: "OUT",
          reason: modalForm.reason,
        };
      } else {
        endpoint = "/api/inventory/adjust";
        payload = {
          productId: modalForm.productId,
          newQuantity: Number(modalForm.newQuantity),
          reason: modalForm.reason,
        };
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Transaction rejected by server");
      }

      setIsModalOpen(false);
      if (activeTab === "movements") fetchMovements();
      else fetchBatches();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error executing inventory transaction";
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout
      title="Stock Management & Movement Transactions"
      subtitle="Guaranteed Transaction Consistency, Batches & Audit Trail"
      onRefresh={activeTab === "movements" ? fetchMovements : fetchBatches}
    >
      <div className="space-y-4">
        {/* Top Control Bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          {/* Tabs */}
          <div className="flex items-center gap-2 border-b sm:border-b-0 border-slate-200 pb-2 sm:pb-0">
            <button
              onClick={() => setActiveTab("movements")}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
                activeTab === "movements"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <History className="h-4 w-4" />
              <span>Movement Audit Log</span>
            </button>

            <button
              onClick={() => setActiveTab("batches")}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
                activeTab === "batches"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Boxes className="h-4 w-4" />
              <span>Active Inventory Batches</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setModalType("IN");
                setModalForm((prev) => ({
                  ...prev,
                  reason: "Goods Inbound Receipt",
                  batchNumber: `BCH-${Date.now().toString().slice(-6)}`,
                }));
                setIsModalOpen(true);
              }}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-500 transition"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Stock In</span>
            </button>

            <button
              onClick={() => {
                setModalType("OUT");
                setModalForm((prev) => ({ ...prev, reason: "Manual Dispatch / Kitchen Requisition" }));
                setIsModalOpen(true);
              }}
              className="flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white shadow-xs hover:bg-rose-500 transition"
            >
              <Minus className="h-3.5 w-3.5" />
              <span>Stock Out</span>
            </button>

            <button
              onClick={() => {
                setModalType("ADJUST");
                setModalForm((prev) => ({ ...prev, reason: "Physical Stock Mandi Audit" }));
                setIsModalOpen(true);
              }}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Audit Adjust</span>
            </button>
          </div>
        </div>

        {/* View Mode Content */}
        {activeTab === "movements" ? (
          <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            {/* Filter by Movement Type */}
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2.5 bg-slate-50/70 text-xs">
              <span className="font-semibold text-slate-700">Filter Movements:</span>
              <div className="flex items-center gap-1.5">
                {["ALL", "IN", "OUT", "SALE", "ADJUSTMENT", "DAMAGE", "RETURN"].map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setMovementFilter(t);
                      setPage(1);
                    }}
                    className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition ${
                      movementFilter === t
                        ? "bg-slate-900 text-white"
                        : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Date / Time</th>
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4 text-right">Delta</th>
                    <th className="py-3 px-4 text-right">Balance (Old → New)</th>
                    <th className="py-3 px-4">Reason / Reference</th>
                    <th className="py-3 px-4">Auditor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">
                        Loading stock transaction records...
                      </td>
                    </tr>
                  ) : movements.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">
                        No stock movement records found.
                      </td>
                    </tr>
                  ) : (
                    movements.map((m) => {
                      const isIncoming = m.movementType === "IN" || m.movementType === "RETURN";
                      return (
                        <tr key={m.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                            {formatDate(m.createdAt)}
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-900">
                            <div>{m.product.name}</div>
                            <span className="text-[10px] font-mono text-slate-400">
                              {m.product.productCode} • {m.product.district}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold ${
                                isIncoming
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-rose-100 text-rose-800"
                              }`}
                            >
                              {isIncoming ? (
                                <ArrowDownLeft className="h-3 w-3" />
                              ) : (
                                <ArrowUpRight className="h-3 w-3" />
                              )}
                              <span>{m.movementType}</span>
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-slate-900">
                            {isIncoming ? "+" : "-"}
                            {m.quantity} {m.product.unit}
                          </td>
                          <td className="py-3 px-4 text-right text-slate-600 font-mono text-[11px]">
                            {m.previousQuantity} →{" "}
                            <span className="font-semibold text-slate-900">{m.newQuantity}</span>
                          </td>
                          <td className="py-3 px-4 text-slate-700">
                            <div>{m.reason}</div>
                            {m.referenceType && (
                              <span className="text-[10px] text-slate-400 font-mono">
                                Ref: {m.referenceType}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-slate-500 text-[11px]">
                            {m.performedBy?.name || "System Automated"}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Batches View */
          <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Batch Number</th>
                    <th className="py-3 px-4">Product Name</th>
                    <th className="py-3 px-4 text-right">Available Qty</th>
                    <th className="py-3 px-4 text-right">Initial Qty</th>
                    <th className="py-3 px-4">Manufacture Date</th>
                    <th className="py-3 px-4">Expiry Date</th>
                    <th className="py-3 px-4 text-center">Batch Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">
                        Loading inventory batches...
                      </td>
                    </tr>
                  ) : batches.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">
                        No inventory batches recorded.
                      </td>
                    </tr>
                  ) : (
                    batches.map((b) => {
                      const isExpired = b.status === "EXPIRED";
                      return (
                        <tr key={b.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">
                            {b.batchNumber}
                          </td>
                          <td className="py-3 px-4 font-medium text-slate-900">
                            <div>{b.product.name}</div>
                            <span className="text-[10px] text-slate-400">
                              {b.product.district}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-slate-900">
                            {b.quantity} {b.product.unit}
                          </td>
                          <td className="py-3 px-4 text-right text-slate-500">
                            {b.initialQuantity} {b.product.unit}
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {b.manufactureDate ? formatDate(b.manufactureDate) : "N/A"}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`font-medium ${
                                isExpired ? "text-rose-600 font-bold" : "text-slate-800"
                              }`}
                            >
                              {b.expiryDate ? formatDate(b.expiryDate) : "Non-perishable"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                b.status === "ACTIVE"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : b.status === "EXPIRED"
                                  ? "bg-rose-100 text-rose-800"
                                  : "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {b.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Action Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">
                {modalType === "IN"
                  ? "Record Stock In (Inbound Receipt)"
                  : modalType === "OUT"
                  ? "Record Stock Out (Deduction)"
                  : "Audit Stock Adjustment (Reconciliation)"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleActionSubmit} className="mt-4 space-y-3.5 text-xs">
              {formError && (
                <div className="rounded-lg bg-rose-50 p-2.5 text-rose-700 border border-rose-200">
                  {formError}
                </div>
              )}

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Select Product</label>
                <select
                  value={modalForm.productId}
                  onChange={(e) => setModalForm({ ...modalForm, productId: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 p-2 text-slate-900"
                >
                  {productsList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.productCode}) — Current: {p.currentQuantity} {p.unit}
                    </option>
                  ))}
                </select>
              </div>

              {modalType === "ADJUST" ? (
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    New Exact Physical Count
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={modalForm.newQuantity}
                    onChange={(e) => setModalForm({ ...modalForm, newQuantity: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 font-bold"
                  />
                  <p className="mt-1 text-[11px] text-slate-400">
                    System will automatically compute delta and register an audit movement.
                  </p>
                </div>
              ) : (
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Quantity</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={modalForm.quantity}
                    onChange={(e) => setModalForm({ ...modalForm, quantity: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 font-bold"
                  />
                </div>
              )}

              {modalType === "IN" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Batch Number</label>
                    <input
                      type="text"
                      required
                      value={modalForm.batchNumber}
                      onChange={(e) => setModalForm({ ...modalForm, batchNumber: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Expiry Date (Optional)</label>
                    <input
                      type="date"
                      value={modalForm.expiryDate}
                      onChange={(e) => setModalForm({ ...modalForm, expiryDate: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 p-2 text-slate-900"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Reason / Notes</label>
                <input
                  type="text"
                  required
                  value={modalForm.reason}
                  onChange={(e) => setModalForm({ ...modalForm, reason: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 p-2 text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
                >
                  {isSubmitting ? "Processing..." : "Commit Transaction"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
