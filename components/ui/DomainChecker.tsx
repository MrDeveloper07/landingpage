"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Copy, ArrowRight, Loader2, Sparkles, Shield, Globe, Terminal } from "lucide-react";
import { triggerConfetti } from "@/utils/confetti";

interface DomainCheckerProps {
  className?: string;
  autoFocus?: boolean;
}

const RESERVED_NAMES = ["admin", "api", "root", "support", "dashboard", "billing", "system", "auth"];

export default function DomainChecker({ className = "" }: DomainCheckerProps) {
  const [handle, setHandle] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [status, setStatus] = useState<"idle" | "available" | "taken" | "invalid">("idle");
  const [copied, setCopied] = useState(false);
  const [hasClaimed, setHasClaimed] = useState(false);

  // Debounced domain availability check simulation
  useEffect(() => {
    const cleanHandle = handle.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");

    if (!cleanHandle) {
      setStatus("idle");
      setIsChecking(false);
      return;
    }

    if (cleanHandle.length < 2) {
      setStatus("invalid");
      setIsChecking(false);
      return;
    }

    setIsChecking(true);
    const timer = setTimeout(() => {
      setIsChecking(false);
      if (RESERVED_NAMES.includes(cleanHandle)) {
        setStatus("taken");
      } else {
        setStatus("available");
      }
    }, 320);

    return () => clearTimeout(timer);
  }, [handle]);

  const handleClaim = () => {
    if (status !== "available") return;
    setHasClaimed(true);
    triggerConfetti();
    setTimeout(() => setHasClaimed(false), 3000);
  };

  const handleCopy = () => {
    const fullDomain = `${handle || "yourname"}.is-a-coder.in`;
    navigator.clipboard.writeText(`https://${fullDomain}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`w-full max-w-xl mx-auto ${className}`}>
      {/* 3D Glass Shell */}
      <div className="relative p-2 rounded-2xl bg-white/90 border border-slate-200/90 shadow-[0_20px_50px_rgba(79,70,229,0.08),0_1px_3px_rgba(0,0,0,0.05)] backdrop-blur-xl transition-all duration-300 hover:shadow-[0_25px_60px_rgba(79,70,229,0.12)]">
        <div className="flex flex-col sm:flex-row items-stretch gap-2">
          
          {/* Input field with handle & domain suffix */}
          <div className="relative flex-1 flex items-center bg-slate-50/80 rounded-xl px-4 py-3 border border-slate-200/70 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
            <span className="text-slate-400 font-mono text-sm mr-2 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-indigo-500" />
              https://
            </span>
            <input
              type="text"
              value={handle}
              onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
              placeholder="yourname"
              maxLength={30}
              className="flex-1 bg-transparent font-mono text-base font-semibold text-slate-900 placeholder:text-slate-300 focus:outline-none min-w-0"
            />
            <span className="text-indigo-600 font-mono text-sm font-bold ml-1 bg-indigo-50/80 px-2 py-0.5 rounded-md border border-indigo-100">
              .is-a-coder.in
            </span>
          </div>

          {/* Action Claim Button */}
          <button
            onClick={handleClaim}
            disabled={status !== "available"}
            className={`px-6 py-3.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer shadow-md ${
              status === "available"
                ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 hover:shadow-indigo-300 active:scale-95"
                : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
            }`}
          >
            {isChecking ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
            ) : hasClaimed ? (
              <>
                <Sparkles className="w-4 h-4 text-amber-300 animate-bounce" />
                <span>Reserved!</span>
              </>
            ) : (
              <>
                <span>Claim Free</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Live Dynamic Status Bar */}
        <AnimatePresence mode="wait">
          {handle && (
            <motion.div
              initial={{ opacity: 0, y: -6, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -6, height: 0 }}
              transition={{ duration: 0.2 }}
              className="pt-3 px-3 flex flex-wrap items-center justify-between text-xs border-t border-slate-100 mt-2"
            >
              <div className="flex items-center gap-2">
                {isChecking ? (
                  <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                    Querying Cloudflare DNS edge...
                  </span>
                ) : status === "available" ? (
                  <span className="text-emerald-600 flex items-center gap-1.5 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="font-mono">{handle}.is-a-coder.in</span> is available!
                  </span>
                ) : status === "taken" ? (
                  <span className="text-amber-600 flex items-center gap-1.5 font-medium bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                    <Shield className="w-3.5 h-3.5" />
                    Reserved handle. Please try another handle.
                  </span>
                ) : (
                  <span className="text-slate-500">
                    Enter at least 2 alphanumeric characters
                  </span>
                )}
              </div>

              {status === "available" && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-slate-500 hover:text-indigo-600 font-medium transition-colors py-0.5 px-2 rounded-md hover:bg-slate-100"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-600">Copied URL</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                  <a
                    href="https://github.com/is-a-coder/register"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-medium underline underline-offset-2"
                  >
                    <Terminal className="w-3 h-3" />
                    View JSON Spec
                  </a>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Trust micro-text */}
      <div className="flex items-center justify-center gap-4 mt-3 text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <Check className="w-3.5 h-3.5 text-emerald-500" /> 100% Free Forever
        </span>
        <span className="w-1 h-1 rounded-full bg-slate-300" />
        <span className="flex items-center gap-1">
          <Check className="w-3.5 h-3.5 text-emerald-500" /> Zero Renewal Fees
        </span>
        <span className="w-1 h-1 rounded-full bg-slate-300" />
        <span className="flex items-center gap-1">
          <Check className="w-3.5 h-3.5 text-emerald-500" /> Instant HTTPS SSL
        </span>
      </div>
    </div>
  );
}
