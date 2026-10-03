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
  MapPin,
  ArrowUpRight,
  ArrowDownLeft,
  Bell,
  RefreshCw,
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
  categoryDistribution: { categoryId: string; name: string; productsCount: number; inventoryValue: number }[];
  districtDistribution: { district: string; productsCount: number; totalStock: number; inventoryValue: number }[];
  recentAlerts: {
    id: string;
    alertType: string;
    severity: string;
    message: string;
    createdAt: string;
    product?: { name: string; district: string };
  }[];
  recentMovements: {
    id: string;
    movementType: string;
    quantity: number;
    createdAt: string;
    reason: string;
    product: { name: string; productCode: string; unit: string; district: string };
    performedBy?: { name: string };
  }[];
}

const CATEGORY_COLORS = [
  "#059669", "#0284c7", "#d97706", "#dc2626", "#7c3aed",
  "#0891b2", "#ea580c", "#4f46e5", "#16a34a", "#be185d",
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
      subtitle="Real-time Tamil Nadu Mandi & Retail Operational Intelligence"
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
            <RefreshCw className="h-8 w-8 animate-spin text-emerald-600" />
            <p className="text-sm font-medium text-slate-500">Aggregating live database records...</p>
          </div>
        </div>
      ) : data ? (
        <div className="space-y-6">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {/* Total Products */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Catalogue</span>
                <span className="rounded-md bg-slate-100 p-1.5 text-slate-700">
                  <Package className="h-4 w-4" />
                </span>
              </div>
              <div className="mt-2 text-2xl font-bold text-slate-900">{data.overview.totalProducts}</div>
              <p className="mt-1 text-xs text-slate-500">{data.overview.totalStockUnits.toLocaleString("en-IN")} units</p>
            </div>

            {/* Total Valuation */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Inventory Value</span>
                <span className="rounded-md bg-emerald-50 p-1.5 text-emerald-700">
                  <IndianRupee className="h-4 w-4" />
                </span>
              </div>
              <div className="mt-2 text-2xl font-bold text-emerald-700">
                {formatINR(data.overview.totalInventoryValue)}
              </div>
              <p className="mt-1 text-xs text-slate-500">Purchase cost basis</p>
            </div>

            {/* Low Stock Alerts */}
            <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Low Stock</span>
                <span className="rounded-md bg-amber-100 p-1.5 text-amber-800">
                  <AlertTriangle className="h-4 w-4" />
                </span>
              </div>
              <div className="mt-2 text-2xl font-bold text-amber-900">{data.overview.lowStockCount}</div>
              <p className="mt-1 text-xs text-amber-700">Under min threshold</p>
            </div>

            {/* Out of Stock */}
            <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider">Out of Stock</span>
                <span className="rounded-md bg-rose-100 p-1.5 text-rose-800">
                  <XCircle className="h-4 w-4" />
                </span>
              </div>
              <div className="mt-2 text-2xl font-bold text-rose-900">{data.overview.outOfStockCount}</div>
              <p className="mt-1 text-xs text-rose-700">Requires immediate PO</p>
            </div>

            {/* Expiring Batches */}
            <div className="rounded-xl border border-orange-200 bg-orange-50/40 p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-orange-700 uppercase tracking-wider">Expiring Soon</span>
                <span className="rounded-md bg-orange-100 p-1.5 text-orange-800">
                  <Clock className="h-4 w-4" />
                </span>
              </div>
              <div className="mt-2 text-2xl font-bold text-orange-900">{data.overview.expiringSoonCount}</div>
              <p className="mt-1 text-xs text-orange-700">Within next 7 days</p>
            </div>

            {/* Total Revenue */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Sales</span>
                <span className="rounded-md bg-sky-50 p-1.5 text-sky-700">
                  <TrendingUp className="h-4 w-4" />
                </span>
              </div>
              <div className="mt-2 text-2xl font-bold text-slate-900">
                {formatINR(data.overview.totalSalesRevenue)}
              </div>
              <p className="mt-1 text-xs text-slate-500">{data.overview.totalSalesOrders} orders</p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Category Breakdown Chart */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Inventory Valuation by Category</h2>
                  <p className="text-xs text-slate-500">Total cost value in Tamil Nadu retail stock</p>
                </div>
                <span className="text-xs font-semibold text-emerald-700">10 Categories</span>
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
                    <Bar dataKey="inventoryValue" fill="#059669" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* District Distribution Summary */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">District Mandi Distribution</h2>
                  <p className="text-xs text-slate-500">Aggregated inventory by Tamil Nadu market location</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                  <span>State Markets</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.districtDistribution.slice(0, 8)}
                        dataKey="inventoryValue"
                        nameKey="district"
                        cx="50%"
                        cy="50%"
                        outerRadius={75}
                        innerRadius={45}
                        paddingAngle={2}
                      >
                        {data.districtDistribution.slice(0, 8).map((_, index) => (
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
                  {data.districtDistribution.slice(0, 7).map((d, i) => (
                    <div key={d.district} className="flex items-center justify-between text-xs py-1 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }}
                        />
                        <span className="font-medium text-slate-800">{d.district}</span>
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

          {/* Bottom Row: Active Continuous Alerts & Recent Movements */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Active Continuous Alerts */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-rose-600" />
                  <h2 className="text-sm font-bold text-slate-900">Active Operational Alerts</h2>
                </div>
                <a
                  href="/monitoring"
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
                >
                  View All ({data.overview.openAlertsCount})
                </a>
              </div>

              <div className="space-y-2.5">
                {data.recentAlerts.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">No open alerts. All stock parameters normal.</p>
                ) : (
                  data.recentAlerts.slice(0, 5).map((alert) => {
                    const isCritical = alert.severity === "CRITICAL";
                    const isHigh = alert.severity === "HIGH";
                    return (
                      <div
                        key={alert.id}
                        className={`flex items-start justify-between rounded-lg p-3 text-xs border ${
                          isCritical
                            ? "bg-rose-50/50 border-rose-200 text-rose-950"
                            : isHigh
                            ? "bg-amber-50/50 border-amber-200 text-amber-950"
                            : "bg-slate-50 border-slate-200 text-slate-800"
                        }`}
                      >
                        <div className="space-y-0.5 max-w-[80%]">
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
                            {alert.product?.district && (
                              <span className="text-[11px] font-medium text-slate-500">
                                {alert.product.district}
                              </span>
                            )}
                          </div>
                          <p className="font-medium text-slate-900 leading-snug">{alert.message}</p>
                        </div>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {formatDate(alert.createdAt)}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Recent Stock Movements */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-slate-900">Recent Inventory Movements</h2>
                <a
                  href="/inventory"
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
                >
                  View Movement Audit
                </a>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="pb-2">Product</th>
                      <th className="pb-2">Type</th>
                      <th className="pb-2 text-right">Quantity</th>
                      <th className="pb-2 text-right">Date</th>
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
                              {m.product.productCode} • {m.product.district}
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
