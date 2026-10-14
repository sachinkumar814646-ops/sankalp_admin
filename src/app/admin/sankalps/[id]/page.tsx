"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ChevronLeft,
  Flame,
  Calendar,
  Sparkles,
  Lock,
  Pause,
  Play,
  CheckCircle,
  Clock,
  AlertTriangle,
  Loader2,
  Heart,
  Palette,
  Award,
} from "lucide-react";
import { Sankalp, SankalpCalendarDay } from "@/types";

interface SankalpDetail extends Sankalp {
  calendar: SankalpCalendarDay[];
}

const MILESTONES = [
  { target: 1008, label: "1,008" },
  { target: 5000, label: "5,000" },
  { target: 11000, label: "11,000" },
  { target: 21000, label: "21,000" },
  { target: 51000, label: "51,000" },
  { target: 100000, label: "1,00,000" },
];

export default function SankalpDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params?.id as string;

  const [isPauseDialogOpen, setIsPauseDialogOpen] = useState(false);
  const [reason, setReason] = useState("");

  const { data: item, isLoading, isError, refetch } = useQuery<SankalpDetail>({
    queryKey: ["sankalpDetail", id],
    queryFn: async () => {
      const res = await fetch(`/api/admin/sankalps/${id}`);
      if (!res.ok) throw new Error("Sankalp not found");
      return res.json();
    },
    enabled: !!id,
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({
      newStatus,
      pauseReason,
    }: {
      newStatus: "active" | "paused";
      pauseReason: string;
    }) => {
      const res = await fetch(`/api/admin/sankalps/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, reason: pauseReason }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update status");
      return json;
    },
    onSuccess: () => {
      toast.success(
        item?.status === "active" ? "Sankalp paused" : "Sankalp resumed"
      );
      queryClient.invalidateQueries({ queryKey: ["sankalpDetail", id] });
      setIsPauseDialogOpen(false);
      setReason("");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update status");
    },
  });

  if (isLoading) {
    return (
      <div className="p-12 text-center text-gray-500 animate-pulse flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#7A1F1F]" />
        <p className="text-sm">Loading devotional vow details...</p>
      </div>
    );
  }

  if (isError || !item) {
    return (
      <div className="p-12 text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-red-500 mx-auto" />
        <h3 className="text-lg font-bold">Sankalp Record Not Found</h3>
        <button
          onClick={() => router.push("/admin/sankalps")}
          className="px-4 py-2 text-xs bg-[#7A1F1F] text-white rounded-lg"
        >
          Back to Sankalps
        </button>
      </div>
    );
  }

  const pct = Math.min(100, Math.round((item.completedCount / item.targetCount) * 100));

  // Estimated completion calculation
  const remaining = Math.max(0, item.targetCount - item.completedCount);
  const daysLeft = item.dailyAverage > 0 ? Math.ceil(remaining / item.dailyAverage) : 0;
  const estimatedDate =
    item.status === "completed"
      ? item.completionDate
        ? new Date(item.completionDate).toLocaleDateString()
        : "Completed"
      : new Date(Date.now() + daysLeft * 24 * 60 * 60 * 1000).toLocaleDateString();

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/sankalps"
          className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-[#7A1F1F]"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Sankalps
        </Link>

        {/* Read-only Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 rounded-full text-xs font-semibold border border-amber-200 dark:border-amber-800">
          <Lock className="w-3.5 h-3.5 text-amber-600" />
          <span>Devotional progress cannot be edited</span>
        </div>
      </div>

      {/* Header Banner */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="text-4xl p-3 bg-[#FDFBF7] dark:bg-gray-700 rounded-2xl border border-gray-200 dark:border-gray-600 shadow-inner">
            {item.naam?.icon || "🙏"}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold font-devanagari text-[#7A1F1F] dark:text-[#F59E0B]">
                {item.naam?.name_hindi}
              </h1>
              <span className="text-xl font-semibold text-gray-700 dark:text-gray-200">
                ({item.naam?.name})
              </span>
              <span
                className={`inline-flex px-3 py-1 text-xs rounded-full font-bold ${
                  item.status === "completed"
                    ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
                    : item.status === "active"
                    ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                    : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                }`}
              >
                {item.status.toUpperCase()}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Devotee:{" "}
              <Link
                href={`/admin/users/${item.userId}`}
                className="font-semibold text-[#7A1F1F] dark:text-[#F59E0B] underline"
              >
                {item.user?.name || `Devotee #${item.userId}`}
              </Link>{" "}
              • Vow #{item.id}
            </p>
          </div>
        </div>

        {/* Pause/Resume Action */}
        {item.status !== "completed" && (
          <button
            onClick={() => {
              setReason(item.pauseReason || "");
              setIsPauseDialogOpen(true);
            }}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold shadow transition-colors ${
              item.status === "active"
                ? "bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300"
                : "bg-green-600 hover:bg-green-700 text-white"
            }`}
          >
            {item.status === "active" ? (
              <>
                <Pause className="w-4 h-4" /> Pause Sankalp
              </>
            ) : (
              <>
                <Play className="w-4 h-4" /> Resume Sankalp
              </>
            )}
          </button>
        )}
      </div>

      {/* Grid: Progress & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Overview Card */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-6">
          <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#F59E0B]" /> Progress & Velocity
          </h3>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-mono font-bold text-lg text-gray-900 dark:text-white">
                {item.completedCount.toLocaleString("en-IN")}{" "}
                <span className="text-xs font-normal text-gray-500">
                  / {item.targetCount.toLocaleString("en-IN")} Naams
                </span>
              </span>
              <span className="text-xl font-extrabold text-[#7A1F1F] dark:text-[#F59E0B]">
                {pct}%
              </span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-700 h-3 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#7A1F1F] to-[#F59E0B] h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}
              ></div>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            <div className="p-3 bg-[#FDFBF7] dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700">
              <p className="text-xs text-gray-500 font-medium">Daily Average</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                {item.dailyAverage}{" "}
                <span className="text-[10px] font-normal text-gray-400">/ day</span>
              </p>
            </div>

            <div className="p-3 bg-[#FDFBF7] dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700">
              <p className="text-xs text-gray-500 font-medium">Current Streak</p>
              <p className="text-lg font-bold text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                <Flame className="w-4 h-4 fill-amber-500" /> {item.currentStreak} d
              </p>
            </div>

            <div className="p-3 bg-[#FDFBF7] dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700">
              <p className="text-xs text-gray-500 font-medium">Longest Streak</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                {item.longestStreak} days
              </p>
            </div>

            <div className="p-3 bg-[#FDFBF7] dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700">
              <p className="text-xs text-gray-500 font-medium">Estimated End</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">
                {estimatedDate}
              </p>
            </div>
          </div>

          {/* 60-Day Calendar Grid */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-gray-400" /> 60-Day Devotional Activity Grid
              </h4>
              <div className="flex items-center gap-3 text-[11px] text-gray-500">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-green-500"></span> Completed (≥108)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-[#F59E0B]"></span> Partial (&lt;108)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-gray-200 dark:bg-gray-700"></span> Rest Day
                </span>
              </div>
            </div>

            <div className="grid grid-cols-10 sm:grid-cols-15 gap-1.5 p-3 bg-[#FDFBF7] dark:bg-gray-900/40 rounded-xl border border-gray-200 dark:border-gray-700">
              {item.calendar?.map((day, idx) => {
                let bg = "bg-gray-200 dark:bg-gray-700";
                if (day.count >= 108) bg = "bg-green-500 hover:bg-green-600";
                else if (day.count > 0) bg = "bg-[#F59E0B] hover:bg-amber-600";

                return (
                  <div
                    key={idx}
                    title={`${day.date}: ${day.count} written (Target: 108)`}
                    className={`h-4 rounded-sm transition-transform hover:scale-125 cursor-pointer ${bg}`}
                  ></div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Details & Milestones Column */}
        <div className="space-y-6">
          {/* Details Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-4">
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" /> Devotee Intention
            </h3>

            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-gray-400">Recipient</p>
                <p className="font-semibold text-gray-800 dark:text-gray-200">
                  {item.recipientName} ({item.recipientType})
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-400">Sacred Intention</p>
                <p className="italic text-gray-700 dark:text-gray-300 bg-[#FDFBF7] dark:bg-gray-900/40 p-3 rounded-lg border border-amber-100 dark:border-gray-700">
                  &ldquo;{item.intention}&rdquo;
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-400">Selected Cover Design</p>
                <p className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                  <Palette className="w-4 h-4 text-purple-500" />
                  {item.design?.name || "Golden Peetambar"}
                </p>
                <p className="text-xs text-gray-500">{item.design?.theme}</p>
              </div>

              <div>
                <p className="text-xs text-gray-400">Started Date</p>
                <p className="font-medium">{new Date(item.startDate).toLocaleDateString()}</p>
              </div>

              {item.pauseReason && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-lg border border-amber-200 dark:border-amber-800 text-xs">
                  <p className="font-bold text-amber-900 dark:text-amber-300">Pause Reason:</p>
                  <p className="text-amber-800 dark:text-amber-400 mt-0.5">{item.pauseReason}</p>
                </div>
              )}
            </div>
          </div>

          {/* Milestones Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-4">
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" /> Sacred Milestones
            </h3>

            <div className="space-y-2">
              {MILESTONES.map((m) => {
                const reached = item.completedCount >= m.target;
                const isTarget = item.targetCount === m.target;

                return (
                  <div
                    key={m.target}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition-colors ${
                      reached
                        ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300"
                        : "bg-gray-50 dark:bg-gray-900/30 border-gray-200 dark:border-gray-700 text-gray-400"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle
                        className={`w-4 h-4 ${
                          reached ? "text-green-600" : "text-gray-300 dark:text-gray-600"
                        }`}
                      />
                      <span>{m.label} Naams</span>
                    </div>
                    {isTarget && (
                      <span className="px-2 py-0.5 rounded bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 text-[10px] font-bold">
                        VOW TARGET
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Pause/Resume Reason Modal */}
      {isPauseDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
            <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {item.status === "active" ? "Pause Devotional Vow" : "Resume Devotional Vow"}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              State the administrative reason for{" "}
              {item.status === "active" ? "pausing" : "resuming"} this vow.
            </p>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Devotee requested 2-week hold due to illness."
                className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A1F1F]"
              ></textarea>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsPauseDialogOpen(false);
                  setReason("");
                }}
                className="px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!reason.trim() || toggleStatusMutation.isPending}
                onClick={() =>
                  toggleStatusMutation.mutate({
                    newStatus: item.status === "active" ? "paused" : "active",
                    pauseReason: reason.trim(),
                  })
                }
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#7A1F1F] hover:bg-[#631818] rounded-lg shadow disabled:opacity-50"
              >
                {toggleStatusMutation.isPending && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                )}
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
