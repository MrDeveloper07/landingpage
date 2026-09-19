"use client";

import React, { useState } from "react";
import {
  Globe2,
  Plus,
  CheckCircle2,
  Clock,
  XCircle,
  Code2,
  Copy,
  Check,
  Search,
  LayoutGrid,
  List as ListIcon,
  ArrowUpRight,
  Trash2,
} from "lucide-react";
import { useDashboard } from "./DashboardContext";

export default function DashboardSubdomainsPage() {
  const {
    user,
    subdomains,
    setModalOpen,
    setGuideModal,
    setDeleteSubdomainModal,
    handleCopy,
    copiedId,
  } = useDashboard();

  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "approved" | "pending" | "rejected">("all");

  const allowedQuota = user?.maxSubdomains || 3;
  const activeCount = subdomains.filter((s) => s.status === "approved").length;
  const pendingCount = subdomains.filter((s) => s.status === "pending").length;

  const filteredSubdomains = subdomains.filter((item) => {
    const matchesSearch =
      item.subdomain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.target.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Page Header with Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            My Subdomains &amp; DNS Routing
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage, configure, and monitor your custom <code className="text-cyan-300 font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">*.is-a-coder.in</code> subdomains.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:via-blue-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-cyan-500/20 transition-all cursor-pointer group shrink-0"
        >
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
          <span>Add Subdomain</span>
        </button>
      </div>

      {/* Stat Metric Cards - Clean & Minimal */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#0c1222] border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Subdomain Quota</span>
            <Globe2 className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-white">{subdomains.length}</span>
              <span className="text-xs text-slate-400 font-medium">/ {allowedQuota} Claimed</span>
            </div>
            <div className="w-full bg-slate-900 h-1.5 rounded-full mt-2.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  subdomains.length >= allowedQuota
                    ? "bg-gradient-to-r from-amber-500 to-rose-500"
                    : "bg-gradient-to-r from-cyan-500 to-blue-500"
                }`}
                style={{ width: `${Math.min(100, (subdomains.length / allowedQuota) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0c1222] border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Active &amp; Live</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-emerald-400">{activeCount}</span>
              <span className="text-xs text-slate-400 font-medium">Routings Active</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Anycast edge routed</span>
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0c1222] border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Review</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-amber-400">{pendingCount}</span>
              <span className="text-xs text-slate-400 font-medium">Under Verification</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>Avg review &lt; 2h</span>
            </p>
          </div>
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

        {/* Filter Chips, Add Button & View Mode Toggle */}
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
  );
}
