import React, { useState, useMemo } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
  XCircle,
  Clock,
  Info,
  CheckCircle2,
  Trash2,
  Eye,
  Sliders,
} from "lucide-react";
import { useInventory } from "../hooks/useInventoryStore";
import { Alert } from "../lib/inventoryStore";

export const MonitoringPage: React.FC = () => {
  const { alerts, runMonitoring, acknowledgeAlert, resolveAlert, clearResolvedAlerts } = useInventory();

  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "ACKNOWLEDGED" | "RESOLVED">("ALL");
  const [severityFilter, setSeverityFilter] = useState<"ALL" | "CRITICAL" | "WARNING" | "INFO">("ALL");
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const filteredAlerts = useMemo(() => {
    return alerts.filter((a) => {
      const matchStatus = statusFilter === "ALL" || a.status === statusFilter;
      const matchSeverity = severityFilter === "ALL" || a.severity === severityFilter;
      return matchStatus && matchSeverity;
    });
  }, [alerts, statusFilter, severityFilter]);

  const handleRunScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      runMonitoring();
      setIsScanning(false);
    }, 400);
  };

  const activeCount = alerts.filter((a) => a.status === "ACTIVE").length;
  const criticalCount = alerts.filter((a) => a.severity === "CRITICAL" && a.status !== "RESOLVED").length;
  const warningCount = alerts.filter((a) => a.severity === "WARNING" && a.status !== "RESOLVED").length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Automated Rule Engine
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Continuous Surveillance & Alerts</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Automated detection for low stock, zero-inventory stockouts, batch expiries, and anomalous movements.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={clearResolvedAlerts}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
          >
            <Trash2 className="w-3.5 h-3.5 text-slate-400" />
            Clear Resolved
          </button>
          <button
            onClick={handleRunScan}
            disabled={isScanning}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-xs transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? "animate-spin" : ""}`} />
            {isScanning ? "Scanning..." : "Run Surveillance Scan"}
          </button>
        </div>
      </div>

      {/* Browser Mode Notice */}
      <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/60 text-xs text-blue-900 flex items-start gap-3">
        <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="space-y-1">
          <h4 className="font-bold">Continuous Browser Surveillance Telemetry</h4>
          <p className="text-blue-800 leading-relaxed">
            In standalone client-side mode, surveillance checks evaluate automatically after every stock modification
            (Stock In, Stock Out, Sales, Adjustments) and whenever you open the dashboard. Browser localStorage stores all state locally on this device without requiring external backend servers.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Critical Alarms</span>
            <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-red-600">{criticalCount}</div>
          <p className="text-[11px] text-slate-400">Depleted stock & expired batches</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Warning Warnings</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-600">{warningCount}</div>
          <p className="text-[11px] text-slate-400">Below safety threshold & 30d expiry</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Active Action Items</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{activeCount}</div>
          <p className="text-[11px] text-slate-400">Requires acknowledgment / reorder</p>
        </div>
      </div>

      {/* Filters & Alarm Feed */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Filter Toolbar */}
        <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 mr-1">Status:</span>
            {(["ALL", "ACTIVE", "ACKNOWLEDGED", "RESOLVED"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  statusFilter === s
                    ? "bg-blue-600 text-white shadow-2xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Severity:</span>
            <select
              value={severityFilter}
              onChange={(e: any) => setSeverityFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical Only</option>
              <option value="WARNING">Warnings Only</option>
              <option value="INFO">Info Only</option>
            </select>
          </div>
        </div>

        {/* List of Alerts */}
        <div className="divide-y divide-slate-100">
          {filteredAlerts.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto" />
              <h4 className="font-bold text-slate-800 text-sm">No Alerts in this Category</h4>
              <p className="text-xs text-slate-400">All surveillance checks matching current filter are normal.</p>
            </div>
          ) : (
            filteredAlerts.map((alert) => {
              const isCritical = alert.severity === "CRITICAL";
              const isWarning = alert.severity === "WARNING";
              const isResolved = alert.status === "RESOLVED";

              return (
                <div
                  key={alert.id}
                  className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 transition ${
                    isResolved ? "bg-slate-50/50 opacity-60" : "hover:bg-slate-50/80"
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        isCritical
                          ? "bg-red-50 text-red-600"
                          : isWarning
                          ? "bg-amber-50 text-amber-600"
                          : "bg-blue-50 text-blue-600"
                      }`}
                    >
                      {isCritical ? (
                        <XCircle className="w-5 h-5" />
                      ) : isWarning ? (
                        <AlertTriangle className="w-5 h-5" />
                      ) : (
                        <Info className="w-5 h-5" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                            isCritical
                              ? "bg-red-600 text-white"
                              : isWarning
                              ? "bg-amber-600 text-white"
                              : "bg-blue-600 text-white"
                          }`}
                        >
                          {alert.severity}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm">{alert.title}</h4>
                        <span className="text-[11px] font-medium text-slate-400">
                          • {new Date(alert.createdAt).toLocaleString()}
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed max-w-2xl">{alert.message}</p>

                      <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-500">
                        <span className="bg-slate-100 px-2 py-0.5 rounded font-mono">
                          Rule: {alert.type}
                        </span>
                        <span className="text-slate-600">
                          <strong>Trigger Reason:</strong> {alert.reason}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 sm:self-center flex-shrink-0">
                    {alert.status === "ACTIVE" && (
                      <button
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg shadow-2xs transition"
                      >
                        Acknowledge
                      </button>
                    )}

                    {alert.status !== "RESOLVED" && (
                      <button
                        onClick={() => resolveAlert(alert.id)}
                        className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-2xs transition flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Resolve
                      </button>
                    )}

                    {isResolved && (
                      <span className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-lg">
                        Resolved
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
