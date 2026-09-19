"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Sliders,
  Globe2,
  Server,
  ShieldCheck,
  Lock,
  Mail,
  Check,
  Copy,
  AlertTriangle,
  Sparkles,
  Info,
  Database,
  Layers,
} from "lucide-react";
import { useAdmin } from "../AdminContext";

export default function AdminSettingsPage() {
  const { adminUser } = useAdmin();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const reservedPrefixes = [
    "admin",
    "api",
    "app",
    "auth",
    "billing",
    "blog",
    "cdn",
    "dashboard",
    "dev",
    "docs",
    "ftp",
    "login",
    "mail",
    "ns1",
    "ns2",
    "pay",
    "portal",
    "root",
    "secure",
    "status",
    "support",
    "vpn",
    "www",
  ];

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <Sliders className="w-6 h-6 text-indigo-400" />
          DNS Zone & System Configuration
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Root zone rules, nameservers, reserved system prefixes, and platform security boundaries.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* DNS Root Zone Card */}
        <div className="rounded-2xl bg-[#0c1222]/90 border border-slate-800 p-6 space-y-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              <Globe2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Root Domain Zone</h2>
              <p className="text-xs text-slate-400">Master DNS apex and edge propagation</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-slate-400">Apex Domain:</span>
              <span className="font-mono text-white font-bold text-sm">is-a-coder.in</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-slate-400">DNS Authority:</span>
              <span className="text-slate-200 font-medium">GoDaddy DNS Manager</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-slate-400">Default TTL:</span>
              <span className="font-mono text-indigo-400 font-medium">1800s (30 Mins)</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-slate-400">Supported Record Types:</span>
              <span className="font-mono text-white font-semibold">CNAME, A, AAAA, TXT</span>
            </div>
          </div>
        </div>

        {/* System Administration & Security */}
        <div className="rounded-2xl bg-[#0c1222]/90 border border-slate-800 p-6 space-y-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Platform Governance</h2>
              <p className="text-xs text-slate-400">System admin email and automated safeguards</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-slate-400">Admin Contact:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-indigo-300 font-semibold">sync2pixel@gmail.com</span>
                <button
                  onClick={() => handleCopy("sync2pixel@gmail.com", "admin_email")}
                  className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                >
                  {copiedKey === "admin_email" ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-slate-400">Session Security:</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold">
                Single Active Device Enforced
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-slate-400">Automated Audit:</span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-semibold">
                AuditLog Mongoose Stream
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-slate-400">Current Admin User:</span>
              <span className="text-white font-medium">{adminUser?.email}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reserved Subdomains List */}
      <div className="rounded-2xl bg-[#0c1222]/90 border border-slate-800 p-6 space-y-4 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Lock className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">Protected & Reserved Subdomains</h2>
          </div>
          <span className="text-xs text-slate-400">{reservedPrefixes.length} prefixes blocked</span>
        </div>

        <p className="text-xs text-slate-400">
          The following subdomains are automatically rejected during registration to prevent spoofing of core system services:
        </p>

        <div className="flex flex-wrap gap-2 pt-2">
          {reservedPrefixes.map((prefix) => (
            <span
              key={prefix}
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              {prefix}.is-a-coder.in
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
