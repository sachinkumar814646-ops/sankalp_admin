"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  BookMarked,
  Eye,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  FileCheck,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Personalization } from "@/types";

export default function PersonalizationPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [approvalStatus, setApprovalStatus] = useState("all");
  const [language, setLanguage] = useState("all");
  const [edition, setEdition] = useState("all");
  const [bookSize, setBookSize] = useState("all");

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  const { data, isLoading, isError, refetch } = useQuery<{
    data: Personalization[];
    total: number;
    page: number;
    limit: number;
  }>({
    queryKey: [
      "personalizationsList",
      page,
      limit,
      debouncedSearch,
      approvalStatus,
      language,
      edition,
      bookSize,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search: debouncedSearch,
        approvalStatus,
        language,
        edition,
        bookSize,
      });
      const res = await fetch(`/api/admin/personalizations?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch personalization orders");
      return res.json();
    },
  });

  const totalPages = data ? Math.ceil(data.total / limit) : 1;
  const startRow = data?.total ? (page - 1) * limit + 1 : 0;
  const endRow = data?.total ? Math.min(page * limit, data.total) : 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <BookMarked className="w-6 h-6 text-[#7A1F1F] dark:text-[#F59E0B]" />
          Personalization & Book Customization
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Review sacred Naam Pustika dedications, front covers, approval workflows, and print-ready proofs.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="relative w-full lg:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search Order #, recipient, from..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A1F1F]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Status */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-500 font-medium">Status:</span>
            <select
              value={approvalStatus}
              onChange={(e) => {
                setApprovalStatus(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1.5 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="changes_requested">Changes Requested</option>
            </select>
          </div>

          {/* Language */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-500 font-medium">Lang:</span>
            <select
              value={language}
              onChange={(e) => {
                setLanguage(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1.5 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg"
            >
              <option value="all">All</option>
              <option value="Hindi">Hindi</option>
              <option value="English">English</option>
            </select>
          </div>

          {/* Edition */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-500 font-medium">Edition:</span>
            <select
              value={edition}
              onChange={(e) => {
                setEdition(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1.5 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg"
            >
              <option value="all">All</option>
              <option value="Standard">Standard</option>
              <option value="Premium Gift">Premium Gift</option>
            </select>
          </div>

          {/* Size */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-500 font-medium">Size:</span>
            <select
              value={bookSize}
              onChange={(e) => {
                setBookSize(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1.5 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg"
            >
              <option value="all">All</option>
              <option value="A5">A5</option>
              <option value="A4 Large Print">A4 Large Print</option>
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
                <th className="px-4 py-3 font-mono">Order No</th>
                <th className="px-4 py-3">Naam</th>
                <th className="px-4 py-3">Recipient</th>
                <th className="px-4 py-3">From</th>
                <th className="px-4 py-3 min-w-[200px]">Dedication</th>
                <th className="px-4 py-3">Size & Binding</th>
                <th className="px-4 py-3">Edition</th>
                <th className="px-4 py-3 text-center">Pages</th>
                <th className="px-4 py-3 text-center">Approval</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-4">
                      <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="h-4 w-8 bg-gray-200 dark:bg-gray-700 rounded mx-auto"></div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto"></div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="h-7 w-16 bg-gray-200 dark:bg-gray-700 rounded ml-auto"></div>
                    </td>
                  </tr>
                ))
              ) : isError ? (
                <tr>
                  <td colSpan={11} className="px-4 py-12 text-center text-red-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertTriangle className="w-8 h-8 text-red-500" />
                      <p className="font-semibold">Failed to load personalizations</p>
                      <button
                        onClick={() => refetch()}
                        className="mt-2 px-3 py-1.5 text-xs bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-md font-medium"
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
                    {/* Order No */}
                    <td className="px-4 py-3 font-mono font-bold text-[#7A1F1F] dark:text-[#F59E0B]">
                      {item.orderNumber}
                    </td>

                    {/* Naam */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span>{item.naam?.icon || "🙏"}</span>
                        <div>
                          <p className="font-semibold">{item.naam?.name}</p>
                          <p className="text-xs font-devanagari text-gray-500">
                            {item.naam?.name_hindi}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Recipient */}
                    <td className="px-4 py-3">
                      <p className="font-semibold">{item.recipientName}</p>
                      <span className="inline-flex px-1.5 py-0.2 rounded text-[10px] bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        {item.recipientRelation}
                      </span>
                    </td>

                    {/* From */}
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300 font-medium">
                      {item.fromName}
                    </td>

                    {/* Dedication */}
                    <td className="px-4 py-3">
                      <p className="text-xs text-gray-600 dark:text-gray-300 font-devanagari line-clamp-2 max-w-xs">
                        {item.dedication}
                      </p>
                    </td>

                    {/* Size & Binding */}
                    <td className="px-4 py-3 text-xs">
                      <p className="font-medium text-gray-900 dark:text-gray-100">{item.bookSize}</p>
                      <p className="text-gray-400">{item.binding} Bind</p>
                    </td>

                    {/* Edition */}
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${
                          item.edition === "Premium Gift"
                            ? "bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {item.edition}
                      </span>
                    </td>

                    {/* Pages */}
                    <td className="px-4 py-3 text-center font-mono font-medium">
                      {item.pages}
                    </td>

                    {/* Approval Status */}
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          item.approvalStatus === "approved"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
                            : item.approvalStatus === "changes_requested"
                            ? "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {item.approvalStatus === "approved" && <FileCheck className="w-3 h-3" />}
                        {item.approvalStatus === "changes_requested" && <AlertCircle className="w-3 h-3" />}
                        {item.approvalStatus === "pending" && <Clock className="w-3 h-3" />}
                        {item.approvalStatus === "changes_requested"
                          ? "Changes Req"
                          : item.approvalStatus}
                      </span>
                    </td>

                    {/* Created */}
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/personalization/${item.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#7A1F1F] hover:bg-[#631818] text-white text-xs font-semibold shadow transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> Review
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={11} className="px-4 py-12 text-center text-gray-500">
                    <p className="font-semibold text-base">No personalization orders found</p>
                    <p className="text-xs text-gray-400 mt-1">Try adjusting search or status filters.</p>
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
    </div>
  );
}
