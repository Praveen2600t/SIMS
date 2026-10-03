"use client";

import React, { useEffect, useState, useCallback } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { formatDate } from "@/lib/utils";
import {
  Bell,
  AlertTriangle,
  XCircle,
  Clock,
  Activity,
  CheckCircle2,
  RefreshCw,
  Play,
  ShieldAlert,
  Info,
} from "lucide-react";

interface AlertItem {
  id: string;
  alertType: string;
  severity: string;
  status: string;
  message: string;
  detailsJson?: string | null;
  createdAt: string;
  resolvedAt?: string | null;
  product?: {
    id: string;
    name: string;
    productCode: string;
    unit: string;
    currentQuantity: number;
    minStockLevel: number;
    district: string;
    marketLocation: string;
  } | null;
  batch?: {
    id: string;
    batchNumber: string;
    expiryDate?: string | null;
    quantity: number;
  } | null;
  resolvedBy?: { name: string; role: string } | null;
}

export default function MonitoringPage() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"OPEN" | "RESOLVED" | "ACKNOWLEDGED">("OPEN");
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        status: statusFilter,
        limit: "50",
      });
      if (severityFilter !== "ALL") params.append("severity", severityFilter);
      if (typeFilter !== "ALL") params.append("type", typeFilter);

      const res = await fetch(`/api/monitoring/alerts?${params.toString()}`);
      const json = await res.json();
      if (res.ok) {
        setAlerts(json.data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [statusFilter, severityFilter, typeFilter]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const handleResolveAlert = async (id: string, action: "RESOLVE" | "ACKNOWLEDGE") => {
    try {
      const res = await fetch(`/api/monitoring/alerts/${id}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        fetchAlerts();
      }
    } catch {
      alert("Failed to update alert");
    }
  };

  const handleRunEvaluation = async () => {
    setIsEvaluating(true);
    setEvalResult(null);
    try {
      const res = await fetch("/api/monitoring/run", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setEvalResult(
          `Evaluated ${data.result.productsEvaluated} SKUs & ${data.result.batchesEvaluated} batches: Generated ${data.result.alertsCreated} alerts, Auto-resolved ${data.result.alertsResolved}, Detected ${data.result.anomaliesDetected} anomalies.`
        );
        fetchAlerts();
      } else {
        alert(data.error || "Evaluation failed");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error";
      alert(`Monitoring engine error: ${msg}`);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <AppLayout
      title="Continuous Inventory Monitoring Engine"
      subtitle="Autonomous Rule-Based Anomaly Detection & State Stock Auditing"
      onRefresh={fetchAlerts}
    >
      <div className="space-y-4">
        {/* Engine Status & Manual Trigger Header */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h2 className="text-sm font-bold text-slate-900">
                  Continuous Engine Status: <span className="text-emerald-600">Active</span>
                </h2>
              </div>
              <p className="mt-1 text-xs text-slate-500 max-w-xl">
                Continuous background auditing automatically monitors zero stock (OUT_OF_STOCK), threshold breaches (LOW_STOCK), perishable expiration timelines (EXPIRY_WARNING / EXPIRED), and sudden reductions or frequent adjustments (ANOMALY_REVIEW).
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRunEvaluation}
                disabled={isEvaluating}
                className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-500 disabled:opacity-50 transition"
              >
                {isEvaluating ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 fill-white" />
                )}
                <span>{isEvaluating ? "Analyzing System..." : "Run Monitoring Engine Now"}</span>
              </button>
            </div>
          </div>

          {evalResult && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-xs font-medium text-emerald-800 border border-emerald-200 animate-fade-in">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{evalResult}</span>
            </div>
          )}
        </div>

        {/* Explainable Anomaly Detection Information Banner */}
        <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4 text-xs text-indigo-950">
          <div className="flex items-start gap-2.5">
            <Info className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-indigo-900">Explainable Anomaly Rules in Action:</span>
              <p className="mt-0.5 text-indigo-800 leading-relaxed">
                1) <strong>Sudden Quantity Drop:</strong> Triggers when an outbound deduction exceeds 40% of current inventory in a single movement without a recorded customer invoice.
                <br />
                2) <strong>Frequent Manual Adjustments:</strong> Flags products with 3+ manual audit corrections in recent history for supervisor review.
                <br />
                3) <strong>Batch Expiry Escalation:</strong> Perishable batches with ≤ 7 days shelf-life automatically alert mandis before reaching 0-day write-off.
              </p>
            </div>
          </div>
        </div>

        {/* Alerts Filtering & Listing Card */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 bg-slate-50/70 text-xs">
            {/* Status Selector */}
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-700 mr-1">Alert Status:</span>
              {(["OPEN", "ACKNOWLEDGED", "RESOLVED"] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`rounded-md px-3 py-1 font-semibold transition ${
                    statusFilter === st
                      ? "bg-slate-900 text-white"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Type & Severity Selectors */}
            <div className="flex items-center gap-2">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-700"
              >
                <option value="ALL">All Alert Types</option>
                <option value="OUT_OF_STOCK">Out of Stock</option>
                <option value="LOW_STOCK">Low Stock</option>
                <option value="EXPIRY_WARNING">Expiry Warning</option>
                <option value="EXPIRED">Expired</option>
                <option value="ANOMALY_REVIEW">Anomaly Review</option>
              </select>

              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-700"
              >
                <option value="ALL">All Severities</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
          </div>

          {/* Alerts Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Severity</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Alert Message & Product</th>
                  <th className="py-3 px-4">Market / District</th>
                  <th className="py-3 px-4">Triggered At</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      Loading monitoring alerts...
                    </td>
                  </tr>
                ) : alerts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      No alerts match the selected status and filters. All monitored stock rules are in compliance.
                    </td>
                  </tr>
                ) : (
                  alerts.map((al) => {
                    const isCritical = al.severity === "CRITICAL";
                    const isHigh = al.severity === "HIGH";

                    return (
                      <tr key={al.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-4">
                          <span
                            className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                              isCritical
                                ? "bg-rose-600 text-white"
                                : isHigh
                                ? "bg-amber-600 text-white"
                                : "bg-sky-600 text-white"
                            }`}
                          >
                            {al.severity}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          {al.alertType}
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-slate-900 leading-snug">{al.message}</p>
                          {al.product && (
                            <span className="text-[11px] text-slate-400">
                              SKU: {al.product.productCode} • Stock: {al.product.currentQuantity}{" "}
                              {al.product.unit} (Min: {al.product.minStockLevel})
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {al.product ? (
                            <div>
                              <div className="font-medium text-slate-800">{al.product.district}</div>
                              <span className="text-[10px] text-slate-400">
                                {al.product.marketLocation}
                              </span>
                            </div>
                          ) : (
                            "Statewide / Batch"
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                          {formatDate(al.createdAt)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {al.status === "OPEN" ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleResolveAlert(al.id, "ACKNOWLEDGE")}
                                className="rounded-md border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
                              >
                                Ack
                              </button>
                              <button
                                onClick={() => handleResolveAlert(al.id, "RESOLVE")}
                                className="rounded-md bg-emerald-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-emerald-500"
                              >
                                Resolve
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] font-medium text-slate-400 italic">
                              Resolved {al.resolvedAt ? formatDate(al.resolvedAt) : ""}
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
      </div>
    </AppLayout>
  );
}
