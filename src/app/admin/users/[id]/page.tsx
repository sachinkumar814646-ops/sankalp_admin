"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, User, Phone, Mail, MapPin, Globe, BookOpen, ShoppingBag, Calendar } from "lucide-react";
import { User as UserType } from "@/types";

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { data: user, isLoading, isError } = useQuery<UserType>({
    queryKey: ["user", id],
    queryFn: async () => {
      const res = await fetch(`/api/admin/users/${id}`);
      if (!res.ok) throw new Error("User not found");
      return res.json();
    },
    enabled: !!id,
  });

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500 animate-pulse">Loading user profile...</div>;
  }

  if (isError || !user) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-red-500 font-semibold">User not found</p>
        <button
          onClick={() => router.push("/admin/users")}
          className="px-4 py-2 text-xs bg-[#7A1F1F] text-white rounded-lg"
        >
          Back to Users
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <button
        onClick={() => router.push("/admin/users")}
        className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-[#7A1F1F]"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Users
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{user.name}</h1>
            <p className="text-xs text-gray-500 font-mono">User ID: #{user.id}</p>
          </div>
          <span
            className={`px-3 py-1 text-xs rounded-full font-semibold ${
              user.status === "active"
                ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
                : "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300"
            }`}
          >
            {user.status}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p className="text-sm font-medium">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Phone</p>
              <p className="text-sm font-medium">{user.phone}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">City</p>
              <p className="text-sm font-medium">{user.city}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Language</p>
              <p className="text-sm font-medium">{user.language}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-[#7A1F1F] dark:text-[#F59E0B]" />
            <div>
              <p className="text-xs text-gray-500">Sankalp Count</p>
              <p className="text-sm font-bold text-[#7A1F1F] dark:text-[#F59E0B]">{user.sankalpCount}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-amber-600" />
            <div>
              <p className="text-xs text-gray-500">Total Orders</p>
              <p className="text-sm font-bold">{user.orderCount}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
