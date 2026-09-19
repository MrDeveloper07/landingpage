"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  ShieldAlert,
  Search,
  Activity,
  Globe2,
  Users,
  Lock,
  Server,
  Filter,
  Calendar,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { useAdmin } from "../AdminContext";

export default function AuditManagementPage() {
  const { auditLogs, loading } = useAdmin();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<
    "all" | "subdomain" | "user" | "security" | "system"
  >("all");

  const filteredLogs = auditLogs.filter((log) => {
    if (categoryFilter !== "all" && log.category !== categoryFilter) return false;
    if (searchQuery.trim() === "") return true;
    const q = searchQuery.toLowerCase();
    return (
      log.action.toLowerCase().includes(q) ||
      log.actorEmail.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q) ||
      (log.target && log.target.toLowerCase().includes(q))
    );
  });

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case "subdomain":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-[11px] font-medium">
            <Globe2 className="w-3 h-3 text-indigo-400" /> Subdomain
          </span>
        );
      case "user":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[11px] font-medium">
            <Users className="w-3 h-3 text-cyan-400" /> User
          </span>
        );
      case "security":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px] font-medium">
            <ShieldAlert className="w-3 h-3 text-rose-400" /> Security
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-[11px] font-medium">
            <Server className="w-3 h-3 text-slate-400" /> System
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-indigo-400" />
            Audit & Security Logs
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Immutable audit trail of all subdomain approvals, rejections, user role modifications, and administrative events.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 bg-[#0c1222] p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setCategoryFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              categoryFilter === "all"
                ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
                : "text-slate-400 hover:text-white"
            }`}
          >
            All ({auditLogs.length})
          </button>
          <button
            onClick={() => setCategoryFilter("subdomain")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              categoryFilter === "subdomain"
                ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Globe2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Subdomain</span>
          </button>
          <button
            onClick={() => setCategoryFilter("user")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              categoryFilter === "user"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span>Users</span>
          </button>
          <button
            onClick={() => setCategoryFilter("security")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              categoryFilter === "security"
                ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>Security</span>
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
          placeholder="Search by action, actor email, target subdomain, or details..."
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

      {/* Audit Log Table */}
      <div className="rounded-2xl bg-[#0c1222]/90 border border-slate-800 overflow-hidden shadow-xl backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Action Event</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Actor</th>
                <th className="py-3.5 px-4">Target / Description</th>
                <th className="py-3.5 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 font-sans text-xs">
                    <Activity className="w-10 h-10 text-slate-400 mx-auto mb-2 opacity-60" />
                    No audit records matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-900/40 transition">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-white uppercase tracking-tight">
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-sans">
                      {getCategoryBadge(log.category)}
                    </td>

                    <td className="py-3.5 px-4 text-slate-300">
                      {log.actorEmail}
                    </td>

                    <td className="py-3.5 px-4 font-sans text-slate-300 max-w-md">
                      <div>
                        {log.target && (
                          <span className="font-mono text-indigo-300 font-semibold mr-1.5">
                            [{log.target}]
                          </span>
                        )}
                        <span>{log.details}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right text-slate-400">
                      <div>{new Date(log.createdAt).toLocaleDateString()}</div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(log.createdAt).toLocaleTimeString()}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
