"use client";

import React from "react";
import Link from "next/navigation";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Boxes,
  BellRing,
  Truck,
  ShoppingCart,
  BarChart3,
  FileSpreadsheet,
  ShieldCheck,
  MapPin,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/products", label: "Products", icon: Package },
  { href: "/inventory", label: "Inventory Movements", icon: Boxes },
  { href: "/monitoring", label: "Monitoring & Alerts", icon: BellRing },
  { href: "/suppliers", label: "Suppliers & Orders", icon: Truck },
  { href: "/sales", label: "Sales Transactions", icon: ShoppingCart },
  { href: "/reports", label: "Analytics & Reports", icon: BarChart3 },
  { href: "/csv-manager", label: "CSV Dataset & Import", icon: FileSpreadsheet },
];

export function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs md:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 md:static md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand / Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 font-bold text-white shadow-xs">
            TN
          </div>
          <div>
            <div className="font-semibold text-slate-900 leading-tight">SICMS</div>
            <div className="text-xs text-slate-500 font-medium">Tamil Nadu Mandi Intel</div>
          </div>
        </div>

        {/* Region Tag */}
        <div className="mx-4 my-3 flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800 border border-emerald-200">
          <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
          <span>Tamil Nadu Retail & Supply</span>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <a
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>

        {/* User Card */}
        <div className="border-t border-slate-200 p-3 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : "TN"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-slate-900">{user?.name || "Officer"}</p>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-3 w-3 text-emerald-600" />
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                  {user?.role || "STAFF"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
