"use client";

import React, { useEffect, useState, useCallback } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { formatINR, formatDate } from "@/lib/utils";
import {
  Truck,
  Plus,
  PackageCheck,
  Building2,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle2,
  X,
} from "lucide-react";

interface Supplier {
  id: string;
  supplierCode: string;
  name: string;
  contactPerson?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  district: string;
  rating: number;
  isSampleData: boolean;
  _count?: { products: number; purchaseOrders: number };
}

interface PurchaseOrder {
  id: string;
  orderNumber: string;
  orderDate: string;
  expectedDeliveryDate?: string | null;
  status: string;
  totalCost: number;
  notes?: string | null;
  supplier: { id: string; name: string; district: string };
  createdBy?: { name: string } | null;
  items: {
    id: string;
    productId: string;
    quantity: number;
    receivedQuantity: number;
    unitCost: number;
    totalCost: number;
    product: { name: string; productCode: string; unit: string };
  }[];
}

export default function SuppliersPage() {
  const [activeTab, setActiveTab] = useState<"orders" | "suppliers">("orders");
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);

  // New PO Modal
  const [isPOModalOpen, setIsPOModalOpen] = useState(false);
  const [productsList, setProductsList] = useState<{ id: string; name: string; purchasePrice: number }[]>([]);
  const [newPOForm, setNewPOForm] = useState({
    supplierId: "",
    expectedDeliveryDate: "",
    notes: "Restock requisition order for warehouse facility",
    items: [{ productId: "", quantity: 100, unitCost: 40 }],
  });

  // Receive Modal
  const [receivingPO, setReceivingPO] = useState<PurchaseOrder | null>(null);
  const [receiveBatchData, setReceiveBatchData] = useState<{ [itemId: string]: { qty: number; batchNo: string; expiry: string } }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/suppliers");
      const json = await res.json();
      if (res.ok) setSuppliers(json.data);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/purchase-orders");
      const json = await res.json();
      if (res.ok) setOrders(json.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch("/api/products?limit=100")
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          setProductsList(data.data);
          if (data.data[0]) {
            setNewPOForm((prev) => ({
              ...prev,
              items: [{ productId: data.data[0].id, quantity: 100, unitCost: data.data[0].purchasePrice }],
            }));
          }
        }
      });
  }, []);

  useEffect(() => {
    if (activeTab === "orders") fetchOrders();
    else fetchSuppliers();
  }, [activeTab, fetchOrders, fetchSuppliers]);

  const handleCreatePO = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/purchase-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplierId: newPOForm.supplierId || suppliers[0]?.id,
          expectedDeliveryDate: newPOForm.expectedDeliveryDate || undefined,
          notes: newPOForm.notes,
          items: newPOForm.items.map((i) => ({
            productId: i.productId || productsList[0]?.id,
            quantity: Number(i.quantity),
            unitCost: Number(i.unitCost),
          })),
        }),
      });

      if (res.ok) {
        setIsPOModalOpen(false);
        fetchOrders();
      } else {
        const d = await res.json();
        alert(d.error || "Failed to create PO");
      }
    } catch {
      alert("Error creating purchase order");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openReceiveModal = (po: PurchaseOrder) => {
    setReceivingPO(po);
    const initialBatchMap: typeof receiveBatchData = {};
    po.items.forEach((item) => {
      initialBatchMap[item.id] = {
        qty: Math.max(0, item.quantity - item.receivedQuantity),
        batchNo: `RCV-${Date.now().toString().slice(-5)}`,
        expiry: "",
      };
    });
    setReceiveBatchData(initialBatchMap);
  };

  const handleCommitReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receivingPO) return;
    setIsSubmitting(true);

    try {
      const payload = {
        receivedItems: receivingPO.items.map((item) => ({
          orderItemId: item.id,
          productId: item.productId,
          quantityReceived: Number(receiveBatchData[item.id]?.qty || 0),
          batchNumber: receiveBatchData[item.id]?.batchNo || `B-${Date.now()}`,
          expiryDate: receiveBatchData[item.id]?.expiry || undefined,
        })),
      };

      const res = await fetch(`/api/purchase-orders/${receivingPO.id}/receive`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setReceivingPO(null);
        fetchOrders();
      } else {
        const d = await res.json();
        alert(d.error || "Failed to receive goods");
      }
    } catch {
      alert("Error receiving goods");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout
      title="Suppliers & Procurement Orders"
      subtitle="Industrial & Commercial Suppliers & Goods Receipt Verification"
      onRefresh={activeTab === "orders" ? fetchOrders : fetchSuppliers}
    >
      <div className="space-y-4">
        {/* Navigation & Actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("orders")}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
                activeTab === "orders"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <PackageCheck className="h-4 w-4" />
              <span>Purchase Orders</span>
            </button>

            <button
              onClick={() => setActiveTab("suppliers")}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
                activeTab === "suppliers"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Building2 className="h-4 w-4" />
              <span>Registered Suppliers</span>
            </button>
          </div>

          <button
            onClick={() => {
              if (suppliers.length === 0) fetchSuppliers();
              setIsPOModalOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-500 transition"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Purchase Order</span>
          </button>
        </div>

        {/* Orders View */}
        {activeTab === "orders" ? (
          <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">PO Number</th>
                    <th className="py-3 px-4">Supplier</th>
                    <th className="py-3 px-4">Order Date</th>
                    <th className="py-3 px-4">Expected Delivery</th>
                    <th className="py-3 px-4 text-right">Items / Qty</th>
                    <th className="py-3 px-4 text-right">Total Cost</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-500">
                        Loading purchase orders...
                      </td>
                    </tr>
                  ) : orders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-500">
                        No purchase orders recorded yet.
                      </td>
                    </tr>
                  ) : (
                    orders.map((po) => {
                      const isReceived = po.status === "RECEIVED";
                      const totalOrdered = po.items.reduce((a, b) => a + b.quantity, 0);
                      const totalRcvd = po.items.reduce((a, b) => a + b.receivedQuantity, 0);

                      return (
                        <tr key={po.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">
                            {po.orderNumber}
                          </td>
                          <td className="py-3 px-4 font-medium text-slate-900">
                            <div>{po.supplier.name}</div>
                            <span className="text-[10px] text-slate-400">
                              {po.supplier.district}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                            {formatDate(po.orderDate)}
                          </td>
                          <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                            {po.expectedDeliveryDate ? formatDate(po.expectedDeliveryDate) : "Flexible"}
                          </td>
                          <td className="py-3 px-4 text-right font-medium text-slate-800">
                            {totalRcvd} / {totalOrdered} units
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-slate-900">
                            {formatINR(po.totalCost)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                isReceived
                                  ? "bg-emerald-100 text-emerald-800"
                                  : po.status === "APPROVED"
                                  ? "bg-sky-100 text-sky-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {po.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            {!isReceived ? (
                              <button
                                onClick={() => openReceiveModal(po)}
                                className="rounded-md bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-emerald-500 shadow-xs"
                              >
                                Receive Goods
                              </button>
                            ) : (
                              <span className="text-[11px] font-medium text-slate-400 italic">
                                Fulfilled
                              </span>
                            )}
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
          /* Suppliers Listing */
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {suppliers.map((s) => (
              <div
                key={s.id}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs hover:border-emerald-300 transition"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                      {s.supplierCode}
                    </span>
                    <h3 className="mt-1 font-bold text-slate-900 text-sm">{s.name}</h3>
                  </div>
                  <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700 border border-amber-200">
                    ★ {s.rating.toFixed(1)}
                  </span>
                </div>

                <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>{s.address || s.district}</span>
                  </div>
                  {s.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>{s.phone}</span>
                    </div>
                  )}
                  {s.email && (
                    <div className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{s.email}</span>
                    </div>
                  )}
                </div>

                {s.isSampleData && (
                  <div className="mt-3 border-t border-slate-100 pt-2 text-[10px] text-slate-400 italic">
                    Verified Industrial Supplier
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Create Purchase Order */}
      {isPOModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Create Procurement Purchase Order</h2>
              <button
                onClick={() => setIsPOModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePO} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Supplier</label>
                <select
                  value={newPOForm.supplierId}
                  onChange={(e) => setNewPOForm({ ...newPOForm, supplierId: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 p-2 text-slate-900"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.district})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Product Item</label>
                <select
                  value={newPOForm.items[0]?.productId}
                  onChange={(e) => {
                    const prod = productsList.find((p) => p.id === e.target.value);
                    setNewPOForm({
                      ...newPOForm,
                      items: [
                        {
                          productId: e.target.value,
                          quantity: newPOForm.items[0]?.quantity || 100,
                          unitCost: prod?.purchasePrice || 40,
                        },
                      ],
                    });
                  }}
                  className="w-full rounded-lg border border-slate-200 p-2 text-slate-900"
                >
                  {productsList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — Cost: ₹{p.purchasePrice}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Quantity</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={newPOForm.items[0]?.quantity}
                    onChange={(e) =>
                      setNewPOForm({
                        ...newPOForm,
                        items: [
                          {
                            ...newPOForm.items[0],
                            quantity: Number(e.target.value),
                          },
                        ],
                      })
                    }
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Unit Cost (₹)</label>
                  <input
                    type="number"
                    min={0}
                    step="any"
                    required
                    value={newPOForm.items[0]?.unitCost}
                    onChange={(e) =>
                      setNewPOForm({
                        ...newPOForm,
                        items: [
                          {
                            ...newPOForm.items[0],
                            unitCost: Number(e.target.value),
                          },
                        ],
                      })
                    }
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Expected Delivery Date</label>
                <input
                  type="date"
                  value={newPOForm.expectedDeliveryDate}
                  onChange={(e) => setNewPOForm({ ...newPOForm, expectedDeliveryDate: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 p-2 text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPOModalOpen(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
                >
                  {isSubmitting ? "Creating..." : "Issue Purchase Order"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Receive Purchase Order */}
      {receivingPO && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">
                Receive Stock: {receivingPO.orderNumber}
              </h2>
              <button
                onClick={() => setReceivingPO(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCommitReceipt} className="mt-4 space-y-4 text-xs">
              <p className="text-slate-500">
                Verify incoming quantities and assign batch numbers for freshness and expiry tracking:
              </p>

              <div className="space-y-3">
                {receivingPO.items.map((item) => (
                  <div key={item.id} className="rounded-lg border border-slate-200 p-3 bg-slate-50/50">
                    <div className="font-semibold text-slate-900 mb-2">{item.product.name}</div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[10px] font-semibold text-slate-600 block">Received Qty</label>
                        <input
                          type="number"
                          min={1}
                          required
                          value={receiveBatchData[item.id]?.qty || 0}
                          onChange={(e) =>
                            setReceiveBatchData({
                              ...receiveBatchData,
                              [item.id]: {
                                ...receiveBatchData[item.id],
                                qty: Number(e.target.value),
                              },
                            })
                          }
                          className="w-full rounded-md border border-slate-200 p-1.5 text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-600 block">Batch Code</label>
                        <input
                          type="text"
                          required
                          value={receiveBatchData[item.id]?.batchNo || ""}
                          onChange={(e) =>
                            setReceiveBatchData({
                              ...receiveBatchData,
                              [item.id]: {
                                ...receiveBatchData[item.id],
                                batchNo: e.target.value,
                              },
                            })
                          }
                          className="w-full rounded-md border border-slate-200 p-1.5 text-slate-900 font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-600 block">Expiry (Perishable)</label>
                        <input
                          type="date"
                          value={receiveBatchData[item.id]?.expiry || ""}
                          onChange={(e) =>
                            setReceiveBatchData({
                              ...receiveBatchData,
                              [item.id]: {
                                ...receiveBatchData[item.id],
                                expiry: e.target.value,
                              },
                            })
                          }
                          className="w-full rounded-md border border-slate-200 p-1.5 text-slate-900"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReceivingPO(null)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
                >
                  {isSubmitting ? "Receiving..." : "Accept Goods & Update Stock"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
