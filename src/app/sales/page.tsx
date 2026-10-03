"use client";

import React, { useEffect, useState, useCallback } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { formatINR, formatDate } from "@/lib/utils";
import {
  Send,
  Plus,
  Receipt,
  User,
  CreditCard,
  CheckCircle2,
  X,
  Warehouse,
} from "lucide-react";

interface Sale {
  id: string;
  invoiceNumber: string;
  customerName?: string | null;
  customerPhone?: string | null;
  totalAmount: number;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
  createdBy?: { name: string } | null;
  location?: { name: string; zoneCode: string } | null;
  items: {
    id: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    product: { name: string; productCode: string; unit: string };
  }[];
}

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  // New Dispatch Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productsList, setProductsList] = useState<{ id: string; name: string; sellingPrice: number; currentQuantity: number; unit: string }[]>([]);
  const [saleForm, setSaleForm] = useState({
    customerName: "",
    customerPhone: "",
    paymentMethod: "CREDIT" as "CREDIT" | "BANK_TRANSFER" | "UPI" | "CASH",
    productId: "",
    quantity: 1,
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSales = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/sales");
      const json = await res.json();
      if (res.ok) setSales(json.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSales();
    fetch("/api/products?limit=100")
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          setProductsList(data.data);
          if (data.data[0]) {
            setSaleForm((prev) => ({ ...prev, productId: data.data[0].id }));
          }
        }
      });
  }, [fetchSales]);

  const handleCreateSale = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    const selectedProduct = productsList.find((p) => p.id === saleForm.productId);
    if (!selectedProduct) {
      setFormError("Please select a product");
      setIsSubmitting(false);
      return;
    }

    if (saleForm.quantity > selectedProduct.currentQuantity) {
      setFormError(
        `Insufficient inventory. Only ${selectedProduct.currentQuantity} ${selectedProduct.unit} available in stock.`
      );
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: saleForm.customerName || "Commercial Client / Warehouse Transfer",
          customerPhone: saleForm.customerPhone || undefined,
          paymentMethod: saleForm.paymentMethod,
          items: [
            {
              productId: selectedProduct.id,
              quantity: Number(saleForm.quantity),
              unitPrice: selectedProduct.sellingPrice,
            },
          ],
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to process outbound dispatch");
      }

      setIsModalOpen(false);
      fetchSales();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error executing dispatch";
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout
      title="Outbound Dispatches & Stock Issues"
      subtitle="Client Deliveries, Warehouse Issues & Real-Time Stock Depletion"
      onRefresh={fetchSales}
    >
      <div className="space-y-4">
        {/* Header Action Bar */}
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Recorded Outbound Orders & Issues</h2>
            <p className="text-xs text-slate-500">Every dispatch automatically deducts lot inventory and evaluates stock triggers in real-time</p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-500 transition"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create Outbound Dispatch</span>
          </button>
        </div>

        {/* Sales Table */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Dispatch / Invoice #</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Recipient / Client</th>
                  <th className="py-3 px-4">Items Issued</th>
                  <th className="py-3 px-4">Terms</th>
                  <th className="py-3 px-4 text-right">Value (₹)</th>
                  <th className="py-3 px-4">Dispatched By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      Loading outbound dispatches...
                    </td>
                  </tr>
                ) : sales.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      No outbound dispatches recorded yet. Click "Create Outbound Dispatch" to issue stock.
                    </td>
                  </tr>
                ) : (
                  sales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {sale.invoiceNumber}
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        {formatDate(sale.createdAt)}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900">
                        <div>{sale.customerName || "Commercial Client"}</div>
                        {sale.customerPhone && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            {sale.customerPhone}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {sale.items.map((i) => (
                          <div key={i.id} className="text-slate-800">
                            <span className="font-semibold">{i.product.name}</span>: {i.quantity}{" "}
                            {i.product.unit} @ ₹{i.unitPrice}
                          </div>
                        ))}
                      </td>
                      <td className="py-3 px-4">
                        <span className="rounded bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-800 border border-sky-200">
                          {sale.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        {formatINR(sale.totalAmount)}
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        {sale.createdBy?.name || "Inventory Officer"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal: Create Dispatch Order */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Create Outbound Stock Dispatch</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSale} className="mt-4 space-y-3.5 text-xs">
              {formError && (
                <div className="rounded-lg bg-rose-50 p-2.5 text-rose-700 border border-rose-200">
                  {formError}
                </div>
              )}

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Recipient / Client Organization</label>
                <input
                  type="text"
                  placeholder="e.g. Apex Industrial Systems / Facility B Transfer"
                  value={saleForm.customerName}
                  onChange={(e) => setSaleForm({ ...saleForm, customerName: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 p-2 text-slate-900"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Select Product SKU</label>
                <select
                  value={saleForm.productId}
                  onChange={(e) => setSaleForm({ ...saleForm, productId: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 p-2 text-slate-900"
                >
                  {productsList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — Available: {p.currentQuantity} {p.unit} (Price: ₹{p.sellingPrice})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Quantity Issued</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={saleForm.quantity}
                    onChange={(e) => setSaleForm({ ...saleForm, quantity: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Settlement Method</label>
                  <select
                    value={saleForm.paymentMethod}
                    onChange={(e) => setSaleForm({ ...saleForm, paymentMethod: e.target.value as "CREDIT" | "BANK_TRANSFER" | "UPI" | "CASH" })}
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-900"
                  >
                    <option value="CREDIT">Net 30 / Commercial Credit</option>
                    <option value="BANK_TRANSFER">Direct Wire / NEFT</option>
                    <option value="UPI">UPI / Digital Payment</option>
                    <option value="CASH">Cash on Dispatch</option>
                  </select>
                </div>
              </div>

              <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
                <div className="flex justify-between font-medium text-slate-600">
                  <span>Unit Rate:</span>
                  <span>
                    ₹{productsList.find((p) => p.id === saleForm.productId)?.sellingPrice || 0}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 text-sm mt-1 border-t border-slate-200 pt-1">
                  <span>Total Order Value:</span>
                  <span className="text-emerald-700">
                    {formatINR(
                      (productsList.find((p) => p.id === saleForm.productId)?.sellingPrice || 0) *
                        saleForm.quantity
                    )}
                  </span>
                </div>
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
                  {isSubmitting ? "Processing..." : "Confirm Dispatch & Deduct Stock"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
