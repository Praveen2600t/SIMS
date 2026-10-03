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
  Sliders,
  Warehouse,
  X,
  Save,
} from "lucide-react";

interface AlertItem {
  id: string;
  alertType: string;
  severity: string;
  status: string;
  message: string;
  recommendedAction?: string | null;
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
    storageLocation?: string | null;
  } | null;
  batch?: {
    id: string;
    batchNumber: string;
    expiryDate?: string | null;
    quantity: number;
  } | null;
  resolvedBy?: { name: string; role: string } | null;
}

interface MonitoringConfig {
  expiryWarningDays: number;
  anomalyDropPercentage: number;
  rapidAdjustmentLimit: number;
}

export default function MonitoringPage() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"OPEN" | "RESOLVED" | "ACKNOWLEDGED">("OPEN");
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState<string | null>(null);

  // Settings State
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [config, setConfig] = useState<MonitoringConfig>({
    expiryWarningDays: 14,
    anomalyDropPercentage: 35,
    rapidAdjustmentLimit: 3,
  });
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [configMsg, setConfigMsg] = useState<string | null>(null);

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

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/monitoring/settings");
      const json = await res.json();
      if (res.ok && json.config) {
        setConfig(json.config);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
    fetchSettings();
  }, [fetchAlerts, fetchSettings]);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingConfig(true);
    setConfigMsg(null);
    try {
      const res = await fetch("/api/monitoring/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (res.ok) {
        setConfigMsg("Monitoring rules updated successfully! Running evaluation with new rules...");
        setTimeout(() => {
          setIsConfigOpen(false);
          handleRunEvaluation();
        }, 800);
      } else {
        setConfigMsg(data.error || "Failed to update rules");
      }
    } catch {
      setConfigMsg("Failed to update monitoring rules");
    } finally {
      setIsSavingConfig(false);
    }
  };

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
      subtitle="Autonomous Rule-Based Surveillance, Stock Auditing & Anomaly Detection"
      onRefresh={fetchAlerts}
    >
      <div className="space-y-4">
        {/* Engine Status, Settings & Manual Trigger Bar */}
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
                Background monitoring evaluates zero stock (<span className="font-mono text-slate-700">OUT_OF_STOCK</span>), threshold breaches (<span className="font-mono text-slate-700">LOW_STOCK</span>), perishable expiration timelines (<span className="font-mono text-slate-700">EXPIRY_WARNING / EXPIRED</span>), and sudden deductions or rapid manual adjustments (<span className="font-mono text-slate-700">ANOMALY_REVIEW</span>).
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsConfigOpen(true)}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
              >
                <Sliders className="h-3.5 w-3.5 text-slate-500" />
                <span>Configure Rules</span>
              </button>

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
              <div className="mt-1 grid grid-cols-1 md:grid-cols-3 gap-3 text-indigo-800">
                <div className="rounded-lg bg-white/70 p-2.5 border border-indigo-100/50">
                  <strong>1) Sudden Stock Drop:</strong>
                  <p className="mt-0.5 text-[11px] text-slate-600">
                    Triggers when single-movement deduction exceeds {config.anomalyDropPercentage}% of available balance without an outbound dispatch order.
                  </p>
                </div>
                <div className="rounded-lg bg-white/70 p-2.5 border border-indigo-100/50">
                  <strong>2) Rapid Manual Adjustments:</strong>
                  <p className="mt-0.5 text-[11px] text-slate-600">
                    Flags items exceeding {config.rapidAdjustmentLimit} manual quantity corrections in recent history for supervisory investigation.
                  </p>
                </div>
                <div className="rounded-lg bg-white/70 p-2.5 border border-indigo-100/50">
                  <strong>3) Perishable Expiry Horizon:</strong>
                  <p className="mt-0.5 text-[11px] text-slate-600">
                    Batches with shelf-life under {config.expiryWarningDays} days automatically generate re-allocation or discount dispatch alerts.
                  </p>
                </div>
              </div>
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
                  <th className="py-3 px-4">Alert Details & Recommended Action</th>
                  <th className="py-3 px-4">Storage Location</th>
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
                        <td className="py-3 px-4 max-w-md">
                          <p className="font-semibold text-slate-900 leading-snug">{al.message}</p>
                          {al.recommendedAction && (
                            <div className="mt-1 rounded bg-amber-50/80 border border-amber-200/60 px-2 py-1 text-[11px] font-medium text-amber-900">
                              <span className="font-bold">Recommended Action:</span> {al.recommendedAction}
                            </div>
                          )}
                          {al.product && (
                            <span className="text-[10px] text-slate-400 block mt-1">
                              SKU: {al.product.productCode} • Available: {al.product.currentQuantity}{" "}
                              {al.product.unit} (Min: {al.product.minStockLevel})
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          <div className="flex items-center gap-1 font-medium text-slate-800">
                            <Warehouse className="h-3 w-3 text-emerald-600 shrink-0" />
                            <span className="truncate max-w-[160px]">{al.product?.storageLocation || "Warehouse Facility"}</span>
                          </div>
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

      {/* Configurable Monitoring Rules Modal */}
      {isConfigOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-emerald-600" />
                <h2 className="text-base font-bold text-slate-900">Configurable Monitoring Rules</h2>
              </div>
              <button
                onClick={() => setIsConfigOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveConfig} className="mt-4 space-y-4 text-xs">
              {configMsg && (
                <div className="rounded-lg bg-emerald-50 p-2.5 text-emerald-800 border border-emerald-200">
                  {configMsg}
                </div>
              )}

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Expiry Warning Horizon (Days)
                </label>
                <input
                  type="number"
                  min={1}
                  max={180}
                  required
                  value={config.expiryWarningDays}
                  onChange={(e) =>
                    setConfig({ ...config, expiryWarningDays: parseInt(e.target.value) || 14 })
                  }
                  className="w-full rounded-lg border border-slate-200 p-2 text-slate-900"
                />
                <span className="text-[11px] text-slate-400">
                  Flag perishable lots approaching expiry within this threshold.
                </span>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Anomaly Drop Percentage (%)
                </label>
                <input
                  type="number"
                  min={10}
                  max={95}
                  required
                  value={config.anomalyDropPercentage}
                  onChange={(e) =>
                    setConfig({ ...config, anomalyDropPercentage: parseInt(e.target.value) || 35 })
                  }
                  className="w-full rounded-lg border border-slate-200 p-2 text-slate-900"
                />
                <span className="text-[11px] text-slate-400">
                  Flag sudden outbound stock reductions that exceed this % of current balance.
                </span>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Rapid Adjustments Threshold
                </label>
                <input
                  type="number"
                  min={2}
                  max={20}
                  required
                  value={config.rapidAdjustmentLimit}
                  onChange={(e) =>
                    setConfig({ ...config, rapidAdjustmentLimit: parseInt(e.target.value) || 3 })
                  }
                  className="w-full rounded-lg border border-slate-200 p-2 text-slate-900"
                />
                <span className="text-[11px] text-slate-400">
                  Flag SKUs with manual adjustments exceeding this count within 24 hours.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsConfigOpen(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingConfig}
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>{isSavingConfig ? "Saving..." : "Save & Re-evaluate"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
