"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe2,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  Copy,
  Check,
  ExternalLink,
  Trash2,
  AlertTriangle,
  Loader2,
  Sparkles,
  Info,
  Filter,
  ShieldCheck,
  GitFork,
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  X,
} from "lucide-react";
import { useAdmin, AdminRequestItem } from "../AdminContext";

export default function SubdomainRequestsManagementPage() {
  const {
    requests,
    stats,
    handleApprove,
    handleReject,
    handleDeleteRequest,
    handleCopy,
    copiedId,
    actionLoading,
  } = useAdmin();

  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "rejected" | "all">("pending");
  const [searchQuery, setSearchQuery] = useState("");

  // Rejection modal state
  const [rejectingItem, setRejectingItem] = useState<AdminRequestItem | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // Delete modal state (Password protected)
  const [deletingItem, setDeletingItem] = useState<AdminRequestItem | null>(null);
  const [deletePassword, setDeletePassword] = useState("");
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const filteredRequests = requests.filter((item) => {
    if (activeTab !== "all" && item.status !== activeTab) return false;
    if (searchQuery.trim() === "") return true;
    const q = searchQuery.toLowerCase();
    return (
      item.subdomain.toLowerCase().includes(q) ||
      item.userEmail.toLowerCase().includes(q) ||
      item.userName.toLowerCase().includes(q) ||
      item.target.toLowerCase().includes(q) ||
      item.recordType.toLowerCase().includes(q)
    );
  });

  const confirmRejection = async () => {
    if (!rejectingItem) return;
    await handleReject(rejectingItem._id, rejectReason);
    setRejectingItem(null);
    setRejectReason("");
  };

  const handleOpenDelete = (item: AdminRequestItem) => {
    setDeletingItem(item);
    setDeletePassword("");
    setShowDeletePassword(false);
    setDeleteError(null);
  };

  const confirmDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deletingItem) return;
    if (!deletePassword.trim()) {
      setDeleteError("Please enter your administrator password to proceed.");
      return;
    }

    setDeleteLoading(true);
    setDeleteError(null);
    try {
      const res = await handleDeleteRequest(deletingItem._id, deletePassword);
      if (!res.success) {
        setDeleteError(res.error || "Failed to delete subdomain record.");
      } else {
        setDeletingItem(null);
        setDeletePassword("");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error deleting record";
      setDeleteError(msg);
    } finally {
      setDeleteLoading(false);
    }
  };

  const quickReasons = [
    "Target host unreachable / DNS does not resolve",
    "Reserved brand or system prefix",
    "Invalid record format or IP address",
    "Violation of acceptable developer policy",
    "Incomplete documentation / missing repository link",
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Globe2 className="w-6 h-6 text-indigo-400" />
            Subdomain Requests & Reviews
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Review developer DNS applications, inspect routing targets, and publish GoDaddy records.
          </p>
        </div>

        {/* Status Count Pills */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-1.5 sm:gap-2 bg-[#0c1222] p-1.5 rounded-xl border border-slate-800 overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === "pending"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Pending</span>
            <span className="px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-300 text-[10px]">
              {stats.pending}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("approved")}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === "approved"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Approved</span>
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-400/20 text-emerald-300 text-[10px]">
              {stats.approved}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("rejected")}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === "rejected"
                ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <XCircle className="w-3.5 h-3.5 text-rose-400" />
            <span>Rejected</span>
            <span className="px-1.5 py-0.2 rounded-full bg-rose-400/20 text-rose-300 text-[10px]">
              {stats.rejected}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("all")}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 cursor-pointer ${
              activeTab === "all"
                ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
                : "text-slate-400 hover:text-white"
            }`}
          >
            All ({stats.total})
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by subdomain, target IP/host, developer name, email..."
          className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#0c1222]/80 border border-slate-800 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500/60 transition shadow-inner"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
          >
            Clear
          </button>
        )}
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="rounded-2xl bg-[#0c1222]/60 border border-slate-800 p-12 text-center">
            <Globe2 className="w-12 h-12 text-slate-400 mx-auto mb-3 opacity-60" />
            <h3 className="text-base font-semibold text-white">No subdomain requests found</h3>
            <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
              {searchQuery
                ? "No applications matched your search filters. Try clearing the search query."
                : `There are currently no ${activeTab === "all" ? "" : activeTab} subdomain records.`}
            </p>
          </div>
        ) : (
          filteredRequests.map((item) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              key={item._id}
              className="rounded-2xl bg-[#0c1222]/90 border border-slate-800 hover:border-slate-700/80 p-5 md:p-6 transition backdrop-blur-md space-y-4 shadow-xl"
            >
              {/* Header row of card */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800/60">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-lg md:text-xl font-bold text-white tracking-tight">
                      {item.subdomain}.is-a-coder.in
                    </span>
                    <span className="px-2.5 py-0.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-mono text-xs font-bold">
                      {item.recordType}
                    </span>

                    {/* Status Badge */}
                    {item.status === "pending" && (
                      <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Pending Review
                      </span>
                    )}
                    {item.status === "approved" && (
                      <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Approved & Live
                      </span>
                    )}
                    {item.status === "rejected" && (
                      <span className="px-2.5 py-0.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-1">
                        <XCircle className="w-3 h-3" /> Rejected
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-400 flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span>
                      Developer: <strong className="text-slate-200">{item.userName}</strong> ({item.userEmail})
                    </span>
                    <span>&bull;</span>
                    <span>
                      Requested: {new Date(item.createdAt).toLocaleDateString()} at{" "}
                      {new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>

                {/* Top Action Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  {item.status === "pending" && (
                    <>
                      <button
                        disabled={actionLoading === item._id}
                        onClick={() => handleApprove(item._id)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
                      >
                        {actionLoading === item._id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        )}
                        Approve
                      </button>

                      <button
                        disabled={actionLoading === item._id}
                        onClick={() => {
                          setRejectingItem(item);
                          setRejectReason("");
                        }}
                        className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-rose-950/60 border border-slate-700 hover:border-rose-500/40 text-rose-300 text-xs font-medium transition active:scale-95 flex items-center gap-1.5"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Reject
                      </button>
                    </>
                  )}

                  {item.status === "approved" && (
                    <button
                      disabled={actionLoading === item._id}
                      onClick={() => {
                        setRejectingItem(item);
                        setRejectReason("");
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-300 text-xs transition flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Suspend
                    </button>
                  )}

                  {item.status === "rejected" && (
                    <button
                      disabled={actionLoading === item._id}
                      onClick={() => handleApprove(item._id)}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-emerald-400 text-xs transition flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Re-Approve
                    </button>
                  )}

                  <button
                    onClick={() => handleOpenDelete(item)}
                    title="Delete Request"
                    className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/30 transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Target & GoDaddy Snippet Box */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Routing & Target Details */}
                <div className="rounded-xl bg-slate-950/70 border border-slate-800/80 p-4 space-y-2 text-xs">
                  <span className="font-semibold text-slate-300 uppercase tracking-wider text-[10px] block">
                    Routing & Target Configuration
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Target Host / IP:</span>
                    <span className="font-mono text-white font-semibold">{item.target}</span>
                  </div>
                  {item.description && (
                    <div className="pt-1 text-slate-300 border-t border-slate-800/50">
                      <span className="text-slate-400">Purpose:</span> {item.description}
                    </div>
                  )}
                  {item.repoUrl && (
                    <div className="pt-1 flex items-center gap-1.5 text-indigo-400">
                      <ExternalLink className="w-3.5 h-3.5" />
                      <a
                        href={item.repoUrl.startsWith("http") ? item.repoUrl : `https://${item.repoUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline truncate"
                      >
                        {item.repoUrl}
                      </a>
                    </div>
                  )}
                  {item.status === "rejected" && item.rejectionReason && (
                    <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 mt-2">
                      <strong>Rejection Reason:</strong> {item.rejectionReason}
                    </div>
                  )}
                </div>

                {/* GoDaddy 1-Click DNS Snippet */}
                <div className="rounded-xl bg-gradient-to-br from-[#0c1222] to-slate-950 border border-indigo-500/20 p-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-indigo-300 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-indigo-400" />
                      GoDaddy DNS Manager Record
                    </span>
                    <button
                      onClick={() =>
                        handleCopy(
                          `Type: ${item.recordType}\nName: ${item.subdomain}\nValue: ${item.target}\nTTL: 1/2 Hour`,
                          item._id
                        )
                      }
                      className="px-2.5 py-1 rounded bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[11px] font-medium flex items-center gap-1 transition"
                    >
                      {copiedId === item._id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Snippet</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 font-mono text-[11px] bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                    <div>
                      <div className="text-[9px] text-slate-400 uppercase font-sans">Type</div>
                      <div className="text-indigo-400 font-bold">{item.recordType}</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-slate-400 uppercase font-sans">Name</div>
                      <div className="text-white truncate" title={item.subdomain}>
                        {item.subdomain}
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] text-slate-400 uppercase font-sans">Value</div>
                      <div className="text-emerald-400 truncate" title={item.target}>
                        {item.target}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* ================= REJECTION MODAL ================= */}
      <AnimatePresence>
        {rejectingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0c1222] border border-rose-500/30 rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3 text-rose-400">
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Decline Subdomain Request</h3>
                  <p className="text-xs text-slate-400">
                    Rejecting <strong className="text-slate-200">{rejectingItem.subdomain}.is-a-coder.in</strong>
                  </p>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1.5 block">
                  Quick Reason Templates:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {quickReasons.map((reason) => (
                    <button
                      key={reason}
                      type="button"
                      onClick={() => setRejectReason(reason)}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300 hover:text-white hover:border-slate-700 transition text-left"
                    >
                      {reason}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">
                  Custom Rejection Feedback for Developer:
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                  placeholder="Explain why this request was declined so the developer can correct and resubmit..."
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-rose-500/50"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setRejectingItem(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-slate-300 text-xs font-medium hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmRejection}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/20 transition"
                >
                  Confirm Rejection
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= DELETE MODAL (PASSWORD AUTHENTICATED) ================= */}
      <AnimatePresence>
        {deletingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0c1222] border border-rose-500/30 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3 text-rose-400">
                  <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Delete Subdomain Record</h3>
                    <p className="text-xs text-slate-400">Requires administrator authentication</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDeletingItem(null)}
                  className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300">
                Are you sure you want to permanently delete the request for{" "}
                <strong className="text-white">{deletingItem.subdomain}.is-a-coder.in</strong> owned by{" "}
                <span className="text-indigo-400 font-mono">{deletingItem.userEmail}</span>?
              </div>

              {deleteError && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{deleteError}</span>
                </div>
              )}

              <form onSubmit={confirmDelete} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-rose-400" />
                    <span>Confirm Admin Password</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showDeletePassword ? "text" : "password"}
                      required
                      autoFocus
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      placeholder="Enter your administrator password"
                      className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-rose-500/60"
                    />
                    <button
                      type="button"
                      onClick={() => setShowDeletePassword(!showDeletePassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    >
                      {showDeletePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Please re-authenticate with your administrator password to authorize deleting this subdomain.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setDeletingItem(null)}
                    className="px-4 py-2 rounded-xl bg-slate-900 text-slate-300 text-xs font-medium hover:bg-slate-800 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={deleteLoading || !deletePassword.trim()}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/20 transition flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {deleteLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Verifying & Deleting...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Authorize & Delete</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
