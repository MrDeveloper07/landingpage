"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, ShieldCheck, Globe, CheckCircle2 } from "lucide-react";
import { triggerConfetti } from "@/utils/confetti";
import Card3D from "@/components/ui/Card3D";

export default function CtaSection() {
  const router = useRouter();
  const [handle, setHandle] = useState("");
  const [claimed, setClaimed] = useState(false);

  const handleClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!handle.trim()) return;
    setClaimed(true);
    triggerConfetti();

    setTimeout(() => {
      router.push("/dashboard");
    }, 1200);
  };

  return (
    <section className="relative py-28 overflow-hidden">
      {/* 3D background glowing halos */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-indigo-500/10 via-violet-500/10 to-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <Card3D intensity={8} glareIntensity={0.3} className="w-full">
            <div className="relative p-10 sm:p-16 rounded-[2.5rem] bg-gradient-to-b from-white via-white to-slate-50/90 border border-slate-200/90 shadow-[0_30px_80px_rgba(79,70,229,0.12),0_1px_3px_rgba(0,0,0,0.05)] text-center overflow-hidden">
              {/* Floating 3D Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs sm:text-sm font-semibold mb-6 shadow-xs">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Zero Cost. Instant Approval. Free Forever.</span>
              </div>

              {/* Main Headline */}
              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight max-w-2xl mx-auto leading-[1.12]">
                Your Code Deserves a{" "}
                <span className="text-gradient-indigo">Premier Address.</span>
              </h2>

              <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
                Join over 34,000 developers worldwide. Claim your permanent subdomain today and point it to your GitHub Pages, Vercel, Netlify, or VPS.
              </p>

              {/* Direct Interactive Form */}
              <form
                onSubmit={handleClaim}
                className="mt-10 max-w-lg mx-auto flex flex-col sm:flex-row items-center gap-3"
              >
                <div className="relative w-full flex items-center bg-slate-50 rounded-2xl px-4 py-3.5 border border-slate-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition-all shadow-inner">
                  <Globe className="w-4 h-4 text-indigo-500 mr-2 shrink-0" />
                  <input
                    type="text"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                    placeholder="yourhandle"
                    required
                    className="w-full bg-transparent font-mono text-sm sm:text-base font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none"
                  />
                  <span className="text-indigo-600 font-mono text-xs sm:text-sm font-bold ml-1 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 shrink-0">
                    .is-a-coder.in
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-indigo-200 hover:shadow-indigo-300 flex items-center justify-center gap-2 shrink-0 cursor-pointer active:scale-95"
                >
                  {claimed ? (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300 animate-bounce" />
                      <span>Redirecting...</span>
                    </>
                  ) : (
                    <>
                      <span>Claim Free</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Trust Badges */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  Instant Web Dashboard
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-300 hidden sm:inline-block" />
                <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  Fast Admin Approval
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-300 hidden sm:inline-block" />
                <span>100% Free Forever</span>
              </div>
            </div>
          </Card3D>
        </motion.div>
      </div>
    </section>
  );
}
