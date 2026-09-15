"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Globe2,
  CheckCircle2,
  Clock,
  XCircle,
  Copy,
  Check,
  Search,
  RefreshCw,
  Trash2,
  ExternalLink,
  LogOut,
  AlertTriangle,
  Loader2,
  Server,
  User,
  Sparkles,
  Info,
  ShieldAlert,
  Laptop,
  Lock,
} from "lucide-react";

interface AdminRequestItem {
  _id: string;
  userId: string;
  userName: string;
  userEmail: string;
  subdomain: string;
  recordType: "CNAME" | "A" | "AAAA" | "TXT";
  target: string;
  description?: string;
  repoUrl?: string;
  status: "pending" | "approved" | "rejected" | "suspended";
  rejectionReason?: string;
  createdAt: string;
}

interface StatsData {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<AdminRequestItem[]>([]);
  const [stats, setStats] = useState<StatsData>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "rejected" | "all">("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Rejection modal
  const [rejectingItem, setRejectingItem] = useState<AdminRequestItem | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [sessionReplacedModalOpen, setSessionReplacedModalOpen] = useState(false);

  const fetchAdminData = useCallback(async () => {
    try {
      setLoading(true);
      const authRes = await fetch("/api/auth/me");
      const authData = await authRes.json();

      if (authData.sessionTerminated || authData.reason === "session_replaced") {
        setSessionReplacedModalOpen(true);
        return;
      }

      if (!authRes.ok || !authData.authenticated) {
        router.push("/login");
        return;
      }

      if (authData.user.role !== "admin") {
        router.push("/dashboard");
        return;
      }

      const res = await fetch("/api/admin/requests");
      const data = await res.json();

      if (data.sessionTerminated || data.reason === "session_replaced") {
        setSessionReplacedModalOpen(true);
        return;
      }

      if (res.ok) {
        setRequests(data.requests || []);
        setStats(
          data.stats || {
            total: 0,
            pending: 0,
            approved: 0,
            rejected: 0,
          }
        );
      }
    } catch (err) {
      console.error("Admin Load Error:", err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  // Session Heartbeat for admin page
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
        // Offline / network glitch
      }
    };

    const interval = setInterval(checkActiveSession, 5000);
    const handleFocus = () => checkActiveSession();
    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, [sessionReplacedModalOpen]);

  // Copy helper for GoDaddy
  const handleCopyGoDaddy = (item: AdminRequestItem) => {
    const textToCopy = `Type: ${item.recordType}\nName: ${item.subdomain}\nValue: ${item.target}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(`godaddy-${item._id}`);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Quick copy single value
  const handleCopyValue = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Approve action
  const handleApprove = async (id: string) => {
    try {
      setActionLoading(id);
      const res = await fetch(`/api/admin/requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" }),
      });

      if (res.ok) {
        await fetchAdminData();
      }
    } catch (err) {
      console.error("Approve error:", err);
    } finally {
      setActionLoading(null);
    }
  };

  // Reject action
  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingItem) return;

    try {
      setActionLoading(rejectingItem._id);
      const res = await fetch(`/api/admin/requests/${rejectingItem._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "rejected",
          rejectionReason: rejectReason || "Rejected by administrator",
        }),
      });

      if (res.ok) {
        setRejectingItem(null);
        setRejectReason("");
        await fetchAdminData();
      }
    } catch (err) {
      console.error("Reject error:", err);
    } finally {
      setActionLoading(null);
    }
  };

  // Delete/Revoke action
  const handleDelete = async (id: string, subdomain: string) => {
    if (
      !confirm(
        `Are you sure you want to delete "${subdomain}.is-a-coder.in"? Remember to also remove it from GoDaddy DNS.`
      )
    ) {
      return;
    }

    try {
      setActionLoading(id);
      const res = await fetch(`/api/admin/requests/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await fetchAdminData();
      }
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  // Filter requests
  const filteredRequests = requests.filter((req) => {
    const matchesTab = activeTab === "all" ? true : req.status === activeTab;
    const matchesSearch =
      req.subdomain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.userName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mb-3" />
        <p className="text-sm text-slate-400">Loading Admin Control Center...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <header className="border-b border-white/10 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <Globe2 className="w-6 h-6 text-indigo-400" />
              <span className="font-bold text-lg bg-gradient-to-r from-indigo-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                is-a-coder.in
              </span>
            </Link>
            <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              Admin Control Center
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white transition"
            >
              User View
            </Link>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-rose-400 hover:border-rose-500/30 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* GoDaddy Helper Banner */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900 border border-indigo-500/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                GoDaddy Manual Workflow
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                1. Click <strong>&quot;📋 Copy for GoDaddy&quot;</strong> on any pending request.
                <br />
                2. In GoDaddy DNS, click <strong>Add Record</strong> and paste the Name &amp; Target.
                <br />
                3. Return here and click <strong>&quot;✅ Mark Approved&quot;</strong> to notify the user.
              </p>
            </div>
          </div>
          <a
            href="https://dcc.godaddy.com/manage-dns"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-xl bg-indigo-500/20 border border-indigo-500/40 hover:bg-indigo-500/30 text-indigo-300 font-semibold text-xs inline-flex items-center gap-1.5 shrink-0 transition"
          >
            <span>Open GoDaddy DNS</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10">
            <p className="text-xs text-slate-400 font-medium">Pending Requests</p>
            <div className="flex items-center justify-between mt-1">
              <p className="text-2xl font-bold text-amber-400">{stats.pending}</p>
              <Clock className="w-5 h-5 text-amber-400/50" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10">
            <p className="text-xs text-slate-400 font-medium">Active Subdomains</p>
            <div className="flex items-center justify-between mt-1">
              <p className="text-2xl font-bold text-emerald-400">{stats.approved}</p>
              <CheckCircle2 className="w-5 h-5 text-emerald-400/50" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10">
            <p className="text-xs text-slate-400 font-medium">Rejected</p>
            <div className="flex items-center justify-between mt-1">
              <p className="text-2xl font-bold text-rose-400">{stats.rejected}</p>
              <XCircle className="w-5 h-5 text-rose-400/50" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10">
            <p className="text-xs text-slate-400 font-medium">Total Requests</p>
            <div className="flex items-center justify-between mt-1">
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <Globe2 className="w-5 h-5 text-slate-500" />
            </div>
          </div>
        </div>

        {/* Control Box: Tabs & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex rounded-xl bg-slate-900 p-1 border border-white/10 overflow-x-auto">
            <button
              onClick={() => setActiveTab("pending")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === "pending"
                  ? "bg-amber-500/20 border border-amber-500/30 text-amber-300"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Pending ({stats.pending})</span>
            </button>
            <button
              onClick={() => setActiveTab("approved")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === "approved"
                  ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-300"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Active ({stats.approved})</span>
            </button>
            <button
              onClick={() => setActiveTab("rejected")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === "rejected"
                  ? "bg-rose-500/20 border border-rose-500/30 text-rose-300"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Rejected ({stats.rejected})</span>
            </button>
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === "all"
                  ? "bg-indigo-500/20 border border-indigo-500/30 text-indigo-300"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              All Requests ({stats.total})
            </button>
          </div>

          {/* Search bar & Refresh */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search subdomain, user, target..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 w-64"
              />
            </div>
            <button
              onClick={fetchAdminData}
              className="p-2 rounded-xl bg-slate-900 border border-white/10 text-slate-400 hover:text-white transition cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {filteredRequests.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-12 text-center">
              <Globe2 className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-300">
                No requests found in this view
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Switch tabs or clear your search query to see other records.
              </p>
            </div>
          ) : (
            filteredRequests.map((item) => (
              <div
                key={item._id}
                className="p-5 sm:p-6 rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur-xl shadow-lg hover:border-white/20 transition flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5"
              >
                {/* Left Side: Subdomain Info */}
                <div className="space-y-2.5 max-w-xl">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-lg font-bold font-mono text-cyan-300">
                      {item.subdomain}
                      <span className="text-slate-400">.is-a-coder.in</span>
                    </span>

                    <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-800 border border-white/10 text-indigo-300">
                      {item.recordType}
                    </span>

                    {item.status === "pending" && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 border border-amber-500/30 text-amber-400">
                        <Clock className="w-3 h-3" />
                        Pending
                      </span>
                    )}
                    {item.status === "approved" && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" />
                        Active
                      </span>
                    )}
                    {item.status === "rejected" && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 border border-rose-500/30 text-rose-400">
                        <XCircle className="w-3 h-3" />
                        Rejected
                      </span>
                    )}
                  </div>

                  {/* Target & Copy box */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400 font-medium">Points to:</span>
                    <span className="px-2 py-1 rounded bg-slate-950 font-mono text-slate-200 border border-white/5">
                      {item.target}
                    </span>
                    <button
                      onClick={() => handleCopyValue(item.target, `target-${item._id}`)}
                      className="text-slate-500 hover:text-cyan-400 transition"
                      title="Copy Target"
                    >
                      {copiedId === `target-${item._id}` ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Requester & Timestamp */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      <strong className="text-slate-300">{item.userName}</strong> (
                      {item.userEmail})
                    </span>
                    <span>
                      📅{" "}
                      {new Date(item.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  {/* Description & Repo */}
                  {(item.description || item.repoUrl) && (
                    <div className="pt-1 text-xs text-slate-400 space-y-1">
                      {item.description && <p>&ldquo;{item.description}&rdquo;</p>}
                      {item.repoUrl && (
                        <a
                          href={item.repoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-cyan-400 hover:underline"
                        >
                          <span>{item.repoUrl}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  )}

                  {/* Rejection reason if any */}
                  {item.rejectionReason && (
                    <p className="text-xs text-rose-400 bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
                      Reason: {item.rejectionReason}
                    </p>
                  )}
                </div>

                {/* Right Side: Action Buttons */}
                <div className="flex flex-wrap lg:flex-col items-end gap-2 shrink-0 border-t lg:border-t-0 border-white/10 pt-3 lg:pt-0">
                  {/* Copy for GoDaddy Button */}
                  <button
                    onClick={() => handleCopyGoDaddy(item)}
                    className="px-3.5 py-2 rounded-xl bg-indigo-500/15 border border-indigo-500/30 hover:bg-indigo-500/25 text-indigo-300 text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer"
                  >
                    {copiedId === `godaddy-${item._id}` ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-300 font-bold">Copied for GoDaddy!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-indigo-400" />
                        <span>📋 Copy for GoDaddy</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-2">
                    {item.status !== "approved" && (
                      <button
                        onClick={() => handleApprove(item._id)}
                        disabled={actionLoading === item._id}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition cursor-pointer disabled:opacity-50"
                      >
                        {actionLoading === item._id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                        <span>Mark Approved</span>
                      </button>
                    )}

                    {item.status !== "rejected" && (
                      <button
                        onClick={() => {
                          setRejectingItem(item);
                          setRejectReason("");
                        }}
                        disabled={actionLoading === item._id}
                        className="px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(item._id, item.subdomain)}
                      disabled={actionLoading === item._id}
                      className="p-2 rounded-xl bg-white/5 border border-white/10 hover:border-rose-500/30 hover:text-rose-400 text-slate-500 transition cursor-pointer"
                      title="Delete Record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Reject Reason Dialog */}
      <AnimatePresence>
        {rejectingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl bg-slate-900 border border-white/10 p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  Reject &quot;{rejectingItem.subdomain}.is-a-coder.in&quot;
                </h3>
                <button
                  onClick={() => setRejectingItem(null)}
                  className="p-1 rounded text-slate-400 hover:text-white transition cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleConfirmReject} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Rejection Reason (Visible to user)
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="e.g. Target CNAME is not pointing to an active repository, or trademark name collision."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-rose-400 text-xs resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setRejectingItem(null)}
                    className="px-3.5 py-2 rounded-xl bg-white/5 text-slate-400 hover:text-white text-xs font-medium transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition cursor-pointer"
                  >
                    Confirm Rejection
                  </button>
                </div>
              </form>
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
                You have been automatically signed out because this administrator account was just signed into from another computer, browser, or device.
              </p>

              <div className="mt-4 p-3.5 rounded-xl bg-slate-900/80 border border-white/5 text-left text-xs text-slate-400 space-y-1.5">
                <div className="flex items-center gap-2 text-slate-300 font-medium">
                  <Info className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Why was I logged out?</span>
                </div>
                <p className="pl-6 text-[11px] text-slate-400 leading-relaxed">
                  To protect administrative controls and platform security, only one active session per account is permitted at a time.
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
