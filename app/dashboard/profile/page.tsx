"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  KeyRound,
  Mail,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import { useDashboard } from "../DashboardContext";

export default function ProfilePage() {
  const { user, setUser, setLogoutModalOpen } = useDashboard();

  const [profileName, setProfileName] = useState(user?.name || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  const getPassStrength = (pass: string) => {
    if (!pass) return { score: 0, label: "Enter password", color: "bg-slate-800", text: "text-slate-500", percent: 5 };
    let s = 0;
    if (pass.length >= 6) s += 1;
    if (pass.length >= 10) s += 1;
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) s += 1;
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) s += 1;

    if (s === 1) return { score: 1, label: "Weak", color: "bg-rose-500", text: "text-rose-400", percent: 25 };
    if (s === 2) return { score: 2, label: "Fair", color: "bg-amber-500", text: "text-amber-400", percent: 50 };
    if (s === 3) return { score: 3, label: "Good", color: "bg-cyan-500", text: "text-cyan-400", percent: 75 };
    return { score: 4, label: "Strong", color: "bg-emerald-500", text: "text-emerald-400", percent: 100 };
  };

  const strength = getPassStrength(newPassword);
  const passwordsMatch = Boolean(newPassword && confirmPassword && newPassword === confirmPassword);
  const passwordsMismatch = Boolean(confirmPassword && newPassword !== confirmPassword);

  const memberDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "Active Developer";

  // Update Display Name
  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");

    if (!profileName.trim()) {
      setProfileError("Display name cannot be empty.");
      return;
    }

    setProfileSaving(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: profileName.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile name");
      }

      if (user) {
        setUser({ ...user, name: profileName.trim() });
      }
      setProfileSuccess("Display name updated successfully!");
      setTimeout(() => setProfileSuccess(""), 4000);
    } catch (err: unknown) {
      setProfileError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setProfileSaving(false);
    }
  };

  // Change Password
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

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Feedback Alerts */}
      <AnimatePresence>
        {profileSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3 text-emerald-300"
          >
            <div className="flex items-center gap-2.5 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{profileSuccess}</span>
            </div>
            <button
              onClick={() => setProfileSuccess("")}
              className="text-emerald-400/60 hover:text-emerald-300 text-xs px-2"
            >
              ✕
            </button>
          </motion.div>
        )}

        {profileError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between gap-3 text-rose-300"
          >
            <div className="flex items-center gap-2.5 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{profileError}</span>
            </div>
            <button
              onClick={() => setProfileError("")}
              className="text-rose-400/60 hover:text-rose-300 text-xs px-2"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Developer Profile Header Card */}
      <div className="p-6 sm:p-7 rounded-3xl bg-[#0c1222] border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 shrink-0 shadow-lg shadow-cyan-500/10">
            <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center font-black text-2xl text-cyan-300">
              {user?.name ? user.name.charAt(0).toUpperCase() : "D"}
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-bold text-white">{user?.name || "Developer"}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                {user?.role === "admin" ? "Admin" : "Developer"}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-mono text-slate-300">
                <Mail className="w-3.5 h-3.5 text-cyan-400" />
                {user?.email}
              </span>
              <span>•</span>
              <span>Member since {memberDate}</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setLogoutModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-rose-500/40 text-slate-300 hover:text-rose-400 text-xs font-semibold transition cursor-pointer self-start sm:self-auto"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* 2-Column Settings: Profile & Password */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Profile Info Form */}
        <div className="p-6 sm:p-7 rounded-3xl bg-[#0c1222] border border-slate-800/80 space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Developer Identity</h3>
                <p className="text-xs text-slate-400">Update your public display name</p>
              </div>
            </div>

            <form onSubmit={handleUpdateName} id="profile-name-form" className="space-y-4 mt-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Display Name</label>
                <input
                  type="text"
                  required
                  maxLength={80}
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Registered Email</label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ""}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-400 text-xs font-mono cursor-not-allowed"
                />
                <p className="text-[11px] text-slate-400">
                  Bound to all your claimed subdomain routing certificates.
                </p>
              </div>
            </form>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <button
              type="submit"
              form="profile-name-form"
              disabled={profileSaving || profileName.trim() === user?.name}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer flex items-center justify-center gap-2"
            >
              {profileSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Name</span>
              )}
            </button>
          </div>
        </div>

        {/* Right: Security & Password Form */}
        <div className="p-6 sm:p-7 rounded-3xl bg-[#0c1222] border border-slate-800/80 space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Security &amp; Password</h3>
                <p className="text-xs text-slate-400">Update your account login password</p>
              </div>
            </div>

            <form onSubmit={handleChangePassword} id="password-form" className="space-y-3.5 mt-5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrentPass ? "text" : "password"}
                    required
                    placeholder="Existing password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full pl-3.5 pr-9 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs cursor-pointer"
                  >
                    {showCurrentPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">New Password</label>
                  {newPassword && (
                    <span className={`text-[10px] font-bold ${strength.text}`}>
                      {strength.label}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showNewPass ? "text" : "password"}
                    required
                    minLength={6}
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-3.5 pr-9 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs cursor-pointer"
                  >
                    {showNewPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {newPassword && (
                  <div className="w-full h-1 rounded-full bg-slate-900 mt-1.5 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${strength.color}`}
                      style={{ width: `${strength.percent}%` }}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">Confirm New Password</label>
                  {passwordsMismatch && (
                    <span className="text-[10px] font-semibold text-rose-400">Mismatch</span>
                  )}
                  {passwordsMatch && (
                    <span className="text-[10px] font-semibold text-emerald-400">Match</span>
                  )}
                </div>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 text-xs"
                />
              </div>
            </form>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <button
              type="submit"
              form="password-form"
              disabled={profileSaving || !currentPassword || !newPassword || !confirmPassword || passwordsMismatch}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer flex items-center justify-center gap-2"
            >
              {profileSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <span>Update Password</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
