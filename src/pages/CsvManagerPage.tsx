import React, { useState, useRef } from "react";
import {
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  X,
  FileText,
  AlertCircle,
} from "lucide-react";
import { useInventory } from "../hooks/useInventoryStore";
import { Product } from "../lib/inventoryStore";

interface ParsedRow {
  name: string;
  sku: string;
  category: string;
  quantity: number;
  unit: string;
  minStock: number;
  unitPrice: number;
  location: string;
  supplierName: string;
  errors: string[];
  isDuplicate: boolean;
}

export const CsvManagerPage: React.FC = () => {
  const { products, saveProduct } = useInventory();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [previewRows, setPreviewRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const existingSkus = new Set(products.map((p) => p.sku.toUpperCase()));

  // Download Sample Template CSV
  const downloadTemplate = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Name,SKU,Category,Quantity,Unit,MinStock,UnitPrice,Location,Supplier\n" +
      "Raspberry Pi 4 Model B 4GB,SKU-RPI-001,Electronics,25,pcs,10,5400,Aisle A - Vault 02,Apex Micro Electronics\n" +
      "Industrial Thermal Packing Tape 48mm,SKU-TAPE-002,Packaging,150,roll,30,85,Warehouse Bay 1,Falcon Packaging Industries\n" +
      "Insulin Glargine 100 IU/ml Vial,SKU-INS-003,Pharmaceuticals,80,vial,25,480,Cold Vault 1 (2-8C),Medisurge Bio-Pharma Ltd\n";

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "sicms_inventory_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Full Catalog CSV
  const exportFullCatalog = () => {
    const headers = ["Name", "SKU", "Category", "Quantity", "Unit", "MinStock", "UnitPrice", "Location", "Supplier"];
    const rows = products.map((p) => [
      `"${p.name.replace(/"/g, '""')}"`,
      p.sku,
      `"${p.category}"`,
      p.quantity,
      p.unit,
      p.minStock,
      p.unitPrice,
      `"${p.location.replace(/"/g, '""')}"`,
      `"${p.supplierName.replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sicms_full_inventory_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setErrorMessage(null);
    setSuccessMessage(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (!text) {
        setErrorMessage("Empty CSV file uploaded.");
        return;
      }

      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length < 2) {
        setErrorMessage("CSV file must contain a header row and at least one data row.");
        return;
      }

      // Parse headers
      const rawHeaders = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, "").toLowerCase());
      const expected = ["name", "sku", "category", "quantity", "unit", "minstock", "unitprice", "location", "supplier"];

      const nameIdx = rawHeaders.indexOf("name");
      const skuIdx = rawHeaders.indexOf("sku");
      const catIdx = rawHeaders.indexOf("category");
      const qtyIdx = rawHeaders.indexOf("quantity");
      const unitIdx = rawHeaders.indexOf("unit");
      const minStockIdx = rawHeaders.indexOf("minstock");
      const priceIdx = rawHeaders.indexOf("unitprice");
      const locIdx = rawHeaders.indexOf("location");
      const supIdx = rawHeaders.indexOf("supplier");

      if (nameIdx === -1 || skuIdx === -1) {
        setErrorMessage("Missing required columns: Name and SKU must be present in the CSV header.");
        return;
      }

      const parsed: ParsedRow[] = [];
      const batchSeenSkus = new Set<string>();

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        // Handle simple quoted CSV
        const cols: string[] = [];
        let curr = "";
        let inQuotes = false;
        for (let c = 0; c < line.length; c++) {
          const char = line[c];
          if (char === '"' && (c === 0 || line[c - 1] !== "\\")) {
            inQuotes = !inQuotes;
          } else if (char === "," && !inQuotes) {
            cols.push(curr.trim().replace(/^"|"$/g, ""));
            curr = "";
          } else {
            curr += char;
          }
        }
        cols.push(curr.trim().replace(/^"|"$/g, ""));

        const name = cols[nameIdx] || "";
        const sku = (cols[skuIdx] || "").toUpperCase();
        const category = catIdx !== -1 && cols[catIdx] ? cols[catIdx] : "General";
        const quantity = qtyIdx !== -1 ? parseInt(cols[qtyIdx]) || 0 : 0;
        const unit = unitIdx !== -1 && cols[unitIdx] ? cols[unitIdx] : "pcs";
        const minStock = minStockIdx !== -1 ? parseInt(cols[minStockIdx]) || 10 : 10;
        const unitPrice = priceIdx !== -1 ? parseFloat(cols[priceIdx]) || 100 : 100;
        const location = locIdx !== -1 && cols[locIdx] ? cols[locIdx] : "General Storage";
        const supplierName = supIdx !== -1 && cols[supIdx] ? cols[supIdx] : "Direct Vendor";

        const errors: string[] = [];
        if (!name) errors.push("Missing Name");
        if (!sku) errors.push("Missing SKU");
        if (quantity < 0) errors.push("Negative quantity");

        const isDuplicate = existingSkus.has(sku) || batchSeenSkus.has(sku);
        if (isDuplicate) errors.push("Duplicate SKU");
        if (sku) batchSeenSkus.add(sku);

        parsed.push({
          name,
          sku,
          category,
          quantity,
          unit,
          minStock,
          unitPrice,
          location,
          supplierName,
          errors,
          isDuplicate,
        });
      }

      setPreviewRows(parsed);
    };

    reader.readAsText(file);
  };

  const handleCommitImport = () => {
    const validRows = previewRows.filter((r) => r.errors.length === 0);
    if (validRows.length === 0) {
      setErrorMessage("No valid non-duplicate rows found to import.");
      return;
    }

    validRows.forEach((r) => {
      saveProduct({
        name: r.name,
        sku: r.sku,
        category: r.category,
        quantity: r.quantity,
        unit: r.unit,
        minStock: r.minStock,
        unitPrice: r.unitPrice,
        location: r.location,
        supplierId: "sup-direct",
        supplierName: r.supplierName,
        description: "Imported via CSV Data Stream",
      });
    });

    setSuccessMessage(`Successfully imported ${validRows.length} products into the inventory catalog!`);
    setPreviewRows([]);
    setFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">CSV Dataset Manager</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Bulk-import product inventory from spreadsheets with validation, error checks, and preview verification.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={downloadTemplate}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Download Sample CSV
          </button>
          <button
            onClick={exportFullCatalog}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Export Live Catalog
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)}>
            <X className="w-4 h-4 text-red-500" />
          </button>
        </div>
      )}

      {/* Upload Dropzone */}
      <div className="bg-white p-8 rounded-2xl border-2 border-dashed border-slate-300 hover:border-blue-500 transition text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
          <Upload className="w-6 h-6" />
        </div>

        <div className="space-y-1">
          <h3 className="font-bold text-slate-900 text-base">Select Inventory CSV File to Import</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Drag and drop or browse for a .csv file containing product rows. Must include at least <strong>Name</strong> and <strong>SKU</strong> headers.
          </p>
        </div>

        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
            id="csv-file-input"
          />
          <label
            htmlFor="csv-file-input"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl cursor-pointer shadow-xs transition"
          >
            <Upload className="w-4 h-4" />
            {fileName ? `Change File (${fileName})` : "Browse CSV File"}
          </label>
        </div>
      </div>

      {/* Import Preview Table */}
      {previewRows.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Pre-Import Data Validation</h3>
              <p className="text-xs text-slate-500">
                {previewRows.filter((r) => r.errors.length === 0).length} valid rows ready to import •{" "}
                {previewRows.filter((r) => r.errors.length > 0).length} flagged errors / duplicates
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setPreviewRows([]);
                  setFileName(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCommitImport}
                disabled={previewRows.filter((r) => r.errors.length === 0).length === 0}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 rounded-xl shadow-xs transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                Commit Import ({previewRows.filter((r) => r.errors.length === 0).length})
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Validation</th>
                  <th className="py-2.5 px-3">SKU</th>
                  <th className="py-2.5 px-3">Product Name</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Qty</th>
                  <th className="py-2.5 px-3">Unit Cost</th>
                  <th className="py-2.5 px-3">Location</th>
                  <th className="py-2.5 px-3">Supplier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {previewRows.map((r, idx) => {
                  const hasErr = r.errors.length > 0;
                  return (
                    <tr key={idx} className={hasErr ? "bg-red-50/40" : "hover:bg-slate-50"}>
                      <td className="py-3 px-3">
                        {hasErr ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                            <AlertTriangle className="w-3 h-3" />
                            {r.errors.join(", ")}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" /> Valid
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-800">{r.sku}</td>
                      <td className="py-3 px-3 font-semibold text-slate-900">{r.name}</td>
                      <td className="py-3 px-3 text-slate-600">{r.category}</td>
                      <td className="py-3 px-3 font-semibold text-slate-900">
                        {r.quantity} {r.unit}
                      </td>
                      <td className="py-3 px-3 text-slate-900 font-semibold">₹{r.unitPrice}</td>
                      <td className="py-3 px-3 text-slate-600">{r.location}</td>
                      <td className="py-3 px-3 text-slate-600">{r.supplierName}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
