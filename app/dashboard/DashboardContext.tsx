"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FaviconIcon } from "@/components/ui/Icons";
import {
  LogOut,
  Trash2,
  Code2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Copy,
  Check,
  Laptop,
  ShieldAlert,
  Info,
  Lock,
} from "lucide-react";

export interface SubdomainItem {
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

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  maxSubdomains?: number;
  createdAt?: string;
}

interface DashboardContextType {
  user: UserProfile | null;
  subdomains: SubdomainItem[];
  loading: boolean;
  fetchDashboardData: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  setModalOpen: (open: boolean) => void;
  setGuideModal: (item: SubdomainItem | null) => void;
  setDeleteSubdomainModal: (item: SubdomainItem | null) => void;
  setLogoutModalOpen: (open: boolean) => void;
  handleCopy: (text: string, id: string) => void;
  copiedId: string | null;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}

export function DashboardProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [subdomains, setSubdomains] = useState<SubdomainItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [guideModal, setGuideModal] = useState<SubdomainItem | null>(null);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [deleteSubdomainModal, setDeleteSubdomainModal] = useState<SubdomainItem | null>(null);
  const [sessionReplacedModalOpen, setSessionReplacedModalOpen] = useState(false);

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

  // Loading states
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch Session & Subdomains
  const fetchDashboardData = useCallback(async () => {
    try {
      // Only set initial loading if we don't have user yet
      if (!user) {
        setLoading(true);
      }
      const authRes = await fetch("/api/auth/profile");
      const authData = await authRes.json();

      if (authData.sessionTerminated || authData.reason === "session_replaced") {
        setSessionReplacedModalOpen(true);
        return;
      }

      if (authRes.ok && authData.user) {
        setUser(authData.user);
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

  // Session Heartbeat
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

    const interval = setInterval(checkActiveSession, 5000);

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

  // Logout action
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

    const allowedQuota = user?.maxSubdomains || 3;
    const activeSubs = subdomains.filter(
      (s) => s.status === "pending" || s.status === "approved"
    ).length;

    if (activeSubs >= allowedQuota && user?.role !== "admin") {
      setFormError(
        `You have reached your limit of ${allowedQuota} subdomains for this account. Delete an inactive subdomain or contact support to request an increase.`
      );
      return;
    }

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
          subdomain: subdomainName.trim().toLowerCase(),
          recordType,
          target: target.trim(),
          description: description.trim(),
          repoUrl: repoUrl.trim(),
        }),
      });

      const data = await res.json();

      if (data.sessionTerminated || data.reason === "session_replaced") {
        setSessionReplacedModalOpen(true);
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit claim request");
      }

      setModalOpen(false);
      setSubdomainName("");
      setTarget("");
      setDescription("");
      setRepoUrl("");
      setAvailabilityResult(null);
      await fetchDashboardData();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setFormSubmitting(false);
    }
  };

  // Delete Subdomain
  const handleDeleteSubdomain = async () => {
    if (!deleteSubdomainModal) return;
    setDeleteLoading(true);

    try {
      const res = await fetch(`/api/subdomains?id=${deleteSubdomainModal._id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.sessionTerminated || data.reason === "session_replaced") {
        setSessionReplacedModalOpen(true);
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete subdomain");
      }

      setDeleteSubdomainModal(null);
      await fetchDashboardData();
    } catch (err) {
      console.error("Delete Subdomain Error:", err);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <DashboardContext.Provider
      value={{
        user,
        subdomains,
        loading,
        fetchDashboardData,
        setUser,
        setModalOpen,
        setGuideModal,
        setDeleteSubdomainModal,
        setLogoutModalOpen,
        handleCopy,
        copiedId,
      }}
    >
      {children}

      {/* ================= SHARED MODALS ================= */}

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

      {/* Account Logged In On Another Device Modal */}
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
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-amber-500/15 blur-3xl pointer-events-none" />

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
    </DashboardContext.Provider>
  );
}
