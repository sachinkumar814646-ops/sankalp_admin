"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  Palette,
  Plus,
  Search,
  Edit,
  Trash2,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  UploadCloud,
  FileText,
  Sparkles,
  X,
} from "lucide-react";
import { Design, DesignTemplates } from "@/types";

const designFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["simple", "traditional", "premium"]),
  description: z.string().min(1, "Description is required"),
  status: z.enum(["active", "inactive"]),
});

type DesignFormData = z.infer<typeof designFormSchema>;

type TemplateSlotKey = keyof DesignTemplates;

const TEMPLATE_SLOTS: { key: TemplateSlotKey; label: string }[] = [
  { key: "cover", label: "Cover Page" },
  { key: "writingPage", label: "Writing Page" },
  { key: "milestonePage", label: "Milestone Page" },
  { key: "completionPage", label: "Completion Page" },
];

export default function DesignsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Add Dialog State
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Edit Sheet State
  const [editingDesign, setEditingDesign] = useState<Design | null>(null);

  // Delete Alert State
  const [deletingDesign, setDeletingDesign] = useState<Design | null>(null);

  // Local slot files & previews for Edit Sheet
  const [slotFiles, setSlotFiles] = useState<{
    [K in TemplateSlotKey]?: { file: File; previewUrl: string };
  }>({});
  const [uploadingSlot, setUploadingSlot] = useState<TemplateSlotKey | null>(null);

  // Add Form
  const {
    register: registerAdd,
    handleSubmit: handleSubmitAdd,
    reset: resetAdd,
    formState: { errors: errorsAdd, isSubmitting: isSubmittingAdd },
  } = useForm<DesignFormData>({
    resolver: zodResolver(designFormSchema),
    defaultValues: {
      name: "",
      type: "simple",
      description: "",
      status: "active",
    },
  });

  // Edit Form
  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    formState: { errors: errorsEdit, isSubmitting: isSubmittingEdit },
  } = useForm<DesignFormData>({
    resolver: zodResolver(designFormSchema),
  });

  // Fetch Designs
  const { data, isLoading, isError, refetch } = useQuery<{ data: Design[]; total: number }>({
    queryKey: ["designsList", search, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        search,
        status: statusFilter,
      });
      const res = await fetch(`/api/admin/designs?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch designs");
      return res.json();
    },
  });

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: async (formData: DesignFormData) => {
      const res = await fetch("/api/admin/designs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create design");
      return json;
    },
    onSuccess: () => {
      toast.success("Design created successfully");
      queryClient.invalidateQueries({ queryKey: ["designsList"] });
      setIsAddOpen(false);
      resetAdd();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create design");
    },
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: async (formData: DesignFormData) => {
      if (!editingDesign) return;
      const res = await fetch(`/api/admin/designs/${editingDesign.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update design");
      return json;
    },
    onSuccess: (updated) => {
      toast.success("Design details updated");
      queryClient.invalidateQueries({ queryKey: ["designsList"] });
      setEditingDesign(updated);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update design");
    },
  });

  // Toggle Switch Mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, newStatus }: { id: number; newStatus: "active" | "inactive" }) => {
      const res = await fetch(`/api/admin/designs/${id}`, {
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
      queryClient.invalidateQueries({ queryKey: ["designsList"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update status");
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/designs/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to delete design");
      return json;
    },
    onSuccess: () => {
      toast.success("Design deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["designsList"] });
      setDeletingDesign(null);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete design");
    },
  });

  // Upload Template Slot Mutation
  const uploadTemplateMutation = useMutation({
    mutationFn: async ({
      designId,
      slot,
      fileName,
    }: {
      designId: number;
      slot: TemplateSlotKey;
      fileName: string;
    }) => {
      const res = await fetch(`/api/admin/designs/${designId}/templates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slot, fileName }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to upload template");
      return json;
    },
    onSuccess: (data, variables) => {
      toast.success(`${variables.slot} template uploaded`);
      queryClient.invalidateQueries({ queryKey: ["designsList"] });
      if (editingDesign) {
        setEditingDesign({
          ...editingDesign,
          templates: {
            ...editingDesign.templates,
            [variables.slot]: variables.fileName,
          },
        });
      }
      setUploadingSlot(null);
    },
    onError: (err: any) => {
      toast.error(err.message || "Upload failed");
      setUploadingSlot(null);
    },
  });

  const openEditSheet = (design: Design) => {
    setEditingDesign(design);
    setSlotFiles({});
    resetEdit({
      name: design.name,
      type: design.type,
      description: design.description,
      status: design.status,
    });
  };

  const handleFileChange = (slot: TemplateSlotKey, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setSlotFiles((prev) => ({
        ...prev,
        [slot]: { file, previewUrl },
      }));
    }
  };

  const handleUploadSlot = (slot: TemplateSlotKey) => {
    if (!editingDesign) return;
    const selected = slotFiles[slot];
    if (!selected) return;

    setUploadingSlot(slot);
    uploadTemplateMutation.mutate({
      designId: editingDesign.id,
      slot,
      fileName: selected.file.name,
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Palette className="w-6 h-6 text-[#7A1F1F] dark:text-[#F59E0B]" /> Digital Designs & Templates
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage devotional writing page borders, layouts, themes, and PDF template assets.
          </p>
        </div>
        <button
          onClick={() => {
            resetAdd({
              name: "",
              type: "simple",
              description: "",
              status: "active",
            });
            setIsAddOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#7A1F1F] hover:bg-[#631818] text-white text-sm font-semibold shadow transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Design
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search design name or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A1F1F]"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="text-xs text-gray-500 font-medium">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A1F1F]"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Card Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-4 animate-pulse"
            >
              <div className="h-44 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
              <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-12 text-center text-red-500">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
          <p className="font-semibold">Failed to load designs</p>
          <button
            onClick={() => refetch()}
            className="mt-3 px-4 py-1.5 text-xs bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-md font-medium"
          >
            Retry
          </button>
        </div>
      ) : data?.data && data.data.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.data.map((design) => {
            return (
              <div
                key={design.id}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                {/* CSS Drawn Preview */}
                <div className="p-5 bg-stone-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-center">
                  <div
                    className={`w-full max-w-[260px] h-44 rounded-xl bg-[#FFFDF9] text-gray-800 flex flex-col items-center justify-center relative p-4 shadow-sm select-none ${
                      design.type === "simple"
                        ? "border border-stone-300"
                        : design.type === "traditional"
                        ? "border-4 border-double border-[#7A1F1F] ring-1 ring-[#F59E0B]"
                        : "border-2 border-transparent bg-gradient-to-r from-amber-200 via-[#FFFDF9] to-amber-200 p-[2px] shadow-md ring-2 ring-[#F59E0B]"
                    }`}
                  >
                    {/* Corner Ornaments for Premium */}
                    {design.type === "premium" && (
                      <>
                        <span className="absolute top-1.5 left-2 text-[#7A1F1F] text-xs font-serif">
                          ❧
                        </span>
                        <span className="absolute top-1.5 right-2 text-[#7A1F1F] text-xs font-serif">
                          ❧
                        </span>
                        <span className="absolute bottom-1.5 left-2 text-[#7A1F1F] text-xs font-serif">
                          ❧
                        </span>
                        <span className="absolute bottom-1.5 right-2 text-[#7A1F1F] text-xs font-serif">
                          ❧
                        </span>
                      </>
                    )}

                    {/* Traditional Border Motif */}
                    {design.type === "traditional" && (
                      <span className="absolute top-1 text-[10px] text-[#7A1F1F] font-mono">
                        ❖ ❖ ❖
                      </span>
                    )}

                    {/* Sample Sacred Writing Preview */}
                    <div className="text-center space-y-1">
                      <p className="text-2xl font-devanagari font-extrabold text-[#7A1F1F]">
                        श्री राम
                      </p>
                      <p className="text-[10px] text-gray-500 font-mono tracking-widest">
                        NAAM LEKHAN
                      </p>
                    </div>

                    <div className="absolute bottom-2 text-[9px] text-stone-400 font-sans uppercase">
                      {design.type} template layout
                    </div>
                  </div>
                </div>

                {/* Card Info */}
                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        {design.name}
                      </h3>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                          design.type === "premium"
                            ? "bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300"
                            : design.type === "traditional"
                            ? "bg-red-100 text-[#7A1F1F] dark:bg-red-950/50 dark:text-red-300"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {design.type}
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
                      {design.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {/* Switch */}
                      <button
                        type="button"
                        role="switch"
                        aria-checked={design.status === "active"}
                        onClick={() =>
                          toggleStatusMutation.mutate({
                            id: design.id,
                            newStatus: design.status === "active" ? "inactive" : "active",
                          })
                        }
                        className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          design.status === "active"
                            ? "bg-[#7A1F1F]"
                            : "bg-gray-300 dark:bg-gray-600"
                        }`}
                      >
                        <span
                          aria-hidden="true"
                          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            design.status === "active" ? "translate-x-4" : "translate-x-0"
                          }`}
                        />
                      </button>
                      <span className="text-xs text-gray-500 capitalize">{design.status}</span>
                    </div>

                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                      Used in <strong className="text-gray-900 dark:text-white font-bold">{design.usageCount}</strong> vows
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      onClick={() => openEditSheet(design)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5" /> Edit & Assets
                    </button>
                    <button
                      onClick={() => setDeletingDesign(design)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-12 text-center text-gray-500">
          <Palette className="w-10 h-10 mx-auto text-gray-400 mb-2" />
          <p className="font-semibold text-base">No designs found</p>
          <p className="text-xs text-gray-400 mt-1">Try adjusting search or add a new layout.</p>
        </div>
      )}

      {/* Add Design Dialog */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Add Digital Design</h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={handleSubmitAdd((values) => createMutation.mutate(values))}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Design Name <span className="text-red-500">*</span>
                </label>
                <input
                  {...registerAdd("name")}
                  placeholder="e.g. Traditional Mandir Red"
                  className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A1F1F]"
                />
                {errorsAdd.name && (
                  <p className="text-xs text-red-500 mt-1">{errorsAdd.name.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Design Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...registerAdd("type")}
                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A1F1F]"
                  >
                    <option value="simple">Simple</option>
                    <option value="traditional">Traditional</option>
                    <option value="premium">Premium</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    {...registerAdd("status")}
                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A1F1F]"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  {...registerAdd("description")}
                  placeholder="Describe theme, borders, and visual motifs..."
                  className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A1F1F]"
                ></textarea>
                {errorsAdd.description && (
                  <p className="text-xs text-red-500 mt-1">{errorsAdd.description.message}</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAdd || createMutation.isPending}
                  className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-[#7A1F1F] hover:bg-[#631818] rounded-lg shadow disabled:opacity-50"
                >
                  {(isSubmittingAdd || createMutation.isPending) && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  )}
                  Save Design
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Design Sheet */}
      {editingDesign && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white dark:bg-gray-800 h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
            {/* Sheet Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  Edit Design & Assets
                </h3>
                <p className="text-xs text-gray-500">Design ID #{editingDesign.id}</p>
              </div>
              <button
                onClick={() => setEditingDesign(null)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sheet Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Form Details */}
              <form
                onSubmit={handleSubmitEdit((values) => updateMutation.mutate(values))}
                className="space-y-4 bg-gray-50 dark:bg-gray-900/40 p-4 rounded-xl border border-gray-200 dark:border-gray-700"
              >
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                  Design Properties
                </h4>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Design Name
                  </label>
                  <input
                    {...registerEdit("name")}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
                  />
                  {errorsEdit.name && (
                    <p className="text-xs text-red-500 mt-1">{errorsEdit.name.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Type
                    </label>
                    <select
                      {...registerEdit("type")}
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
                    >
                      <option value="simple">Simple</option>
                      <option value="traditional">Traditional</option>
                      <option value="premium">Premium</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Status
                    </label>
                    <select
                      {...registerEdit("status")}
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    {...registerEdit("description")}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
                  ></textarea>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={isSubmittingEdit || updateMutation.isPending}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-[#7A1F1F] hover:bg-[#631818] rounded-lg shadow disabled:opacity-50 inline-flex items-center gap-1.5"
                  >
                    {updateMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Save Info
                  </button>
                </div>
              </form>

              {/* Template Slots Upload Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-[#7A1F1F] dark:text-[#F59E0B]" />
                    Page Template Assets (4 Slots)
                  </h4>
                </div>

                <div className="space-y-4">
                  {TEMPLATE_SLOTS.map((slot) => {
                    const isUploaded = !!editingDesign.templates[slot.key];
                    const selected = slotFiles[slot.key];
                    const isCurrentUploading = uploadingSlot === slot.key;

                    return (
                      <div
                        key={slot.key}
                        className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                            {slot.label}
                          </span>
                          {isUploaded ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 dark:bg-green-950/40 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Uploaded (
                              {editingDesign.templates[slot.key]})
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">Not uploaded</span>
                          )}
                        </div>

                        {/* Thumbnail preview if selected */}
                        {selected?.previewUrl && (
                          <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-inner">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={selected.previewUrl}
                              alt="preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <input
                            type="file"
                            accept="image/*,.pdf,.svg"
                            onChange={(e) => handleFileChange(slot.key, e)}
                            className="text-xs text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer"
                          />

                          {selected && (
                            <button
                              type="button"
                              disabled={isCurrentUploading}
                              onClick={() => handleUploadSlot(slot.key)}
                              className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-white bg-[#7A1F1F] hover:bg-[#631818] rounded-md shadow disabled:opacity-50"
                            >
                              {isCurrentUploading ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <UploadCloud className="w-3 h-3" />
                              )}
                              Upload
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Alert */}
      {deletingDesign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-3 bg-red-100 dark:bg-red-950/50 rounded-full">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Confirm Deletion
              </h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Are you sure you want to delete design{" "}
              <strong className="text-gray-900 dark:text-white font-semibold">
                {deletingDesign.name}
              </strong>
              ? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingDesign(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(deletingDesign.id)}
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
