import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  Layers,
  AlertTriangle,
  XCircle,
  Clock,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  ArrowRight,
  ShieldAlert,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";
import { useInventory } from "../hooks/useInventoryStore";

export const DashboardPage: React.FC = () => {
  const { products, movements, alerts, metrics, runMonitoring, acknowledgeAlert } = useInventory();

  // Active Critical & Warning Alerts
  const activeAlerts = useMemo(() => {
    return alerts.filter((a) => a.status !== "RESOLVED").slice(0, 5);
  }, [alerts]);

  // Aggregate Movement Volume for Chart (Last 7 distinct activity points)
  const chartData = useMemo(() => {
    // Group movements by date (YYYY-MM-DD)
    const grouped: Record<string, { date: string; inQty: number; outQty: number }> = {};

    // Get last 14 days or recent movements
    movements.slice(0, 30).forEach((m) => {
      const day = m.date.split("T")[0];
      if (!grouped[day]) {
        grouped[day] = { date: day.slice(5), inQty: 0, outQty: 0 };
      }
      if (m.type === "IN") grouped[day].inQty += m.quantity;
      if (m.type === "OUT" || m.type === "SALE") grouped[day].outQty += m.quantity;
    });

    const list = Object.values(grouped).reverse();
    return list.length > 0
      ? list
      : [
          { date: "Oct 01", inQty: 300, outQty: 65 },
          { date: "Oct 02", inQty: 50, outQty: 18 },
          { date: "Oct 03", inQty: 100, outQty: 42 },
        ];
  }, [movements]);

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Continuous Surveillance Active
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Inventory Dashboard</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time telemetry, stock surveillance, batch expiry, and movement monitoring.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => runMonitoring()}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            Run Check Now
          </button>
          <Link
            to="/inventory"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Stock In / Out
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Catalog Products */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Catalog Products</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{metrics.totalProducts}</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Active distinct SKUs registered</p>
          </div>
        </div>

        {/* Total Stock Available */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Available Units</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{metrics.totalStock.toLocaleString()}</div>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
              ₹{metrics.totalInventoryValue.toLocaleString()} total value
            </p>
          </div>
        </div>

        {/* Low Stock Items */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Low Stock Alerts</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-amber-600">{metrics.lowStockCount}</div>
            <p className="text-[11px] text-slate-500 mt-0.5">At or below reorder threshold</p>
          </div>
        </div>

        {/* Out of Stock & Expired */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Depleted / Expired</span>
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">
              {metrics.outOfStockCount + metrics.expiredBatchCount}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {metrics.outOfStockCount} out-of-stock, {metrics.expiredBatchCount} expired
            </p>
          </div>
        </div>
      </div>

      {/* Main Row: Surveillance Feed + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Continuous Surveillance Alerts */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 leading-tight">
                  Continuous Surveillance Feed
                </h3>
                <p className="text-xs text-slate-500">
                  Automated checks run after every stock change and view load.
                </p>
              </div>
            </div>
            <Link
              to="/monitoring"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition"
            >
              View all ({alerts.filter((a) => a.status !== "RESOLVED").length})
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {activeAlerts.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-800">Inventory Status Healthy</p>
              <p className="text-xs text-slate-500 mt-1">
                Zero active critical alarms or depleted batches detected by surveillance.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeAlerts.map((alert) => {
                const isCritical = alert.severity === "CRITICAL";
                return (
                  <div
                    key={alert.id}
                    className={`p-3.5 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isCritical
                        ? "bg-red-50/50 border-red-200 text-red-950"
                        : "bg-amber-50/50 border-amber-200 text-amber-950"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                            isCritical ? "bg-red-600 text-white" : "bg-amber-600 text-white"
                          }`}
                        >
                          {alert.type.replace(/_/g, " ")}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900">{alert.title}</h4>
                      </div>
                      <p className="text-xs text-slate-600 leading-normal">{alert.message}</p>
                      <p className="text-[11px] text-slate-400">
                        Triggered: {new Date(alert.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {alert.status === "ACTIVE" && (
                        <button
                          onClick={() => acknowledgeAlert(alert.id)}
                          className="px-2.5 py-1.5 text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg shadow-2xs transition"
                        >
                          Acknowledge
                        </button>
                      )}
                      <Link
                        to="/monitoring"
                        className="px-2.5 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                      >
                        Inspect
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Movement Activity Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4 flex flex-col">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">Stock Movement Trends</h3>
              <p className="text-xs text-slate-500">Recent Inflow vs Outflow volumes</p>
            </div>
            <Link to="/inventory" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
              Details
            </Link>
          </div>

          <div className="flex-1 min-h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    fontSize: "12px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Bar dataKey="inQty" name="Stock In" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="outQty" name="Stock Out" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-6 pt-2 border-t border-slate-100 text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-blue-600 inline-block"></span>
              <span>Stock Inflow</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-amber-500 inline-block"></span>
              <span>Dispatches & Sales</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Movements Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 leading-tight">Recent Stock Activity</h3>
            <p className="text-xs text-slate-500">Live ledger of latest product inflows, outflows, and adjustments</p>
          </div>
          <Link
            to="/inventory"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            Full Ledger <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Product</th>
                <th className="py-3 px-3">Quantity</th>
                <th className="py-3 px-3">Balance</th>
                <th className="py-3 px-3">Reason / Ref</th>
                <th className="py-3 px-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {movements.slice(0, 6).map((m) => {
                const isIn = m.type === "IN";
                return (
                  <tr key={m.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold text-[10px] ${
                          isIn
                            ? "bg-blue-50 text-blue-700"
                            : m.type === "SALE"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {isIn ? (
                          <ArrowDownLeft className="w-3 h-3 text-blue-600" />
                        ) : (
                          <ArrowUpRight className="w-3 h-3 text-amber-600" />
                        )}
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
                    <td className="py-3 px-3 font-mono text-slate-600">
                      {m.previousQty} → {m.newQty}
                    </td>
                    <td className="py-3 px-3 text-slate-600 max-w-xs truncate">
                      {m.reason}
                    </td>
                    <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                      {new Date(m.date).toLocaleDateString([], { month: "short", day: "numeric" })} •{" "}
                      {new Date(m.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
