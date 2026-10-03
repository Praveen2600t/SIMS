import React, { useState, useMemo } from "react";
import {
  ShoppingCart,
  Plus,
  IndianRupee,
  Receipt,
  UserCheck,
  TrendingUp,
  X,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
} from "lucide-react";
import { useInventory } from "../hooks/useInventoryStore";
import { Sale } from "../lib/inventoryStore";

export const SalesPage: React.FC = () => {
  const { sales, products, recordSale } = useInventory();

  // Create Sale Modal
  const [saleModalOpen, setSaleModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<Sale["paymentMethod"]>("UPI");
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || "");
  const [quantity, setQuantity] = useState(1);

  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sales Totals
  const totalRevenue = useMemo(() => sales.reduce((acc, s) => acc + s.totalAmount, 0), [sales]);
  const totalTransactions = sales.length;
  const avgOrderValue = totalTransactions > 0 ? Math.round(totalRevenue / totalTransactions) : 0;

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  const handleCreateSale = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!customerName.trim()) {
      setErrorMsg("Please provide a customer name.");
      return;
    }

    if (!selectedProduct) {
      setErrorMsg("Please select a product.");
      return;
    }

    if (quantity <= 0) {
      setErrorMsg("Quantity must be at least 1.");
      return;
    }

    if (quantity > selectedProduct.quantity) {
      setErrorMsg(
        `Insufficient stock! Only ${selectedProduct.quantity} ${selectedProduct.unit} available for ${selectedProduct.name}.`
      );
      return;
    }

    try {
      const sale = recordSale({
        customerName: customerName.trim(),
        paymentMethod,
        items: [{ productId: selectedProduct.id, quantity }],
      });

      setSaleModalOpen(false);
      setCustomerName("");
      setQuantity(1);
      setFeedback(`Sale recorded successfully! Invoice ${sale.invoiceNumber} generated.`);
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to record sale");
    }
  };

  const exportSalesCSV = () => {
    const headers = ["Invoice#", "Date", "Customer", "Item", "Quantity", "UnitPrice", "TotalAmount", "PaymentMethod"];
    const rows = sales.flatMap((s) =>
      s.items.map((i) => [
        s.invoiceNumber,
        s.date.split("T")[0],
        `"${s.customerName.replace(/"/g, '""')}"`,
        `"${i.productName.replace(/"/g, '""')}"`,
        i.quantity,
        i.unitPrice,
        s.totalAmount,
        s.paymentMethod,
      ])
    );

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sicms_sales_dispatch_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Sales & Revenue Tracking</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Record customer orders, dispense stock, issue invoices, and track revenue metrics.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportSalesCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
            Export Sales CSV
          </button>
          <button
            onClick={() => {
              setErrorMsg(null);
              setSelectedProductId(products[0]?.id || "");
              setSaleModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition"
          >
            <Plus className="w-3.5 h-3.5" />
            New Customer Sale
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Total Realized Revenue</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">₹{totalRevenue.toLocaleString()}</div>
          <p className="text-[11px] text-emerald-600 font-medium">Cumulative dispatched sales</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Sales Dispatches</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{totalTransactions}</div>
          <p className="text-[11px] text-slate-400">Total customer orders fulfilled</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Average Order Value</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">₹{avgOrderValue.toLocaleString()}</div>
          <p className="text-[11px] text-slate-400">Average ticket per customer</p>
        </div>
      </div>

      {/* Sales Transactions Ledger */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden p-5 sm:p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-900">Customer Sales Ledger</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-3">Invoice #</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Dispensed Items</th>
                <th className="py-3 px-3">Payment</th>
                <th className="py-3 px-3">Invoice Total</th>
                <th className="py-3 px-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sales.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3.5 px-3 font-mono font-bold text-slate-900">{s.invoiceNumber}</td>
                  <td className="py-3.5 px-3 font-semibold text-slate-800">{s.customerName}</td>
                  <td className="py-3.5 px-3">
                    {s.items.map((it, idx) => (
                      <div key={idx} className="text-slate-700">
                        {it.quantity}x {it.productName} <span className="text-slate-400">(₹{it.unitPrice}/u)</span>
                      </div>
                    ))}
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                      {s.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 font-bold text-slate-900">
                    ₹{s.totalAmount.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-3 text-slate-400 whitespace-nowrap">
                    {new Date(s.date).toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE SALE MODAL */}
      {saleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Record Customer Dispatch</h3>
              <button onClick={() => setSaleModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateSale} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Customer / Client Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apollo Diagnostics Labs"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Select Item *</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id} disabled={p.quantity === 0}>
                      {p.name} — {p.quantity} {p.unit} available (₹{p.unitPrice})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <label className="font-semibold text-slate-700">Quantity *</label>
                    <span className="text-[11px] text-slate-400">
                      Avail: {selectedProduct?.quantity || 0}
                    </span>
                  </div>
                  <input
                    type="number"
                    min="1"
                    max={selectedProduct?.quantity || 1}
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Payment Method *</label>
                  <select
                    value={paymentMethod}
                    onChange={(e: any) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="UPI">UPI / Digital</option>
                    <option value="CARD">Credit/Debit Card</option>
                    <option value="CASH">Cash on Delivery</option>
                    <option value="INVOICE">Commercial Invoice (Credit)</option>
                  </select>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between font-bold text-xs text-slate-900">
                <span>Calculated Invoice Total:</span>
                <span className="text-emerald-600 text-sm">
                  ₹{((selectedProduct?.unitPrice || 0) * quantity).toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSaleModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedProduct || selectedProduct.quantity === 0}
                  className="px-4 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 rounded-xl shadow-xs transition"
                >
                  Generate Sale & Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
