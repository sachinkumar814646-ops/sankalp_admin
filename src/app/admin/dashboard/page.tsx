"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  BookOpen,
  ShoppingBag,
  CreditCard,
  Tag,
  Palette,
  ArrowUpRight,
  TrendingUp,
  Clock,
  CheckCircle2,
} from "lucide-react";

export default function DashboardPage() {
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["dashboardUsers"],
    queryFn: async () => {
      const res = await fetch("/api/admin/users?limit=5");
      if (!res.ok) return { total: 0, data: [] };
      return res.json();
    },
  });

  const { data: sankalpsData, isLoading: sankalpsLoading } = useQuery({
    queryKey: ["dashboardSankalps"],
    queryFn: async () => {
      const res = await fetch("/api/admin/sankalps?limit=5");
      if (!res.ok) return { total: 0, data: [] };
      return res.json();
    },
  });

  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ["dashboardOrders"],
    queryFn: async () => {
      const res = await fetch("/api/admin/orders?limit=5");
      if (!res.ok) return { total: 0, data: [] };
      return res.json();
    },
  });

  const { data: paymentsData, isLoading: paymentsLoading } = useQuery({
    queryKey: ["dashboardPayments"],
    queryFn: async () => {
      const res = await fetch("/api/admin/payments?limit=5");
      if (!res.ok) return { total: 0, data: [] };
      return res.json();
    },
  });

  const stats = [
    {
      title: "Total Devotees",
      value: usersLoading ? "..." : usersData?.total ?? 0,
      icon: Users,
      href: "/admin/users",
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800",
    },
    {
      title: "Active Sankalps",
      value: sankalpsLoading ? "..." : sankalpsData?.total ?? 0,
      icon: BookOpen,
      href: "/admin/sankalps",
      color: "text-[#7A1F1F] dark:text-[#F59E0B]",
      bg: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800",
    },
    {
      title: "Total Orders",
      value: ordersLoading ? "..." : ordersData?.total ?? 0,
      icon: ShoppingBag,
      href: "/admin/orders",
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800",
    },
    {
      title: "Total Payments",
      value: paymentsLoading ? "..." : paymentsData?.total ?? 0,
      icon: CreditCard,
      href: "/admin/payments",
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800",
    },
  ];

  const quickLinks = [
    { name: "Manage Naam Library", href: "/admin/naam", icon: Tag },
    { name: "Design Templates", href: "/admin/designs", icon: Palette },
    { name: "Personalization Approvals", href: "/admin/personalization", icon: BookOpen },
    { name: "Product Catalog", href: "/admin/products", icon: ShoppingBag },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 font-devanagari">
          Dashboard Overview
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Welcome to the NaamVriddhi Admin Console. Monitor devotees, sankalps, and book orders.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.title}
              href={stat.href}
              className={`p-5 rounded-2xl border ${stat.bg} shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 group`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                  {stat.title}
                </span>
                <div className={`p-2.5 rounded-xl bg-white dark:bg-gray-800 shadow-xs ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <div className="text-3xl font-extrabold text-gray-900 dark:text-white font-mono">
                  {stat.value}
                </div>
                <span className="inline-flex items-center text-xs font-medium text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100">
                  View <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Navigation & Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Links */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#7A1F1F] dark:text-[#F59E0B]" /> Quick Actions
          </h2>
          <div className="grid grid-cols-1 gap-2.5">
            {quickLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-gray-700/60 bg-gray-50/50 dark:bg-gray-900/40 hover:bg-[#FDFBF7] dark:hover:bg-gray-700/50 hover:border-amber-200 dark:hover:border-amber-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white dark:bg-gray-800 text-[#7A1F1F] dark:text-[#F59E0B] shadow-xs">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {item.name}
                    </span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-gray-400" />
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Devotees */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#7A1F1F] dark:text-[#F59E0B]" /> Recent Devotees
            </h2>
            <Link
              href="/admin/users"
              className="text-xs font-semibold text-[#7A1F1F] dark:text-[#F59E0B] hover:underline"
            >
              View All
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                <tr>
                  <th className="pb-2">Name</th>
                  <th className="pb-2">City</th>
                  <th className="pb-2 text-center">Sankalps</th>
                  <th className="pb-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
                {usersLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="py-3">
                        <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded mb-1" />
                        <div className="h-3 w-36 bg-gray-200 dark:bg-gray-700 rounded" />
                      </td>
                      <td className="py-3">
                        <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                      </td>
                      <td className="py-3 text-center">
                        <div className="h-4 w-8 bg-gray-200 dark:bg-gray-700 rounded mx-auto" />
                      </td>
                      <td className="py-3 text-center">
                        <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto" />
                      </td>
                    </tr>
                  ))
                ) : usersData?.data && usersData.data.length > 0 ? (
                  usersData.data.slice(0, 4).map((u: any) => (
                    <tr key={u.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30">
                      <td className="py-2.5">
                        <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                          {u.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                          {u.email}
                        </div>
                      </td>
                      <td className="py-2.5 text-xs text-gray-600 dark:text-gray-300">
                        {u.city || "—"}
                      </td>
                      <td className="py-2.5 text-center text-xs font-semibold text-[#7A1F1F] dark:text-[#F59E0B]">
                        {u.sankalpCount ?? 0}
                      </td>
                      <td className="py-2.5 text-center">
                        <span
                          className={`inline-flex px-2 py-0.5 text-xs rounded-full font-medium ${
                            u.status === "active"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
                              : "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300"
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-xs text-gray-500">
                      No recent devotee records available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
