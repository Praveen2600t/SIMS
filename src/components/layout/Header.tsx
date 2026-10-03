"use client";

import React, { useState } from "react";
import { Menu, Play, RefreshCw, LogOut, Bell, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface HeaderProps {
  onToggleSidebar: () => void;
  title: string;
  subtitle?: string;
  onRefresh?: () => void;
}

export function Header({ onToggleSidebar, title, subtitle, onRefresh }: HeaderProps) {
  const { user, logout } = useAuth();
  const [isRunningEngine, setIsRunningEngine] = useState(false);
  const [engineMessage, setEngineMessage] = useState<string | null>(null);

  const handleRunMonitoring = async () => {
    setIsRunningEngine(true);
    setEngineMessage(null);
    try {
      const res = await fetch("/api/monitoring/run", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setEngineMessage(
          `Evaluated ${data.result?.productsEvaluated ?? 0} items: ${data.result?.alertsCreated ?? 0} new alerts, ${data.result?.alertsResolved ?? 0} auto-resolved`
        );
        setTimeout(() => setEngineMessage(null), 5000);
        if (onRefresh) onRefresh();
      } else {
        alert(data.error || "Failed to execute monitoring engine");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error";
      alert(`Monitoring execution failed: ${msg}`);
    } finally {
      setIsRunningEngine(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6">
      {/* Left side: Hamburger + Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle Navigation"
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <h1 className="text-lg font-bold text-slate-900 leading-tight">{title}</h1>
          {subtitle && <p className="text-xs text-slate-500 font-normal">{subtitle}</p>}
        </div>
      </div>

      {/* Right side: Monitoring Trigger + Notifications + Logout */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Engine status notification if recently triggered */}
        {engineMessage && (
          <div className="hidden lg:flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 border border-emerald-200 animate-fade-in">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <span>{engineMessage}</span>
          </div>
        )}

        {/* Continuous Monitoring Trigger Button */}
        <button
          onClick={handleRunMonitoring}
          disabled={isRunningEngine}
          title="Run continuous inventory analysis across all items and lot batches"
          className="flex items-center gap-1.5 rounded-lg border border-indigo-600 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100 disabled:opacity-50"
        >
          {isRunningEngine ? (
            <RefreshCw className="h-3.5 w-3.5 animate-spin text-indigo-600" />
          ) : (
            <Play className="h-3.5 w-3.5 text-indigo-600 fill-indigo-600" />
          )}
          <span className="hidden sm:inline">Evaluate Inventory</span>
        </button>

        {/* Alerts Link */}
        <a
          href="/monitoring"
          title="View Active Operational Alerts"
          className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100"
        >
          <Bell className="h-4.5 w-4.5" />
        </a>

        {/* Logout */}
        <button
          onClick={logout}
          title="Sign out of system"
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-rose-600"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
