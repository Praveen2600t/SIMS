"use client";

import React, { useEffect, useState, useCallback } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { formatINR } from "@/lib/utils";
import {
  Search,
  Plus,
  Filter,
  ArrowUpDown,
  AlertTriangle,
  XCircle,
  Package,
  Boxes,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Eye,
  Trash2,
  X,
  Check,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface Product {
  id: string;
  productCode: string;
  name: string;
  subcategory: string;
  unit: string;
  purchasePrice: number;
  sellingPrice: number;
  currentQuantity: number;
  minStockLevel: number;
  reorderQuantity: number;
  storageType: string;
  district: string;
  marketLocation: string;
  category: { id: string; name: string };
  supplier?: { id: string; name: string; supplierCode: string } | null;
  alerts?: { id: string; alertType: string; severity: string; message: string }[];
}

export default function ProductsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filters & Pagination State
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [stockStatus, setStockStatus] = useState("ALL");
  const [expiryStatus, setExpiryStatus] = useState("ALL");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Metadata for filter dropdowns
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [suppliers, setSuppliers] = useState<{ id: string; name: string }[]>([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "view">("create");
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);

  // New Product Form State
  const [formData, setFormData] = useState({
    productCode: "",
    name: "",
    categoryId: "",
    subcategory: "General",
    unit: "kg",
    purchasePrice: 0,
    sellingPrice: 0,
    currentQuantity: 50,
    minStockLevel: 15,
    reorderQuantity: 60,
    storageType: "ROOM_TEMP",
    district: "Chennai",
    marketLocation: "Koyambedu Wholesale Market",
    supplierId: "",
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load Lookup Options
  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          setCategories(data.data);
          if (data.data[0]) {
            setFormData((prev) => ({ ...prev, categoryId: data.data[0].id }));
          }
        }
      });

    fetch("/api/locations")
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          const uniqueDists = Array.from(new Set(data.data.map((l: { district: string }) => l.district))) as string[];
          setDistricts(uniqueDists);
        }
      });

    fetch("/api/suppliers")
      .then((res) => res.json())
      .then((data) => {
        if (data.data) setSuppliers(data.data);
      });
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        sortBy,
        sortOrder,
      });

      if (search) params.append("search", search);
      if (selectedCategory) params.append("category", selectedCategory);
      if (selectedDistrict) params.append("district", selectedDistrict);
      if (stockStatus !== "ALL") params.append("stockStatus", stockStatus);
      if (expiryStatus !== "ALL") params.append("expiryStatus", expiryStatus);

      const res = await fetch(`/api/products?${params.toString()}`);
      const json = await res.json();
      if (res.ok) {
        setProducts(json.data);
        setTotal(json.pagination.total);
        setTotalPages(json.pagination.totalPages);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [page, search, selectedCategory, selectedDistrict, stockStatus, expiryStatus, sortBy, sortOrder]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          purchasePrice: Number(formData.purchasePrice),
          sellingPrice: Number(formData.sellingPrice),
          currentQuantity: Number(formData.currentQuantity),
          minStockLevel: Number(formData.minStockLevel),
          reorderQuantity: Number(formData.reorderQuantity),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create product");
      }

      setIsModalOpen(false);
      fetchProducts();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error creating product";
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to archive product "${name}"?`)) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchProducts();
      } else {
        const d = await res.json();
        alert(d.error || "Failed to archive product");
      }
    } catch {
      alert("Error archiving product");
    }
  };

  return (
    <AppLayout
      title="Product Inventory Catalogue"
      subtitle="Cataloguing, District Allocation & Continuous Thresholds"
      onRefresh={fetchProducts}
    >
      <div className="space-y-4">
        {/* Controls Bar: Search, Filters, and New Product Action */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by SKU code, product name, subcategory..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-xs text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-hidden"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setPage(1);
                }}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs font-medium text-slate-700 focus:border-emerald-500 focus:outline-hidden"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              {/* District Filter */}
              <select
                value={selectedDistrict}
                onChange={(e) => {
                  setSelectedDistrict(e.target.value);
                  setPage(1);
                }}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs font-medium text-slate-700 focus:border-emerald-500 focus:outline-hidden"
              >
                <option value="">All Districts</option>
                {districts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>

              {/* Stock Status Filter */}
              <select
                value={stockStatus}
                onChange={(e) => {
                  setStockStatus(e.target.value);
                  setPage(1);
                }}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs font-medium text-slate-700 focus:border-emerald-500 focus:outline-hidden"
              >
                <option value="ALL">All Stock Levels</option>
                <option value="OUT_OF_STOCK">Out of Stock (0)</option>
                <option value="LOW_STOCK">Low Stock (≤ Threshold)</option>
                <option value="NORMAL">Normal Stock</option>
              </select>

              {/* Expiry Filter */}
              <select
                value={expiryStatus}
                onChange={(e) => {
                  setExpiryStatus(e.target.value);
                  setPage(1);
                }}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs font-medium text-slate-700 focus:border-emerald-500 focus:outline-hidden"
              >
                <option value="ALL">All Expiry Statuses</option>
                <option value="EXPIRING_SOON">Expiring Soon (≤ 7 Days)</option>
                <option value="EXPIRED">Expired Batches</option>
                <option value="VALID">Valid Shelf Life</option>
              </select>

              {/* Add Product Button */}
              <button
                onClick={() => {
                  setFormData({
                    productCode: `TN-SKU-${String(Math.floor(1000 + Math.random() * 9000))}`,
                    name: "",
                    categoryId: categories[0]?.id || "",
                    subcategory: "Agricultural Produce",
                    unit: "kg",
                    purchasePrice: 40,
                    sellingPrice: 55,
                    currentQuantity: 100,
                    minStockLevel: 20,
                    reorderQuantity: 80,
                    storageType: "ROOM_TEMP",
                    district: "Coimbatore",
                    marketLocation: "MGR Wholesale Vegetable Mandi",
                    supplierId: suppliers[0]?.id || "",
                  });
                  setModalMode("create");
                  setIsModalOpen(true);
                }}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-500 transition shrink-0"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Product</span>
              </button>
            </div>
          </div>
        </div>

        {/* Products Table Card */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Code / SKU</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Location (TN)</th>
                  <th className="py-3 px-4 text-right">Stock Level</th>
                  <th className="py-3 px-4 text-right">Pricing (₹)</th>
                  <th className="py-3 px-4 text-center">Alerts</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
                        <span>Loading product catalogue...</span>
                      </div>
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-500">
                      No products match your search or filter criteria.
                    </td>
                  </tr>
                ) : (
                  products.map((p) => {
                    const isOutOfStock = p.currentQuantity <= 0;
                    const isLowStock = p.currentQuantity > 0 && p.currentQuantity <= p.minStockLevel;
                    const hasAlerts = p.alerts && p.alerts.length > 0;

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-4 font-mono font-medium text-slate-600">
                          {p.productCode}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          <div>{p.name}</div>
                          <span className="text-[10px] font-normal text-slate-400">
                            {p.subcategory} • {p.storageType}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                            {p.category.name}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          <div className="flex items-center gap-1 font-medium text-slate-800">
                            <MapPin className="h-3 w-3 text-emerald-600 shrink-0" />
                            <span>{p.district}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 block truncate max-w-[160px]">
                            {p.marketLocation}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div
                            className={`font-bold ${
                              isOutOfStock
                                ? "text-rose-600"
                                : isLowStock
                                ? "text-amber-600"
                                : "text-slate-900"
                            }`}
                          >
                            {p.currentQuantity} {p.unit}
                          </div>
                          <span className="text-[10px] text-slate-400">
                            Min: {p.minStockLevel} | Reorder: {p.reorderQuantity}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="font-semibold text-slate-900">
                            ₹{p.sellingPrice} / {p.unit}
                          </div>
                          <span className="text-[10px] text-slate-400">
                            Cost: ₹{p.purchasePrice}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {isOutOfStock ? (
                            <span className="inline-flex items-center gap-1 rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-800">
                              <XCircle className="h-3 w-3" />
                              <span>OUT</span>
                            </span>
                          ) : isLowStock ? (
                            <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
                              <AlertTriangle className="h-3 w-3" />
                              <span>LOW</span>
                            </span>
                          ) : hasAlerts ? (
                            <span className="inline-flex items-center gap-1 rounded bg-orange-100 px-1.5 py-0.5 text-[10px] font-bold text-orange-800">
                              <span>ALERT</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                              OK
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setActiveProduct(p);
                                setModalMode("view");
                                setIsModalOpen(true);
                              }}
                              title="View Product Details"
                              className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                            {user?.role === "ADMIN" && (
                              <button
                                onClick={() => handleDeleteProduct(p.id, p.name)}
                                title="Archive Product"
                                className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-xs text-slate-600 bg-slate-50/50">
            <div>
              Showing <span className="font-semibold text-slate-900">{products.length}</span> of{" "}
              <span className="font-semibold text-slate-900">{total}</span> products
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                className="flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-slate-700 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Prev</span>
              </button>
              <span className="px-2 font-medium">
                Page {page} of {totalPages || 1}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                className="flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-slate-700 hover:bg-slate-50 disabled:opacity-40"
              >
                <span>Next</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Create or View Product */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">
                {modalMode === "create" ? "Add New Tamil Nadu Product" : `Product: ${activeProduct?.name}`}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {modalMode === "create" ? (
              <form onSubmit={handleCreateProduct} className="mt-4 space-y-3.5 text-xs">
                {formError && (
                  <div className="rounded-lg bg-rose-50 p-2.5 text-rose-700 border border-rose-200">
                    {formError}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Product SKU Code</label>
                    <input
                      type="text"
                      required
                      value={formData.productCode}
                      onChange={(e) => setFormData({ ...formData, productCode: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 p-2 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Category</label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 p-2 text-slate-900"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Salem Malgova Mango / Tanjore Deluxe Rice"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Unit</label>
                    <select
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 p-2 text-slate-900"
                    >
                      {["kg", "g", "litre", "ml", "packet", "piece", "box", "dozen"].map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Purchase Cost (₹)</label>
                    <input
                      type="number"
                      required
                      min={0}
                      step="any"
                      value={formData.purchasePrice}
                      onChange={(e) => setFormData({ ...formData, purchasePrice: Number(e.target.value) })}
                      className="w-full rounded-lg border border-slate-200 p-2 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Selling Price (₹)</label>
                    <input
                      type="number"
                      required
                      min={0}
                      step="any"
                      value={formData.sellingPrice}
                      onChange={(e) => setFormData({ ...formData, sellingPrice: Number(e.target.value) })}
                      className="w-full rounded-lg border border-slate-200 p-2 text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Initial Stock</label>
                    <input
                      type="number"
                      min={0}
                      value={formData.currentQuantity}
                      onChange={(e) => setFormData({ ...formData, currentQuantity: Number(e.target.value) })}
                      className="w-full rounded-lg border border-slate-200 p-2 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Min Threshold</label>
                    <input
                      type="number"
                      min={0}
                      value={formData.minStockLevel}
                      onChange={(e) => setFormData({ ...formData, minStockLevel: Number(e.target.value) })}
                      className="w-full rounded-lg border border-slate-200 p-2 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Reorder Qty</label>
                    <input
                      type="number"
                      min={0}
                      value={formData.reorderQuantity}
                      onChange={(e) => setFormData({ ...formData, reorderQuantity: Number(e.target.value) })}
                      className="w-full rounded-lg border border-slate-200 p-2 text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">District</label>
                    <input
                      type="text"
                      required
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 p-2 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Market Location</label>
                    <input
                      type="text"
                      required
                      value={formData.marketLocation}
                      onChange={(e) => setFormData({ ...formData, marketLocation: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 p-2 text-slate-900"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-lg border border-slate-200 px-4 py-2 text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
                  >
                    {isSubmitting ? "Saving..." : "Save Product"}
                  </button>
                </div>
              </form>
            ) : activeProduct ? (
              <div className="mt-4 space-y-3 text-xs text-slate-700">
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div>
                    <span className="text-slate-400 block">SKU Code:</span>
                    <span className="font-mono font-semibold text-slate-900">{activeProduct.productCode}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Category:</span>
                    <span className="font-medium text-slate-900">{activeProduct.category.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Current Stock:</span>
                    <span className="font-bold text-slate-900 text-sm">
                      {activeProduct.currentQuantity} {activeProduct.unit}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Inventory Value:</span>
                    <span className="font-bold text-emerald-700 text-sm">
                      {formatINR(activeProduct.currentQuantity * activeProduct.purchasePrice)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Location:</span>
                    <span className="font-medium text-slate-900">
                      {activeProduct.marketLocation}, {activeProduct.district}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Storage:</span>
                    <span className="font-medium text-slate-900">{activeProduct.storageType}</span>
                  </div>
                </div>

                {activeProduct.alerts && activeProduct.alerts.length > 0 && (
                  <div className="rounded-lg border border-rose-200 bg-rose-50/50 p-3">
                    <span className="font-semibold text-rose-900 block mb-1">Active Alerts:</span>
                    {activeProduct.alerts.map((al) => (
                      <p key={al.id} className="text-rose-700">
                        • {al.message}
                      </p>
                    ))}
                  </div>
                )}

                <div className="pt-2 text-right">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-lg bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-800"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </AppLayout>
  );
}
