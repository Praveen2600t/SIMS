import React, { useState } from "react";
import {
  Truck,
  Plus,
  PackageCheck,
  Clock,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  X,
  FileText,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { useInventory } from "../hooks/useInventoryStore";
import { Supplier, PurchaseOrder } from "../lib/inventoryStore";

export const SuppliersPage: React.FC = () => {
  const { suppliers, purchaseOrders, products, saveSupplier, deleteSupplier, createPurchaseOrder, receivePurchaseOrder } =
    useInventory();

  const [activeTab, setActiveTab] = useState<"suppliers" | "orders">("suppliers");

  // Supplier Modal
  const [supModalOpen, setSupModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [supForm, setSupForm] = useState({
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    leadTimeDays: 3,
    categories: "Electronics, Components",
  });

  // PO Modal
  const [poModalOpen, setPoModalOpen] = useState(false);
  const [poForm, setPoForm] = useState({
    supplierId: suppliers[0]?.id || "",
    productId: products[0]?.id || "",
    quantity: 50,
    unitPrice: 100,
    notes: "Urgent replenishment batch",
  });

  const [feedback, setFeedback] = useState<string | null>(null);

  const handleOpenAddSupplier = () => {
    setEditingSupplier(null);
    setSupForm({
      name: "",
      contactPerson: "",
      email: "",
      phone: "",
      address: "",
      leadTimeDays: 3,
      categories: "General Materials",
    });
    setSupModalOpen(true);
  };

  const handleSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supForm.name.trim()) return;

    saveSupplier({
      id: editingSupplier?.id,
      name: supForm.name.trim(),
      contactPerson: supForm.contactPerson.trim(),
      email: supForm.email.trim(),
      phone: supForm.phone.trim(),
      address: supForm.address.trim(),
      leadTimeDays: Number(supForm.leadTimeDays) || 1,
      categories: supForm.categories.split(",").map((c) => c.trim()),
    });

    setSupModalOpen(false);
    setFeedback("Supplier saved successfully.");
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleCreatePO = (e: React.FormEvent) => {
    e.preventDefault();
    const sup = suppliers.find((s) => s.id === poForm.supplierId);
    const prod = products.find((p) => p.id === poForm.productId);
    if (!sup || !prod) return;

    createPurchaseOrder({
      supplierId: sup.id,
      supplierName: sup.name,
      items: [
        {
          productId: prod.id,
          productName: prod.name,
          sku: prod.sku,
          quantity: Number(poForm.quantity),
          unitPrice: Number(poForm.unitPrice),
        },
      ],
      totalAmount: Number(poForm.quantity) * Number(poForm.unitPrice),
      notes: poForm.notes,
    });

    setPoModalOpen(false);
    setActiveTab("orders");
    setFeedback("Purchase order raised and queued for receipt.");
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleReceivePO = (poId: string) => {
    try {
      receivePurchaseOrder(poId);
      setFeedback("Purchase order received! Quantities automatically added to inventory.");
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      alert(err.message || "Failed to receive order");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Suppliers & Purchase Orders</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Maintain authorized vendor contacts and issue replenishment purchase orders.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleOpenAddSupplier}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
          >
            <Plus className="w-3.5 h-3.5 text-slate-500" />
            Add Supplier
          </button>
          <button
            onClick={() => setPoModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition"
          >
            <FileText className="w-3.5 h-3.5" />
            Create Purchase Order
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 text-xs font-semibold gap-6">
        <button
          onClick={() => setActiveTab("suppliers")}
          className={`pb-3 transition flex items-center gap-2 ${
            activeTab === "suppliers"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Truck className="w-4 h-4" />
          Registered Suppliers ({suppliers.length})
        </button>
        <button
          onClick={() => setActiveTab("orders")}
          className={`pb-3 transition flex items-center gap-2 ${
            activeTab === "orders"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <PackageCheck className="w-4 h-4" />
          Purchase Orders ({purchaseOrders.length})
        </button>
      </div>

      {/* TAB 1: SUPPLIERS LIST */}
      {activeTab === "suppliers" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliers.map((s) => (
            <div
              key={s.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3.5 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm leading-tight">{s.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{s.contactPerson}</p>
                  </div>
                  <button
                    onClick={() => deleteSupplier(s.id)}
                    className="p-1 text-slate-400 hover:text-red-600 rounded-md transition"
                    title="Delete Supplier"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 pt-1">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{s.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>{s.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{s.address}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Lead Time: <strong className="text-slate-800">{s.leadTimeDays} days</strong></span>
                <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium">
                  {s.categories[0] || "Vendor"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: PURCHASE ORDERS LIST */}
      {activeTab === "orders" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Purchase Order History</h3>
            <span className="text-xs text-slate-400">Click &quot;Receive&quot; to auto-stock received goods</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">PO Number</th>
                  <th className="py-3 px-3">Supplier</th>
                  <th className="py-3 px-3">Item Details</th>
                  <th className="py-3 px-3">Order Total</th>
                  <th className="py-3 px-3">Order Date</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {purchaseOrders.map((po) => {
                  const isPending = po.status === "PENDING";
                  return (
                    <tr key={po.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">{po.poNumber}</td>
                      <td className="py-3 px-3 font-semibold text-slate-800">{po.supplierName}</td>
                      <td className="py-3 px-3">
                        {po.items.map((i, idx) => (
                          <div key={idx} className="text-slate-700">
                            {i.quantity}x {i.productName}
                          </div>
                        ))}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-900">
                        ₹{po.totalAmount.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-slate-600">{po.orderDate}</td>
                      <td className="py-3 px-3">
                        {isPending ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                            <Clock className="w-3 h-3" /> PENDING
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            <CheckCircle className="w-3 h-3" /> RECEIVED
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {isPending && (
                          <button
                            onClick={() => handleReceivePO(po.id)}
                            className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs transition"
                          >
                            Mark Received
                          </button>
                        )}
                        {!isPending && (
                          <span className="text-[11px] text-slate-400">
                            Received {po.receivedDate}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE SUPPLIER MODAL */}
      {supModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Register Vendor / Supplier</h3>
              <button onClick={() => setSupModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSaveSupplier} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Company Name *</label>
                <input
                  type="text"
                  required
                  value={supForm.name}
                  onChange={(e) => setSupForm({ ...supForm, name: e.target.value })}
                  placeholder="e.g. Apex Industrial Supplies Ltd"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Contact Person</label>
                  <input
                    type="text"
                    value={supForm.contactPerson}
                    onChange={(e) => setSupForm({ ...supForm, contactPerson: e.target.value })}
                    placeholder="e.g. Rajesh Kumar"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Lead Time (Days)</label>
                  <input
                    type="number"
                    min="1"
                    value={supForm.leadTimeDays}
                    onChange={(e) => setSupForm({ ...supForm, leadTimeDays: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Email Address</label>
                  <input
                    type="email"
                    value={supForm.email}
                    onChange={(e) => setSupForm({ ...supForm, email: e.target.value })}
                    placeholder="sales@company.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Phone</label>
                  <input
                    type="text"
                    value={supForm.phone}
                    onChange={(e) => setSupForm({ ...supForm, phone: e.target.value })}
                    placeholder="+91 98400..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Physical Address / City</label>
                <input
                  type="text"
                  value={supForm.address}
                  onChange={(e) => setSupForm({ ...supForm, address: e.target.value })}
                  placeholder="e.g. Industrial Park, Chennai"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSupModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition"
                >
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE PURCHASE ORDER MODAL */}
      {poModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Generate Purchase Order</h3>
              <button onClick={() => setPoModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreatePO} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Vendor / Supplier *</label>
                <select
                  value={poForm.supplierId}
                  onChange={(e) => setPoForm({ ...poForm, supplierId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.leadTimeDays}d lead time)
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Product to Reorder *</label>
                <select
                  value={poForm.productId}
                  onChange={(e) => {
                    const prod = products.find((p) => p.id === e.target.value);
                    setPoForm({
                      ...poForm,
                      productId: e.target.value,
                      unitPrice: prod ? prod.unitPrice : 100,
                    });
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Stock: {p.quantity} {p.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Order Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={poForm.quantity}
                    onChange={(e) => setPoForm({ ...poForm, quantity: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Unit Cost (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={poForm.unitPrice}
                    onChange={(e) => setPoForm({ ...poForm, unitPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between font-bold text-xs text-slate-800">
                <span>Calculated PO Total:</span>
                <span>₹{(poForm.quantity * poForm.unitPrice).toLocaleString()}</span>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Order Notes / Requisition Ref</label>
                <input
                  type="text"
                  value={poForm.notes}
                  onChange={(e) => setPoForm({ ...poForm, notes: e.target.value })}
                  placeholder="e.g. Restock safety buffer"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPoModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition"
                >
                  Issue Purchase Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
