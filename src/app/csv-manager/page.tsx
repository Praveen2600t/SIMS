"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  FileSpreadsheet,
  Download,
  Upload,
  AlertCircle,
  CheckCircle2,
  FileCheck,
  RefreshCw,
  Info,
} from "lucide-react";

interface ImportSummary {
  totalProcessed: number;
  created: number;
  updated: number;
  skipped: number;
  errors: { row: number; productCode?: string; message: string }[];
}

export default function CSVManagerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [importSummary, setImportSummary] = useState<ImportSummary | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setImportSummary(null);
      setStatusMessage(null);
      setErrorMessage(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setErrorMessage("Please choose a CSV file first");
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/csv/import", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Import failed");
      }

      setImportSummary(data.result);
      setStatusMessage(data.message);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error importing CSV file";
      setErrorMessage(msg);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <AppLayout
      title="CSV Dataset Hub & Import Engine"
      subtitle="Multi-Sector Inventory Dataset Import, Duplicate Detection & Schema Validation"
    >
      <div className="space-y-6">
        {/* Notice Card: Generic Dataset Information */}
        <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4 text-xs text-indigo-900">
          <div className="flex items-start gap-2.5">
            <Info className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">General Inventory Dataset Specifications:</span>
              <p className="mt-0.5 text-indigo-800">
                The import engine accepts multi-sector product inventories (Electronics, Pharmaceuticals, Raw Materials, FMCG, Hardware, Automotive, Chemicals, etc.). Expiry dates are evaluated for perishable batches and optional for non-perishable goods. Existing SKU records are updated with transactional audit logs.
              </p>
            </div>
          </div>
        </div>

        {/* Two-Column Grid: Download Existing Datasets vs Upload & Import */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Download Box */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                  <Download className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Download General Datasets</h2>
                  <p className="text-xs text-slate-500">Download formatted CSV datasets ready for import</p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {/* Seed Sample Dataset */}
                <div className="rounded-lg border border-slate-200 p-3.5 flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">
                      Standard 200-Item Multi-Sector Sample Dataset
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Contains 10 industrial & commercial categories, 10 warehouse storage zones, batch expiry tracking
                    </p>
                  </div>
                  <a
                    href="/data/general_inventory_sample_200.csv"
                    download="general_inventory_sample_200.csv"
                    className="flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 shrink-0 shadow-xs"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download CSV</span>
                  </a>
                </div>

                {/* Live Database Snapshot */}
                <div className="rounded-lg border border-slate-200 p-3.5 flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">Live Database Inventory Export</h3>
                    <p className="text-[11px] text-slate-500">
                      Export currently saved active database records with real-time stock balances
                    </p>
                  </div>
                  <a
                    href="/api/csv/export"
                    download
                    className="flex items-center gap-1 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shrink-0 shadow-xs"
                  >
                    <Download className="h-3.5 w-3.5 text-slate-500" />
                    <span>Export Live</span>
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-slate-100 pt-4 text-[11px] text-slate-400">
              Field mapping includes: product_code, name, category, unit, storage_location, supplier_id, purchase_price, selling_price, current_quantity, min_stock, batch_number, expiry_date.
            </div>
          </div>

          {/* Upload & Import Box */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
                <Upload className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Import Inventory CSV</h2>
                <p className="text-xs text-slate-500">
                  Includes duplicate detection, field validation, and error reporting
                </p>
              </div>
            </div>

            <form onSubmit={handleUpload} className="mt-5 space-y-4">
              <div className="rounded-xl border-2 border-dashed border-slate-300 p-6 text-center hover:border-emerald-500 transition bg-slate-50/50">
                <FileSpreadsheet className="mx-auto h-8 w-8 text-slate-400" />
                <div className="mt-2 text-xs font-semibold text-slate-700">
                  {file ? file.name : "Select or drag a CSV file here"}
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Supports RFC-4180 .csv with standard inventory columns
                </p>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileChange}
                  className="mt-3 block w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                />
              </div>

              {errorMessage && (
                <div className="flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-xs font-medium text-rose-700 border border-rose-200">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {statusMessage && (
                <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-xs font-medium text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>{statusMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isUploading || !file}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-500 disabled:opacity-50 transition"
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Processing & Validating CSV...</span>
                  </>
                ) : (
                  <>
                    <FileCheck className="h-3.5 w-3.5" />
                    <span>Execute Import & Reconcile</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Import Summary Results Card */}
        {importSummary && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs animate-fade-in">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Import Execution Report</h3>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
                <span className="text-[10px] font-semibold text-slate-500 uppercase">Total Rows</span>
                <span className="text-lg font-bold text-slate-900 block mt-1">
                  {importSummary.totalProcessed}
                </span>
              </div>
              <div className="rounded-lg bg-emerald-50/60 p-3 border border-emerald-100">
                <span className="text-[10px] font-semibold text-emerald-700 uppercase">New Records</span>
                <span className="text-lg font-bold text-emerald-800 block mt-1">
                  {importSummary.created}
                </span>
              </div>
              <div className="rounded-lg bg-sky-50/60 p-3 border border-sky-100">
                <span className="text-[10px] font-semibold text-sky-700 uppercase">Updated (Duplicate Match)</span>
                <span className="text-lg font-bold text-sky-800 block mt-1">
                  {importSummary.updated}
                </span>
              </div>
              <div className="rounded-lg bg-rose-50/60 p-3 border border-rose-100">
                <span className="text-[10px] font-semibold text-rose-700 uppercase">Errors / Skipped</span>
                <span className="text-lg font-bold text-rose-800 block mt-1">
                  {importSummary.skipped}
                </span>
              </div>
            </div>

            {/* Error Table if any rows failed */}
            {importSummary.errors.length > 0 && (
              <div className="mt-4 border-t border-slate-200 pt-4">
                <h4 className="text-xs font-bold text-rose-900 mb-2">Detailed Row Errors</h4>
                <div className="rounded-lg border border-rose-200 bg-rose-50/30 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-rose-100/50 text-rose-900 font-semibold">
                      <tr>
                        <th className="py-2 px-3">CSV Row</th>
                        <th className="py-2 px-3">Product SKU</th>
                        <th className="py-2 px-3">Reason for Rejection</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-rose-100">
                      {importSummary.errors.map((err, idx) => (
                        <tr key={idx}>
                          <td className="py-2 px-3 font-mono font-bold text-rose-900">Line {err.row}</td>
                          <td className="py-2 px-3 font-mono text-slate-700">{err.productCode || "N/A"}</td>
                          <td className="py-2 px-3 text-rose-800">{err.message}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
