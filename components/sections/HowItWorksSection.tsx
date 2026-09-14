"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe2,
  CheckCircle2,
  ArrowRight,
  Terminal,
  Copy,
  Check,
  Sparkles,
  ShieldCheck,
  Server,
  Zap,
  ExternalLink,
  ChevronRight,
  Code2,
  User,
  Shield,
  Clock,
} from "lucide-react";
import Link from "next/link";
import Card3D from "@/components/ui/Card3D";

interface StepConfig {
  step: number;
  label: string;
  timeEst: string;
  title: string;
  shortDesc: string;
  checklist: string[];
}

const STEPS: StepConfig[] = [
  {
    step: 1,
    label: "Search & Request",
    timeEst: "~10 sec",
    title: "Check Availability & Submit Request",
    shortDesc:
      "Sign in to the developer portal and search for your desired subdomain. Our real-time validator instantly checks for collisions and reserved system words.",
    checklist: [
      "Live interactive availability checker",
      "Support for CNAME, A, AAAA, and TXT records",
      "Point to GitHub Pages, Vercel, Netlify, or custom VPS",
    ],
  },
  {
    step: 2,
    label: "Admin Review",
    timeEst: "~30 sec",
    title: "Fast Review & DNS Setup",
    shortDesc:
      "Your request enters the Admin Control Center where the administrator reviews the target and uses 1-click GoDaddy DNS tools to configure your record.",
    checklist: [
      "1-Click GoDaddy formatted DNS copy tool",
      "Built-in protection against phishing & reserved names",
      "Instant status update from Pending to Active",
    ],
  },
  {
    step: 3,
    label: "Go Live",
    timeEst: "Instant",
    title: "Global Propagation & Free SSL",
    shortDesc:
      "Once approved, your domain resolves globally across Anycast networks. Simply link it in your GitHub Pages or Vercel custom domain settings!",
    checklist: [
      "Automatic TLS 1.3 / HTTPS certificate provisioned",
      "Sub-20ms DNS latency with multi-region caching",
      "Your new address https://yourname.is-a-coder.in is live!",
    ],
  },
];

export default function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0);
  const [copied, setCopied] = useState(false);

  const stepData = STEPS[activeStep];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section
      id="how-it-works"
      className="relative py-28 bg-gradient-to-b from-white via-slate-50/70 to-white border-y border-slate-200/80 overflow-hidden"
    >
      {/* Background ambient lighting */}
      <div className="absolute -top-32 right-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 left-1/4 w-[500px] h-[500px] bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight"
          >
            How It Works in 3 Simple Steps
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-4 text-slate-600 text-base sm:text-lg"
          >
            No terminal commands required. Submit your request via our developer portal and go live with fast admin verification.
          </motion.p>
        </div>

        {/* Step Navigation Bar with Connected Timeline */}
        <div className="relative max-w-4xl mx-auto mb-12">
          {/* Background Connecting Line */}
          <div className="hidden md:block absolute top-1/2 left-8 right-8 h-0.5 bg-slate-200 -translate-y-1/2 z-0" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
            {STEPS.map((s, idx) => {
              const isActive = activeStep === idx;
              const isPast = activeStep > idx;

              return (
                <button
                  key={s.step}
                  onClick={() => setActiveStep(idx)}
                  className={`p-4 rounded-2xl text-left transition-all duration-300 border cursor-pointer flex items-center justify-between gap-3 ${
                    isActive
                      ? "bg-white border-indigo-500 shadow-[0_12px_28px_rgba(79,70,229,0.12)] scale-[1.02]"
                      : isPast
                      ? "bg-white/90 border-emerald-200/80 hover:border-slate-300"
                      : "bg-white/70 border-slate-200/80 hover:bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                        isActive
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 scale-105"
                          : isPast
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {isPast ? <Check className="w-5 h-5" /> : <span>0{s.step}</span>}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{s.label}</span>
                        <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-slate-100 text-slate-500">
                          {s.timeEst}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 font-medium">
                        {s.title.split("&")[0]}
                      </p>
                    </div>
                  </div>

                  <ChevronRight
                    className={`w-4 h-4 transition-transform ${
                      isActive ? "text-indigo-600 rotate-90 md:rotate-0" : "text-slate-300"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Interactive Stage Viewer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Stage Explanations & Action Steps */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <AnimatePresence mode="wait">
              <motion.div
                key={stepData.step}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-[0_15px_35px_rgba(0,0,0,0.03)] flex flex-col justify-between h-full"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-mono text-xs font-bold border border-indigo-100">
                      <Terminal className="w-3.5 h-3.5" />
                      STAGE 0{stepData.step} / 03
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      Est: {stepData.timeEst}
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                    {stepData.title}
                  </h3>

                  <p className="mt-4 text-slate-600 text-sm sm:text-base leading-relaxed">
                    {stepData.shortDesc}
                  </p>

                  {/* Checklist */}
                  <div className="mt-6 space-y-3.5">
                    {stepData.checklist.map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs sm:text-sm text-slate-700 font-medium leading-normal">
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Stage Progress Controls */}
                <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between gap-3">
                  <button
                    onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                    disabled={activeStep === 0}
                    className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                      activeStep === 0
                        ? "text-slate-300 cursor-not-allowed"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                    }`}
                  >
                    ← Previous
                  </button>

                  {activeStep < 2 ? (
                    <button
                      onClick={() => setActiveStep(activeStep + 1)}
                      className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <span>Next: {STEPS[activeStep + 1].label}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <Link
                      href="/dashboard"
                      className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-all shadow-md shadow-indigo-200 flex items-center gap-1.5 active:scale-95"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Open Dashboard</span>
                    </Link>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Column: Dynamic High-Fidelity Mockup */}
          <div className="lg:col-span-7">
            <Card3D intensity={6} className="h-full">
              <div className="h-full rounded-3xl bg-slate-950 border border-slate-800/90 shadow-[0_25px_60px_rgba(15,23,42,0.25)] flex flex-col justify-between overflow-hidden">
                {/* Visual Header Tab Bar */}
                <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                    <span className="ml-3 font-mono text-xs text-slate-400 font-semibold flex items-center gap-1.5">
                      {activeStep === 0 && (
                        <>
                          <Globe2 className="w-3.5 h-3.5 text-cyan-400" />
                          portal / request-subdomain
                        </>
                      )}
                      {activeStep === 1 && (
                        <>
                          <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                          admin-panel / review-queue
                        </>
                      )}
                      {activeStep === 2 && (
                        <>
                          <Globe2 className="w-3.5 h-3.5 text-emerald-400" />
                          https://junior.is-a-coder.in
                        </>
                      )}
                    </span>
                  </div>

                  {activeStep === 0 && (
                    <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                      Live Validator
                    </span>
                  )}

                  {activeStep === 1 && (
                    <button
                      onClick={() =>
                        handleCopy("Type: CNAME\nName: junior\nValue: junior.github.io")
                      }
                      className="flex items-center gap-1.5 text-slate-300 hover:text-white px-2.5 py-1 rounded-md bg-indigo-900/40 hover:bg-indigo-800/50 border border-indigo-700/60 transition-colors text-[11px] font-mono cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied for GoDaddy</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-indigo-400" />
                          <span>📋 Copy for GoDaddy</span>
                        </>
                      )}
                    </button>
                  )}

                  {activeStep === 2 && (
                    <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      TLS 1.3 Active
                    </span>
                  )}
                </div>

                {/* Main Dynamic View Content */}
                <div className="p-6 sm:p-8 flex-1 flex flex-col justify-center">
                  <AnimatePresence mode="wait">
                    {/* STEP 1: Interactive User Form Mockup */}
                    {activeStep === 0 && (
                      <motion.div
                        key="step-0"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.25 }}
                        className="space-y-4 font-sans text-xs"
                      >
                        <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 space-y-3">
                          <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
                            <span>SUBDOMAIN PREVIEW</span>
                            <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                              <CheckCircle2 className="w-3 h-3" /> junior.is-a-coder.in is available!
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="p-2.5 rounded-xl bg-slate-950 border border-white/5 space-y-1">
                              <span className="text-slate-500 font-mono text-[10px]">RECORD TYPE</span>
                              <p className="font-bold text-cyan-400 font-mono">CNAME (GitHub Pages / Vercel)</p>
                            </div>

                            <div className="p-2.5 rounded-xl bg-slate-950 border border-white/5 space-y-1">
                              <span className="text-slate-500 font-mono text-[10px]">DESTINATION TARGET</span>
                              <p className="font-semibold text-slate-200 font-mono truncate">junior.github.io</p>
                            </div>
                          </div>

                          <div className="p-2.5 rounded-xl bg-slate-950 border border-white/5 space-y-1">
                            <span className="text-slate-500 font-mono text-[10px]">PROJECT DESCRIPTION</span>
                            <p className="text-slate-300">Junior developer portfolio built with React &amp; Next.js</p>
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs flex items-center justify-between font-mono">
                          <span>Status: Submitting to Admin Review Queue...</span>
                          <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-200 text-[10px]">Instant</span>
                        </div>
                      </motion.div>
                    )}

                    {/* STEP 2: Realistic Admin Panel Review Mockup */}
                    {activeStep === 1 && (
                      <motion.div
                        key="step-1"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.25 }}
                        className="space-y-4"
                      >
                        {/* Admin Pending Request Card */}
                        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold font-mono text-cyan-300">
                                junior<span className="text-slate-400">.is-a-coder.in</span>
                              </span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-indigo-300 border border-white/10">
                                CNAME
                              </span>
                            </div>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> Pending Review
                            </span>
                          </div>

                          <div className="p-2.5 rounded-xl bg-slate-950 text-xs font-mono text-slate-300 flex items-center justify-between border border-white/5">
                            <span>Points to: <strong className="text-white">junior.github.io</strong></span>
                            <span className="text-slate-500">Alex Rivera (alex@devmail.io)</span>
                          </div>

                          {/* Quick Admin Actions Mockup */}
                          <div className="flex items-center justify-end gap-2 pt-1">
                            <div className="px-3 py-1.5 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold flex items-center gap-1">
                              <Copy className="w-3 h-3" /> GoDaddy Helper
                            </div>
                            <div className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold flex items-center gap-1">
                              <Check className="w-3 h-3" /> Approve &amp; Activate
                            </div>
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                          <Shield className="w-4 h-4 text-indigo-400 shrink-0" />
                          <span>Admin sets GoDaddy DNS in 15 seconds and approves request.</span>
                        </div>
                      </motion.div>
                    )}

                    {/* STEP 3: Live Subdomain Active Deployment Mockup */}
                    {activeStep === 2 && (
                      <motion.div
                        key="step-2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.25 }}
                        className="space-y-4"
                      >
                        {/* Browser Window Mockup */}
                        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                          <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2 text-xs font-mono text-emerald-400">
                            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span className="text-slate-400">https://</span>
                            <span className="font-bold text-white">junior.is-a-coder.in</span>
                            <span className="ml-auto text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                              200 OK
                            </span>
                          </div>

                          <div className="p-4 rounded-xl bg-slate-950/80 border border-white/5 text-xs text-slate-300 space-y-2">
                            <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-white/5 pb-2">
                              <span>DNS Resolution</span>
                              <span className="text-emerald-400 font-mono font-bold">14ms latency</span>
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-slate-400">
                              <span>SSL Certificate</span>
                              <span className="text-slate-200 font-mono">Let&apos;s Encrypt / TLS 1.3</span>
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-slate-400">
                              <span>Target Host</span>
                              <span className="text-slate-200 font-mono">junior.github.io</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center justify-between font-mono">
                          <span>🎉 Domain is resolving worldwide!</span>
                          <span className="font-bold">Live 🟢</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Card Footer Bar */}
                <div className="px-6 py-4 bg-slate-900/40 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5 text-indigo-400" />
                    DNS Edge Anycast
                  </span>
                  <span className="font-mono text-slate-500">is-a-coder.in Platform</span>
                </div>
              </div>
            </Card3D>
          </div>
        </div>
      </div>
    </section>
  );
}
