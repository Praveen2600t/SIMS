import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ArrowLeftRight,
  ShieldAlert,
  Truck,
  ShoppingCart,
  BarChart3,
  FileSpreadsheet,
  Menu,
  X,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { useInventory } from "../../hooks/useInventoryStore";

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const { metrics, resetToSampleData, runMonitoring } = useInventory();

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Products", href: "/products", icon: Package },
    { name: "Stock & Batches", href: "/inventory", icon: ArrowLeftRight },
    {
      name: "Monitoring & Alerts",
      href: "/monitoring",
      icon: ShieldAlert,
      badge: metrics.activeAlertsCount > 0 ? metrics.activeAlertsCount : undefined,
      badgeColor: metrics.criticalAlertsCount > 0 ? "bg-red-500" : "bg-amber-500",
    },
    { name: "Suppliers & POs", href: "/suppliers", icon: Truck },
    { name: "Sales & Dispatch", href: "/sales", icon: ShoppingCart },
    { name: "Reports & Analytics", href: "/reports", icon: BarChart3 },
    { name: "CSV Import / Export", href: "/csv-manager", icon: FileSpreadsheet },
  ];

  const handleResetData = () => {
    resetToSampleData();
    runMonitoring();
    setResetModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans">
      {/* Top Mobile Bar */}
      <header className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
            S
          </div>
          <div>
            <h1 className="font-bold text-slate-900 text-sm leading-tight">SICMS</h1>
            <p className="text-[10px] text-slate-500 leading-tight">Smart Inventory Surveillance</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setResetModalOpen(true)}
            title="Reset to Sample Data"
            className="p-1.5 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Desktop */}
        <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-slate-200 flex-shrink-0">
          {/* Logo & Branding */}
          <div className="p-5 border-b border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
              S
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base tracking-tight">SICMS</h2>
              <p className="text-xs text-slate-500 font-medium">Smart Inventory System</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/" ? location.pathname === "/" : location.pathname.startsWith(item.href);

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? "bg-blue-50 text-blue-700 font-semibold"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[11px] font-bold text-white px-2 py-0.5 rounded-full ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* System Footer info & Data Reset */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                Browser Storage Mode
              </span>
              <span className="font-semibold text-slate-700">v2.1</span>
            </div>

            <button
              onClick={() => setResetModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              Reset Sample Data
            </button>
          </div>
        </aside>

        {/* Mobile Slide-out Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40 flex">
            <div
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white z-50 shadow-xl">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                    S
                  </div>
                  <span className="font-bold text-slate-900 text-sm">Smart Inventory</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-md text-slate-500 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.href === "/" ? location.pathname === "/" : location.pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                        isActive
                          ? "bg-blue-50 text-blue-700 font-semibold"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                        <span>{item.name}</span>
                      </div>
                      {item.badge !== undefined && (
                        <span
                          className={`text-[11px] font-bold text-white px-2 py-0.5 rounded-full ${item.badgeColor}`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-slate-200">
                <button
                  onClick={() => {
                    handleResetData();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset to Sample Data
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">{children}</div>
        </main>
      </div>

      {/* Confirmation Modal for Resetting Sample Data */}
      {resetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Reset to Sample Data?</h3>
                <p className="text-xs text-slate-500">Restore default products, movements, and alerts</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              This will reset browser localStorage to the initial 10 catalog products, sample batches, suppliers,
              and historical transactions. Any custom modifications created in this browser will be replaced.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setResetModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetData}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
