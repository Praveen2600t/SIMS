"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle, MapPin } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("admin@sicms.tn.gov.in");
  const [password, setPassword] = useState("AdminPassword123!");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await login(email, password);
    if (!result.success) {
      setError(result.error || "Authentication failed");
    }
    setLoading(false);
  };

  const handleQuickFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 px-4 py-8 text-slate-100">
      <div className="w-full max-w-md">
        {/* Brand / Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 shadow-lg shadow-emerald-900/50">
            <span className="text-xl font-black text-white tracking-wider">TN</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Smart Inventory Intelligence System</h1>
          <p className="mt-1 text-sm text-slate-400">Continuous Monitoring for Tamil Nadu Mandis & Retail</p>

          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-slate-800/80 px-3 py-1 text-xs font-medium text-emerald-400 border border-slate-700">
            <MapPin className="h-3 w-3" />
            <span>State Agri & Retail Mandi Portal (Demo)</span>
          </div>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-800/60 p-6 md:p-8 backdrop-blur-md shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-rose-500/10 p-3 text-xs font-medium text-rose-400 border border-rose-500/20">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="user@sicms.tn.gov.in"
                  className="w-full rounded-lg border border-slate-700 bg-slate-900/80 py-2.5 pl-9 pr-3 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="w-full rounded-lg border border-slate-700 bg-slate-900/80 py-2.5 pl-9 pr-3 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-60 transition"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials for Fast Evaluation */}
          <div className="mt-6 border-t border-slate-700/60 pt-5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Demo Credentials (Pre-seeded)
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill("admin@sicms.tn.gov.in", "AdminPassword123!")}
                className="flex flex-col items-start rounded-lg border border-slate-700 bg-slate-900/40 p-2.5 text-left hover:border-emerald-500/50 transition"
              >
                <div className="flex items-center gap-1 text-xs font-semibold text-emerald-400">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Admin Role</span>
                </div>
                <span className="mt-0.5 text-[11px] text-slate-400 truncate w-full">admin@sicms.tn.gov.in</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill("staff@sicms.tn.gov.in", "StaffPassword123!")}
                className="flex flex-col items-start rounded-lg border border-slate-700 bg-slate-900/40 p-2.5 text-left hover:border-emerald-500/50 transition"
              >
                <div className="flex items-center gap-1 text-xs font-semibold text-sky-400">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Staff Role</span>
                </div>
                <span className="mt-0.5 text-[11px] text-slate-400 truncate w-full">staff@sicms.tn.gov.in</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="mt-4 text-center text-xs text-slate-500">
          SICMS continuous monitoring architecture • Sample Tamil Nadu dataset
        </p>
      </div>
    </div>
  );
}
