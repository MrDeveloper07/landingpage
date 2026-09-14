"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GitFork,
  GitPullRequest,
  Globe2,
  CheckCircle2,
  ArrowRight,
  Terminal,
  Copy,
  Check,
  Sparkles,
  ShieldCheck,
  FileCode2,
  GitBranch,
  Server,
  Zap,
  ExternalLink,
  ChevronRight,
  Code2,
} from "lucide-react";
import { GithubIcon } from "@/components/ui/Icons";
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
    label: "Configure",
    timeEst: "~30 sec",
    title: "Fork & Create Your Domain JSON",
    shortDesc:
      "Clone the official registry repository and define your custom DNS routing rules inside a single JSON configuration file.",
    checklist: [
      "Create domains/yourname.json in the repository",
      "Point CNAME to GitHub Pages, Vercel, Netlify, or Cloudflare",
      "Optional A, AAAA, and TXT verification records supported",
    ],
  },
  {
    step: 2,
    label: "Automate",
    timeEst: "~45 sec",
    title: "Open Pull Request & Automated CI",
    shortDesc:
      "Submit a pull request. GitHub Actions workflows validate JSON schema, check availability, and run collision diagnostics.",
    checklist: [
      "Automated CI linting and JSON schema validator",
      "Subdomain exclusivity & zero collision guarantee",
      "Automated merge bot tags and approves valid submissions",
    ],
  },
  {
    step: 3,
    label: "Go Live",
    timeEst: "Instant",
    title: "Global DNS Propagation & Free SSL",
    shortDesc:
      "Once merged, our Cloudflare edge worker updates DNS records across 300+ global Anycast points of presence worldwide.",
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

  const sampleJson = `{
  "description": "Alex's Developer Portfolio & Projects",
  "repo": "https://github.com/alexrivera/portfolio",
  "owner": {
    "username": "alexrivera",
    "email": "alex@devmail.io"
  },
  "record": {
    "CNAME": "alexrivera.github.io"
  }
}`;

  return (
    <section id="how-it-works" className="relative py-28 bg-gradient-to-b from-white via-slate-50/70 to-white border-y border-slate-200/80 overflow-hidden">
      
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
            No complex DNS consoles. Everything is managed via open source GitHub Pull Requests and automated edge workers.
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
                      {isPast ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <span>0{s.step}</span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          {s.label}
                        </span>
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
                    <a
                      href="#claim"
                      className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-all shadow-md shadow-indigo-200 flex items-center gap-1.5 active:scale-95"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Claim Your Handle</span>
                    </a>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Column: Dynamic High-Fidelity Mockup (IDE / PR / Deployment Card) */}
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
                          <FileCode2 className="w-3.5 h-3.5 text-indigo-400" />
                          domains/alex.json
                        </>
                      )}
                      {activeStep === 1 && (
                        <>
                          <GitPullRequest className="w-3.5 h-3.5 text-emerald-400" />
                          PR #1428: Add alex.is-a-coder.in
                        </>
                      )}
                      {activeStep === 2 && (
                        <>
                          <Globe2 className="w-3.5 h-3.5 text-sky-400" />
                          https://alex.is-a-coder.in
                        </>
                      )}
                    </span>
                  </div>

                  {activeStep === 0 && (
                    <button
                      onClick={() => handleCopy(sampleJson)}
                      className="flex items-center gap-1.5 text-slate-400 hover:text-white px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 transition-colors text-[11px] font-mono cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Template</span>
                        </>
                      )}
                    </button>
                  )}

                  {activeStep === 1 && (
                    <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      CI Checks Passing
                    </span>
                  )}

                  {activeStep === 2 && (
                    <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      SSL Active
                    </span>
                  )}
                </div>

                {/* Main Dynamic View Content */}
                <div className="p-6 sm:p-8 flex-1 flex flex-col justify-center">
                  <AnimatePresence mode="wait">
                    
                    {/* STEP 1: Interactive JSON IDE Mockup */}
                    {activeStep === 0 && (
                      <motion.div
                        key="step-0"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.25 }}
                        className="font-mono text-xs sm:text-sm text-slate-300 space-y-1.5 leading-relaxed"
                      >
                        <div className="text-slate-500 select-none">// 1. Define your records in domains/&lt;handle&gt;.json</div>
                        <div className="text-slate-100 font-bold">&#123;</div>
                        <div className="pl-4">
                          <span className="text-sky-300">&quot;description&quot;</span>: <span className="text-amber-200">&quot;Alex&apos;s Developer Portfolio&quot;</span>,
                        </div>
                        <div className="pl-4">
                          <span className="text-sky-300">&quot;repo&quot;</span>: <span className="text-amber-200">&quot;https://github.com/alexrivera/portfolio&quot;</span>,
                        </div>
                        <div className="pl-4">
                          <span className="text-sky-300">&quot;owner&quot;</span>: &#123;
                        </div>
                        <div className="pl-8">
                          <span className="text-sky-300">&quot;username&quot;</span>: <span className="text-emerald-300">&quot;alexrivera&quot;</span>,
                        </div>
                        <div className="pl-8">
                          <span className="text-sky-300">&quot;email&quot;</span>: <span className="text-emerald-300">&quot;alex@devmail.io&quot;</span>
                        </div>
                        <div className="pl-4">&#125;,</div>
                        <div className="pl-4 bg-indigo-950/40 -mx-4 px-4 py-1 rounded border-l-2 border-indigo-500">
                          <span className="text-sky-300 font-semibold">&quot;record&quot;</span>: &#123; <span className="text-indigo-300">&quot;CNAME&quot;</span>: <span className="text-emerald-300">&quot;alexrivera.github.io&quot;</span> &#125;
                        </div>
                        <div className="text-slate-100 font-bold">&#125;</div>

                        <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                          <span className="flex items-center gap-1.5 text-emerald-400">
                            <Check className="w-3.5 h-3.5" /> Schema validation passed
                          </span>
                          <span className="text-slate-500 font-mono">UTF-8 • JSON</span>
                        </div>
                      </motion.div>
                    )}

                    {/* STEP 2: Realistic GitHub Pull Request & CI Status */}
                    {activeStep === 1 && (
                      <motion.div
                        key="step-1"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.25 }}
                        className="space-y-4"
                      >
                        {/* PR Mini Card */}
                        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-1 border border-emerald-500/30">
                              <GitPullRequest className="w-3.5 h-3.5" /> Open
                            </span>
                            <div>
                              <p className="text-sm font-bold text-white font-mono">
                                #1428 Add alex.is-a-coder.in
                              </p>
                              <p className="text-xs text-slate-400 font-mono mt-0.5">
                                alexrivera wants to merge 1 commit into <span className="text-indigo-400">main</span>
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* CI Check Pipeline */}
                        <div className="space-y-2.5 font-mono text-xs">
                          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-2.5 text-slate-300">
                              <div className="w-5 h-5 rounded-full bg-emerald-950 flex items-center justify-center text-emerald-400 border border-emerald-800">
                                <Check className="w-3 h-3" />
                              </div>
                              <span>schema-validate / json-lint</span>
                            </div>
                            <span className="text-emerald-400 font-semibold">12s — Passed</span>
                          </div>

                          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-2.5 text-slate-300">
                              <div className="w-5 h-5 rounded-full bg-emerald-950 flex items-center justify-center text-emerald-400 border border-emerald-800">
                                <Check className="w-3 h-3" />
                              </div>
                              <span>collision-detector / handle-availability</span>
                            </div>
                            <span className="text-emerald-400 font-semibold">8s — Passed</span>
                          </div>

                          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-2.5 text-slate-300">
                              <div className="w-5 h-5 rounded-full bg-emerald-950 flex items-center justify-center text-emerald-400 border border-emerald-800">
                                <Check className="w-3 h-3" />
                              </div>
                              <span>auto-merge-bot / approve</span>
                            </div>
                            <span className="text-indigo-400 font-semibold">Approved</span>
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 text-xs font-medium flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>All 3 checks passed. Merging and deploying to DNS edge...</span>
                        </div>
                      </motion.div>
                    )}

                    {/* STEP 3: Live DNS Deployment & Edge Routing Preview */}
                    {activeStep === 2 && (
                      <motion.div
                        key="step-2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.25 }}
                        className="space-y-4"
                      >
                        {/* Browser Address Preview */}
                        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-mono text-slate-200">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-slate-500">https://</span>
                            <span className="text-white font-bold">alex.is-a-coder.in</span>
                          </div>
                          <span className="text-[11px] font-mono text-emerald-400 font-semibold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                            200 OK
                          </span>
                        </div>

                        {/* Edge Distribution Network Map Preview */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 font-mono text-xs">
                          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                            <span className="text-slate-400">San Francisco</span>
                            <span className="text-emerald-400 font-bold">14ms</span>
                          </div>
                          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                            <span className="text-slate-400">Frankfurt</span>
                            <span className="text-emerald-400 font-bold">18ms</span>
                          </div>
                          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                            <span className="text-slate-400">Tokyo</span>
                            <span className="text-emerald-400 font-bold">22ms</span>
                          </div>
                          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                            <span className="text-slate-400">London</span>
                            <span className="text-emerald-400 font-bold">16ms</span>
                          </div>
                          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                            <span className="text-slate-400">Mumbai</span>
                            <span className="text-emerald-400 font-bold">19ms</span>
                          </div>
                          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                            <span className="text-slate-400">Sydney</span>
                            <span className="text-emerald-400 font-bold">24ms</span>
                          </div>
                        </div>

                        {/* Direct Routing Verification Bar */}
                        <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-800/40 flex items-center justify-between text-xs font-mono">
                          <div className="flex items-center gap-2 text-indigo-300">
                            <Server className="w-3.5 h-3.5 text-indigo-400" />
                            <span>CNAME &rarr; alexrivera.github.io</span>
                          </div>
                          <span className="text-slate-400 text-[11px]">TTL: 300s</span>
                        </div>
                      </motion.div>
                    )}

                  </AnimatePresence>
                </div>

                {/* Simulated Bottom Status Info */}
                <div className="px-6 py-3.5 border-t border-slate-800/80 bg-slate-900/40 flex items-center justify-between text-xs font-mono text-slate-400">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Anycast DNS sync live
                  </span>
                  <a
                    href="https://github.com/is-a-coder/register"
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                  >
                    <span>View GitHub Workflow</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

              </div>
            </Card3D>
          </div>

        </div>

      </div>
    </section>
  );
}
