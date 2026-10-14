"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Flame,
  Search,
  Eye,
  Pause,
  Play,
  ArrowUpDown,
  AlertTriangle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  Clock,
  BookOpen,
} from "lucide-react";
import { Sankalp } from "@/types";

interface StatsData {
  total: number;
  active: number;
  completed: number;
  paused: number;
  totalNaamWritten: number;
  avgCompletionPercent: number;
}

export default function SankalpsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [naamFilter, setNaamFilter] = useState("all");
  const [targetFilter, setTargetFilter] = useState("all");
  const [sortBy, setSortBy] = useState("startDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Pause/Resume Modal
  const [actionSankalp, setActionSankalp] = useState<Sankalp | null>(null);
  const [reason, setReason] = useState("");

  // Debounce search
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch Stats
  const { data: stats } = useQuery<StatsData>({
    queryKey: ["sankalpsStats"],
    queryFn: async () => {
      const res = await fetch("/api/admin/sankalps/stats");
      if (!res.ok) throw new Error("Failed to fetch statistics");
      return res.json();
    },
  });

  // Fetch Naam list for dropdown
  const { data: naamData } = useQuery({
    queryKey: ["naamDropdown"],
    queryFn: async () => {
      const res = await fetch("/api/admin/naam?limit=50");
      if (!res.ok) return { data: [] };
      return res.json();
    },
  });

  // Fetch Sankalps
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [
      "sankalpsList",
      page,
      limit,
      debouncedSearch,
      statusFilter,
      naamFilter,
      targetFilter,
      sortBy,
      sortOrder,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search: debouncedSearch,
        status: statusFilter,
        naamId: naamFilter,
        targetCount: targetFilter,
        sort: sortBy,
        order: sortOrder,
      });
      const res = await fetch(`/api/admin/sankalps?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch Sankalps");
      return res.json() as Promise<{
        data: Sankalp[];
        total: number;
        page: number;
        limit: number;
      }>;
    },
  });

  // Pause / Resume Mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async ({
      id,
      newStatus,
      pauseReason,
    }: {
      id: number;
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
        actionSankalp?.status === "active"
          ? "Sankalp paused successfully"
          : "Sankalp resumed successfully"
      );
      queryClient.invalidateQueries({ queryKey: ["sankalpsList"] });
      queryClient.invalidateQueries({ queryKey: ["sankalpsStats"] });
      setActionSankalp(null);
      setReason("");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update status");
    },
  });

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
    setPage(1);
  };

  const totalPages = data ? Math.ceil(data.total / limit) : 1;
  const startRow = data?.total ? (page - 1) * limit + 1 : 0;
  const endRow = data?.total ? Math.min(page * limit, data.total) : 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-[#7A1F1F] dark:text-[#F59E0B]" /> Sankalp Monitoring
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Monitor sacred writing vows, devotee intentions, writing streaks, and milestones.
        </p>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Active Sankalps</p>
            <p className="text-2xl font-bold text-[#7A1F1F] dark:text-[#F59E0B] mt-1">
              {stats?.active ?? 0}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">Total vows in progress</p>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl text-amber-600">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Completed</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
              {stats?.completed ?? 0}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">Fully written & fulfilled</p>
          </div>
          <div className="p-3 bg-green-50 dark:bg-green-950/40 rounded-xl text-green-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Paused</p>
            <p className="text-2xl font-bold text-gray-700 dark:text-gray-300 mt-1">
              {stats?.paused ?? 0}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">Temporarily on hold</p>
          </div>
          <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-xl text-gray-600 dark:text-gray-300">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Naam Written</p>
            <p className="text-2xl font-bold text-[#7A1F1F] dark:text-[#F59E0B] mt-1">
              {stats ? stats.totalNaamWritten.toLocaleString("en-IN") : 0}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">Avg {stats?.avgCompletionPercent ?? 0}% fulfilled</p>
          </div>
          <div className="p-3 bg-red-50 dark:bg-red-950/40 rounded-xl text-[#7A1F1F] dark:text-red-400">
            <Flame className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="relative w-full lg:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search devotee, recipient, or Naam..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A1F1F]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A1F1F]"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="paused">Paused</option>
            </select>
          </div>

          {/* Naam Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">Naam:</span>
            <select
              value={naamFilter}
              onChange={(e) => {
                setNaamFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A1F1F]"
            >
              <option value="all">All Naam</option>
              {naamData?.data?.map((n: any) => (
                <option key={n.id} value={n.id}>
                  {n.icon} {n.name} ({n.name_hindi})
                </option>
              ))}
            </select>
          </div>

          {/* Target Count Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">Target:</span>
            <select
              value={targetFilter}
              onChange={(e) => {
                setTargetFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A1F1F]"
            >
              <option value="all">All Targets</option>
              <option value="1008">1,008</option>
              <option value="5000">5,000</option>
              <option value="11000">11,000</option>
              <option value="21000">21,000</option>
              <option value="51000">51,000</option>
              <option value="100000">1,00,000</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-700 dark:text-gray-200">
            <thead className="bg-[#FDFBF7] dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 text-xs uppercase font-semibold text-gray-600 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3">Devotee</th>
                <th className="px-4 py-3">Naam</th>
                <th className="px-4 py-3">Recipient</th>
                <th className="px-4 py-3 text-right">Target</th>
                <th
                  onClick={() => handleSort("progress")}
                  className="px-4 py-3 cursor-pointer hover:text-[#7A1F1F] select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>Progress</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("streak")}
                  className="px-4 py-3 text-center cursor-pointer hover:text-[#7A1F1F] select-none"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Streak</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                  </div>
                </th>
                <th className="px-4 py-3 text-center">Status</th>
                <th
                  onClick={() => handleSort("startDate")}
                  className="px-4 py-3 cursor-pointer hover:text-[#7A1F1F] select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>Started</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                  </div>
                </th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-4">
                      <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
                      <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded ml-auto"></div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-3 w-36 bg-gray-200 dark:bg-gray-700 rounded-full mb-1"></div>
                      <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="h-4 w-10 bg-gray-200 dark:bg-gray-700 rounded mx-auto"></div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto"></div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="h-7 w-20 bg-gray-200 dark:bg-gray-700 rounded ml-auto"></div>
                    </td>
                  </tr>
                ))
              ) : isError ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-red-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertTriangle className="w-8 h-8 text-red-500" />
                      <p className="font-semibold">Failed to load Sankalps</p>
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
                data.data.map((item) => {
                  const pct = Math.min(
                    100,
                    Math.round((item.completedCount / item.targetCount) * 100)
                  );
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-[#FDFBF7]/60 dark:hover:bg-gray-700/40 transition-colors"
                    >
                      {/* User */}
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/users/${item.userId}`}
                          className="font-semibold text-gray-900 dark:text-gray-100 hover:text-[#7A1F1F] dark:hover:text-[#F59E0B]"
                        >
                          {item.user?.name || `Devotee #${item.userId}`}
                        </Link>
                        <div className="text-xs text-gray-500">
                          {item.user?.city || "Devotee"}
                        </div>
                      </td>

                      {/* Naam */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{item.naam?.icon || "🙏"}</span>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-gray-100">
                              {item.naam?.name || "Naam"}
                            </p>
                            <p className="text-xs font-devanagari font-bold text-[#7A1F1F] dark:text-[#F59E0B]">
                              {item.naam?.name_hindi || ""}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Recipient */}
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800 dark:text-gray-200">
                          {item.recipientName}
                        </p>
                        <span className="inline-flex px-1.5 py-0.2 text-[10px] rounded bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          {item.recipientType}
                        </span>
                      </td>

                      {/* Target */}
                      <td className="px-4 py-3 text-right font-mono font-semibold">
                        {item.targetCount.toLocaleString("en-IN")}
                      </td>

                      {/* Progress */}
                      <td className="px-4 py-3 min-w-[180px]">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-mono font-medium text-gray-700 dark:text-gray-300">
                              {item.completedCount.toLocaleString("en-IN")} /{" "}
                              {item.targetCount.toLocaleString("en-IN")}
                            </span>
                            <span className="font-bold text-[#7A1F1F] dark:text-[#F59E0B]">
                              {pct}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-[#7A1F1F] dark:bg-[#F59E0B] h-full rounded-full transition-all duration-300"
                              style={{ width: `${pct}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>

                      {/* Streak */}
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400">
                          <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
                          {item.currentStreak}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex px-2 py-0.5 text-xs rounded-full font-semibold ${
                            item.status === "completed"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
                              : item.status === "active"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                              : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>

                      {/* Started */}
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                        {new Date(item.startDate).toLocaleDateString()}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/admin/sankalps/${item.id}`}
                            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 hover:text-[#7A1F1F]"
                            title="View Sankalp Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          {item.status !== "completed" && (
                            <button
                              onClick={() => {
                                setActionSankalp(item);
                                setReason(item.pauseReason || "");
                              }}
                              className={`p-1.5 rounded transition-colors ${
                                item.status === "active"
                                  ? "hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-700 hover:text-amber-800"
                                  : "hover:bg-green-50 dark:hover:bg-green-950/40 text-green-700 hover:text-green-800"
                              }`}
                              title={item.status === "active" ? "Pause" : "Resume"}
                            >
                              {item.status === "active" ? (
                                <Pause className="w-4 h-4" />
                              ) : (
                                <Play className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-gray-500">
                    <p className="font-medium text-base">No Sankalps found</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Try adjusting filters or search query.
                    </p>
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

      {/* Pause / Resume Reason Dialog */}
      {actionSankalp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
            <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {actionSankalp.status === "active" ? "Pause Sankalp" : "Resume Sankalp"}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Please state the administrative reason for{" "}
              {actionSankalp.status === "active" ? "pausing" : "resuming"} devotee vow #
              {actionSankalp.id} ({actionSankalp.user?.name || "Devotee"}).
            </p>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Paused per devotee email request due to pilgrimage travel."
                className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A1F1F]"
              ></textarea>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setActionSankalp(null);
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
                    id: actionSankalp.id,
                    newStatus: actionSankalp.status === "active" ? "paused" : "active",
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
