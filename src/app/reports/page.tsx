"use client";

import React, { useEffect, useState, useCallback } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { formatINR, formatDate } from "@/lib/utils";
import {
  BarChart3,
  Calendar,
  Download,
  TrendingUp,
  Boxes,
  FileSpreadsheet,
  AlertTriangle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

interface ReportData {
  movementsByType: { movementType: string; _count: { id: number }; _sum: { quantity: number } }[];
  salesOverTime: { id: string; totalAmount: number; createdAt: string }[];
  alertsSummary: { alertType: string; status: string; _count: { id: number } }[];
}

export default function ReportsPage() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports?days=${days}`);
      const json = await res.json();
      if (res.ok) {
        setData(json);
      }
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Aggregate sales by day
  const salesChartData = React.useMemo(() => {
    if (!data?.salesOverTime) return [];
    const dateMap = new Map<string, number>();

    data.salesOverTime.forEach((s) => {
      const d = new Date(s.createdAt).toISOString().split("T")[0];
      dateMap.set(d, (dateMap.get(d) || 0) + s.totalAmount);
    });

    return Array.from(dateMap.entries()).map(([date, revenue]) => ({
      date,
      revenue,
    }));
  }, [data]);

  const movementChartData = React.useMemo(() => {
    if (!data?.movementsByType) return [];
    return data.movementsByType.map((m) => ({
      type: m.movementType,
      volume: m._sum.quantity || 0,
      count: m._count.id,
    }));
  }, [data]);

  return (
    <AppLayout
      title="Analytics, Trends & Operational Reports"
      subtitle="Historical Velocity, Stock Reconciliations & Audit Aggregates"
      onRefresh={fetchReports}
    >
      <div className="space-y-6">
        {/* Controls Bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-emerald-600" />
            <span className="text-xs font-semibold text-slate-700">Reporting Time Horizon:</span>
            <div className="flex items-center gap-1">
              {[7, 30, 90].map((d) => (
                <button
                  key={d}
                  onClick={() => setDays(d)}
                  className={`rounded-md px-3 py-1 text-xs font-semibold transition ${
                    days === d
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Last {d} Days
                </button>
              ))}
            </div>
          </div>

          <a
            href="/api/csv/export"
            download
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span>Download Full CSV Export</span>
          </a>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Movement Velocity Chart */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="mb-4">
              <h2 className="text-sm font-bold text-slate-900">Inventory Movement Volume by Type</h2>
              <p className="text-xs text-slate-500">Cumulative quantity units transferred (Last {days} days)</p>
            </div>

            <div className="h-72 w-full">
              {loading ? (
                <div className="flex h-full items-center justify-center text-xs text-slate-400">
                  Loading movements chart...
                </div>
              ) : movementChartData.length === 0 ? (
                <div className="flex h-full items-center justify-center text-xs text-slate-400">
                  No movement transactions in this time window.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={movementChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="type" tick={{ fontSize: 11, fill: "#64748b" }} />
                    <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                    <Tooltip
                      formatter={(val) => [`${val} Units`, "Quantity"]}
                      contentStyle={{ borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "12px" }}
                    />
                    <Bar dataKey="volume" fill="#059669" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Sales Revenue Trend Chart */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="mb-4">
              <h2 className="text-sm font-bold text-slate-900">Sales Invoicing Trajectory (₹)</h2>
              <p className="text-xs text-slate-500">Daily revenue realized from mandi dispatches</p>
            </div>

            <div className="h-72 w-full">
              {loading ? (
                <div className="flex h-full items-center justify-center text-xs text-slate-400">
                  Loading sales chart...
                </div>
              ) : salesChartData.length === 0 ? (
                <div className="flex h-full items-center justify-center text-xs text-slate-400">
                  No sales recorded in the selected period.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#64748b" }} />
                    <YAxis
                      tickFormatter={(val) => `₹${val}`}
                      tick={{ fontSize: 11, fill: "#64748b" }}
                    />
                    <Tooltip
                      formatter={(val) => [formatINR(Number(val) || 0), "Revenue"]}
                      contentStyle={{ borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "12px" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#0284c7"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Operational Compliance Breakdown */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 mb-3">Monitoring Compliance Summary</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 block uppercase">
                Stock Audits
              </span>
              <span className="text-xl font-bold text-slate-900 mt-1 block">
                {movementChartData.find((m) => m.type === "ADJUSTMENT")?.count || 0} Adjustments
              </span>
            </div>

            <div className="rounded-lg bg-emerald-50/50 p-3 border border-emerald-100">
              <span className="text-[11px] font-semibold text-emerald-700 block uppercase">
                Inbound Inflow
              </span>
              <span className="text-xl font-bold text-emerald-800 mt-1 block">
                {movementChartData.find((m) => m.type === "IN")?.volume || 0} Units
              </span>
            </div>

            <div className="rounded-lg bg-rose-50/50 p-3 border border-rose-100">
              <span className="text-[11px] font-semibold text-rose-700 block uppercase">
                Outbound Dispatches
              </span>
              <span className="text-xl font-bold text-rose-800 mt-1 block">
                {movementChartData.find((m) => m.type === "OUT" || m.type === "SALE")?.volume || 0} Units
              </span>
            </div>

            <div className="rounded-lg bg-amber-50/50 p-3 border border-amber-100">
              <span className="text-[11px] font-semibold text-amber-700 block uppercase">
                Damaged / Spoilage
              </span>
              <span className="text-xl font-bold text-amber-800 mt-1 block">
                {movementChartData.find((m) => m.type === "DAMAGE")?.volume || 0} Units
              </span>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
