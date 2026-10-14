"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Tag,
  BookOpen,
  Palette,
  BookMarked,
  Package,
  ShoppingCart,
  CreditCard,
  LogOut,
  Menu,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { useTheme } from "next-themes";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();

  // Desktop collapse state (persisted in localStorage)
  const [isCollapsed, setIsCollapsed] = useState(false);
  // Mobile drawer state
  const [mobileOpen, setMobileOpen] = useState(false);
  // Mounted state to safely handle hydration for theme and local storage
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("admin_sidebar_collapsed");
    if (saved !== null) {
      setIsCollapsed(saved === "true");
    }
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("admin_sidebar_collapsed", String(next));
      return next;
    });
  };

  // Close mobile drawer on route navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const menu = [
    { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Users", path: "/admin/users", icon: Users },
    { name: "Naam", path: "/admin/naam", icon: Tag },
    { name: "Sankalps", path: "/admin/sankalps", icon: BookOpen },
    { name: "Designs", path: "/admin/designs", icon: Palette },
    { name: "Personalization", path: "/admin/personalization", icon: BookMarked },
    { name: "Products", path: "/admin/products", icon: Package },
    { name: "Orders", path: "/admin/orders", icon: ShoppingCart },
    { name: "Payments", path: "/admin/payments", icon: CreditCard },
  ];

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    router.push("/login");
  };

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <TooltipProvider delayDuration={150}>
      <div className="flex h-screen overflow-hidden bg-[#FDFBF7] dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans">
        {/* Mobile Backdrop Overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden transition-opacity"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Desktop & Mobile Sidebar */}
        <aside
          aria-label="Main Navigation"
          className={`
            fixed inset-y-0 left-0 z-50 flex flex-col bg-[#7A1F1F] dark:bg-[#4A0E0E] text-white
            transition-all duration-300 ease-in-out shadow-xl lg:shadow-none
            lg:static lg:translate-x-0
            ${mobileOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0"}
            ${isCollapsed ? "lg:w-20" : "lg:w-64"}
          `}
        >
          {/* Header */}
          <div className="flex h-16 items-center justify-between px-4 border-b border-white/15 shrink-0">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-[#F59E0B] flex items-center justify-center font-bold text-[#7A1F1F] shrink-0 text-base shadow">
                NV
              </div>
              <span
                className={`font-bold text-lg font-devanagari tracking-wide whitespace-nowrap transition-opacity duration-200 ${isCollapsed ? "lg:opacity-0 lg:hidden" : "opacity-100"
                  }`}
              >
                NaamVriddhi
              </span>
            </div>

            {/* Mobile close button */}
            <button
              type="button"
              className="lg:hidden p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors focus:outline-none"
              onClick={() => setMobileOpen(false)}
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Desktop collapse toggle button */}
            <button
              type="button"
              className={`hidden lg:flex p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors focus:outline-none ${isCollapsed ? "mx-auto" : ""
                }`}
              onClick={toggleCollapse}
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? (
                <ChevronRight className="w-5 h-5" />
              ) : (
                <ChevronLeft className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
            {menu.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.path);

              const navLink = (
                <Link
                  key={item.name}
                  href={item.path}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                    ${isActive
                      ? "bg-[#F59E0B] text-[#7A1F1F] font-bold shadow-sm"
                      : "text-white/85 hover:bg-white/10 hover:text-white"
                    }
                    ${isCollapsed ? "lg:justify-center lg:px-2" : ""}
                  `}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span
                    className={`whitespace-nowrap transition-opacity duration-200 ${isCollapsed ? "lg:hidden" : "inline"
                      }`}
                  >
                    {item.name}
                  </span>
                </Link>
              );

              if (isCollapsed) {
                return (
                  <div key={item.name} className="relative group">
                    <Tooltip>
                      <TooltipTrigger asChild>{navLink}</TooltipTrigger>
                      <TooltipContent side="right" className="hidden lg:block font-medium">
                        {item.name}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                );
              }

              return navLink;
            })}
          </nav>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Topbar / Header */}
          <header className="h-16 flex items-center justify-between px-4 sm:px-6 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shrink-0 shadow-xs z-10 transition-colors">
            <div className="flex items-center gap-3">
              {/* Mobile menu trigger */}
              <button
                type="button"
                className="lg:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none"
                onClick={() => setMobileOpen(true)}
                aria-label="Open sidebar"
              >
                <Menu className="w-5 h-5" />
              </button>

              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 hidden sm:block">
                Admin Portal
              </h2>
            </div>

            {/* Actions: Theme Toggle & Logout */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none"
                onClick={() => setTheme(isDark ? "light" : "dark")}
                aria-label="Toggle color theme"
                title={isDark ? "Switch to light mode" : "Switch to dark mode"}
              >
                {isDark ? (
                  <Sun className="w-5 h-5 text-amber-400 hover:text-amber-300 transition-colors" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-600 hover:text-gray-900 transition-colors" />
                )}
              </button>

              <button
                type="button"
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-[#7A1F1F] dark:text-amber-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors focus:outline-none"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </header>

          {/* Page Contents */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#FDFBF7] dark:bg-gray-950 transition-colors">
            {children}
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
