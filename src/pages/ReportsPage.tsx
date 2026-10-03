import React, { useState, useMemo } from "react";
import {
  BarChart3,
  Download,
  Calendar,
  Layers,
  TrendingDown,
  PieChart as PieIcon,
  ShieldAlert,
  Printer,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { useInventory } from "../hooks/useInventoryStore";

export const ReportsPage: React.FC = () => {
  const { products, batches, movements, sales, metrics } = useInventory();
  const [timeframe, setTimeframe] = useState<"DAILY" | "WEEKLY" | "MONTHLY">("DAILY");

  // Stock status breakdown for PieChart
  const stockDistribution = useMemo(() => {
    const normal = products.filter((p) => p.quantity > p.minStock).length;
    const low = products.filter((p) => p.quantity > 0 && p.quantity <= p.minStock).length;
    const out = products.filter((p) => p.quantity === 0).length;

    return [
      { name: "Optimal Stock", value: normal, color: "#10b981" },
      { name: "Low Stock", value: low, color: "#f59e0b" },
      { name: "Depleted / Out", value: out, color: "#ef4444" },
    ];
  }, [products]);

  // Inventory Value by Category
  const categoryValues = useMemo(() => {
    const map: Record<string, number> = {};
    products.forEach((p) => {
      map[p.category] = (map[p.category] || 0) + p.quantity * p.unitPrice;
    });

    return Object.entries(map).map(([category, value]) => ({
      category,
      value,
    }));
  }, [products]);

  // Expiry risk list
  const expiringLots = useMemo(() => {
    const now = new Date();
    const in60Days = new Date();
    in60Days.setDate(now.getDate() + 60);

    return batches
      .filter((b) => b.quantity > 0 && b.expiryDate)
      .map((b) => {
        const prod = products.find((p) => p.id === b.productId);
        const exp = new Date(b.expiryDate);
        const daysLeft = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return {
          ...b,
          productName: prod?.name || "Product",
          sku: prod?.sku || "SKU",
          daysLeft,
          isExpired: exp < now,
        };
      })
      .filter((b) => b.daysLeft <= 60)
      .sort((a, b) => a.daysLeft - b.daysLeft);
  }, [batches, products]);

  const exportDailySummaryCSV = () => {
    const headers = [
      "ReportType",
      "TotalProducts",
      "TotalStockUnits",
      "TotalInventoryValueINR",
      "LowStockCount",
      "OutOfStockCount",
      "TotalSalesRevenueINR",
      "GeneratedAt",
    ];

    const totalSalesRev = sales.reduce((a, s) => a + s.totalAmount, 0);

    const row = [
      timeframe,
      metrics.totalProducts,
      metrics.totalStock,
      metrics.totalInventoryValue,
      metrics.lowStockCount,
      metrics.outOfStockCount,
      totalSalesRev,
      new Date().toISOString(),
    ];

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), row.join(",")].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sicms_inventory_report_${timeframe.toLowerCase()}_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Daily Stock Reports & Analytics</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Comprehensive stock valuation, health diagnostics, batch shelf-life analytics, and ledger summaries.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs font-semibold">
            {(["DAILY", "WEEKLY", "MONTHLY"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-3 py-1.5 rounded-lg transition ${
                  timeframe === t ? "bg-white text-blue-600 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            Print
          </button>
          <button
            onClick={exportDailySummaryCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition"
          >
            <Download className="w-3.5 h-3.5" />
            Export Report CSV
          </button>
        </div>
      </div>

      {/* Snapshot Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-xs text-slate-500 font-medium">Total Inventory Asset</span>
          <div className="text-xl sm:text-2xl font-bold text-slate-900">
            ₹{metrics.totalInventoryValue.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400">Valuation at current cost</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-xs text-slate-500 font-medium">Physical Stock On Hand</span>
          <div className="text-xl sm:text-2xl font-bold text-slate-900">
            {metrics.totalStock.toLocaleString()} units
          </div>
          <p className="text-[11px] text-slate-400">Across {metrics.totalProducts} products</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-xs text-slate-500 font-medium">Dispatched Sales</span>
          <div className="text-xl sm:text-2xl font-bold text-emerald-600">
            ₹{sales.reduce((a, s) => a + s.totalAmount, 0).toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400">{sales.length} fulfilled customer orders</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-xs text-slate-500 font-medium">Active Batch Health</span>
          <div className="text-xl sm:text-2xl font-bold text-slate-900">
            {batches.filter((b) => b.status === "ACTIVE").length} Lots
          </div>
          <p className="text-[11px] text-slate-400">{expiringLots.length} under expiry surveillance</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inventory Stock Health Pie */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-base font-bold text-slate-900">Stock Availability Breakdown</h3>
          <div className="h-60 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stockDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stockDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-around text-xs text-slate-600 border-t border-slate-100 pt-3">
            {stockDistribution.map((s) => (
              <div key={s.name} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }}></span>
                <span>
                  {s.name}: <strong>{s.value}</strong>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Value by Category Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-base font-bold text-slate-900">Inventory Valuation by Category (₹)</h3>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryValues} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="category" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, "Stock Valuation"]}
                />
                <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Expiry Risk Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Shelf-Life & Expiry Risk Analysis</h3>
            <p className="text-xs text-slate-500">Batches expired or reaching expiry within 60 days</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg">
            {expiringLots.length} Watchlist Lots
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-3">Batch Code</th>
                <th className="py-3 px-3">Product Name</th>
                <th className="py-3 px-3">Quantity</th>
                <th className="py-3 px-3">Expiry Date</th>
                <th className="py-3 px-3">Days Remaining</th>
                <th className="py-3 px-3">Action Urgency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {expiringLots.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No batches expiring in the next 60 days.
                  </td>
                </tr>
              ) : (
                expiringLots.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">{b.batchNumber}</td>
                    <td className="py-3 px-3 font-semibold text-slate-800">{b.productName}</td>
                    <td className="py-3 px-3 font-semibold text-slate-900">{b.quantity}</td>
                    <td className="py-3 px-3 text-slate-700">{b.expiryDate}</td>
                    <td className="py-3 px-3 font-semibold">
                      {b.isExpired ? (
                        <span className="text-red-600 font-bold">Expired ({Math.abs(b.daysLeft)}d ago)</span>
                      ) : (
                        <span className="text-amber-600 font-bold">{b.daysLeft} days remaining</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {b.isExpired ? (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-red-100 text-red-800 rounded-md">
                          Quarantine Immediately
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded-md">
                          Fast-Track Clearance
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
