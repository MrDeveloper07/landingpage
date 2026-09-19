"use client";

import React, { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaviconIcon } from "@/components/ui/Icons";
import {
  Globe2,
  Plus,
  LogOut,
  Shield,
  CheckCircle2,
  BookOpen,
  User,
  LifeBuoy,
  ChevronRight,
  RefreshCw,
  Loader2,
  Sparkles,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  MailCheck,
} from "lucide-react";
import { DashboardProvider, useDashboard } from "./DashboardContext";

function DashboardLayoutContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const {
    user,
    subdomains,
    loading,
    fetchDashboardData,
    setModalOpen,
    setLogoutModalOpen,
  } = useDashboard();

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100">
        <div className="relative">
          <div className="w-14 h-14 rounded-2xl bg-[#0c1222] border border-slate-800 flex items-center justify-center p-2 shadow-2xl shadow-cyan-500/10 animate-pulse">
            <FaviconIcon className="w-9 h-9" />
          </div>
          <Loader2 className="w-20 h-20 text-cyan-400 animate-spin absolute -top-3 -left-3 opacity-60" />
        </div>
        <p className="text-sm text-slate-400 font-medium mt-6">Loading developer console...</p>
      </div>
    );
  }

  // Active route checking
  const isSubdomains = pathname === "/dashboard";
  const isDnsSetup = pathname === "/dashboard/dnssetup" || pathname === "/dashboard/dns-setup";
  const isProfile = pathname === "/dashboard/profile";
  const isSupport = pathname === "/dashboard/support";

  // Is current page locked for regular non-admin users?
  const isNonAdmin = user?.role !== "admin";
  const isPageLocked = isNonAdmin && !isProfile && !isSupport;

  const getPageTitle = () => {
    if (isDnsSetup) return "DNS Setup & Deployment Guides";
    if (isProfile) return "Profile & Security";
    if (isSupport) return "Developer Help Desk & Support";
    return "Subdomains & DNS Routing";
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col md:flex-row">
      {/* ================= LEFT SIDEBAR ================= */}
      <aside className="w-full md:w-64 lg:w-72 md:h-screen md:sticky md:top-0 bg-[#0a0f1d]/90 border-r border-slate-800/80 backdrop-blur-xl flex flex-col justify-between shrink-0 z-20">
        <div>
          {/* Brand Header */}
          <div className="p-5 border-b border-slate-800/60 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-slate-900/90 border border-slate-800/90 flex items-center justify-center p-1.5 shadow-lg shadow-cyan-500/10 group-hover:scale-105 group-hover:border-cyan-500/40 transition-all">
                <FaviconIcon className="w-7 h-7" />
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  is-a-coder<span className="text-cyan-400">.in</span>
                </span>
                <span className="block text-[10px] text-cyan-400 font-mono tracking-wider uppercase">
                  Console v2.0
                </span>
              </div>
            </Link>

            {user?.role === "admin" && (
              <Link
                href="/admin"
                title="Admin Console"
                className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/20 text-xs transition"
              >
                <Shield className="w-4 h-4" />
              </Link>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="px-3 pt-4 space-y-1">
            <Link
              href="/dashboard"
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                isSubdomains
                  ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-xs"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/40"
              }`}
            >
              <div className="flex items-center gap-3">
                <Globe2 className="w-4 h-4" />
                <span>My Subdomains</span>
              </div>
              {isNonAdmin ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20">
                  <Lock className="w-2.5 h-2.5" />
                  <span>Locked</span>
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-800 text-slate-300">
                  {subdomains.length}
                </span>
              )}
            </Link>

            <Link
              href="/dashboard/dnssetup"
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                isDnsSetup
                  ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-xs"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/40"
              }`}
            >
              <div className="flex items-center gap-3">
                <BookOpen className="w-4 h-4" />
                <span>DNS Setup Docs</span>
              </div>
              {isNonAdmin ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20">
                  <Lock className="w-2.5 h-2.5" />
                  <span>Locked</span>
                </span>
              ) : (
                <span className="text-[10px] text-cyan-400">Guides</span>
              )}
            </Link>

            <Link
              href="/dashboard/profile"
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                isProfile
                  ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-xs"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/40"
              }`}
            >
              <div className="flex items-center gap-3">
                <User className="w-4 h-4" />
                <span>Profile &amp; Security</span>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3" />
                <span>Active</span>
              </span>
            </Link>

            <Link
              href="/dashboard/support"
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                isSupport
                  ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-xs"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/40"
              }`}
            >
              <div className="flex items-center gap-3">
                <LifeBuoy className="w-4 h-4" />
                <span>Help &amp; Support</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                24/7
              </span>
            </Link>
          </nav>
        </div>

        {/* User Card & Logout in Sidebar Footer */}
        <div className="p-4 border-t border-slate-800/60 space-y-3">
          {/* Quick DNS network status */}
          <div className="px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-400">Anycast DNS Edge</span>
            </div>
            <span className="text-emerald-400 font-mono font-semibold">99.99%</span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="flex items-center gap-2.5 truncate">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {user?.name ? user.name[0].toUpperCase() : "U"}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate leading-tight">
                  {user?.name}
                </p>
                <p className="text-[10px] text-slate-400 truncate leading-tight">
                  {user?.email}
                </p>
              </div>
            </div>

            <button
              onClick={() => setLogoutModalOpen(true)}
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ================= MAIN CONTENT AREA ================= */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top App Header */}
        <header className="h-16 border-b border-slate-800/80 bg-[#070b14]/80 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <span className="text-slate-500">Dashboard</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-white font-semibold">{getPageTitle()}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchDashboardData}
              title="Reload data"
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition flex items-center gap-1.5 text-xs font-medium cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </header>

        {/* Dashboard Main View Container */}
        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* If the current page is locked for non-admin, show the locked screen */}
          {isPageLocked ? (
            <div className="min-h-[70vh] flex items-center justify-center">
              <div className="w-full max-w-2xl rounded-3xl bg-gradient-to-b from-slate-900/95 via-[#0c1222]/95 to-[#070b14]/95 border border-blue-500/30 p-8 sm:p-10 shadow-[0_0_60px_rgba(245,158,11,0.1)] text-center relative overflow-hidden">
                {/* Glow effects */}
                <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 bg-blue-500/15 blur-[100px] rounded-full pointer-events-none" />
                <div className="absolute -bottom-24 right-0 w-60 h-60 bg-cyan-500/10 blur-[90px] rounded-full pointer-events-none" />

                {/* Locked Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-semibold mb-5 tracking-wide shadow-xs">
                  <Lock className="w-3.5 h-3.5 text-blue-400" />
                  <span>Feature Locked • Platform Under Progress</span>
                </div>

                {/* Icon */}
                <div className="mx-auto w-18 h-18 rounded-3xl bg-gradient-to-tr from-blue-500/20 via-blue-600/20 to-indigo-600/20 border border-blue-400/40 flex items-center justify-center mb-5 text-blue-400 relative shadow-xl shadow-blue-500/10">
                  <div className="absolute inset-0 rounded-3xl bg-blue-400/10 animate-pulse" />
                  <Lock className="w-9 h-9 text-blue-300 relative z-10" />
                </div>

                {/* Title */}
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Subdomain Provisioning is Locked 🚀
                </h2>

                {/* Description */}
                <p className="text-xs sm:text-sm text-slate-300 mt-3 max-w-lg mx-auto leading-relaxed">
                  We are currently performing final Anycast DNS Edge integrations and deployment pipeline tests for <span className="text-cyan-400 font-semibold">is-a-coder.in</span>.
                </p>

                {/* Notification Email Box */}
                <div className="mt-6 p-4 rounded-2xl bg-slate-950/80 border border-blue-500/20 text-left space-y-2 shadow-inner">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-blue-300 text-xs font-semibold">
                      <MailCheck className="w-4 h-4 text-blue-400" />
                      <span>Launch Notification Guarantee</span>
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      Priority List
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Once we go officially live, we will immediately send a launch email notification to:
                  </p>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-white/10 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span className="text-xs font-mono font-medium text-white truncate">
                      {user?.email}
                    </span>
                  </div>
                </div>

               

             
              </div>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </DashboardProvider>
  );
}
