"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  AlertTriangle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Package,
} from "lucide-react";
import { Product } from "@/types";
import { mockNaamList } from "@/mocks/naam";

const TARGET_COUNTS = [1008, 5000, 11000, 21000, 51000, 100000] as const;

const productSchema = z.object({
  naamId: z.number().int().positive("Naam is required"),
  targetCount: z.number().refine((v) => TARGET_COUNTS.includes(v as any), "Invalid target"),
  bookSize: z.enum(["A5", "A4 Large Print"]),
  binding: z.enum(["Perfect", "Wiro"]),
  edition: z.enum(["Standard", "Premium Gift"]),
  basePrice: z.number().positive("Price must be positive"),
  shippingFee: z.number().nonnegative("Shipping fee must be ≥ 0"),
  status: z.enum(["active", "inactive"]),
});

type ProductFormData = z.infer<typeof productSchema>;

function fmtINR(n: number) {
  return n.toLocaleString("en-IN");
}

function calcPages(targetCount: number) {
  return Math.ceil(targetCount / 100) + 5;
}

const inputCls =
  "w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A1F1F]";

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [naamFilter, setNaamFilter] = useState("all");
  const [targetFilter, setTargetFilter] = useState("all");
  const [sizeFilter, setSizeFilter] = useState("all");
  const [editionFilter, setEditionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Product | null>(null);
  const [deletingItem, setDeletingItem] = useState<Product | null>(null);

  React.useEffect(() => {
    const h = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(h);
  }, [search]);


  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      naamId: 1,
      targetCount: 1008,
      bookSize: "A5",
      binding: "Perfect",
      edition: "Standard",
      basePrice: 199,
      shippingFee: 49,
      status: "active",
    },
  });

  const [previewPages, setPreviewPages] = useState(calcPages(1008));
  const watchedTargetForm = watch("targetCount");
  React.useEffect(() => {
    setPreviewPages(calcPages(Number(watchedTargetForm) || 1008));
  }, [watchedTargetForm]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["productList", page, limit, debouncedSearch, naamFilter, targetFilter, sizeFilter, editionFilter, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search: debouncedSearch,
        naamId: naamFilter,
        targetCount: targetFilter,
        bookSize: sizeFilter,
        edition: editionFilter,
        status: statusFilter,
      });
      const res = await fetch(`/api/admin/products?${params}`);
      if (!res.ok) throw new Error("Failed to fetch products");
      return res.json() as Promise<{ data: Product[]; total: number; page: number; limit: number }>;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (formData: ProductFormData) => {
      const url = editingItem ? `/api/admin/products/${editingItem.id}` : `/api/admin/products`;
      const method = editingItem ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save");
      return json;
    },
    onSuccess: () => {
      toast.success(editingItem ? "Product updated" : "Product created");
      queryClient.invalidateQueries({ queryKey: ["productList"] });
      closeForm();
    },
    onError: (err: any) => toast.error(err.message || "Error"),
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: "active" | "inactive" }) => {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      return json;
    },
    onSuccess: () => { toast.success("Status updated"); queryClient.invalidateQueries({ queryKey: ["productList"] }); },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to delete");
      return json;
    },
    onSuccess: () => {
      toast.success("Product deleted");
      queryClient.invalidateQueries({ queryKey: ["productList"] });
      setDeletingItem(null);
    },
    onError: (err: any) => toast.error(err.message),
  });

  const openCreate = () => {
    setEditingItem(null);
    reset({ naamId: 1, targetCount: 1008, bookSize: "A5", binding: "Perfect", edition: "Standard", basePrice: 199, shippingFee: 49, status: "active" });
    setPreviewPages(calcPages(1008));
    setIsFormOpen(true);
  };

  const openEdit = (item: Product) => {
    setEditingItem(item);
    reset({
      naamId: item.naamId,
      targetCount: item.targetCount,
      bookSize: item.bookSize,
      binding: item.binding,
      edition: item.edition,
      basePrice: item.basePrice,
      shippingFee: item.shippingFee,
      status: item.status,
    });
    setPreviewPages(item.pages);
    setIsFormOpen(true);
  };

  const closeForm = () => { setIsFormOpen(false); setEditingItem(null); };

  const totalPages = data ? Math.ceil(data.total / limit) : 1;
  const startRow = data?.total ? (page - 1) * limit + 1 : 0;
  const endRow = data?.total ? Math.min(page * limit, data.total) : 0;

  const selectCls = "px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A1F1F] dark:focus:ring-[#F59E0B]";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Package className="w-6 h-6 text-[#F59E0B]" /> Products
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage Naam Pustika catalog – sizes, editions, pricing.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#7A1F1F] hover:bg-[#631818] text-white text-sm font-medium shadow transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A1F1F]"
          />
        </div>

        <select value={naamFilter} onChange={(e) => { setNaamFilter(e.target.value); setPage(1); }} className={selectCls}>
          <option value="all">All Naam</option>
          {mockNaamList.map((n) => <option key={n.id} value={n.id}>{n.icon} {n.name}</option>)}
        </select>

        <select value={targetFilter} onChange={(e) => { setTargetFilter(e.target.value); setPage(1); }} className={selectCls}>
          <option value="all">All Targets</option>
          {TARGET_COUNTS.map((t) => <option key={t} value={t}>{fmtINR(t)}</option>)}
        </select>

        <select value={sizeFilter} onChange={(e) => { setSizeFilter(e.target.value); setPage(1); }} className={selectCls}>
          <option value="all">All Sizes</option>
          <option value="A5">A5</option>
          <option value="A4 Large Print">A4 Large Print</option>
        </select>

        <select value={editionFilter} onChange={(e) => { setEditionFilter(e.target.value); setPage(1); }} className={selectCls}>
          <option value="all">All Editions</option>
          <option value="Standard">Standard</option>
          <option value="Premium Gift">Premium Gift</option>
        </select>

        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className={selectCls}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-700 dark:text-gray-200">
            <thead className="bg-[#FDFBF7] dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 text-xs uppercase font-semibold text-gray-600 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Naam</th>
                <th className="px-4 py-3 text-right">Target</th>
                <th className="px-4 py-3">Size</th>
                <th className="px-4 py-3">Binding</th>
                <th className="px-4 py-3">Edition</th>
                <th className="px-4 py-3 text-right">Pages</th>
                <th className="px-4 py-3 text-right">Price</th>
                <th className="px-4 py-3 text-right">Ship</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 11 }).map((_, j) => (
                      <td key={j} className="px-4 py-4">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : isError ? (
                <tr>
                  <td colSpan={11} className="px-4 py-12 text-center text-red-500">
                    <div className="flex flex-col items-center gap-2">
                      <AlertTriangle className="w-8 h-8" />
                      <p className="font-semibold">Failed to load products</p>
                      <button onClick={() => refetch()} className="mt-1 px-3 py-1.5 text-xs bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-md font-medium hover:bg-red-200">
                        Retry
                      </button>
                    </div>
                  </td>
                </tr>
              ) : data?.data && data.data.length > 0 ? (
                data.data.map((item) => (
                  <tr key={item.id} className="hover:bg-[#FDFBF7]/60 dark:hover:bg-gray-700/40 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100 max-w-[200px]">
                      <span className="line-clamp-2 text-xs leading-tight">{item.name}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5 text-xs">
                        <span className="text-base">{item.naam?.icon ?? "🙏"}</span>
                        <span className="font-medium">{item.naam?.name}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs font-semibold text-[#7A1F1F] dark:text-amber-400">
                      {fmtINR(item.targetCount)}
                    </td>
                    <td className="px-4 py-3 text-xs">{item.bookSize}</td>
                    <td className="px-4 py-3 text-xs">{item.binding}</td>
                    <td className="px-4 py-3">
                      {item.edition === "Premium Gift" ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                          ✨ Premium Gift
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500">Standard</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-xs font-mono">{item.pages}</td>
                    <td className="px-4 py-3 text-right text-xs font-semibold">₹{fmtINR(item.basePrice)}</td>
                    <td className="px-4 py-3 text-right text-xs text-gray-500">₹{item.shippingFee}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={item.status === "active"}
                        onClick={() => toggleMutation.mutate({ id: item.id, status: item.status === "active" ? "inactive" : "active" })}
                        className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${item.status === "active" ? "bg-[#7A1F1F]" : "bg-gray-300 dark:bg-gray-600"}`}
                      >
                        <span aria-hidden="true" className={`inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ${item.status === "active" ? "translate-x-4" : "translate-x-0"}`} />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(item)} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 hover:text-[#7A1F1F]" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeletingItem(item)} className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-950/30 text-gray-600 dark:text-gray-300 hover:text-red-600" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={11} className="px-4 py-12 text-center text-gray-500">
                    <p className="font-medium text-base">No products found</p>
                    <p className="text-xs text-gray-400 mt-1">Try adjusting filters or add a new product.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.total > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 bg-[#FDFBF7]/40 dark:bg-gray-900/40 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <span>Rows per page:</span>
              <select value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }} className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs">
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
              <span className="ml-2">
                Showing <strong>{startRow}</strong>–<strong>{endRow}</strong> of <strong>{data.total}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="p-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span>Page {page} of {totalPages || 1}</span>
              <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="p-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Dialog */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {editingItem ? "Edit Product" : "Add Product"}
              </h3>
              <button onClick={closeForm} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-lg font-bold">✕</button>
            </div>

            <form onSubmit={handleSubmit((v) => saveMutation.mutate(v as ProductFormData))} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Naam + Target */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Naam <span className="text-red-500">*</span></label>
                  <select {...register("naamId")} className={inputCls}>
                    {mockNaamList.map((n) => <option key={n.id} value={n.id}>{n.icon} {n.name}</option>)}
                  </select>
                  {errors.naamId && <p className="text-xs text-red-500 mt-1">{errors.naamId.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Target Count <span className="text-red-500">*</span></label>
                  <select {...register("targetCount")} className={inputCls}>
                    {TARGET_COUNTS.map((t) => <option key={t} value={t}>{fmtINR(t)}</option>)}
                  </select>
                  {errors.targetCount && <p className="text-xs text-red-500 mt-1">{errors.targetCount.message}</p>}
                </div>
              </div>

              {/* Size + Binding */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Book Size</label>
                  <select {...register("bookSize")} className={inputCls}>
                    <option value="A5">A5</option>
                    <option value="A4 Large Print">A4 Large Print</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Binding</label>
                  <select {...register("binding")} className={inputCls}>
                    <option value="Perfect">Perfect</option>
                    <option value="Wiro">Wiro</option>
                  </select>
                </div>
              </div>

              {/* Edition + Pages preview */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Edition</label>
                  <select {...register("edition")} className={inputCls}>
                    <option value="Standard">Standard</option>
                    <option value="Premium Gift">Premium Gift</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Pages (auto)</label>
                  <div className="w-full px-3 py-2 text-sm bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg text-amber-800 dark:text-amber-300 font-semibold">
                    {previewPages} pages
                  </div>
                </div>
              </div>

              {/* Price + Shipping */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Base Price (₹) <span className="text-red-500">*</span></label>
                  <input type="number" {...register("basePrice")} className={inputCls} />
                  {errors.basePrice && <p className="text-xs text-red-500 mt-1">{errors.basePrice.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Shipping Fee (₹)</label>
                  <input type="number" {...register("shippingFee")} className={inputCls} />
                  {errors.shippingFee && <p className="text-xs text-red-500 mt-1">{errors.shippingFee.message}</p>}
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select {...register("status")} className={inputCls}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <button type="button" onClick={closeForm} className="px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || saveMutation.isPending}
                  className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-[#7A1F1F] hover:bg-[#631818] rounded-lg shadow disabled:opacity-50"
                >
                  {(isSubmitting || saveMutation.isPending) && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editingItem ? "Update Product" : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <div className="p-3 bg-red-100 dark:bg-red-950/50 rounded-full">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">Confirm Deletion</h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Delete <strong className="text-gray-900 dark:text-white">{deletingItem.name}</strong>? This cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button type="button" onClick={() => setDeletingItem(null)} className="px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(deletingItem.id)}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow disabled:opacity-50"
              >
                {deleteMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
