"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  Clock,
  Download,
  FileCheck,
  Save,
  Loader2,
  AlertTriangle,
  BookOpen,
  Eye,
} from "lucide-react";
import { Personalization } from "@/types";

const editFormSchema = z.object({
  recipientName: z.string().min(1, "Recipient name is required"),
  fromName: z.string().min(1, "From name is required"),
  dedication: z.string().min(1, "Dedication message is required"),
  dateText: z.string().optional(),
  familyName: z.string().optional(),
});

type EditFormData = z.infer<typeof editFormSchema>;

export default function PersonalizationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params?.id as string;

  const [activeTab, setActiveTab] = useState<"cover" | "sankalp" | "writing" | "completion">("cover");
  const [changeNote, setChangeNote] = useState("");
  const [isChangeDialogOpen, setIsChangeDialogOpen] = useState(false);

  const { data: item, isLoading, isError } = useQuery<Personalization>({
    queryKey: ["personalizationDetail", id],
    queryFn: async () => {
      const res = await fetch(`/api/admin/personalizations/${id}`);
      if (!res.ok) throw new Error("Personalization record not found");
      return res.json();
    },
    enabled: !!id,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<EditFormData>({
    resolver: zodResolver(editFormSchema),
    values: item
      ? {
          recipientName: item.recipientName,
          fromName: item.fromName,
          dedication: item.dedication,
          dateText: item.dateText || "",
          familyName: item.familyName || "",
        }
      : undefined,
  });

  // Edit details mutation
  const updateMutation = useMutation({
    mutationFn: async (values: EditFormData) => {
      const res = await fetch(`/api/admin/personalizations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update details");
      return json;
    },
    onSuccess: () => {
      toast.success("Personalization details saved");
      queryClient.invalidateQueries({ queryKey: ["personalizationDetail", id] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to save");
    },
  });

  // Approval Mutation
  const approvalMutation = useMutation({
    mutationFn: async ({
      status,
      note,
    }: {
      status: "approved" | "changes_requested" | "pending";
      note?: string;
    }) => {
      const res = await fetch(`/api/admin/personalizations/${id}/approval`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, note }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update approval status");
      return json;
    },
    onSuccess: (updated, variables) => {
      if (variables.status === "approved") {
        toast.success("Book proof approved! Print-ready PDF generated.");
      } else {
        toast.warning("Changes requested notification sent.");
      }
      queryClient.invalidateQueries({ queryKey: ["personalizationDetail", id] });
      setIsChangeDialogOpen(false);
      setChangeNote("");
    },
    onError: (err: any) => {
      toast.error(err.message || "Approval update failed");
    },
  });

  const handleDownload = (type: "preview" | "final") => {
    if (type === "preview") {
      toast.info(`Downloading proof: ${item?.previewFile || "proof_preview.pdf"}`);
    } else {
      if (item?.approvalStatus !== "approved") {
        toast.error("Final PDF is only available for approved books");
        return;
      }
      toast.success(`Downloading final print PDF: ${item.finalPdf}`);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-gray-500 animate-pulse flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#7A1F1F]" />
        <p className="text-sm">Loading book personalization proof...</p>
      </div>
    );
  }

  if (isError || !item) {
    return (
      <div className="p-12 text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-red-500 mx-auto" />
        <h3 className="text-lg font-bold">Personalization Record Not Found</h3>
        <button
          onClick={() => router.push("/admin/personalization")}
          className="px-4 py-2 text-xs bg-[#7A1F1F] text-white rounded-lg"
        >
          Back to Personalization
        </button>
      </div>
    );
  }

  const isApproved = item.approvalStatus === "approved";
  const designType = item.design?.type || "simple";
  const isLargePrint = item.bookSize === "A4 Large Print";

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/personalization"
          className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-[#7A1F1F]"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Customization List
        </Link>

        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
              isApproved
                ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border border-green-300"
                : item.approvalStatus === "changes_requested"
                ? "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300 border border-orange-300"
                : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border border-gray-300"
            }`}
          >
            {isApproved ? <FileCheck className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
            Status: {item.approvalStatus.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: Details, Edit Form & Approval Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Order Details Summary Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 space-y-3">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                  {item.orderNumber}
                </h3>
                <p className="text-xs text-gray-400">Devotee: {item.user?.name || item.fromName}</p>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border border-amber-200">
                {item.edition}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-gray-400">Naam</p>
                <p className="font-semibold text-gray-800 dark:text-gray-200">
                  {item.naam?.name} ({item.naam?.name_hindi})
                </p>
              </div>
              <div>
                <p className="text-gray-400">Target Volume</p>
                <p className="font-semibold text-gray-800 dark:text-gray-200">
                  {item.targetCount.toLocaleString("en-IN")} Naams ({item.pages} pgs)
                </p>
              </div>
              <div>
                <p className="text-gray-400">Format & Size</p>
                <p className="font-semibold text-gray-800 dark:text-gray-200">
                  {item.bookSize} • {item.binding} Binding
                </p>
              </div>
              <div>
                <p className="text-gray-400">Cover Design</p>
                <p className="font-semibold text-gray-800 dark:text-gray-200">
                  {item.design?.name} ({item.design?.type})
                </p>
              </div>
            </div>

            {item.approvalNote && (
              <div className="p-3 bg-orange-50 dark:bg-orange-950/40 rounded-xl border border-orange-200 dark:border-orange-800 text-xs">
                <p className="font-bold text-orange-900 dark:text-orange-300">Approval Note:</p>
                <p className="text-orange-800 dark:text-orange-400 mt-0.5">{item.approvalNote}</p>
              </div>
            )}
          </div>

          {/* Edit Dedication & Metadata Form */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 space-y-4">
            <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-[#7A1F1F]" /> Edit Dedication & Text
            </h4>

            <form onSubmit={handleSubmit((values) => updateMutation.mutate(values))} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Recipient Name
                  </label>
                  <input
                    {...register("recipientName")}
                    className="w-full px-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    From Name
                  </label>
                  <input
                    {...register("fromName")}
                    className="w-full px-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Dedication Message (Hindi/English)
                </label>
                <textarea
                  rows={3}
                  {...register("dedication")}
                  className="w-full px-3 py-1.5 text-xs font-devanagari bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Date Text (e.g. शुभ मुहूर्त)
                  </label>
                  <input
                    {...register("dateText")}
                    className="w-full px-3 py-1.5 text-xs font-devanagari bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Family Name (e.g. शर्मा परिवार)
                  </label>
                  <input
                    {...register("familyName")}
                    className="w-full px-3 py-1.5 text-xs font-devanagari bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || updateMutation.isPending}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#7A1F1F] hover:bg-[#631818] rounded-lg shadow disabled:opacity-50"
                >
                  {(isSubmitting || updateMutation.isPending) && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  )}
                  <Save className="w-3.5 h-3.5" /> Save Changes
                </button>
              </div>
            </form>
          </div>

          {/* Approval & Action Panel */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 space-y-4">
            <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">
              Approval & Print Dispatch
            </h4>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                disabled={approvalMutation.isPending}
                onClick={() => approvalMutation.mutate({ status: "approved" })}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold shadow transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" /> Approve Book
              </button>

              <button
                type="button"
                onClick={() => {
                  setChangeNote(item.approvalNote || "");
                  setIsChangeDialogOpen(true);
                }}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-orange-100 hover:bg-orange-200 text-orange-900 dark:bg-orange-950/60 dark:text-orange-300 text-xs font-bold border border-orange-300 transition-colors"
              >
                <AlertCircle className="w-4 h-4" /> Request Changes
              </button>
            </div>

            <div className="pt-2 border-t flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => handleDownload("preview")}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 text-xs font-semibold text-gray-700 dark:text-gray-300"
              >
                <Download className="w-3.5 h-3.5" /> Download Proof
              </button>

              <button
                type="button"
                disabled={!isApproved}
                onClick={() => handleDownload("final")}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#7A1F1F] hover:bg-[#631818] text-white text-xs font-semibold shadow disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Download className="w-3.5 h-3.5" /> Download Final PDF
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Book Preview (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Tabs */}
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#F59E0B]" /> Book Page Proof (Proof Viewer)
            </h3>
            <div className="flex items-center gap-1 bg-stone-100 dark:bg-gray-800 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab("cover")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                  activeTab === "cover"
                    ? "bg-white dark:bg-gray-700 text-[#7A1F1F] dark:text-[#F59E0B] shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Front Cover
              </button>
              <button
                onClick={() => setActiveTab("sankalp")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                  activeTab === "sankalp"
                    ? "bg-white dark:bg-gray-700 text-[#7A1F1F] dark:text-[#F59E0B] shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Sankalp Page
              </button>
              <button
                onClick={() => setActiveTab("writing")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                  activeTab === "writing"
                    ? "bg-white dark:bg-gray-700 text-[#7A1F1F] dark:text-[#F59E0B] shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Writing Page
              </button>
              <button
                onClick={() => setActiveTab("completion")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                  activeTab === "completion"
                    ? "bg-white dark:bg-gray-700 text-[#7A1F1F] dark:text-[#F59E0B] shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Completion Page
              </button>
            </div>
          </div>

          {/* Book Proof Canvas Frame */}
          <div className="flex justify-center bg-stone-100 dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* A5 (1 : 1.414) Page Frame */}
            <div
              className={`relative w-full max-w-[420px] aspect-[1/1.414] bg-[#FFFDF9] text-gray-900 rounded-2xl shadow-xl flex flex-col justify-between p-6 select-none transition-all ${
                designType === "simple"
                  ? "border border-stone-300"
                  : designType === "traditional"
                  ? "border-8 border-double border-[#7A1F1F] ring-2 ring-[#F59E0B]"
                  : "border-4 border-transparent bg-gradient-to-b from-amber-100 via-[#FFFDF9] to-amber-100 ring-4 ring-[#F59E0B] shadow-2xl"
              }`}
            >
              {/* Premium Corner Ornaments */}
              {designType === "premium" && (
                <>
                  <span className="absolute top-2 left-3 text-[#7A1F1F] text-lg font-serif">❧</span>
                  <span className="absolute top-2 right-3 text-[#7A1F1F] text-lg font-serif">❧</span>
                  <span className="absolute bottom-2 left-3 text-[#7A1F1F] text-lg font-serif">❧</span>
                  <span className="absolute bottom-2 right-3 text-[#7A1F1F] text-lg font-serif">❧</span>
                </>
              )}

              {/* Watermark when NOT approved */}
              {!isApproved && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                  <span className="text-red-500/20 text-6xl font-black transform -rotate-45 tracking-widest uppercase select-none border-4 border-red-500/20 px-8 py-2 rounded-2xl">
                    PREVIEW PROOF
                  </span>
                </div>
              )}

              {/* TAB 1: FRONT COVER */}
              {activeTab === "cover" && (
                <div className="h-full flex flex-col justify-between text-center py-4 relative z-10">
                  <div className="space-y-1">
                    <span className="text-3xl">{item.naam?.icon || "🙏"}</span>
                    <h2
                      className={`font-devanagari font-extrabold text-[#7A1F1F] tracking-wide ${
                        isLargePrint ? "text-3xl" : "text-2xl"
                      }`}
                    >
                      श्री {item.naam?.name_hindi} नाम लेखन
                    </h2>
                    <p className="text-xs font-semibold text-amber-800 tracking-wider">
                      {item.targetCount.toLocaleString("en-IN")} {item.naam?.name_hindi} नाम संकल्प पुस्तिका
                    </p>
                  </div>

                  {/* Dedication Block */}
                  <div className="my-auto py-4 px-3 bg-amber-50/60 rounded-xl border border-amber-200/60 space-y-2">
                    <p className="text-xs font-bold uppercase text-[#7A1F1F] tracking-widest font-devanagari">
                      ॥ सप्रेम भेंट ॥
                    </p>
                    <p className="text-base font-bold text-gray-900 font-devanagari">
                      {item.recipientName}
                    </p>
                    <p className="text-xs italic text-gray-700 font-devanagari px-2 leading-relaxed">
                      &ldquo;{item.dedication}&rdquo;
                    </p>
                  </div>

                  {/* From & Date Footer */}
                  <div className="space-y-1 pt-2 border-t border-amber-200/50">
                    <p className="text-[11px] font-semibold text-gray-500 font-devanagari">
                      प्रेम सहित: <span className="text-gray-900 font-bold">{item.fromName}</span>
                    </p>
                    {item.familyName && (
                      <p className="text-[10px] text-gray-400 font-devanagari">{item.familyName}</p>
                    )}
                    {item.dateText && (
                      <p className="text-[10px] text-amber-700 font-devanagari">{item.dateText}</p>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: SANKALP PAGE */}
              {activeTab === "sankalp" && (
                <div className="h-full flex flex-col justify-between py-4 text-center relative z-10 font-devanagari space-y-3">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-[#7A1F1F] uppercase tracking-widest">
                      ॥ पावन संकल्प पत्र ॥
                    </p>
                    <h3 className="text-xl font-bold text-gray-900">
                      श्री {item.naam?.name_hindi} नाम जप संकल्प
                    </h3>
                  </div>

                  <div className="text-xs text-gray-700 leading-relaxed space-y-2 text-left bg-stone-50 p-4 rounded-xl border border-stone-200 shadow-inner">
                    <p>
                      मैं, <strong>{item.fromName}</strong>, पूर्ण श्रद्धा और निष्ठा से{" "}
                      <strong>{item.recipientName}</strong> के कल्याण एवं आत्मिक शांति हेतु{" "}
                      <strong>{item.targetCount.toLocaleString("en-IN")}</strong> श्री {item.naam?.name_hindi} नाम लेखन का संकल्प लेता हूँ।
                    </p>
                    <p className="italic text-gray-500">
                      भगवत कृपा से यह पावन अनुष्ठान निर्विघ्न संपन्न हो।
                    </p>
                  </div>

                  <div className="pt-2 flex justify-between items-center text-[10px] text-gray-500 border-t">
                    <span>संकल्प कर्ता: {item.fromName}</span>
                    <span>पुस्तिका क्रमांक: {item.orderNumber}</span>
                  </div>
                </div>
              )}

              {/* TAB 3: WRITING PAGE (Grid) */}
              {activeTab === "writing" && (
                <div className="h-full flex flex-col justify-between py-2 relative z-10 font-devanagari">
                  <div className="flex justify-between items-center text-[10px] text-gray-400 border-b pb-1">
                    <span>श्री {item.naam?.name_hindi} नाम लेखन</span>
                    <span>पृष्ठ संख्या ०१</span>
                  </div>

                  {/* Grid of repeated Naam in boxes */}
                  <div className="grid grid-cols-4 gap-2 my-auto p-2 bg-stone-50 rounded-xl border border-stone-200">
                    {Array.from({ length: 16 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-10 border border-stone-300 rounded flex items-center justify-center bg-white shadow-xs"
                      >
                        <span className="text-xs font-bold text-[#7A1F1F]/60">
                          {item.naam?.name_hindi}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="text-center text-[10px] text-stone-400">
                    प्रत्येक पृष्ठ पर १०८ नाम लेखन हेतु पावन कोष्ठक
                  </div>
                </div>
              )}

              {/* TAB 4: COMPLETION PAGE */}
              {activeTab === "completion" && (
                <div className="h-full flex flex-col justify-between py-4 text-center relative z-10 font-devanagari space-y-3">
                  <div className="space-y-1">
                    <span className="text-4xl">🪷</span>
                    <h3 className="text-2xl font-extrabold text-green-700">
                      ॥ संकल्प पूर्णता प्रमाण ॥
                    </h3>
                    <p className="text-xs text-gray-500 font-sans uppercase tracking-wider">
                      Sankalp Completed
                    </p>
                  </div>

                  <div className="bg-green-50/70 p-4 rounded-xl border border-green-200 text-xs text-gray-800 space-y-2">
                    <p>
                      परम सौभाग्य से <strong>{item.recipientName}</strong> के लिए समर्पित{" "}
                      <strong>{item.targetCount.toLocaleString("en-IN")}</strong> श्री {item.naam?.name_hindi} नाम लेखन अनुष्ठान सफलतापूर्वक पूर्ण हुआ।
                    </p>
                    <p className="font-bold text-[#7A1F1F]">
                      &ldquo;राम नाम सब विधि सुखदाता&rdquo;
                    </p>
                  </div>

                  <div className="pt-2 text-[11px] text-gray-500 border-t">
                    <p>सादर समर्पित: {item.fromName}</p>
                    <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                      Completed Proof • {new Date().toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Changes Request Dialog */}
      {isChangeDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
            <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-500" /> Request Proof Changes
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              Please specify the required changes or correction notes for devotee vow proof #{item.orderNumber}.
            </p>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Correction Note <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                value={changeNote}
                onChange={(e) => setChangeNote(e.target.value)}
                placeholder="e.g. Please fix Hindi spelling of the dedication and re-align cover margins."
                className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A1F1F]"
              ></textarea>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsChangeDialogOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!changeNote.trim() || approvalMutation.isPending}
                onClick={() =>
                  approvalMutation.mutate({
                    status: "changes_requested",
                    note: changeNote.trim(),
                  })
                }
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow disabled:opacity-50"
              >
                {approvalMutation.isPending && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                )}
                Submit Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
