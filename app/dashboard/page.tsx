"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe2,
  Plus,
  LogOut,
  Shield,
  ExternalLink,
  CheckCircle2,
  Clock,
  XCircle,
  Server,
  Code2,
  HelpCircle,
  Copy,
  Check,
  AlertCircle,
  Loader2,
  Search,
  RefreshCw,
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
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [subdomains, setSubdomains] = useState<SubdomainItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [guideModal, setGuideModal] = useState<SubdomainItem | null>(null);

  // Form state
  const [subdomainName, setSubdomainName] = useState("");
  const [recordType, setRecordType] = useState<"CNAME" | "A" | "AAAA" | "TXT">("CNAME");
  const [target, setTarget] = useState("");
  const [description, setDescription] = useState("");
  const [repoUrl, setRepoUrl] = useState("");

  // Live availability check
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityResult, setAvailabilityResult] = useState<{
    available?: boolean;
    error?: string;
  } | null>(null);

  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Fetch Session & Subdomains
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const authRes = await fetch("/api/auth/me");
      const authData = await authRes.json();

      if (!authRes.ok || !authData.authenticated) {
        router.push("/login");
        return;
      }

      setUser(authData.user);

      const subsRes = await fetch("/api/subdomains");
      const subsData = await subsRes.json();

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

  // Live check on debounce
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

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

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

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit subdomain request");
      }

      // Reset form and reload
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-3" />
        <p className="text-sm text-slate-400">Loading your developer portal...</p>
      </div>
    );
  }

  const activeCount = subdomains.filter((s) => s.status === "approved").length;
  const pendingCount = subdomains.filter((s) => s.status === "pending").length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <header className="border-b border-white/10 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <Globe2 className="w-6 h-6 text-cyan-400" />
              <span className="font-bold text-lg bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                is-a-coder.in
              </span>
            </Link>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-medium">
              Developer Dashboard
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {user?.role === "admin" && (
              <Link
                href="/admin"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/30 text-xs font-semibold transition"
              >
                <Shield className="w-3.5 h-3.5 text-indigo-400" />
                Admin Panel
              </Link>
            )}

            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-white">{user?.name}</p>
              <p className="text-[11px] text-slate-400">{user?.email}</p>
            </div>

            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-rose-400 hover:border-rose-500/30 hover:bg-rose-500/10 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-indigo-950/30 to-slate-900/60 border border-cyan-500/20 relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Hello, {user?.name || "Developer"} 👋
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-xl">
              Register and point free, lightning-fast <span className="text-cyan-300 font-medium">.is-a-coder.in</span> subdomains to your GitHub Pages, Vercel, Netlify, or custom VPS.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-3">
            <button
              onClick={() => setModalOpen(true)}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm shadow-lg shadow-cyan-500/20 flex items-center gap-2 cursor-pointer transition"
            >
              <Plus className="w-4 h-4" />
              <span>Claim New Subdomain</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Globe2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Total Subdomains</p>
              <p className="text-2xl font-bold text-white mt-0.5">{subdomains.length}</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Active & Live</p>
              <p className="text-2xl font-bold text-emerald-400 mt-0.5">{activeCount}</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Pending Review</p>
              <p className="text-2xl font-bold text-amber-400 mt-0.5">{pendingCount}</p>
            </div>
          </div>
        </div>

        {/* Subdomains Table / List */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/70 backdrop-blur-xl overflow-hidden shadow-xl">
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Your Registered Subdomains</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Track status and DNS propagation for all your addresses
              </p>
            </div>
            <button
              onClick={fetchDashboardData}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition flex items-center gap-1.5 text-xs font-medium cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>

          {subdomains.length === 0 ? (
            <div className="py-16 text-center px-4">
              <Globe2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-300">No subdomains yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
                You haven&apos;t requested any subdomains. Claim your first free{" "}
                <span className="text-cyan-400">yourname.is-a-coder.in</span> address now!
              </p>
              <button
                onClick={() => setModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/30 text-xs font-semibold inline-flex items-center gap-2 cursor-pointer transition"
              >
                <Plus className="w-4 h-4" />
                Claim Your Subdomain
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950/60 text-xs uppercase text-slate-400 border-b border-white/5 font-semibold">
                  <tr>
                    <th className="py-3.5 px-6">Domain</th>
                    <th className="py-3.5 px-6">Type</th>
                    <th className="py-3.5 px-6">Target Destination</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6">Created</th>
                    <th className="py-3.5 px-6 text-right">Setup Guide</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-normal">
                  {subdomains.map((item) => {
                    const fullAddress = `${item.subdomain}.is-a-coder.in`;
                    return (
                      <tr key={item._id} className="hover:bg-white/[0.02] transition">
                        <td className="py-4 px-6 font-medium text-white">
                          <div className="flex items-center gap-2">
                            <span className="text-cyan-300 font-semibold">{item.subdomain}</span>
                            <span className="text-slate-500">.is-a-coder.in</span>
                            {item.status === "approved" && (
                              <a
                                href={`https://${fullAddress}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-slate-400 hover:text-cyan-400 transition"
                                title="Visit Website"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-slate-800 border border-white/10 text-cyan-400">
                            {item.recordType}
                          </span>
                        </td>

                        <td className="py-4 px-6 font-mono text-xs text-slate-400">
                          <div className="flex items-center gap-2 max-w-xs truncate">
                            <span className="truncate">{item.target}</span>
                            <button
                              onClick={() => handleCopy(item.target, item._id)}
                              className="text-slate-500 hover:text-slate-300 transition"
                              title="Copy Target"
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
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Active & Live
                            </span>
                          )}
                          {item.status === "pending" && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 border border-amber-500/30 text-amber-400">
                              <Clock className="w-3.5 h-3.5" />
                              Pending Review
                            </span>
                          )}
                          {item.status === "rejected" && (
                            <div className="space-y-1">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 border border-rose-500/30 text-rose-400">
                                <XCircle className="w-3.5 h-3.5" />
                                Rejected
                              </span>
                              {item.rejectionReason && (
                                <p className="text-[11px] text-rose-400/80 italic">
                                  {item.rejectionReason}
                                </p>
                              )}
                            </div>
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
                          <button
                            onClick={() => setGuideModal(item)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 hover:border-cyan-500/40 text-xs text-slate-300 hover:text-cyan-300 transition cursor-pointer"
                          >
                            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Setup Guide</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Claim Subdomain Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-2xl bg-slate-900 border border-white/10 p-6 sm:p-7 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Globe2 className="w-5 h-5 text-cyan-400" />
                    Claim Your Subdomain
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Choose a prefix and point it to your web host
                  </p>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
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
                        placeholder="junior"
                        value={subdomainName}
                        onChange={(e) =>
                          setSubdomainName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
                        }
                        className="w-full px-3.5 py-2.5 rounded-l-xl bg-slate-950 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 text-sm font-mono"
                      />
                    </div>
                    <span className="px-3.5 py-2.5 rounded-r-xl bg-slate-800 border-y border-r border-white/10 text-slate-400 text-sm font-mono select-none">
                      .is-a-coder.in
                    </span>
                  </div>

                  {/* Availability feedback */}
                  {checkingAvailability && (
                    <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                      <Loader2 className="w-3 h-3 animate-spin text-cyan-400" />
                      Checking availability...
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
                    Record Type *
                  </label>
                  <select
                    value={recordType}
                    onChange={(e) =>
                      setRecordType(e.target.value as "CNAME" | "A" | "AAAA" | "TXT")
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-cyan-400 text-sm"
                  >
                    <option value="CNAME">CNAME (GitHub Pages, Vercel, Netlify, Render)</option>
                    <option value="A">A Record (IPv4 Server Address)</option>
                    <option value="AAAA">AAAA Record (IPv6 Server Address)</option>
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
                        ? "e.g. junior.github.io or cname.vercel-dns.com"
                        : "e.g. 185.199.108.153"
                    }
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 text-sm font-mono"
                  />
                  <p className="text-[11px] text-slate-500">
                    {recordType === "CNAME"
                      ? "Points your subdomain to your hosting provider domain."
                      : "Direct IP address of your host machine."}
                  </p>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Project / Website Description (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Personal portfolio & full-stack web projects..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 text-sm resize-none"
                  />
                </div>

                {/* Repo URL */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Source Code / Demo Link (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://github.com/junior/portfolio"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 text-sm"
                  />
                </div>

                {/* Buttons */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-medium transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={
                      formSubmitting ||
                      !subdomainName ||
                      !target ||
                      (availabilityResult?.available === false)
                    }
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2 cursor-pointer"
                  >
                    {formSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <span>Submit Request</span>
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
              className="w-full max-w-lg rounded-2xl bg-slate-900 border border-white/10 p-6 sm:p-7 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-cyan-400" />
                  How to link {guideModal.subdomain}.is-a-coder.in
                </h3>
                <button
                  onClick={() => setGuideModal(null)}
                  className="p-1 rounded text-slate-400 hover:text-white transition cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-xs text-slate-300">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-white/10 space-y-2">
                  <p className="font-semibold text-cyan-300">1. On GitHub Pages:</p>
                  <ul className="list-disc pl-4 space-y-1 text-slate-400">
                    <li>Go to your GitHub repo → <strong>Settings</strong> → <strong>Pages</strong>.</li>
                    <li>Under <strong>Custom domain</strong>, type:</li>
                  </ul>
                  <div className="p-2 rounded bg-slate-900 font-mono text-cyan-400 text-center font-bold">
                    {guideModal.subdomain}.is-a-coder.in
                  </div>
                  <p className="text-slate-400">Click <strong>Save</strong> and check &quot;Enforce HTTPS&quot;.</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-white/10 space-y-2">
                  <p className="font-semibold text-cyan-300">2. On Vercel:</p>
                  <ul className="list-disc pl-4 space-y-1 text-slate-400">
                    <li>Go to your Vercel Project → <strong>Settings</strong> → <strong>Domains</strong>.</li>
                    <li>Add: <code className="text-cyan-400">{guideModal.subdomain}.is-a-coder.in</code></li>
                  </ul>
                </div>
              </div>

              <div className="text-right pt-2 border-t border-white/10">
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
    </div>
  );
}
