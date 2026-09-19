"use client";

import React, { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Globe2,
  Users,
  FileText,
  Sliders,
  LogOut,
  ChevronRight,
  RefreshCw,
  Loader2,
  Laptop,
  ShieldAlert,
  Lock,
  Menu,
  X,
  LayoutDashboard,
  Server,
  Zap,
  Activity,
  Sparkles,
} from "lucide-react";
import { AdminProvider, useAdmin } from "./AdminContext";

function AdminLayoutContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    adminUser,
    stats,
    loading,
    fetchAdminData,
    fetchUsers,
    fetchAuditLogs,
    sessionReplacedModalOpen,
  } = useAdmin();

  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (loading && !adminUser) {
    return (
      <div className="min-h-screen bg-[#070b14] flex flex-col items-center justify-center text-slate-100">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-[#0c1222] border border-indigo-500/30 flex items-center justify-center p-2 shadow-2xl shadow-indigo-500/20">
            <ShieldCheck className="w-9 h-9 text-indigo-400 animate-pulse" />
          </div>
          <Loader2 className="w-24 h-24 text-indigo-400/40 animate-spin absolute -top-4 -left-4 pointer-events-none" />
        </div>
        <p className="text-sm text-slate-400 font-medium mt-6">Loading root control center...</p>
      </div>
    );
  }

  const isOverview = pathname === "/admin";
  const isRequests = pathname === "/admin/requests";
  const isUsers = pathname === "/admin/users";
  const isAudit = pathname === "/admin/audit";
  const isSettings = pathname === "/admin/settings";

  const getPageTitle = () => {
    if (isRequests) return "Subdomain Requests & Reviews";
    if (isUsers) return "User & Developer Management";
    if (isAudit) return "Audit & Security Logs";
    if (isSettings) return "DNS Zone & System Settings";
    return "Command Center & Overview";
  };

  const handleConfirmLogout = async () => {
    setLogoutLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Admin Logout Error:", err);
    } finally {
      setLogoutLoading(false);
      setLogoutModalOpen(false);
    }
  };

  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([fetchAdminData(), fetchUsers(), fetchAuditLogs()]);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const navGroups = [
    {
      groupTitle: "PLATFORM CONTROLS",
      items: [
        {
          label: "Overview & Telemetry",
          href: "/admin",
          icon: LayoutDashboard,
          active: isOverview,
          badge: <span className="text-[10px] font-mono text-emerald-400 font-semibold">Live</span>,
        },
        {
          label: "Subdomain Requests",
          href: "/admin/requests",
          icon: Globe2,
          active: isRequests,
          badge:
            stats.pending > 0 ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/25 text-amber-300 border border-amber-500/40 animate-pulse">
                {stats.pending}
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-800/80 text-slate-400 font-medium">
                {stats.total}
              </span>
            ),
        },
        {
          label: "User Management",
          href: "/admin/users",
          icon: Users,
          active: isUsers,
          badge: (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-800/80 text-slate-400 font-medium">
              {stats.totalUsers || 0}
            </span>
          ),
        },
      ],
    },
    {
      groupTitle: "SECURITY & SYSTEM",
      items: [
        {
          label: "Audit & Security Logs",
          href: "/admin/audit",
          icon: FileText,
          active: isAudit,
          badge: <span className="text-[10px] font-mono text-purple-400">Stream</span>,
        },
        {
          label: "DNS & System Settings",
          href: "/admin/settings",
          icon: Sliders,
          active: isSettings,
          badge: <span className="text-[10px] font-mono text-cyan-400">GoDaddy</span>,
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col md:flex-row">
      {/* ================= DESKTOP ADMIN SIDEBAR ================= */}
      <aside className="hidden md:flex w-64 lg:w-72 md:h-screen md:sticky md:top-0 bg-[#0a0f1d] border-r border-slate-800/80 backdrop-blur-2xl flex-col justify-between shrink-0 z-30 select-none shadow-2xl">
        <div className="flex flex-col h-full overflow-y-auto custom-scrollbar">
          {/* Brand Header */}
          <div className="p-5 border-b border-slate-800/60">
            <Link href="/admin" className="flex items-center gap-3.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600/30 to-purple-600/20 border border-indigo-500/30 flex items-center justify-center p-2 shadow-lg shadow-indigo-500/10 group-hover:border-indigo-500/60 group-hover:scale-105 transition-all text-indigo-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="overflow-hidden">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-sm lg:text-base tracking-tight text-white group-hover:text-indigo-200 transition">
                    is-a-coder.in
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] text-indigo-300 font-mono font-semibold uppercase tracking-wider">
                    Root Console
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* Navigation Groups */}
          <div className="px-3.5 py-5 space-y-6 flex-1">
            {navGroups.map((group, gIdx) => (
              <div key={gIdx} className="space-y-1.5">
                <div className="px-3 text-[10px] font-bold text-slate-400 font-mono tracking-wider uppercase">
                  {group.groupTitle}
                </div>

                <div className="space-y-1">
                  {group.items.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={idx}
                        href={item.href}
                        className={`relative w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group cursor-pointer ${
                          item.active
                            ? "bg-gradient-to-r from-indigo-500/20 via-indigo-500/10 to-transparent text-white border border-indigo-500/30 shadow-sm"
                            : "text-slate-400 hover:text-white hover:bg-slate-800/40"
                        }`}
                      >
                        {item.active && (
                          <motion.div
                            layoutId="activeAdminNavIndicator"
                            className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-gradient-to-b from-indigo-400 to-cyan-400 rounded-r"
                            transition={{ type: "spring", stiffness: 350, damping: 30 }}
                          />
                        )}

                        <div className="flex items-center gap-3">
                          <Icon
                            className={`w-4 h-4 transition-colors ${
                              item.active ? "text-indigo-400" : "text-slate-400 group-hover:text-slate-200"
                            }`}
                          />
                          <span>{item.label}</span>
                        </div>

                        {item.badge}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar Footer & Admin Identity */}
          <div className="p-3.5 border-t border-slate-800/70 bg-[#070b14]/50 space-y-2.5">
            {/* Anycast DNS Status Pill */}
            <div className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]" />
                <span className="text-slate-400 font-medium">Anycast DNS</span>
              </div>
              <span className="text-emerald-400 font-mono font-semibold">14ms Online</span>
            </div>

            {/* Admin User Card with Sign Out */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 transition">
              <div className="flex items-center gap-2.5 truncate min-w-0 pr-2">
                <div className="relative shrink-0">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-indigo-500/20">
                    {adminUser?.name ? adminUser.name[0].toUpperCase() : "A"}
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#0a0f1d] absolute -bottom-0.5 -right-0.5" />
                </div>
                <div className="truncate">
                  <p className="text-xs font-semibold text-white truncate leading-tight">
                    {adminUser?.name || "Administrator"}
                  </p>
                  <p className="text-[10px] text-indigo-300 font-mono truncate leading-tight">
                    {adminUser?.email}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setLogoutModalOpen(true)}
                title="Sign Out"
                className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* ================= MOBILE HEADER & DRAWER ================= */}
      <div className="md:hidden sticky top-0 z-30 bg-[#0a0f1d] border-b border-slate-800/80 px-4 py-3 flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-sm text-white">is-a-coder.in</span>
            <span className="block text-[9px] text-indigo-400 font-mono">Admin Console</span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefreshAll}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-indigo-400" : ""}`} />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#0a0f1d] border-b border-slate-800/80 px-4 py-4 space-y-4 z-20"
          >
            {navGroups.map((group, gIdx) => (
              <div key={gIdx} className="space-y-1">
                <div className="text-[10px] font-bold text-slate-500 font-mono uppercase">
                  {group.groupTitle}
                </div>
                <div className="space-y-1">
                  {group.items.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={idx}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold ${
                          item.active
                            ? "bg-indigo-600 text-white"
                            : "text-slate-300 hover:bg-slate-800/60"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </div>
                        {item.badge}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                  {adminUser?.name ? adminUser.name[0].toUpperCase() : "A"}
                </div>
                <div className="text-xs">
                  <p className="font-semibold text-white">{adminUser?.name}</p>
                  <p className="text-[10px] text-slate-400 font-mono">{adminUser?.email}</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setLogoutModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-lg bg-rose-600/20 border border-rose-500/30 text-rose-300 text-xs font-medium"
              >
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= MAIN CONTENT AREA ================= */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-800/80 bg-[#070b14]/80 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <span className="text-slate-500">Admin Console</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-white font-semibold">{getPageTitle()}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRefreshAll}
              title="Reload live data"
              disabled={isRefreshing}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition flex items-center gap-2 text-xs font-medium cursor-pointer shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-indigo-400" : ""}`} />
              <span className="hidden sm:inline">{isRefreshing ? "Syncing..." : "Sync Data"}</span>
            </button>
          </div>
        </header>

        {/* Main View */}
        <main className="flex-1 p-5 sm:p-7 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* ================= LOGOUT CONFIRMATION MODAL ================= */}
      <AnimatePresence>
        {logoutModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm rounded-2xl bg-[#0c1222] border border-slate-800 p-6 shadow-2xl space-y-4 text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
                <LogOut className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">Sign Out of Admin Console?</h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  Are you sure you want to end your administrator session?
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setLogoutModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmLogout}
                  disabled={logoutLoading}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-rose-600/20 disabled:opacity-50"
                >
                  {logoutLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Signing Out...</span>
                    </>
                  ) : (
                    <span>Yes, Sign Out</span>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= CONCURRENT SESSION MODAL ================= */}
      <AnimatePresence>
        {sessionReplacedModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
              className="w-full max-w-md rounded-2xl bg-gradient-to-b from-[#141b2d] to-[#0c101c] border border-amber-500/30 p-6 sm:p-7 shadow-2xl shadow-amber-500/10 text-center relative overflow-hidden"
            >
              <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-5 text-amber-400 relative">
                <Laptop className="w-8 h-8 relative z-10" />
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-semibold mb-3">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Security Notice • Single Session Policy</span>
              </div>

              <h2 className="text-xl font-bold text-white tracking-tight">
                Admin Session Active On Another Device
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 mt-2.5 leading-relaxed">
                You have been signed out of this admin session because the account was just signed into from another device.
              </p>

              <div className="mt-6">
                <Link
                  href="/login?reason=session_replaced"
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2 text-center cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5 text-slate-950" />
                  <span>Sign In Again</span>
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AdminProvider>
  );
}
