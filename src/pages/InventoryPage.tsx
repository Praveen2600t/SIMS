import React, { useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  SlidersHorizontal,
  Layers,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  Plus,
  X,
  History,
} from "lucide-react";
import { useInventory } from "../hooks/useInventoryStore";

export const InventoryPage: React.FC = () => {
  const { products, batches, movements, stockIn, stockOut, adjustStock, addBatch } = useInventory();

  // Active Tab
  const [activeTab, setActiveTab] = useState<"operations" | "batches" | "movements">("operations");

  // Stock In Modal
  const [inModalOpen, setInModalOpen] = useState(false);
  const [inData, setInData] = useState({
    productId: products[0]?.id || "",
    quantity: 10,
    reason: "Supplier Delivery",
    reference: "DEL-2026",
    batchNumber: "",
    expiryDate: "",
  });

  // Stock Out Modal
  const [outModalOpen, setOutModalOpen] = useState(false);
  const [outData, setOutData] = useState({
    productId: products[0]?.id || "",
    quantity: 5,
    reason: "Internal Usage / Requisition",
    reference: "REQ-01",
    batchId: "",
  });

  // Adjust Stock Modal
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [adjustData, setAdjustData] = useState({
    productId: products[0]?.id || "",
    newQuantity: 10,
    reason: "Physical Cycle Count Audit",
  });

  // Add Batch Modal
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [newBatchData, setNewBatchData] = useState({
    productId: products[0]?.id || "",
    batchNumber: `LOT-${Math.floor(1000 + Math.random() * 9000)}`,
    quantity: 50,
    expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  });

  // Feedback notifications
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleStockInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      stockIn({
        productId: inData.productId,
        quantity: Number(inData.quantity),
        reason: inData.reason,
        reference: inData.reference || undefined,
        batchNumber: inData.batchNumber.trim() || undefined,
        expiryDate: inData.expiryDate || undefined,
      });
      setInModalOpen(false);
      showSuccess("Stock-in movement recorded and balances updated successfully.");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to record stock in");
    }
  };

  const handleStockOutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      stockOut({
        productId: outData.productId,
        quantity: Number(outData.quantity),
        reason: outData.reason,
        reference: outData.reference || undefined,
        batchId: outData.batchId || undefined,
      });
      setOutModalOpen(false);
      showSuccess("Stock-out movement dispatched and deducted from inventory.");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to record stock out");
    }
  };

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      adjustStock({
        productId: adjustData.productId,
        newQuantity: Number(adjustData.newQuantity),
        reason: adjustData.reason,
      });
      setAdjustModalOpen(false);
      showSuccess("Inventory quantity adjusted and audit delta recorded.");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to adjust stock");
    }
  };

  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      addBatch({
        productId: newBatchData.productId,
        batchNumber: newBatchData.batchNumber.trim(),
        quantity: Number(newBatchData.quantity),
        expiryDate: newBatchData.expiryDate,
        receivedDate: new Date().toISOString().split("T")[0],
        status: "ACTIVE",
      });
      setBatchModalOpen(false);
      showSuccess("New batch lot registered with expiry telemetry.");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to add batch");
    }
  };

  // Selected product helper for modals
  const selectedOutProd = products.find((p) => p.id === outData.productId);
  const outProductBatches = batches.filter((b) => b.productId === outData.productId && b.quantity > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Stock Movements & Batches</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Record stock inflows, dispatches, audits, and track batch lots with expiration dates.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setErrorMsg(null);
              setInData({ ...inData, productId: products[0]?.id || "" });
              setInModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition"
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            Stock In (+)
          </button>
          <button
            onClick={() => {
              setErrorMsg(null);
              setOutData({ ...outData, productId: products[0]?.id || "" });
              setOutModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition"
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-amber-600" />
            Stock Out (-)
          </button>
          <button
            onClick={() => {
              setErrorMsg(null);
              setAdjustData({ ...adjustData, productId: products[0]?.id || "" });
              setAdjustModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
            Adjust
          </button>
        </div>
      </div>

      {/* Alerts / Feedback Banner */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)}>
            <X className="w-4 h-4 text-emerald-500" />
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)}>
            <X className="w-4 h-4 text-red-500" />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 text-xs font-semibold gap-6">
        <button
          onClick={() => setActiveTab("operations")}
          className={`pb-3 transition flex items-center gap-2 ${
            activeTab === "operations"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Layers className="w-4 h-4" />
          Quick Stock Operations
        </button>
        <button
          onClick={() => setActiveTab("batches")}
          className={`pb-3 transition flex items-center gap-2 ${
            activeTab === "batches"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Clock className="w-4 h-4" />
          Batch & Lot Expiry Tracking ({batches.length})
        </button>
        <button
          onClick={() => setActiveTab("movements")}
          className={`pb-3 transition flex items-center gap-2 ${
            activeTab === "movements"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <History className="w-4 h-4" />
          Complete Movement Ledger ({movements.length})
        </button>
      </div>

      {/* TAB 1: OPERATIONS / INVENTORY OVERVIEW */}
      {activeTab === "operations" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Fast Product Stock Cards */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 leading-tight">Current Stock Status</h3>
            <div className="divide-y divide-slate-100">
              {products.map((p) => (
                <div key={p.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">{p.name}</h4>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      {p.sku} • {p.location} • Min: {p.minStock} {p.unit}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-sm font-bold px-3 py-1 rounded-lg ${
                        p.quantity === 0
                          ? "bg-red-50 text-red-700"
                          : p.quantity <= p.minStock
                          ? "bg-amber-50 text-amber-700"
                          : "bg-slate-100 text-slate-800"
                      }`}
                    >
                      {p.quantity} {p.unit}
                    </span>

                    <button
                      onClick={() => {
                        setInData({ ...inData, productId: p.id });
                        setInModalOpen(true);
                      }}
                      className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg text-xs font-semibold transition"
                      title="Quick Stock In"
                    >
                      + In
                    </button>
                    <button
                      onClick={() => {
                        setOutData({ ...outData, productId: p.id });
                        setOutModalOpen(true);
                      }}
                      disabled={p.quantity === 0}
                      className="p-1.5 text-amber-600 bg-amber-50 hover:bg-amber-100 disabled:opacity-40 rounded-lg text-xs font-semibold transition"
                      title="Quick Stock Out"
                    >
                      - Out
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Guide Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 leading-tight">Stock Inflow Rules</h3>
            <ul className="text-xs text-slate-600 space-y-3 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0"></span>
                <span>
                  <strong>Strict Non-Negative Balance:</strong> Dispatches cannot exceed available stock. Any attempted over-allocation is blocked.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0"></span>
                <span>
                  <strong>Batch Traceability:</strong> You can assign a Lot/Batch number with expiry date during Stock In.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0"></span>
                <span>
                  <strong>Continuous Telemetry:</strong> Every stock transaction automatically executes surveillance checks to detect low stock or sudden depletion.
                </span>
              </li>
            </ul>

            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 text-xs text-blue-900 space-y-2">
              <p className="font-bold">Need a batch lot registered?</p>
              <button
                onClick={() => setBatchModalOpen(true)}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-2xs transition"
              >
                + Register New Batch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BATCH EXPIRY TRACKER */}
      {activeTab === "batches" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden space-y-4 p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Registered Batch Lots</h3>
              <p className="text-xs text-slate-500">Track shelf-life, expiry dates, and lot quantities.</p>
            </div>
            <button
              onClick={() => setBatchModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Batch
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">Batch Number</th>
                  <th className="py-3 px-3">Product</th>
                  <th className="py-3 px-3">Lot Quantity</th>
                  <th className="py-3 px-3">Received Date</th>
                  <th className="py-3 px-3">Expiry Date</th>
                  <th className="py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {batches.map((b) => {
                  const prod = products.find((p) => p.id === b.productId);
                  const isExpired = b.expiryDate && new Date(b.expiryDate) < new Date();
                  const isNear =
                    b.expiryDate &&
                    !isExpired &&
                    (new Date(b.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24) <= 30;

                  return (
                    <tr key={b.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">{b.batchNumber}</td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900">{prod?.name || "Product"}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{prod?.sku}</div>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-900">{b.quantity}</td>
                      <td className="py-3 px-3 text-slate-600">{b.receivedDate}</td>
                      <td className="py-3 px-3 font-semibold">
                        <span
                          className={
                            isExpired ? "text-red-600" : isNear ? "text-amber-600" : "text-slate-800"
                          }
                        >
                          {b.expiryDate || "N/A"}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        {isExpired ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                            EXPIRED
                          </span>
                        ) : isNear ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            EXPIRING SOON
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            ACTIVE
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

      {/* TAB 3: COMPLETE MOVEMENT LEDGER */}
      {activeTab === "movements" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden p-5 sm:p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900">Historical Movement Ledger</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">Movement Type</th>
                  <th className="py-3 px-3">Product Name</th>
                  <th className="py-3 px-3">Quantity Delta</th>
                  <th className="py-3 px-3">Balance Shift</th>
                  <th className="py-3 px-3">Reason / Reference</th>
                  <th className="py-3 px-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {movements.map((m) => {
                  const isIn = m.type === "IN";
                  return (
                    <tr key={m.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold ${
                            isIn
                              ? "bg-blue-50 text-blue-700"
                              : m.type === "SALE"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {m.type}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900">{m.productName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{m.sku}</div>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-900">
                        {isIn ? `+${m.quantity}` : `-${m.quantity}`}
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-mono">
                        {m.previousQty} → {m.newQty}
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        <div>{m.reason}</div>
                        {m.reference && <div className="text-[10px] text-slate-400 font-mono">{m.reference}</div>}
                      </td>
                      <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                        {new Date(m.date).toLocaleString([], {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: STOCK IN */}
      {inModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <ArrowDownLeft className="w-5 h-5 text-blue-600" />
                Record Stock Inflow
              </h3>
              <button onClick={() => setInModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleStockInSubmit} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Select Product *</label>
                <select
                  value={inData.productId}
                  onChange={(e) => setInData({ ...inData, productId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Current: {p.quantity} {p.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Quantity to Add *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={inData.quantity}
                    onChange={(e) => setInData({ ...inData, quantity: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Batch Number (Optional)</label>
                  <input
                    type="text"
                    placeholder="LOT-2026-X"
                    value={inData.batchNumber}
                    onChange={(e) => setInData({ ...inData, batchNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Expiry Date (If applicable)</label>
                <input
                  type="date"
                  value={inData.expiryDate}
                  onChange={(e) => setInData({ ...inData, expiryDate: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Inflow Reason *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Supplier Restock, Warehouse Transfer"
                  value={inData.reason}
                  onChange={(e) => setInData({ ...inData, reason: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Reference / Invoice #</label>
                <input
                  type="text"
                  placeholder="e.g. PO-8910"
                  value={inData.reference}
                  onChange={(e) => setInData({ ...inData, reference: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setInModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition"
                >
                  Confirm Stock In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: STOCK OUT */}
      {outModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-amber-600" />
                Record Stock Outflow
              </h3>
              <button onClick={() => setOutModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleStockOutSubmit} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Select Product *</label>
                <select
                  value={outData.productId}
                  onChange={(e) => setOutData({ ...outData, productId: e.target.value, batchId: "" })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Available: {p.quantity} {p.unit})
                    </option>
                  ))}
                </select>
              </div>

              {outProductBatches.length > 0 && (
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Deduct from Batch (Optional)</label>
                  <select
                    value={outData.batchId}
                    onChange={(e) => setOutData({ ...outData, batchId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="">General Stock (No specific batch)</option>
                    {outProductBatches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.batchNumber} (Expires: {b.expiryDate} • Qty: {b.quantity})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-1">
                <div className="flex justify-between">
                  <label className="font-semibold text-slate-700">Quantity to Issue *</label>
                  <span className="text-[11px] text-slate-500">
                    Max: {selectedOutProd?.quantity || 0} {selectedOutProd?.unit}
                  </span>
                </div>
                <input
                  type="number"
                  min="1"
                  max={selectedOutProd?.quantity || 1}
                  required
                  value={outData.quantity}
                  onChange={(e) => setOutData({ ...outData, quantity: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Outflow Reason *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Customer Dispatch, Store Transfer, Scrap"
                  value={outData.reason}
                  onChange={(e) => setOutData({ ...outData, reason: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Reference #</label>
                <input
                  type="text"
                  placeholder="e.g. REQ-9912"
                  value={outData.reference}
                  onChange={(e) => setOutData({ ...outData, reference: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setOutModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition"
                >
                  Confirm Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADJUST STOCK */}
      {adjustModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Inventory Audit Adjustment</h3>
              <button onClick={() => setAdjustModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Select Product *</label>
                <select
                  value={adjustData.productId}
                  onChange={(e) => {
                    const prod = products.find((p) => p.id === e.target.value);
                    setAdjustData({
                      ...adjustData,
                      productId: e.target.value,
                      newQuantity: prod ? prod.quantity : 0,
                    });
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Current: {p.quantity} {p.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Correct Physical Count *</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={adjustData.newQuantity}
                  onChange={(e) => setAdjustData({ ...adjustData, newQuantity: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Audit Reason / Justification *</label>
                <input
                  type="text"
                  required
                  value={adjustData.reason}
                  onChange={(e) => setAdjustData({ ...adjustData, reason: e.target.value })}
                  placeholder="e.g. Physical inventory discrepancy reconciliation"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAdjustModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition"
                >
                  Apply Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD BATCH */}
      {batchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Register New Batch Lot</h3>
              <button onClick={() => setBatchModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreateBatch} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Select Product *</label>
                <select
                  value={newBatchData.productId}
                  onChange={(e) => setNewBatchData({ ...newBatchData, productId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Batch Code *</label>
                  <input
                    type="text"
                    required
                    value={newBatchData.batchNumber}
                    onChange={(e) => setNewBatchData({ ...newBatchData, batchNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newBatchData.quantity}
                    onChange={(e) => setNewBatchData({ ...newBatchData, quantity: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Expiry Date *</label>
                <input
                  type="date"
                  required
                  value={newBatchData.expiryDate}
                  onChange={(e) => setNewBatchData({ ...newBatchData, expiryDate: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setBatchModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition"
                >
                  Register Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
