"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Search,
  Trash2,
  AlertTriangle,
  Loader2,
  Crown,
  Globe2,
  Calendar,
  CheckCircle2,
  Clock,
  Pencil,
  FileText,
  Activity,
  X,
  Check,
  ExternalLink,
  ShieldCheck,
  User as UserIcon,
  Mail,
  Sliders,
  Eye,
  EyeOff,
  Lock,
} from "lucide-react";
import { useAdmin, AdminUserItem, AuditLogItem } from "../AdminContext";

export default function UserManagementPage() {
  const {
    users,
    stats,
    requests,
    auditLogs,
    handleUpdateUser,
    handleDeleteUser,
    actionLoading,
  } = useAdmin();

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "user">("all");

  // Edit User Modal State
  const [editingUser, setEditingUser] = useState<AdminUserItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editMaxSubdomains, setEditMaxSubdomains] = useState<number>(3);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSaving, setEditSaving] = useState(false);

  // User Logs & Activity Modal State
  const [logsUser, setLogsUser] = useState<AdminUserItem | null>(null);

  // Delete User Modal State (Password Protected)
  const [deleteModalUser, setDeleteModalUser] = useState<AdminUserItem | null>(null);
  const [deletePassword, setDeletePassword] = useState("");
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const filteredUsers = users.filter((u) => {
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    if (searchQuery.trim() === "") return true;
    const q = searchQuery.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  const handleOpenEdit = (user: AdminUserItem) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditMaxSubdomains(user.maxSubdomains || 3);
    setEditError(null);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    if (!editName.trim()) {
      setEditError("Name cannot be empty.");
      return;
    }
    if (!editEmail.trim()) {
      setEditError("Email cannot be empty.");
      return;
    }
    if (editMaxSubdomains < 1) {
      setEditError("Subdomain quota must be at least 1.");
      return;
    }

    setEditSaving(true);
    setEditError(null);
    try {
      const res = await handleUpdateUser(editingUser._id, {
        name: editName.trim(),
        email: editEmail.trim(),
        maxSubdomains: Number(editMaxSubdomains) || 3,
      });

      if (!res.success) {
        setEditError(res.error || "Failed to update user profile");
      } else {
        setEditingUser(null);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving user";
      setEditError(msg);
    } finally {
      setEditSaving(false);
    }
  };

  const handleOpenDelete = (user: AdminUserItem) => {
    setDeleteModalUser(user);
    setDeletePassword("");
    setShowDeletePassword(false);
    setDeleteError(null);
  };

  const confirmDeleteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deleteModalUser) return;
    if (!deletePassword) {
      setDeleteError("Please enter your administrator password to proceed.");
      return;
    }

    setDeleteLoading(true);
    setDeleteError(null);
    try {
      const res = await handleDeleteUser(deleteModalUser._id, deletePassword);
      if (!res.success) {
        setDeleteError(res.error || "Failed to delete user.");
      } else {
        setDeleteModalUser(null);
        setDeletePassword("");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error deleting user";
      setDeleteError(msg);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Get user-specific audit logs & subdomains
  const getUserAuditLogs = (email: string): AuditLogItem[] => {
    if (!email) return [];
    const lower = email.toLowerCase();
    return auditLogs.filter(
      (log) =>
        (log.actorEmail && log.actorEmail.toLowerCase() === lower) ||
        (log.target && log.target.toLowerCase() === lower) ||
        (log.details && log.details.toLowerCase().includes(lower))
    );
  };

  const getUserSubdomains = (userId: string) => {
    return requests.filter((r) => r.userId === userId);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-indigo-400" />
            User & Developer Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage developer accounts, inspect created subdomains, and view individual audit history.
          </p>
        </div>

        {/* Role Filter Pills */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-1.5 sm:gap-2 bg-[#0c1222] p-1.5 rounded-xl border border-slate-800 overflow-x-auto max-w-full">
          <button
            onClick={() => setRoleFilter("all")}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 cursor-pointer ${
              roleFilter === "all"
                ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
                : "text-slate-400 hover:text-white"
            }`}
          >
            All ({users.length})
          </button>
          <button
            onClick={() => setRoleFilter("admin")}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              roleFilter === "admin"
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-purple-400" />
            <span>Admins ({stats.adminUsers || users.filter((u) => u.role === "admin").length})</span>
          </button>
          <button
            onClick={() => setRoleFilter("user")}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 cursor-pointer ${
              roleFilter === "user"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Developers ({users.filter((u) => u.role === "user").length})
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
          placeholder="Search by user name or email address..."
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

      {/* Users Table */}
      <div className="rounded-2xl bg-[#0c1222]/90 border border-slate-800 overflow-hidden shadow-xl backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Developer</th>
                <th className="py-3.5 px-4">System Role</th>
                <th className="py-3.5 px-4">Subdomains</th>
                <th className="py-3.5 px-4">Registered On</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <Users className="w-10 h-10 text-slate-400 mx-auto mb-2 opacity-60" />
                    No users matching criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-900/40 transition">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-300 text-sm">
                          {u.name ? u.name.charAt(0).toUpperCase() : "U"}
                        </div>
                        <div>
                          <div className="font-semibold text-white text-sm">{u.name}</div>
                          <div className="text-slate-400 font-mono text-[11px]">{u.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      {u.role === "admin" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300 font-semibold text-[11px]">
                          <Crown className="w-3.5 h-3.5 text-purple-400" />
                          Administrator
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 font-medium text-[11px]">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          Developer
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 font-semibold text-xs">
                          {u.subdomainCount} / {u.maxSubdomains || 3} used
                        </span>
                        {u.approvedSubdomains > 0 && (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 text-xs">
                            {u.approvedSubdomains} active
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-4 text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Edit User Button (Only shown for developer accounts) */}
                        {u.role !== "admin" && (
                          <button
                            disabled={actionLoading === u._id}
                            onClick={() => handleOpenEdit(u)}
                            title="Edit Developer Profile & Subdomain Quota"
                            className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-indigo-500/50 text-slate-300 hover:text-white text-xs font-medium transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Edit</span>
                          </button>
                        )}

                        {/* View Logs Button */}
                        <button
                          onClick={() => setLogsUser(u)}
                          title="View User Activity & Audit History"
                          className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-cyan-500/50 text-slate-300 hover:text-white text-xs font-medium transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Activity className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Logs</span>
                        </button>

                        {/* Delete User Button */}
                        <button
                          disabled={actionLoading === u._id}
                          onClick={() => handleOpenDelete(u)}
                          title="Delete User"
                          className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/30 transition disabled:opacity-50 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= EDIT USER MODAL ================= */}
      <AnimatePresence>
        {editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0c1222] border border-indigo-500/30 rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3 text-indigo-400">
                  <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                    <Pencil className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Edit User Account</h3>
                    <p className="text-xs text-slate-400">Update developer profile details and subdomain quota</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {editError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{editError}</span>
                </div>
              )}

              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1 block">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="E.g. Jane Doe"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500/60"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1 block">Email Address</label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    placeholder="E.g. jane@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500/60"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-300">
                      Subdomain Quota Limit
                    </label>
                    <span className="text-[10px] text-indigo-400 font-medium">
                      Default: 3 free subdomains
                    </span>
                  </div>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={editMaxSubdomains}
                    onChange={(e) => setEditMaxSubdomains(Math.max(1, parseInt(e.target.value) || 1))}
                    placeholder="3"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500/60"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Increase this number to grant this developer additional subdomain slots beyond the default 3.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="px-4 py-2 rounded-xl bg-slate-900 text-slate-300 text-xs font-medium hover:bg-slate-800 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editSaving}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {editSaving ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= USER LOGS & ACTIVITY MODAL ================= */}
      <AnimatePresence>
        {logsUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0c1222] border border-cyan-500/30 rounded-2xl p-6 w-full max-w-2xl shadow-2xl space-y-4 max-h-[85vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3 text-cyan-400">
                  <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <span>Activity & Audit History</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-normal">
                        {logsUser.email}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">All actions, subdomain requests, and system events associated with this developer</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setLogsUser(null)}
                  className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* User Summary Snapshot */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-0.5">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Account Role</span>
                  <span className="font-semibold text-white capitalize">{logsUser.role}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-0.5">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Subdomain Quota</span>
                  <span className="font-semibold text-indigo-300">
                    {logsUser.subdomainCount} / {logsUser.maxSubdomains || 3} used ({logsUser.approvedSubdomains} live)
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-0.5">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Registration Date</span>
                  <span className="font-semibold text-slate-200">
                    {new Date(logsUser.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Scrollable Logs Area */}
              <div className="overflow-y-auto space-y-4 flex-1 pr-1">
                {/* Subdomain Records Section */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Globe2 className="w-3.5 h-3.5 text-indigo-400" />
                    Subdomains Owned
                  </h4>
                  {getUserSubdomains(logsUser._id).length === 0 ? (
                    <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/60 text-xs text-slate-400">
                      No subdomains requested by this account yet.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {getUserSubdomains(logsUser._id).map((sub) => (
                        <div
                          key={sub._id}
                          className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs flex items-center justify-between"
                        >
                          <div>
                            <div className="font-bold text-white">{sub.subdomain}.is-a-coder.in</div>
                            <div className="text-[10px] text-slate-400 font-mono truncate max-w-[150px]">
                              {sub.recordType} &bull; {sub.target}
                            </div>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                              sub.status === "approved"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                                : sub.status === "pending"
                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                                : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                            }`}
                          >
                            {sub.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Audit Logs Section */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-cyan-400" />
                      Recorded Audit Events ({getUserAuditLogs(logsUser.email).length})
                    </h4>
                    <Link
                      href={`/admin/audit`}
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium"
                    >
                      <span>Open Full Audit Room</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>

                  {getUserAuditLogs(logsUser.email).length === 0 ? (
                    <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/60 text-xs text-slate-400 text-center">
                      No explicit audit actions logged for this account yet.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {getUserAuditLogs(logsUser.email).map((log) => (
                        <div
                          key={log._id}
                          className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-indigo-300 uppercase tracking-tight text-[11px]">
                              {log.action}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {new Date(log.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-slate-300 text-[11px]">{log.details}</p>
                          <div className="text-[10px] text-slate-400 flex items-center gap-2">
                            <span>Actor: <strong className="text-slate-300">{log.actorEmail}</strong></span>
                            {log.target && (
                              <>
                                <span>&bull;</span>
                                <span>Target: <strong className="text-slate-300">{log.target}</strong></span>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setLogsUser(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-slate-300 text-xs font-medium hover:bg-slate-800 transition"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= DELETE USER MODAL (PASSWORD AUTHENTICATED) ================= */}
      <AnimatePresence>
        {deleteModalUser && (
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
                    <h3 className="text-base font-bold text-white">Delete User Account</h3>
                    <p className="text-xs text-slate-400">Requires administrator authentication</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDeleteModalUser(null)}
                  className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 space-y-1">
                <p className="font-semibold">Cascade Deletion Warning:</p>
                <p>
                  Deleting <strong className="text-white">{deleteModalUser.email}</strong> will permanently delete their account and all{" "}
                  {deleteModalUser.subdomainCount} requested subdomain(s).
                </p>
              </div>

              {deleteError && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{deleteError}</span>
                </div>
              )}

              <form onSubmit={confirmDeleteUser} className="space-y-4">
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
                    Please re-authenticate with your administrator password to authorize this destructive deletion.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setDeleteModalUser(null)}
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
