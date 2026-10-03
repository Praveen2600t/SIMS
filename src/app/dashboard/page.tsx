"use client";

import React, { useEffect, useState, useCallback } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { formatINR, formatDate } from "@/lib/utils";
import {
  Package,
  IndianRupee,
  AlertTriangle,
  XCircle,
  Clock,
  TrendingUp,
  Building2,
  ArrowUpRight,
  ArrowDownLeft,
  Bell,
  RefreshCw,
  ShieldAlert,
  CalendarCheck,
  CheckCircle2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface MetricData {
  overview: {
    totalProducts: number;
    totalInventoryValue: number;
    totalStockUnits: number;
    lowStockCount: number;
    outOfStockCount: number;
    expiringSoonCount: number;
    expiredCount: number;
    openAlertsCount: number;
    criticalAlertsCount: number;
    totalSalesRevenue: number;
    totalSalesOrders: number;
  };
  dailyStockAnalysis: {
    openingStock: number;
    receivedToday: number;
    issuedToday: number;
    closingStock: number;
    netDailyChange: number;
  };
  dailySummary: {
    totalMonitored: number;
    totalStockUnits: number;
    lowStockItems: number;
    outOfStockItems: number;
    nearExpiryBatches: number;
    expiredBatches: number;
    unresolvedAlerts: number;
    totalValuation: number;
  };
  categoryDistribution: { categoryId: string; name: string; productsCount: number; inventoryValue: number }[];
  storageDistribution: { location: string; productsCount: number; totalStock: number; inventoryValue: number }[];
  recentAlerts: {
    id: string;
    alertType: string;
    severity: string;
    message: string;
    recommendedAction?: string | null;
    createdAt: string;
    product?: { name: string; productCode: string; storageLocation?: string | null };
  }[];
  recentMovements: {
    id: string;
    movementType: string;
    quantity: number;
    createdAt: string;
    reason: string;
    product: { name: string; productCode: string; unit: string; storageLocation?: string | null };
    performedBy?: { name: string };
  }[];
}

const CATEGORY_COLORS = [
  "#4f46e5", "#0284c7", "#059669", "#d97706", "#dc2626",
  "#7c3aed", "#0891b2", "#ea580c", "#16a34a", "#be185d",
];

export default function DashboardPage() {
  const [data, setData] = useState<MetricData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/dashboard/metrics");
      if (!res.ok) throw new Error("Failed to load metrics");
      const json = await res.json();
      setData(json);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error fetching dashboard metrics";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return (
    <AppLayout
      title="Continuous Inventory Monitoring Dashboard"
      subtitle="Real-Time Stock Surveillance, Expiry Tracking & Automated Alerts"
      onRefresh={fetchMetrics}
    >
      {error && (
        <div className="mb-6 rounded-lg bg-rose-50 p-4 text-sm font-medium text-rose-700 border border-rose-200">
          {error}
        </div>
      )}

      {loading && !data ? (
        <div className="flex h-96 items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <RefreshCw className="h-8 w-8 animate-spin text-indigo-600" />
            <p className="text-sm font-medium text-slate-500">Aggregating live inventory telemetry...</p>
          </div>
        </div>
      ) : data ? (
        <div className="space-y-6">
          {/* Top 6 Operational Metric Cards */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {/* Total Items Monitored */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Monitored Items</span>
                <span className="rounded-md bg-slate-100 p-1.5 text-slate-700">
                  <Package className="h-4 w-4" />
                </span>
              </div>
              <div className="mt-2 text-2xl font-bold text-slate-900">{data.overview.totalProducts}</div>
              <p className="mt-1 text-xs text-slate-500">{data.overview.totalStockUnits.toLocaleString()} total units</p>
            </div>

            {/* Total Available Inventory Valuation */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Inventory Value</span>
                <span className="rounded-md bg-indigo-50 p-1.5 text-indigo-700">
                  <IndianRupee className="h-4 w-4" />
                </span>
              </div>
              <div className="mt-2 text-2xl font-bold text-indigo-700">
                {formatINR(data.overview.totalInventoryValue)}
              </div>
              <p className="mt-1 text-xs text-slate-500">Total asset value</p>
            </div>

            {/* Low-Stock Count */}
            <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Low Stock</span>
                <span className="rounded-md bg-amber-100 p-1.5 text-amber-800">
                  <AlertTriangle className="h-4 w-4" />
                </span>
              </div>
              <div className="mt-2 text-2xl font-bold text-amber-900">{data.overview.lowStockCount}</div>
              <p className="mt-1 text-xs text-amber-700">Below threshold</p>
            </div>

            {/* Out-of-Stock Count */}
            <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider">Out of Stock</span>
                <span className="rounded-md bg-rose-100 p-1.5 text-rose-800">
                  <XCircle className="h-4 w-4" />
                </span>
              </div>
              <div className="mt-2 text-2xl font-bold text-rose-900">{data.overview.outOfStockCount}</div>
              <p className="mt-1 text-xs text-rose-700">Zero available</p>
            </div>

            {/* Near-Expiry Count */}
            <div className="rounded-xl border border-orange-200 bg-orange-50/40 p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-orange-700 uppercase tracking-wider">Near Expiry</span>
                <span className="rounded-md bg-orange-100 p-1.5 text-orange-800">
                  <Clock className="h-4 w-4" />
                </span>
              </div>
              <div className="mt-2 text-2xl font-bold text-orange-900">{data.overview.expiringSoonCount}</div>
              <p className="mt-1 text-xs text-orange-700">Next 14 days</p>
            </div>

            {/* Expired Stock Count */}
            <div className="rounded-xl border border-red-200 bg-red-50/50 p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-red-700 uppercase tracking-wider">Expired Batches</span>
                <span className="rounded-md bg-red-100 p-1.5 text-red-800">
                  <ShieldAlert className="h-4 w-4" />
                </span>
              </div>
              <div className="mt-2 text-2xl font-bold text-red-900">{data.overview.expiredCount}</div>
              <p className="mt-1 text-xs text-red-700">Quarantine required</p>
            </div>
          </div>

          {/* Daily Stock Analysis & Daily Summary Cards */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Daily Stock Analysis Section */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <CalendarCheck className="h-4 w-4 text-indigo-600" />
                  <h2 className="text-sm font-bold text-slate-900">Daily Stock Movement Analysis</h2>
                </div>
                <span className="text-[11px] font-semibold text-slate-500">Today's Transactions</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase block">Opening Stock</span>
                  <span className="text-lg font-bold text-slate-900 mt-1 block">
                    {data.dailyStockAnalysis.openingStock.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400">Baseline units</span>
                </div>

                <div className="rounded-lg bg-emerald-50/60 p-3 border border-emerald-100">
                  <span className="text-[10px] font-semibold text-emerald-700 uppercase block">+ Received</span>
                  <span className="text-lg font-bold text-emerald-800 mt-1 block">
                    +{data.dailyStockAnalysis.receivedToday.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-emerald-600">Goods in today</span>
                </div>

                <div className="rounded-lg bg-rose-50/60 p-3 border border-rose-100">
                  <span className="text-[10px] font-semibold text-rose-700 uppercase block">- Issued / Sold</span>
                  <span className="text-lg font-bold text-rose-800 mt-1 block">
                    -{data.dailyStockAnalysis.issuedToday.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-rose-600">Dispatched today</span>
                </div>

                <div className="rounded-lg bg-indigo-50/60 p-3 border border-indigo-100">
                  <span className="text-[10px] font-semibold text-indigo-700 uppercase block">= Closing Stock</span>
                  <span className="text-lg font-bold text-indigo-900 mt-1 block">
                    {data.dailyStockAnalysis.closingStock.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-indigo-600">
                    Net: {data.dailyStockAnalysis.netDailyChange >= 0 ? "+" : ""}{data.dailyStockAnalysis.netDailyChange}
                  </span>
                </div>
              </div>
            </div>

            {/* Daily Operational Summary Card */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                  <h2 className="text-sm font-bold text-slate-900">Surveillance Status Summary</h2>
                </div>
                <span className="text-[11px] font-semibold text-emerald-700">Autonomous Check</span>
              </div>

              <div className="grid grid-cols-3 gap-2.5 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block text-[11px]">Unresolved Alerts</span>
                  <span className="text-base font-bold text-slate-900 mt-0.5 block">
                    {data.dailySummary.unresolvedAlerts}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-amber-50/60 border border-amber-100">
                  <span className="text-amber-800 block text-[11px]">Low Stock SKUs</span>
                  <span className="text-base font-bold text-amber-900 mt-0.5 block">
                    {data.dailySummary.lowStockItems}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-rose-50/60 border border-rose-100">
                  <span className="text-rose-800 block text-[11px]">Out-of-Stock SKUs</span>
                  <span className="text-base font-bold text-rose-900 mt-0.5 block">
                    {data.dailySummary.outOfStockItems}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-orange-50/60 border border-orange-100">
                  <span className="text-orange-800 block text-[11px]">Near-Expiry Lots</span>
                  <span className="text-base font-bold text-orange-900 mt-0.5 block">
                    {data.dailySummary.nearExpiryBatches}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-red-50/60 border border-red-100">
                  <span className="text-red-800 block text-[11px]">Expired Lots</span>
                  <span className="text-base font-bold text-red-900 mt-0.5 block">
                    {data.dailySummary.expiredBatches}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-indigo-50/60 border border-indigo-100">
                  <span className="text-indigo-800 block text-[11px]">Total Asset Basis</span>
                  <span className="text-xs font-bold text-indigo-950 mt-1 block truncate">
                    {formatINR(data.dailySummary.totalValuation)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Distribution Charts */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Category Breakdown Chart */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Inventory Valuation by Category</h2>
                  <p className="text-xs text-slate-500">Real-time asset value across product classifications</p>
                </div>
                <span className="text-xs font-semibold text-indigo-700">10 Categories</span>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.categoryDistribution}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                    <XAxis
                      type="number"
                      tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                      tick={{ fontSize: 11, fill: "#64748b" }}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      tick={{ fontSize: 11, fill: "#334155" }}
                      width={110}
                    />
                    <Tooltip
                      formatter={(value) => [formatINR(Number(value) || 0), "Inventory Value"]}
                      contentStyle={{ borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "12px" }}
                    />
                    <Bar dataKey="inventoryValue" fill="#4f46e5" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Warehouse Facility / Storage Zone Distribution */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Storage Location Distribution</h2>
                  <p className="text-xs text-slate-500">Stock distribution across warehouse facilities & bays</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Building2 className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Facility Zones</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.storageDistribution.slice(0, 8)}
                        dataKey="inventoryValue"
                        nameKey="location"
                        cx="50%"
                        cy="50%"
                        outerRadius={75}
                        innerRadius={45}
                        paddingAngle={2}
                      >
                        {data.storageDistribution.slice(0, 8).map((_, index) => (
                          <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val) => [formatINR(Number(val) || 0), "Valuation"]}
                        contentStyle={{ borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "12px" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                  {data.storageDistribution.slice(0, 7).map((d, i) => (
                    <div key={d.location} className="flex items-center justify-between text-xs py-1 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }}
                        />
                        <span className="font-medium text-slate-800 truncate max-w-[140px]">{d.location}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-slate-900">{formatINR(d.inventoryValue)}</span>
                        <span className="text-[10px] text-slate-400 block">{d.productsCount} SKUs</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row: Active Alerts with Recommended Actions & Recent Movements */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Active Continuous Surveillance Alerts */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-rose-600" />
                  <h2 className="text-sm font-bold text-slate-900">Alerts Requiring Immediate Action</h2>
                </div>
                <a
                  href="/monitoring"
                  className="text-xs font-semibold text-indigo-700 hover:text-indigo-800 hover:underline"
                >
                  Manage All ({data.overview.openAlertsCount})
                </a>
              </div>

              <div className="space-y-2.5">
                {data.recentAlerts.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">No open alerts. All monitored parameters are within threshold.</p>
                ) : (
                  data.recentAlerts.slice(0, 4).map((alert) => {
                    const isCritical = alert.severity === "CRITICAL";
                    const isHigh = alert.severity === "HIGH";
                    return (
                      <div
                        key={alert.id}
                        className={`rounded-lg p-3 text-xs border space-y-1.5 ${
                          isCritical
                            ? "bg-rose-50/50 border-rose-200 text-rose-950"
                            : isHigh
                            ? "bg-amber-50/50 border-amber-200 text-amber-950"
                            : "bg-slate-50 border-slate-200 text-slate-800"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span
                              className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                isCritical
                                  ? "bg-rose-600 text-white"
                                  : isHigh
                                  ? "bg-amber-600 text-white"
                                  : "bg-slate-600 text-white"
                              }`}
                            >
                              {alert.alertType}
                            </span>
                            {alert.product?.productCode && (
                              <span className="font-mono text-[10px] text-slate-500">
                                {alert.product.productCode}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {formatDate(alert.createdAt)}
                          </span>
                        </div>

                        <p className="font-semibold text-slate-900 leading-snug">{alert.message}</p>

                        {alert.recommendedAction && (
                          <div className="rounded bg-white/80 p-2 text-[11px] text-slate-700 border border-slate-200/60 font-medium">
                            <span className="font-bold text-slate-900">Recommended Action: </span>
                            {alert.recommendedAction}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Recent Inventory Movements */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-slate-900">Recent Inventory Changes</h2>
                <a
                  href="/inventory"
                  className="text-xs font-semibold text-indigo-700 hover:text-indigo-800 hover:underline"
                >
                  View Movement History
                </a>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="pb-2">Item</th>
                      <th className="pb-2">Action</th>
                      <th className="pb-2 text-right">Quantity</th>
                      <th className="pb-2 text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.recentMovements.map((m) => {
                      const isIncoming = m.movementType === "IN" || m.movementType === "RETURN";
                      return (
                        <tr key={m.id} className="hover:bg-slate-50">
                          <td className="py-2.5 font-medium text-slate-900">
                            <div>{m.product.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {m.product.productCode} • {m.product.storageLocation || "Warehouse"}
                            </div>
                          </td>
                          <td className="py-2.5">
                            <span
                              className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                                isIncoming
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-rose-50 text-rose-700 border border-rose-200"
                              }`}
                            >
                              {isIncoming ? (
                                <ArrowDownLeft className="h-3 w-3 text-emerald-600" />
                              ) : (
                                <ArrowUpRight className="h-3 w-3 text-rose-600" />
                              )}
                              <span>{m.movementType}</span>
                            </span>
                          </td>
                          <td className="py-2.5 text-right font-semibold text-slate-900">
                            {m.quantity} {m.product.unit}
                          </td>
                          <td className="py-2.5 text-right text-slate-400 text-[11px]">
                            {formatDate(m.createdAt)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </AppLayout>
  );
}
