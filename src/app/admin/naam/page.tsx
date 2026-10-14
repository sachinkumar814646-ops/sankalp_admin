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
  MoreHorizontal,
  Edit,
  Trash2,
  AlertTriangle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Naam } from "@/types";
import RichTextEditor from "@/components/RichTextEditor";

const naamFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  name_hindi: z.string().min(1, "Hindi Name is required"),
  slug: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  icon: z.string().optional(),
  description: z.string().optional(),
  sort_order: z.coerce.number().min(0, "Must be >= 0"),
  status: z.enum(["active", "inactive"]),
});

type NaamFormData = z.infer<typeof naamFormSchema>;

export default function NaamPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Dialog & Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Naam | null>(null);
  const [isSlugCustomized, setIsSlugCustomized] = useState(false);
  const [deletingItem, setDeletingItem] = useState<Naam | null>(null);

  // Debounce search input
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  // Form setup
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NaamFormData>({
    resolver: zodResolver(naamFormSchema) as any,
    defaultValues: {
      name: "",
      name_hindi: "",
      slug: "",
      category: "",
      icon: "🙏",
      description: "",
      sort_order: 1,
      status: "active",
    },
  });

  const watchedName = watch("name");

  // Auto-generate slug if not customized
  React.useEffect(() => {
    if (!isSlugCustomized && watchedName) {
      const generated = watchedName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setValue("slug", generated, { shouldValidate: true });
    }
  }, [watchedName, isSlugCustomized, setValue]);

  // Query Naam List
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["naamList", page, limit, debouncedSearch, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search: debouncedSearch,
        status: statusFilter,
      });
      const res = await fetch(`/api/admin/naam?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch Naam records");
      return res.json() as Promise<{
        data: Naam[];
        total: number;
        page: number;
        limit: number;
      }>;
    },
  });

  // Create / Update Mutation
  const saveMutation = useMutation({
    mutationFn: async (formData: NaamFormData) => {
      const url = editingItem
        ? `/api/admin/naam/${editingItem.id}`
        : `/api/admin/naam`;
      const method = editingItem ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to save Naam");
      }
      return json;
    },
    onSuccess: () => {
      toast.success(
        editingItem ? "Naam updated successfully" : "Naam created successfully"
      );
      queryClient.invalidateQueries({ queryKey: ["naamList"] });
      closeFormModal();
    },
    onError: (err: any) => {
      toast.error(err.message || "An error occurred");
    },
  });

  // Toggle Active/Inactive Status Mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, newStatus }: { id: number; newStatus: "active" | "inactive" }) => {
      const res = await fetch(`/api/admin/naam/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update status");
      return json;
    },
    onSuccess: () => {
      toast.success("Status updated");
      queryClient.invalidateQueries({ queryKey: ["naamList"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to toggle status");
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/naam/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to delete");
      return json;
    },
    onSuccess: () => {
      toast.success("Naam deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["naamList"] });
      setDeletingItem(null);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete Naam");
    },
  });

  const openCreateModal = () => {
    setEditingItem(null);
    setIsSlugCustomized(false);
    reset({
      name: "",
      name_hindi: "",
      slug: "",
      category: "",
      icon: "🙏",
      description: "",
      sort_order: (data?.total || 0) + 1,
      status: "active",
    });
    setIsFormOpen(true);
  };

  const openEditModal = (item: Naam) => {
    setEditingItem(item);
    setIsSlugCustomized(true);
    reset({
      name: item.name,
      name_hindi: item.name_hindi,
      slug: item.slug,
      category: item.category,
      icon: item.icon || "🙏",
      description: item.description || "",
      sort_order: item.sort_order,
      status: item.status,
    });
    setIsFormOpen(true);
  };

  const closeFormModal = () => {
    setIsFormOpen(false);
    setEditingItem(null);
  };

  const totalPages = data ? Math.ceil(data.total / limit) : 1;
  const startRow = data?.total ? (page - 1) * limit + 1 : 0;
  const endRow = data?.total ? Math.min(page * limit, data.total) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#F59E0B]" /> Naam Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage divine sacred names, transliterations, and ordering for Naam Lekhan.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#7A1F1F] hover:bg-[#631818] text-white text-sm font-medium shadow transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Naam
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search name, Hindi or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A1F1F] dark:focus:ring-[#F59E0B]"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="text-xs text-gray-500 font-medium whitespace-nowrap">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A1F1F] dark:focus:ring-[#F59E0B]"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-700 dark:text-gray-200">
            <thead className="bg-[#FDFBF7] dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 text-xs uppercase font-semibold text-gray-600 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3 text-center w-16">Sort</th>
                <th className="px-4 py-3 text-center w-16">Icon</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Hindi Name</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-4 text-center">
                      <div className="h-4 w-6 bg-gray-200 dark:bg-gray-700 rounded mx-auto"></div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto"></div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto"></div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded ml-auto"></div>
                    </td>
                  </tr>
                ))
              ) : isError ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-red-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertTriangle className="w-8 h-8 text-red-500" />
                      <p className="font-semibold">Failed to load Naam data</p>
                      <button
                        onClick={() => refetch()}
                        className="mt-2 px-3 py-1.5 text-xs bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-md font-medium hover:bg-red-200"
                      >
                        Retry
                      </button>
                    </div>
                  </td>
                </tr>
              ) : data?.data && data.data.length > 0 ? (
                data.data.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-[#FDFBF7]/60 dark:hover:bg-gray-700/40 transition-colors"
                  >
                    <td className="px-4 py-3 text-center font-mono font-medium text-gray-500">
                      {item.sort_order}
                    </td>
                    <td className="px-4 py-3 text-center text-xl">{item.icon || "🙏"}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-100">
                      {item.name}
                    </td>
                    <td className="px-4 py-3 font-devanagari text-lg text-[#7A1F1F] dark:text-[#F59E0B] font-bold">
                      {item.name_hindi}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">
                      {item.slug}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="inline-flex items-center gap-2">
                        <span
                          className={`inline-flex px-2 py-0.5 text-xs rounded-full font-semibold ${item.status === "active"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                            }`}
                        >
                          {item.status}
                        </span>
                        {/* Custom Switch Toggle */}
                        <button
                          type="button"
                          role="switch"
                          aria-checked={item.status === "active"}
                          onClick={() =>
                            toggleStatusMutation.mutate({
                              id: item.id,
                              newStatus: item.status === "active" ? "inactive" : "active",
                            })
                          }
                          className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${item.status === "active"
                            ? "bg-[#7A1F1F]"
                            : "bg-gray-300 dark:bg-gray-600"
                            }`}
                        >
                          <span
                            aria-hidden="true"
                            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${item.status === "active" ? "translate-x-4" : "translate-x-0"
                              }`}
                          />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 hover:text-[#7A1F1F]"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingItem(item)}
                          className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-950/30 text-gray-600 dark:text-gray-300 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                    <p className="font-medium text-base">No Naam found</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Try adjusting your search criteria or add a new Naam.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {data && data.total > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 bg-[#FDFBF7]/40 dark:bg-gray-900/40 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <span>Rows per page:</span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs"
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
              <span className="ml-2">
                Showing <strong className="font-semibold">{startRow}</strong> -{" "}
                <strong className="font-semibold">{endRow}</strong> of{" "}
                <strong className="font-semibold">{data.total}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span>
                Page {page} of {totalPages || 1}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="p-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
              >
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
                {editingItem ? "Edit Naam" : "Add New Naam"}
              </h3>
              <button
                onClick={closeFormModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={handleSubmit((values) => saveMutation.mutate(values as NaamFormData))}
              className="p-6 space-y-4 max-h-[80vh] overflow-y-auto"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Name (English) <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("name")}
                    placeholder="e.g. Ram"
                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A1F1F]"
                  />
                  {errors.name && (
                    <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
                  )}
                </div>

                {/* Hindi Name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Hindi Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("name_hindi")}
                    placeholder="e.g. राम"
                    className="w-full px-3 py-2 text-sm font-devanagari font-bold bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A1F1F]"
                  />
                  {errors.name_hindi && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.name_hindi.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Slug */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Slug
                  </label>
                  <input
                    {...register("slug")}
                    onChange={() => setIsSlugCustomized(true)}
                    placeholder="e.g. ram"
                    className="w-full px-3 py-2 text-sm font-mono bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A1F1F]"
                  />
                  {errors.slug && (
                    <p className="text-xs text-red-500 mt-1">{errors.slug.message}</p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("category")}
                    placeholder="e.g. Vishnu Avatar"
                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A1F1F]"
                  />
                  {errors.category && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.category.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Icon */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Icon (Emoji)
                  </label>
                  <input
                    {...register("icon")}
                    placeholder="🙏"
                    className="w-full px-3 py-2 text-sm text-center bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A1F1F]"
                  />
                </div>

                {/* Sort Order */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    {...register("sort_order")}
                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A1F1F]"
                  />
                  {errors.sort_order && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.sort_order.message}
                    </p>
                  )}
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    {...register("status")}
                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A1F1F]"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  {...register("description")}
                  placeholder="Short spiritual significance..."
                  className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A1F1F]"
                ></textarea>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={closeFormModal}
                  className="px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || saveMutation.isPending}
                  className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-[#7A1F1F] hover:bg-[#631818] rounded-lg shadow disabled:opacity-50"
                >
                  {(isSubmitting || saveMutation.isPending) && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  )}
                  {editingItem ? "Update Naam" : "Save Naam"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Alert Dialog */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <div className="p-3 bg-red-100 dark:bg-red-950/50 rounded-full">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Confirm Deletion
              </h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Are you sure you want to delete{" "}
              <strong className="text-gray-900 dark:text-white font-semibold">
                {deletingItem.name} ({deletingItem.name_hindi})
              </strong>
              ? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingItem(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(deletingItem.id)}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow disabled:opacity-50"
              >
                {deleteMutation.isPending && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                )}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
