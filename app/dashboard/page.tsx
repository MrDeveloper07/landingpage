"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FaviconIcon } from "@/components/ui/Icons";
import {
  Globe2,
  Plus,
  LogOut,
  Shield,
  ShieldCheck,
  ExternalLink,
  CheckCircle2,
  Clock,
  XCircle,
  Code2,
  HelpCircle,
  Copy,
  Check,
  AlertCircle,
  AlertTriangle,
  Loader2,
  Search,
  RefreshCw,
  User,
  UserCheck,
  KeyRound,
  Trash2,
  Eye,
  EyeOff,
  Sparkles,
  Calendar,
  Layers,
  Activity,
  Server,
  Terminal,
  ChevronRight,
  Filter,
  LayoutGrid,
  List as ListIcon,
  BookOpen,
  ArrowUpRight,
  Cpu,
  Zap,
  Lock,
  Mail,
  Fingerprint,
  Laptop,
  BadgeCheck,
  Info,
  ShieldAlert,
} from "lucide-react";

interface SubdomainItem {
  _id: string;
  subdomain: string;
  recordType: string;
  target: string;
  description?: string;
  repoUrl?: string;
  status: "pending" | "approved" | "rejected" | "suspended";
  rejectionReason?: string;
  createdAt: string;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  createdAt?: string;
}

type TabKey = "subdomains" | "guides" | "profile";
type ViewMode = "grid" | "table";

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("subdomains");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [subdomains, setSubdomains] = useState<SubdomainItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [guideModal, setGuideModal] = useState<SubdomainItem | null>(null);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [deleteSubdomainModal, setDeleteSubdomainModal] = useState<SubdomainItem | null>(null);
  const [sessionReplacedModalOpen, setSessionReplacedModalOpen] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "approved" | "pending" | "rejected">("all");
  const [guideCategory, setGuideCategory] = useState<"all" | "static" | "serverless" | "vps" | "records">("all");
  const [guideSearch, setGuideSearch] = useState("");
  const [serverSnippetTab, setServerSnippetTab] = useState<"nginx" | "caddy" | "docker">("nginx");

  // Claim Subdomain Form state
  const [subdomainName, setSubdomainName] = useState("");
  const [recordType, setRecordType] = useState<"CNAME" | "A" | "AAAA" | "TXT">("CNAME");
  const [target, setTarget] = useState("");
  const [description, setDescription] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityResult, setAvailabilityResult] = useState<{
    available?: boolean;
    error?: string;
  } | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Profile Management Form state
  const [profileName, setProfileName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  // Action Loading states
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch Session & Subdomains
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const authRes = await fetch("/api/auth/profile");
      const authData = await authRes.json();

      if (authData.sessionTerminated || authData.reason === "session_replaced") {
        setSessionReplacedModalOpen(true);
        return;
      }

      if (authRes.ok && authData.user) {
        setUser(authData.user);
        setProfileName(authData.user.name || "");
      } else {
        const meRes = await fetch("/api/auth/me");
        const meData = await meRes.json();
        if (meData.sessionTerminated || meData.reason === "session_replaced") {
          setSessionReplacedModalOpen(true);
          return;
        }
        if (!meRes.ok || !meData.authenticated) {
          router.push("/login");
          return;
        }
        setUser(meData.user);
        setProfileName(meData.user.name || "");
      }

      const subsRes = await fetch("/api/subdomains");
      const subsData = await subsRes.json();

      if (subsData.sessionTerminated || subsData.reason === "session_replaced") {
        setSessionReplacedModalOpen(true);
        return;
      }

      if (subsRes.ok) {
        setSubdomains(subsData.subdomains || []);
      }
    } catch (err) {
      console.error("Dashboard Load Error:", err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Session Heartbeat: Automatically detects when account is logged in on another device (PC2)
  useEffect(() => {
    if (sessionReplacedModalOpen) return;

    const checkActiveSession = async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.sessionTerminated || data.reason === "session_replaced") {
          setSessionReplacedModalOpen(true);
        }
      } catch {
        // Network offline / temporary glitch
      }
    };

    // Heartbeat poll every 5 seconds
    const interval = setInterval(checkActiveSession, 5000);

    // Immediate check whenever user focuses/returns to this tab
    const handleFocus = () => {
      checkActiveSession();
    };
    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, [sessionReplacedModalOpen]);

  // Live availability check debounce
  useEffect(() => {
    if (!subdomainName || subdomainName.trim().length < 2) {
      setAvailabilityResult(null);
      return;
    }

    const timer = setTimeout(async () => {
      setCheckingAvailability(true);
      try {
        const res = await fetch(
          `/api/subdomains/check?name=${encodeURIComponent(subdomainName.trim())}`
        );
        const data = await res.json();
        setAvailabilityResult(data);
      } catch {
        setAvailabilityResult({ available: false, error: "Network check error" });
      } finally {
        setCheckingAvailability(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [subdomainName]);

  // Logout confirmation action
  const handleConfirmLogout = async () => {
    setLogoutLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Logout Error:", err);
    } finally {
      setLogoutLoading(false);
      setLogoutModalOpen(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Submit Claim Subdomain
  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (availabilityResult && availabilityResult.available === false) {
      setFormError(availabilityResult.error || "This subdomain is unavailable.");
      return;
    }

    setFormSubmitting(true);

    try {
      const res = await fetch("/api/subdomains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subdomain: subdomainName,
          recordType,
          target,
          description,
          repoUrl,
        }),
      });

      const data = await res.json();

      if (data.sessionTerminated || data.reason === "session_replaced") {
        setSessionReplacedModalOpen(true);
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit subdomain request");
      }

      setModalOpen(false);
      setSubdomainName("");
      setTarget("");
      setDescription("");
      setRepoUrl("");
      setAvailabilityResult(null);
      await fetchDashboardData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setFormError(message);
    } finally {
      setFormSubmitting(false);
    }
  };

  // Delete Subdomain Action
  const handleDeleteSubdomain = async () => {
    if (!deleteSubdomainModal) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/subdomains?id=${deleteSubdomainModal._id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.sessionTerminated || data.reason === "session_replaced") {
        setDeleteSubdomainModal(null);
        setSessionReplacedModalOpen(true);
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete subdomain");
      }
      setDeleteSubdomainModal(null);
      await fetchDashboardData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete subdomain");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Update Profile Name Action
  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");
    setProfileSaving(true);

    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: profileName }),
      });

      const data = await res.json();

      if (data.sessionTerminated || data.reason === "session_replaced") {
        setSessionReplacedModalOpen(true);
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile name");
      }

      setUser((prev) => (prev ? { ...prev, name: data.user.name } : null));
      setProfileSuccess("Profile updated successfully!");
      setTimeout(() => setProfileSuccess(""), 4000);
    } catch (err: unknown) {
      setProfileError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setProfileSaving(false);
    }
  };

  // Change Password Action
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");

    if (newPassword.length < 6) {
      setProfileError("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setProfileError("New password and confirm password do not match.");
      return;
    }

    setProfileSaving(true);

    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();

      if (data.sessionTerminated || data.reason === "session_replaced") {
        setSessionReplacedModalOpen(true);
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || "Failed to update password");
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setProfileSuccess("Password updated successfully!");
      setTimeout(() => setProfileSuccess(""), 4000);
    } catch (err: unknown) {
      setProfileError(err instanceof Error ? err.message : "Password change failed");
    } finally {
      setProfileSaving(false);
    }
  };

  if (loading) {
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

  // Filtered subdomains
  const filteredSubdomains = subdomains.filter((item) => {
    const matchesSearch =
      item.subdomain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.target.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeCount = subdomains.filter((s) => s.status === "approved").length;
  const pendingCount = subdomains.filter((s) => s.status === "pending").length;

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

          {/* Quick Action Button */}
          <div className="p-4">
            <button
              onClick={() => setModalOpen(true)}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:via-blue-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer group"
            >
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
              <span>Claim New Subdomain</span>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1">
            <button
              onClick={() => setActiveTab("subdomains")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === "subdomains"
                  ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-xs"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/40"
              }`}
            >
              <div className="flex items-center gap-3">
                <Globe2 className="w-4 h-4" />
                <span>My Subdomains</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-800 text-slate-300">
                {subdomains.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("guides")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === "guides"
                  ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-xs"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/40"
              }`}
            >
              <div className="flex items-center gap-3">
                <BookOpen className="w-4 h-4" />
                <span>DNS Setup Docs</span>
              </div>
              <span className="text-[10px] text-cyan-400">Guides</span>
            </button>

            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === "profile"
                  ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-xs"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/40"
              }`}
            >
              <div className="flex items-center gap-3">
                <User className="w-4 h-4" />
                <span>Profile &amp; Security</span>
              </div>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </button>
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
            <span className="text-white font-semibold capitalize">
              {activeTab === "subdomains" ? "Subdomains & DNS Routing" : activeTab === "guides" ? "Setup & Deployment Guides" : "Profile & Security"}
            </span>
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
        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-8">
          {/* TAB 1: SUBDOMAINS & DNS */}
          {activeTab === "subdomains" && (
            <div className="space-y-8">
              {/* Stat Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-[#0c1222] border border-slate-800/80 relative overflow-hidden group hover:border-cyan-500/40 transition">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl group-hover:bg-cyan-500/10 transition" />
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Quota Utilization
                    </span>
                    <Globe2 className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-3xl font-black text-white">{subdomains.length}</span>
                    <span className="text-sm font-semibold text-slate-500">/ 5 Subdomains</span>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full bg-slate-950 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all"
                      style={{ width: `${(subdomains.length / 5) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#0c1222] border border-slate-800/80 relative overflow-hidden group hover:border-emerald-500/40 transition">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition" />
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Active &amp; Verified
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-3xl font-black text-emerald-400">{activeCount}</span>
                    <span className="text-xs text-slate-400">Live DNS routings</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-3 flex items-center gap-1.5">
                    <Zap className="w-3 h-3 text-emerald-400" />
                    <span>Serving traffic through global edge</span>
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[#0c1222] border border-slate-800/80 relative overflow-hidden group hover:border-amber-500/40 transition">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl group-hover:bg-amber-500/10 transition" />
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Pending Approvals
                    </span>
                    <Clock className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-3xl font-black text-amber-400">{pendingCount}</span>
                    <span className="text-xs text-slate-400">in moderation queue</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-3 flex items-center gap-1.5">
                    <Cpu className="w-3 h-3 text-amber-400" />
                    <span>Automatic security verification</span>
                  </p>
                </div>
              </div>

              {/* Toolbar & Filters */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Search Bar */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search subdomain or target destination..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0c1222] border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition"
                  />
                </div>

                {/* Filter Chips & View Mode Toggle */}
                <div className="flex items-center gap-2.5 flex-wrap">
                  <div className="flex items-center rounded-xl bg-[#0c1222] p-1 border border-slate-800 text-xs">
                    {(["all", "approved", "pending", "rejected"] as const).map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setStatusFilter(filter)}
                        className={`px-3 py-1.5 rounded-lg capitalize transition cursor-pointer font-medium text-xs ${
                          statusFilter === filter
                            ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center rounded-xl bg-[#0c1222] p-1 border border-slate-800">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-1.5 rounded-lg transition cursor-pointer ${
                        viewMode === "grid" ? "bg-slate-800 text-cyan-400" : "text-slate-400 hover:text-white"
                      }`}
                      title="Grid Cards View"
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("table")}
                      className={`p-1.5 rounded-lg transition cursor-pointer ${
                        viewMode === "table" ? "bg-slate-800 text-cyan-400" : "text-slate-400 hover:text-white"
                      }`}
                      title="Table List View"
                    >
                      <ListIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Subdomains Content */}
              {filteredSubdomains.length === 0 ? (
                <div className="py-20 text-center px-4 rounded-3xl bg-[#0c1222]/50 border border-slate-800/80">
                  <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600 mx-auto mb-4">
                    <Globe2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    {subdomains.length === 0 ? "No Subdomains Claimed Yet" : "No Subdomains Match Your Search"}
                  </h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-6">
                    {subdomains.length === 0
                      ? "Launch your developer identity by claiming your free custom prefix under .is-a-coder.in"
                      : "Try adjusting your search terms or status filters."}
                  </p>
                  {subdomains.length === 0 && (
                    <button
                      onClick={() => setModalOpen(true)}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold inline-flex items-center gap-2 cursor-pointer transition shadow-lg shadow-cyan-500/20"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Claim Your First Subdomain</span>
                    </button>
                  )}
                </div>
              ) : viewMode === "grid" ? (
                /* GRID CARDS VIEW */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredSubdomains.map((item) => {
                    const fullAddress = `${item.subdomain}.is-a-coder.in`;
                    return (
                      <div
                        key={item._id}
                        className="p-5 rounded-2xl bg-[#0c1222] border border-slate-800 hover:border-cyan-500/40 transition flex flex-col justify-between space-y-4 shadow-lg group relative"
                      >
                        {/* Top: Domain Name & Status */}
                        <div>
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shrink-0" />
                              <h3 className="text-base font-bold text-white truncate font-mono">
                                {item.subdomain}
                                <span className="text-slate-500 font-normal">.is-a-coder.in</span>
                              </h3>
                            </div>

                            {/* Status Badge */}
                            {item.status === "approved" && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0">
                                <CheckCircle2 className="w-3 h-3" />
                                Live
                              </span>
                            )}
                            {item.status === "pending" && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0">
                                <Clock className="w-3 h-3" />
                                Pending
                              </span>
                            )}
                            {item.status === "rejected" && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 border border-rose-500/30 text-rose-400 shrink-0">
                                <XCircle className="w-3 h-3" />
                                Rejected
                              </span>
                            )}
                          </div>

                          {/* Target Destination Box */}
                          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-slate-500 font-medium">Routing Target:</span>
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-slate-800 text-cyan-400">
                                {item.recordType}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-2 text-xs font-mono text-slate-300">
                              <span className="truncate">{item.target}</span>
                              <button
                                onClick={() => handleCopy(item.target, item._id)}
                                title="Copy Target"
                                className="text-slate-500 hover:text-white transition cursor-pointer shrink-0"
                              >
                                {copiedId === item._id ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </div>

                          {item.rejectionReason && (
                            <p className="mt-2 text-[11px] text-rose-400/90 italic bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
                              Reason: {item.rejectionReason}
                            </p>
                          )}
                        </div>

                        {/* Bottom Actions */}
                        <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
                          <button
                            onClick={() => setGuideModal(item)}
                            className="inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer transition"
                          >
                            <Code2 className="w-3.5 h-3.5" />
                            <span>Setup Guide</span>
                          </button>

                          <div className="flex items-center gap-2">
                            {item.status === "approved" && (
                              <a
                                href={`https://${fullAddress}`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white border border-slate-800 transition"
                                title="Visit Website"
                              >
                                <ArrowUpRight className="w-3.5 h-3.5" />
                              </a>
                            )}
                            <button
                              onClick={() => setDeleteSubdomainModal(item)}
                              title="Delete Subdomain"
                              className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/30 transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* TABLE LIST VIEW */
                <div className="rounded-2xl border border-slate-800 bg-[#0c1222] overflow-hidden shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-300">
                      <thead className="bg-slate-950/80 text-xs uppercase text-slate-400 border-b border-slate-800 font-semibold">
                        <tr>
                          <th className="py-3.5 px-6">Domain</th>
                          <th className="py-3.5 px-6">Type</th>
                          <th className="py-3.5 px-6">Destination</th>
                          <th className="py-3.5 px-6">Status</th>
                          <th className="py-3.5 px-6">Created</th>
                          <th className="py-3.5 px-6 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-normal">
                        {filteredSubdomains.map((item) => {
                          const fullAddress = `${item.subdomain}.is-a-coder.in`;
                          return (
                            <tr key={item._id} className="hover:bg-slate-900/40 transition">
                              <td className="py-4 px-6 font-medium text-white font-mono">
                                <div className="flex items-center gap-2">
                                  <span className="text-cyan-300 font-semibold">{item.subdomain}</span>
                                  <span className="text-slate-500">.is-a-coder.in</span>
                                </div>
                              </td>

                              <td className="py-4 px-6">
                                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-900 border border-slate-800 text-cyan-400">
                                  {item.recordType}
                                </span>
                              </td>

                              <td className="py-4 px-6 font-mono text-xs text-slate-400">
                                <div className="flex items-center gap-2 max-w-xs truncate">
                                  <span className="truncate">{item.target}</span>
                                  <button
                                    onClick={() => handleCopy(item.target, item._id)}
                                    className="text-slate-500 hover:text-slate-300 transition cursor-pointer"
                                  >
                                    {copiedId === item._id ? (
                                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                                    ) : (
                                      <Copy className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                </div>
                              </td>

                              <td className="py-4 px-6">
                                {item.status === "approved" && (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    Live
                                  </span>
                                )}
                                {item.status === "pending" && (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 border border-amber-500/30 text-amber-400">
                                    <Clock className="w-3.5 h-3.5" />
                                    Pending
                                  </span>
                                )}
                                {item.status === "rejected" && (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 border border-rose-500/30 text-rose-400">
                                    <XCircle className="w-3.5 h-3.5" />
                                    Rejected
                                  </span>
                                )}
                              </td>

                              <td className="py-4 px-6 text-xs text-slate-500">
                                {new Date(item.createdAt).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </td>

                              <td className="py-4 px-6 text-right">
                                <div className="inline-flex items-center gap-2">
                                  <button
                                    onClick={() => setGuideModal(item)}
                                    className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-xs text-slate-300 hover:text-cyan-300 transition cursor-pointer"
                                  >
                                    Setup Guide
                                  </button>
                                  {item.status === "approved" && (
                                    <a
                                      href={`https://${fullAddress}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="p-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
                                    >
                                      <ArrowUpRight className="w-3.5 h-3.5" />
                                    </a>
                                  )}
                                  <button
                                    onClick={() => setDeleteSubdomainModal(item)}
                                    className="p-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-rose-500/40 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: DNS & INTEGRATION GUIDES */}
          {activeTab === "guides" && (() => {
            const searchLower = guideSearch.toLowerCase().trim();

            const isItemVisible = (title: string, tags: string[], category: "static" | "serverless" | "vps" | "records") => {
              const matchesCat = guideCategory === "all" || guideCategory === category;
              const matchesSearch =
                !searchLower ||
                title.toLowerCase().includes(searchLower) ||
                tags.some((t) => t.toLowerCase().includes(searchLower));
              return matchesCat && matchesSearch;
            };

            const nginxSnippet = `server {\n    listen 80;\n    server_name yourname.is-a-coder.in;\n\n    location / {\n        proxy_pass http://127.0.0.1:3000;\n        proxy_set_header Host $host;\n        proxy_set_header X-Real-IP $remote_addr;\n        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n        proxy_set_header X-Forwarded-Proto $scheme;\n    }\n}`;
            const caddySnippet = `yourname.is-a-coder.in {\n    reverse_proxy 127.0.0.1:3000\n}`;
            const certbotSnippet = `# 1. Verify Nginx configuration\nsudo nginx -t\n\n# 2. Request & install automatic Let's Encrypt SSL\nsudo certbot --nginx -d yourname.is-a-coder.in`;

            return (
              <div className="space-y-8 max-w-5xl">
                {/* 1. HERO DOCUMENTATION BANNER */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#0e1628] via-[#0c1222] to-[#070b14] border border-slate-800/80 p-6 sm:p-8 shadow-2xl">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
                  <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2 max-w-2xl">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold uppercase tracking-wider">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>DNS Integration &amp; Deployment Hub</span>
                      </div>
                      <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                        Deploy Anywhere with Instant Anycast DNS
                      </h1>
                      <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                        Step-by-step guides to connect your custom <code className="text-cyan-300 font-mono bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800">*.is-a-coder.in</code> subdomain to modern JAMstack hosts, serverless clouds, or custom Linux servers.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-2 shrink-0">
                      <div className="px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Anycast TTL: <strong className="text-white font-mono">60 seconds</strong></span>
                      </div>
                      <div className="px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-cyan-400" />
                        <span>Automatic SSL / TLS 1.3</span>
                      </div>
                    </div>
                  </div>

                  {/* Telemetry Strip */}
                  <div className="mt-7 pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/60">
                      <div className="text-[11px] text-slate-500 font-medium">Domain Format</div>
                      <div className="text-sm font-bold text-cyan-300 font-mono mt-0.5">name.is-a-coder.in</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/60">
                      <div className="text-[11px] text-slate-500 font-medium">Global Propagation</div>
                      <div className="text-sm font-bold text-emerald-400 font-mono mt-0.5">&lt; 60s Worldwide</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/60">
                      <div className="text-[11px] text-slate-500 font-medium">SSL Certificates</div>
                      <div className="text-sm font-bold text-slate-200 font-mono mt-0.5">Automated Let&apos;s Encrypt</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/60">
                      <div className="text-[11px] text-slate-500 font-medium">Supported Types</div>
                      <div className="text-sm font-bold text-amber-400 font-mono mt-0.5">CNAME, A, AAAA, TXT</div>
                    </div>
                  </div>
                </div>

                {/* 2. CATEGORY FILTERS & SEARCH TOOLBAR */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Category Filter Pills */}
                  <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#0c1222] border border-slate-800 overflow-x-auto">
                    {(
                      [
                        { key: "all", label: "All Guides" },
                        { key: "static", label: "JAMstack & Static" },
                        { key: "serverless", label: "Cloud & Edge" },
                        { key: "vps", label: "Linux VPS & Servers" },
                        { key: "records", label: "DNS Dictionary" },
                      ] as const
                    ).map((cat) => (
                      <button
                        key={cat.key}
                        onClick={() => setGuideCategory(cat.key)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                          guideCategory === cat.key
                            ? "bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white shadow-md shadow-cyan-500/20"
                            : "text-slate-400 hover:text-white hover:bg-slate-900"
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Search input */}
                  <div className="relative flex-1 md:max-w-xs">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search guides, hosts, or record types..."
                      value={guideSearch}
                      onChange={(e) => setGuideSearch(e.target.value)}
                      className="w-full pl-10 pr-9 py-2 rounded-xl bg-[#0c1222] border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition"
                    />
                    {guideSearch && (
                      <button
                        onClick={() => setGuideSearch("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs cursor-pointer"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                {/* 3. PLATFORM INTEGRATION GUIDES GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* GitHub Pages */}
                  {isItemVisible("GitHub Pages", ["github", "cname", "static", "pages", "portfolio"], "static") && (
                    <div className="p-7 rounded-3xl bg-[#0c1222] border border-slate-800/90 shadow-xl space-y-5 hover:border-cyan-500/40 transition flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-white font-bold">
                              <Terminal className="w-5 h-5 text-cyan-400" />
                            </div>
                            <div>
                              <h3 className="text-base font-bold text-white">GitHub Pages</h3>
                              <p className="text-xs text-slate-400">Personal portfolios, project docs &amp; static blogs</p>
                            </div>
                          </div>
                          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                            CNAME
                          </span>
                        </div>

                        <ol className="list-decimal pl-4 text-xs text-slate-300 space-y-2 leading-relaxed">
                          <li>Open your repository on GitHub and navigate to <strong>Settings</strong> → <strong>Pages</strong>.</li>
                          <li>In the <strong>Custom domain</strong> input, enter: <code className="text-cyan-300 font-mono bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">yourname.is-a-coder.in</code></li>
                          <li>Click <strong>Save</strong> and ensure <strong>&quot;Enforce HTTPS&quot;</strong> is checked.</li>
                          <li>In your is-a-coder dashboard, set the <strong>CNAME Target</strong> to your GitHub Pages URL:</li>
                        </ol>

                        {/* Copy Destination Box */}
                        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs font-mono text-cyan-300">
                          <div className="truncate flex items-center gap-2">
                            <span className="text-slate-500 text-[11px]">Target:</span>
                            <span className="font-semibold">username.github.io</span>
                          </div>
                          <button
                            onClick={() => handleCopy("username.github.io", "guide-gh")}
                            className="p-1.5 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-white transition cursor-pointer shrink-0"
                            title="Copy Target"
                          >
                            {copiedId === "guide-gh" ? (
                              <Check className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 text-[11px] text-slate-400 flex items-center gap-2">
                        <Info className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span>GitHub automatically provisions TLS certificates within 1-2 minutes.</span>
                      </div>
                    </div>
                  )}

                  {/* Vercel */}
                  {isItemVisible("Vercel", ["vercel", "nextjs", "react", "cname", "jamstack", "frontend"], "static") && (
                    <div className="p-7 rounded-3xl bg-[#0c1222] border border-slate-800/90 shadow-xl space-y-5 hover:border-cyan-500/40 transition flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-white font-bold">
                              <Zap className="w-5 h-5 text-cyan-400" />
                            </div>
                            <div>
                              <h3 className="text-base font-bold text-white">Vercel</h3>
                              <p className="text-xs text-slate-400">Next.js, React, Remix, Astro &amp; Serverless web apps</p>
                            </div>
                          </div>
                          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                            CNAME
                          </span>
                        </div>

                        <ol className="list-decimal pl-4 text-xs text-slate-300 space-y-2 leading-relaxed">
                          <li>Open your Vercel Project → <strong>Settings</strong> → <strong>Domains</strong>.</li>
                          <li>Add your domain: <code className="text-cyan-300 font-mono bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">yourname.is-a-coder.in</code></li>
                          <li>Vercel will prompt for DNS verification via CNAME.</li>
                          <li>In your is-a-coder console, set the <strong>CNAME Target</strong> to:</li>
                        </ol>

                        {/* Copy Destination Box */}
                        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs font-mono text-cyan-300">
                          <div className="truncate flex items-center gap-2">
                            <span className="text-slate-500 text-[11px]">Target:</span>
                            <span className="font-semibold">cname.vercel-dns.com</span>
                          </div>
                          <button
                            onClick={() => handleCopy("cname.vercel-dns.com", "guide-vercel")}
                            className="p-1.5 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-white transition cursor-pointer shrink-0"
                            title="Copy Target"
                          >
                            {copiedId === "guide-vercel" ? (
                              <Check className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 text-[11px] text-slate-400 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Vercel checks CNAME status and provisions instant Let&apos;s Encrypt SSL.</span>
                      </div>
                    </div>
                  )}

                  {/* Cloudflare Pages */}
                  {isItemVisible("Cloudflare Pages", ["cloudflare", "pages", "workers", "edge", "cname"], "serverless") && (
                    <div className="p-7 rounded-3xl bg-[#0c1222] border border-slate-800/90 shadow-xl space-y-5 hover:border-cyan-500/40 transition flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-white font-bold">
                              <Layers className="w-5 h-5 text-cyan-400" />
                            </div>
                            <div>
                              <h3 className="text-base font-bold text-white">Cloudflare Pages &amp; Workers</h3>
                              <p className="text-xs text-slate-400">Edge deployments, serverless APIs &amp; static builds</p>
                            </div>
                          </div>
                          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                            CNAME
                          </span>
                        </div>

                        <ol className="list-decimal pl-4 text-xs text-slate-300 space-y-2 leading-relaxed">
                          <li>Go to <strong>Cloudflare Dashboard</strong> → <strong>Workers &amp; Pages</strong> → Select Project.</li>
                          <li>Open <strong>Custom Domains</strong> tab → Click <strong>&quot;Set up a custom domain&quot;</strong>.</li>
                          <li>Enter <code className="text-cyan-300 font-mono bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">yourname.is-a-coder.in</code>.</li>
                          <li>In your is-a-coder dashboard, point CNAME to your default Pages URL:</li>
                        </ol>

                        {/* Copy Destination Box */}
                        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs font-mono text-cyan-300">
                          <div className="truncate flex items-center gap-2">
                            <span className="text-slate-500 text-[11px]">Target:</span>
                            <span className="font-semibold">your-project.pages.dev</span>
                          </div>
                          <button
                            onClick={() => handleCopy("your-project.pages.dev", "guide-cf")}
                            className="p-1.5 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-white transition cursor-pointer shrink-0"
                            title="Copy Target"
                          >
                            {copiedId === "guide-cf" ? (
                              <Check className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 text-[11px] text-slate-400 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Benefit from Cloudflare Anycast edge caching with zero egress fees.</span>
                      </div>
                    </div>
                  )}

                  {/* Netlify / Render */}
                  {isItemVisible("Netlify & Render", ["netlify", "render", "python", "node", "cname", "jamstack"], "serverless") && (
                    <div className="p-7 rounded-3xl bg-[#0c1222] border border-slate-800/90 shadow-xl space-y-5 hover:border-cyan-500/40 transition flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-white font-bold">
                              <Activity className="w-5 h-5 text-cyan-400" />
                            </div>
                            <div>
                              <h3 className="text-base font-bold text-white">Netlify &amp; Render</h3>
                              <p className="text-xs text-slate-400">Web services, background workers &amp; static frontends</p>
                            </div>
                          </div>
                          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                            CNAME
                          </span>
                        </div>

                        <ol className="list-decimal pl-4 text-xs text-slate-300 space-y-2 leading-relaxed">
                          <li>In your Netlify/Render site dashboard, open <strong>Domain Management</strong>.</li>
                          <li>Click <strong>&quot;Add custom domain&quot;</strong> and type: <code className="text-cyan-300 font-mono bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">yourname.is-a-coder.in</code></li>
                          <li>In our dashboard, set CNAME Target to your default app slug:</li>
                        </ol>

                        {/* Copy Destination Box */}
                        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs font-mono text-cyan-300">
                          <div className="truncate flex items-center gap-2">
                            <span className="text-slate-500 text-[11px]">Target:</span>
                            <span className="font-semibold">your-app.netlify.app</span>
                          </div>
                          <button
                            onClick={() => handleCopy("your-app.netlify.app", "guide-net")}
                            className="p-1.5 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-white transition cursor-pointer shrink-0"
                            title="Copy Target"
                          >
                            {copiedId === "guide-net" ? (
                              <Check className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 text-[11px] text-slate-400 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Both platforms verify CNAME records and issue automated HTTPS certificates.</span>
                      </div>
                    </div>
                  )}

                  {/* Custom VPS / Nginx / Caddy */}
                  {isItemVisible("Custom Linux VPS & Dedicated Servers", ["vps", "server", "nginx", "caddy", "docker", "a", "aaaa", "certbot", "ssl", "linux", "ubuntu"], "vps") && (
                    <div className="p-7 rounded-3xl bg-[#0c1222] border border-slate-800/90 shadow-xl space-y-5 md:col-span-2 hover:border-cyan-500/40 transition">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-white font-bold">
                            <Server className="w-5 h-5 text-indigo-400" />
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-white">Custom Linux VPS &amp; Dedicated Compute</h3>
                            <p className="text-xs text-slate-400">Ubuntu, Debian, AWS EC2, DigitalOcean, Hetzner, Docker, Nginx &amp; Caddy</p>
                          </div>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 self-start sm:self-auto">
                          A / AAAA Record
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-[10px] font-bold">1</span>
                            <span>Configure DNS in is-a-coder</span>
                          </h4>
                          <ol className="list-decimal pl-4 text-xs text-slate-300 space-y-1.5 leading-relaxed">
                            <li>Select <strong>A Record</strong> (IPv4) or <strong>AAAA Record</strong> (IPv6).</li>
                            <li>Enter your VPS public IP address (e.g. <code className="text-cyan-300 font-mono bg-slate-950 px-1 py-0.2 rounded">159.65.120.45</code>) as the Target.</li>
                            <li>Save the subdomain and wait ~60s for Anycast DNS propagation.</li>
                          </ol>
                        </div>

                        <div className="space-y-3">
                          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-[10px] font-bold">2</span>
                            <span>Automated HTTPS SSL Setup</span>
                          </h4>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            Use Certbot or Caddy to issue signed Let&apos;s Encrypt certificates directly on your server.
                          </p>
                        </div>
                      </div>

                      {/* Code Snippet Tabs */}
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                            <button
                              onClick={() => setServerSnippetTab("nginx")}
                              className={`px-3 py-1.5 rounded-lg font-mono text-xs transition cursor-pointer ${
                                serverSnippetTab === "nginx"
                                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                                  : "text-slate-400 hover:text-white"
                              }`}
                            >
                              nginx.conf
                            </button>
                            <button
                              onClick={() => setServerSnippetTab("caddy")}
                              className={`px-3 py-1.5 rounded-lg font-mono text-xs transition cursor-pointer ${
                                serverSnippetTab === "caddy"
                                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                                  : "text-slate-400 hover:text-white"
                              }`}
                            >
                              Caddyfile
                            </button>
                            <button
                              onClick={() => setServerSnippetTab("docker")}
                              className={`px-3 py-1.5 rounded-lg font-mono text-xs transition cursor-pointer ${
                                serverSnippetTab === "docker"
                                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                                  : "text-slate-400 hover:text-white"
                              }`}
                            >
                              Certbot SSL CLI
                            </button>
                          </div>

                          <button
                            onClick={() => {
                              const text =
                                serverSnippetTab === "nginx"
                                  ? nginxSnippet
                                  : serverSnippetTab === "caddy"
                                  ? caddySnippet
                                  : certbotSnippet;
                              handleCopy(text, `snippet-${serverSnippetTab}`);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 hover:text-white transition cursor-pointer"
                          >
                            {copiedId === `snippet-${serverSnippetTab}` ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-emerald-400 font-medium">Copied Config</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-slate-400" />
                                <span>Copy Snippet</span>
                              </>
                            )}
                          </button>
                        </div>

                        <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed shadow-inner">
                          {serverSnippetTab === "nginx" && nginxSnippet}
                          {serverSnippetTab === "caddy" && caddySnippet}
                          {serverSnippetTab === "docker" && certbotSnippet}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. DNS RECORD PROTOCOL DICTIONARY */}
                {(guideCategory === "all" || guideCategory === "records") && (
                  <div className="p-7 rounded-3xl bg-[#0c1222] border border-slate-800 shadow-xl space-y-5">
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                        <Code2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white">DNS Record Protocol Reference</h3>
                        <p className="text-xs text-slate-400">Technical specifications and recommended usage for supported record types.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* CNAME */}
                      <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                            CNAME
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">RFC 1035</span>
                        </div>
                        <h4 className="text-xs font-bold text-white">Canonical Name Alias</h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          Maps your prefix directly to another hostname. Ideal for Vercel, GitHub Pages, Netlify, and Cloudflare.
                        </p>
                        <div className="pt-2 border-t border-slate-900 text-[10px] text-cyan-400 font-mono truncate">
                          e.g. cname.vercel-dns.com
                        </div>
                      </div>

                      {/* A Record */}
                      <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-indigo-500/10 border border-indigo-500/30 text-indigo-300">
                            A Record
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">RFC 1035</span>
                        </div>
                        <h4 className="text-xs font-bold text-white">IPv4 Host Address</h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          Points directly to a 32-bit IPv4 address of your Linux VPS, AWS EC2 instance, or dedicated server.
                        </p>
                        <div className="pt-2 border-t border-slate-900 text-[10px] text-indigo-400 font-mono truncate">
                          e.g. 159.65.120.45
                        </div>
                      </div>

                      {/* AAAA Record */}
                      <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-purple-500/10 border border-purple-500/30 text-purple-300">
                            AAAA Record
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">RFC 3596</span>
                        </div>
                        <h4 className="text-xs font-bold text-white">IPv6 Host Address</h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          Routes your subdomain to a 128-bit IPv6 address for next-gen dual-stack networks.
                        </p>
                        <div className="pt-2 border-t border-slate-900 text-[10px] text-purple-400 font-mono truncate">
                          e.g. 2001:0db8:85a3::8a2e
                        </div>
                      </div>

                      {/* TXT Record */}
                      <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                            TXT Record
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">RFC 1464</span>
                        </div>
                        <h4 className="text-xs font-bold text-white">Text &amp; Verification</h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          Stores text data for domain verification (Google Search Console, Firebase, Bluesky handle verification).
                        </p>
                        <div className="pt-2 border-t border-slate-900 text-[10px] text-emerald-400 font-mono truncate">
                          e.g. google-site-verification=...
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* TAB 3: PROFILE & SECURITY */}
          {activeTab === "profile" && (() => {
            // Password strength calculation helper
            const getPassStrength = (pass: string) => {
              if (!pass) return { score: 0, label: "Enter password", color: "bg-slate-800", text: "text-slate-500", percent: 5 };
              let s = 0;
              if (pass.length >= 6) s += 1;
              if (pass.length >= 10) s += 1;
              if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) s += 1;
              if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) s += 1;

              if (s === 1) return { score: 1, label: "Weak (add mixed cases & numbers)", color: "bg-rose-500", text: "text-rose-400", percent: 25 };
              if (s === 2) return { score: 2, label: "Fair", color: "bg-amber-500", text: "text-amber-400", percent: 50 };
              if (s === 3) return { score: 3, label: "Good", color: "bg-cyan-500", text: "text-cyan-400", percent: 75 };
              return { score: 4, label: "Strong & Protected", color: "bg-emerald-500", text: "text-emerald-400", percent: 100 };
            };

            const strength = getPassStrength(newPassword);
            const isLengthValid = newPassword.length >= 6;
            const hasUpperLower = /[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword);
            const hasNumSymbol = /[0-9]/.test(newPassword) || /[^A-Za-z0-9]/.test(newPassword);
            const passwordsMatch = Boolean(newPassword && confirmPassword && newPassword === confirmPassword);
            const passwordsMismatch = Boolean(confirmPassword && newPassword !== confirmPassword);

            const liveDomainsCount = subdomains.filter((s) => s.status === "approved").length;
            const pendingDomainsCount = subdomains.filter((s) => s.status === "pending").length;

            const memberDate = user?.createdAt
              ? new Date(user.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })
              : "Active Developer";

            return (
              <div className="space-y-8 max-w-5xl">
                {/* Feedback Alerts */}
                <AnimatePresence>
                  {profileSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.98 }}
                      className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3 text-emerald-300 shadow-lg shadow-emerald-500/5 backdrop-blur-md"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-emerald-200">Account Updated</p>
                          <p className="text-xs text-emerald-400/90">{profileSuccess}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setProfileSuccess("")}
                        className="text-emerald-400/60 hover:text-emerald-300 text-xs px-2 py-1"
                      >
                        Dismiss
                      </button>
                    </motion.div>
                  )}

                  {profileError && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.98 }}
                      className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between gap-3 text-rose-300 shadow-lg shadow-rose-500/5 backdrop-blur-md"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-rose-500/20 flex items-center justify-center shrink-0">
                          <AlertCircle className="w-4 h-4 text-rose-400" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-rose-200">Action Failed</p>
                          <p className="text-xs text-rose-400/90">{profileError}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setProfileError("")}
                        className="text-rose-400/60 hover:text-rose-300 text-xs px-2 py-1"
                      >
                        Dismiss
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* 1. DEVELOPER HERO PROFILE CARD */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#0e1628] via-[#0c1222] to-[#070b14] border border-slate-800/80 p-6 sm:p-8 shadow-2xl">
                  {/* Subtle Background Glow Elements */}
                  <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
                  <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

                  <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    {/* Left: Avatar & Identity Details */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                      <div className="relative shrink-0">
                        {/* Avatar Ring */}
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 p-0.5 shadow-xl shadow-cyan-500/20">
                          <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center">
                            <span className="text-3xl font-black bg-gradient-to-br from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent">
                              {user?.name ? user.name.charAt(0).toUpperCase() : "D"}
                            </span>
                          </div>
                        </div>
                        {/* Online Status Dot */}
                        <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-slate-950"></span>
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <h1 className="text-2xl font-black tracking-tight text-white">
                            {user?.name || "Developer"}
                          </h1>
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40">
                            {user?.role === "admin" ? "System Administrator" : "Developer Account"}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            <BadgeCheck className="w-3.5 h-3.5" />
                            Verified
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-400">
                          <span className="flex items-center gap-1.5 text-slate-300 font-mono">
                            <Mail className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                            {user?.email}
                          </span>
                          <span className="text-slate-600 hidden sm:inline">•</span>
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            Member since {memberDate}
                          </span>
                        </div>

                        {/* Account ID / UID copy badge */}
                        {user?.id && (
                          <div className="pt-1 flex items-center gap-2">
                            <button
                              onClick={() => handleCopy(user.id, "account-uid")}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800 hover:border-slate-700 text-[11px] font-mono text-slate-400 hover:text-slate-200 transition cursor-pointer"
                              title="Click to copy Developer Account ID"
                            >
                              <Fingerprint className="w-3.5 h-3.5 text-indigo-400" />
                              <span>UID: {user.id.slice(0, 10)}...{user.id.slice(-4)}</span>
                              {copiedId === "account-uid" ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3 text-slate-500" />
                              )}
                            </button>
                            {copiedId === "account-uid" && (
                              <span className="text-[11px] text-emerald-400 animate-fade-in font-medium">
                                Copied!
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Quick Action Buttons */}
                    <div className="flex items-center gap-3 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-800/80">
                      <button
                        type="button"
                        onClick={() => setLogoutModalOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-rose-500/40 text-slate-300 hover:text-rose-400 text-xs font-semibold transition cursor-pointer shadow-sm"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>

                  {/* Telemetry Stats Bar */}
                  <div className="mt-7 pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/60">
                      <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                        <Globe2 className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Total Domains</span>
                      </div>
                      <div className="text-lg font-black text-white">{subdomains.length}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{liveDomainsCount} live &amp; routed</div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/60">
                      <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                        <Activity className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Live DNS Records</span>
                      </div>
                      <div className="text-lg font-black text-emerald-400">{liveDomainsCount}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{pendingDomainsCount} pending approval</div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/60">
                      <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Security Protocol</span>
                      </div>
                      <div className="text-lg font-black text-slate-200">TLS 1.3 / Bcrypt</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Email OTP verified</div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/60">
                      <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        <span>Developer Tier</span>
                      </div>
                      <div className="text-lg font-black text-white">Tier 1 Pro</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Unlimited subdomains</div>
                    </div>
                  </div>
                </div>

                {/* 2. MAIN WORKSPACE: 2-COLUMN SETTINGS GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* CARD 1: GENERAL DEVELOPER IDENTITY */}
                  <div className="p-7 rounded-3xl bg-[#0c1222] border border-slate-800/90 shadow-xl space-y-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <h2 className="text-base font-bold text-white">Developer Identity</h2>
                          <p className="text-xs text-slate-400">
                            Manage your display name and public platform profile.
                          </p>
                        </div>
                      </div>

                      <form onSubmit={handleUpdateName} id="profile-name-form" className="space-y-5 mt-5">
                        {/* Display Name */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-slate-300 tracking-wide flex items-center gap-1.5">
                              <span>Display Name</span>
                            </label>
                            <span className="text-[11px] text-slate-500 font-mono">
                              {profileName.length}/80 chars
                            </span>
                          </div>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                              <User className="w-4 h-4" />
                            </div>
                            <input
                              type="text"
                              required
                              maxLength={80}
                              value={profileName}
                              onChange={(e) => setProfileName(e.target.value)}
                              placeholder="e.g. Alex Turing"
                              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm transition font-medium"
                            />
                          </div>
                          <p className="text-[11px] text-slate-400">
                            This name will be displayed across your console and subdomain registries.
                          </p>
                        </div>

                        {/* Registered Email (Locked) */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-slate-300 tracking-wide flex items-center gap-1.5">
                              <span>Registered Account Email</span>
                            </label>
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                              <CheckCircle2 className="w-3 h-3" />
                              Verified &amp; Permanent
                            </span>
                          </div>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                              <Mail className="w-4 h-4" />
                            </div>
                            <input
                              type="email"
                              disabled
                              value={user?.email || ""}
                              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60 text-slate-400 text-sm font-mono cursor-not-allowed select-all"
                            />
                            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-500">
                              <Lock className="w-3.5 h-3.5" />
                            </div>
                          </div>
                          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2 leading-relaxed">
                            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                            <span>
                              Subdomain delegations and ownership certificates are cryptographically bound to this email address.
                            </span>
                          </div>
                        </div>
                      </form>
                    </div>

                    <div className="pt-4 border-t border-slate-800">
                      <button
                        type="submit"
                        form="profile-name-form"
                        disabled={profileSaving || profileName.trim() === user?.name}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:via-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {profileSaving ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Saving Changes...</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            <span>Save Profile Changes</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* CARD 2: SECURITY & PASSWORD MANAGEMENT */}
                  <div className="p-7 rounded-3xl bg-[#0c1222] border border-slate-800/90 shadow-xl space-y-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                          <KeyRound className="w-5 h-5" />
                        </div>
                        <div>
                          <h2 className="text-base font-bold text-white">Security &amp; Password</h2>
                          <p className="text-xs text-slate-400">
                            Update your master password to protect your DNS records.
                          </p>
                        </div>
                      </div>

                      <form onSubmit={handleChangePassword} id="password-form" className="space-y-4 mt-5">
                        {/* Current Password */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-300 tracking-wide">
                            Current Password
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                              <KeyRound className="w-4 h-4" />
                            </div>
                            <input
                              type={showCurrentPass ? "text" : "password"}
                              required
                              placeholder="Enter existing password"
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm transition"
                            />
                            <button
                              type="button"
                              onClick={() => setShowCurrentPass(!showCurrentPass)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition cursor-pointer"
                              tabIndex={-1}
                            >
                              {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {/* New Password */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-slate-300 tracking-wide">
                              New Master Password
                            </label>
                            {newPassword && (
                              <span className={`text-[11px] font-bold ${strength.text}`}>
                                {strength.label}
                              </span>
                            )}
                          </div>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                              <Lock className="w-4 h-4" />
                            </div>
                            <input
                              type={showNewPass ? "text" : "password"}
                              required
                              minLength={6}
                              placeholder="Create strong new password"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm transition"
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPass(!showNewPass)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition cursor-pointer"
                              tabIndex={-1}
                            >
                              {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>

                          {/* Password Strength Visual Progress Bar */}
                          {newPassword && (
                            <div className="space-y-1.5 pt-1">
                              <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
                                <div
                                  className={`h-full transition-all duration-300 ${strength.color}`}
                                  style={{ width: `${strength.percent}%` }}
                                />
                              </div>

                              {/* Rules checklist pills */}
                              <div className="flex flex-wrap gap-2 pt-1 text-[10px]">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md ${isLengthValid ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-slate-900 text-slate-500"}`}>
                                  {isLengthValid ? <Check className="w-3 h-3" /> : "•"} 6+ characters
                                </span>
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md ${hasUpperLower ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-slate-900 text-slate-500"}`}>
                                  {hasUpperLower ? <Check className="w-3 h-3" /> : "•"} Upper &amp; lowercase
                                </span>
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md ${hasNumSymbol ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-slate-900 text-slate-500"}`}>
                                  {hasNumSymbol ? <Check className="w-3 h-3" /> : "•"} Number or symbol
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-slate-300 tracking-wide">
                              Confirm New Password
                            </label>
                            {passwordsMatch && (
                              <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Passwords Match
                              </span>
                            )}
                            {passwordsMismatch && (
                              <span className="text-[11px] font-bold text-rose-400 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" /> Passwords Mismatch
                              </span>
                            )}
                          </div>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                              <ShieldCheck className="w-4 h-4" />
                            </div>
                            <input
                              type="password"
                              required
                              minLength={6}
                              placeholder="Confirm new password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border ${passwordsMismatch ? "border-rose-500 focus:border-rose-400 focus:ring-rose-500" : passwordsMatch ? "border-emerald-500/60 focus:border-emerald-400 focus:ring-emerald-400" : "border-slate-800 focus:border-cyan-400 focus:ring-cyan-400"} text-white placeholder-slate-600 focus:outline-none focus:ring-1 text-sm transition`}
                            />
                          </div>
                        </div>
                      </form>
                    </div>

                    <div className="pt-4 border-t border-slate-800">
                      <button
                        type="submit"
                        form="password-form"
                        disabled={profileSaving || !currentPassword || !newPassword || !confirmPassword || passwordsMismatch}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:via-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {profileSaving ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Updating Password...</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-4 h-4" />
                            <span>Update Master Password</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* 3. ACTIVE SESSION & CRYPTOGRAPHIC TELEMETRY */}
                <div className="p-7 rounded-3xl bg-[#0c1222] border border-slate-800 space-y-5 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-white">Active Session &amp; Cryptographic Protection</h2>
                        <p className="text-xs text-slate-400">Real-time platform safeguards for this developer console.</p>
                      </div>
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 self-start sm:self-auto">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      All Protections Active
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                      <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold">
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>Authentication</span>
                      </div>
                      <p className="text-xs text-slate-200 font-medium">Email OTP + Bcrypt Hash</p>
                      <p className="text-[10px] text-slate-500">Zero plain-text password storage</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                      <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Session Token</span>
                      </div>
                      <p className="text-xs text-slate-200 font-medium">HTTP-Only Lax Cookie</p>
                      <p className="text-[10px] text-slate-500">Protected against XSS &amp; token theft</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                      <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold">
                        <Shield className="w-3.5 h-3.5" />
                        <span>Attack Defense</span>
                      </div>
                      <p className="text-xs text-slate-200 font-medium">Rate Limiting &amp; Honeypot</p>
                      <p className="text-[10px] text-slate-500">Auto-blocks automated bots &amp; brute-force</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                      <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                        <Globe2 className="w-3.5 h-3.5" />
                        <span>Edge DNS Shield</span>
                      </div>
                      <p className="text-xs text-slate-200 font-medium">Cloudflare Anycast</p>
                      <p className="text-[10px] text-slate-500">Global DDoS &amp; DNSSEC enabled</p>
                    </div>
                  </div>
                </div>

                {/* 4. DANGER ZONE & SESSION CONTROL */}
                <div className="p-7 rounded-3xl bg-gradient-to-r from-rose-950/20 via-[#0c1222] to-slate-950/60 border border-rose-900/30 space-y-5 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-rose-300 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-400" />
                        Session &amp; Account Control
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
                        Terminating your session clears your encrypted authentication cookie. Your active subdomains will continue resolving uninterrupted on the edge network.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setLogoutModalOpen(true)}
                      className="px-5 py-2.5 rounded-xl bg-rose-600/10 hover:bg-rose-600 border border-rose-500/30 hover:border-rose-500 text-rose-300 hover:text-white text-xs font-bold transition flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-lg shadow-rose-950/20"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out Console</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
        </main>
      </div>

      {/* ================= MODALS ================= */}

      {/* Logout Confirmation Modal */}
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
                <h3 className="text-lg font-bold text-white">Sign Out of Console?</h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  Are you sure you want to end your current session? You will need to sign back in to manage your domains.
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

      {/* Delete Subdomain Confirmation Modal */}
      <AnimatePresence>
        {deleteSubdomainModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm rounded-2xl bg-[#0c1222] border border-slate-800 p-6 shadow-2xl space-y-4 text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">Delete Subdomain?</h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  Are you sure you want to remove{" "}
                  <strong className="text-rose-300 font-mono">
                    {deleteSubdomainModal.subdomain}.is-a-coder.in
                  </strong>
                  ? DNS resolution will be terminated.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteSubdomainModal(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition cursor-pointer"
                >
                  Keep Subdomain
                </button>
                <button
                  type="button"
                  onClick={handleDeleteSubdomain}
                  disabled={deleteLoading}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-rose-600/20 disabled:opacity-50"
                >
                  {deleteLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <span>Delete Domain</span>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Claim Subdomain Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-2xl bg-[#0c1222] border border-slate-800 p-6 sm:p-7 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center p-1">
                      <FaviconIcon className="w-5 h-5" />
                    </div>
                    <span>Claim Your Subdomain</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Choose a prefix and configure your DNS routing target
                  </p>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {formError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSubmitRequest} className="space-y-4">
                {/* Desired Subdomain */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Desired Subdomain *
                  </label>
                  <div className="flex items-center">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        required
                        placeholder="yourname"
                        value={subdomainName}
                        onChange={(e) =>
                          setSubdomainName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
                        }
                        className="w-full px-3.5 py-2.5 rounded-l-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 text-sm font-mono"
                      />
                    </div>
                    <span className="px-3.5 py-2.5 rounded-r-xl bg-slate-900 border-y border-r border-slate-800 text-slate-400 text-sm font-mono select-none">
                      .is-a-coder.in
                    </span>
                  </div>

                  {/* Availability feedback */}
                  {checkingAvailability && (
                    <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                      <Loader2 className="w-3 h-3 animate-spin text-cyan-400" />
                      Checking registry availability...
                    </p>
                  )}
                  {!checkingAvailability && availabilityResult && (
                    <div className="mt-1">
                      {availabilityResult.available ? (
                        <p className="text-xs text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>&quot;{subdomainName}.is-a-coder.in&quot; is available!</span>
                        </p>
                      ) : (
                        <p className="text-xs text-rose-400 flex items-center gap-1.5">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>{availabilityResult.error}</span>
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Record Type */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    DNS Record Type *
                  </label>
                  <select
                    value={recordType}
                    onChange={(e) =>
                      setRecordType(e.target.value as "CNAME" | "A" | "AAAA" | "TXT")
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-400 text-sm"
                  >
                    <option value="CNAME">CNAME (GitHub Pages, Vercel, Netlify, Render)</option>
                    <option value="A">A Record (IPv4 Address)</option>
                    <option value="AAAA">AAAA Record (IPv6 Address)</option>
                    <option value="TXT">TXT Record (Verification)</option>
                  </select>
                </div>

                {/* Destination Target */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Destination Target *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={
                      recordType === "CNAME"
                        ? "e.g. yourname.github.io or cname.vercel-dns.com"
                        : "e.g. 185.199.108.153"
                    }
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 text-sm font-mono"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Project Description (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Personal developer portfolio & open-source projects..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 text-sm resize-none"
                  />
                </div>

                {/* Buttons */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-xs font-medium transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={
                      formSubmitting ||
                      !subdomainName ||
                      !target ||
                      availabilityResult?.available === false
                    }
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2 cursor-pointer"
                  >
                    {formSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <span>Submit Claim</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DNS Setup Guide Modal */}
      <AnimatePresence>
        {guideModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-2xl bg-[#0c1222] border border-slate-800 p-6 sm:p-7 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-cyan-400" />
                  Link {guideModal.subdomain}.is-a-coder.in
                </h3>
                <button
                  onClick={() => setGuideModal(null)}
                  className="p-1 rounded text-slate-400 hover:text-white transition cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-xs text-slate-300">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <p className="font-semibold text-cyan-300">1. On GitHub Pages:</p>
                  <ul className="list-disc pl-4 space-y-1 text-slate-400">
                    <li>Go to your GitHub repo → <strong>Settings</strong> → <strong>Pages</strong>.</li>
                    <li>Under <strong>Custom domain</strong>, enter:</li>
                  </ul>
                  <div className="p-2 rounded bg-slate-900 font-mono text-cyan-400 text-center font-bold">
                    {guideModal.subdomain}.is-a-coder.in
                  </div>
                  <p className="text-slate-400">Click <strong>Save</strong> and check &quot;Enforce HTTPS&quot;.</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <p className="font-semibold text-cyan-300">2. On Vercel:</p>
                  <ul className="list-disc pl-4 space-y-1 text-slate-400">
                    <li>Go to your Vercel Project → <strong>Settings</strong> → <strong>Domains</strong>.</li>
                    <li>Add: <code className="text-cyan-400">{guideModal.subdomain}.is-a-coder.in</code></li>
                  </ul>
                </div>
              </div>

              <div className="text-right pt-2 border-t border-slate-800">
                <button
                  onClick={() => setGuideModal(null)}
                  className="px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 text-xs font-semibold transition cursor-pointer"
                >
                  Got It!
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Account Logged In On Another Device (Concurrent Session Invalidation) Modal */}
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
              {/* Top ambient glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-amber-500/15 blur-3xl pointer-events-none" />

              {/* Warning Icon with subtle pulse */}
              <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-5 text-amber-400 relative">
                <div className="absolute inset-0 rounded-2xl bg-amber-400/10 animate-ping opacity-75" />
                <Laptop className="w-8 h-8 relative z-10" />
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-semibold mb-3">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Security Notice • Single Session Policy</span>
              </div>

              <h2 className="text-xl font-bold text-white tracking-tight">
                Account Logged In On Another Device
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 mt-2.5 leading-relaxed">
                You have been automatically signed out because this account was just signed into from another computer, browser, or device.
              </p>

              <div className="mt-4 p-3.5 rounded-xl bg-slate-900/80 border border-white/5 text-left text-xs text-slate-400 space-y-1.5">
                <div className="flex items-center gap-2 text-slate-300 font-medium">
                  <Info className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Why was I logged out?</span>
                </div>
                <p className="pl-6 text-[11px] text-slate-400 leading-relaxed">
                  To protect developer DNS configurations and API credentials, our platform allows only one active session per account at a time.
                </p>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/login?reason=session_replaced"
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2 text-center cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5 text-slate-950" />
                  <span>Sign In Again On This Device</span>
                </Link>
                <Link
                  href="/"
                  className="py-3 px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 font-medium text-xs transition text-center cursor-pointer"
                >
                  Homepage
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
