"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Code2, Sparkles, Terminal, ShieldCheck, Zap, CheckCircle2, Globe } from "lucide-react";
import { GithubIcon } from "@/components/ui/Icons";
import DomainChecker from "@/components/ui/DomainChecker";

export default function HeroSection() {
  return (
    <section className="relative min-h-[85vh] lg:min-h-[90vh] pt-32 pb-20 lg:pt-40 lg:pb-28 flex flex-col items-center justify-center overflow-hidden bg-radial-glow bg-grid-pattern">
      
      {/* Background soft ambient glowing circles */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10 text-center flex flex-col items-center">
        
       

        {/* Main Headline */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-2 max-w-4xl"
        >
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.08]">
            I am a{" "}
            <span className="relative inline-block text-gradient-indigo">
              coder.
              <span className="absolute left-0 -bottom-1.5 w-full h-1.5 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full opacity-60" />
            </span>
          </h1>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-slate-700">
            This is my domain.
          </h2>
        </motion.div>

        {/* Subheadline description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="mt-6 text-base sm:text-xl text-slate-600 max-w-2xl leading-relaxed"
        >
          Claim your free, permanent <code className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-mono text-sm sm:text-base border border-indigo-200/80 font-bold">username.is-a-coder.in</code> developer address. Powered by Cloudflare edge DNS with instant GitOps automation.
        </motion.p>

        {/* Interactive Domain Search & Instant Claim Bar */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
          className="w-full mt-10"
          id="claim"
        >
          <DomainChecker />
        </motion.div>

        {/* Action CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
          className="flex flex-wrap items-center justify-center gap-4 mt-8"
        >
          <a
            href="#how-it-works"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-all shadow-[0_10px_25px_rgba(15,23,42,0.15)] hover:shadow-[0_15px_30px_rgba(15,23,42,0.25)] hover:-translate-y-0.5 active:translate-y-0"
          >
            <span>How It Works</span>
            <ArrowRight className="w-4 h-4" />
          </a>

          <a
            href="#showcase"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-all border border-slate-200 shadow-xs hover:shadow-md hover:-translate-y-0.5"
          >
            <Code2 className="w-4 h-4 text-indigo-600" />
            <span>Explore Showcase</span>
          </a>

          <a
            href="https://github.com/is-a-coder/register"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3.5 text-xs text-slate-500 hover:text-slate-900 font-medium transition-colors"
          >
            <GithubIcon className="w-4 h-4" />
            <span>View on GitHub</span>
          </a>
        </motion.div>

        {/* Key Feature Badges Row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 mt-14 pt-8 border-t border-slate-200/70 text-xs sm:text-sm text-slate-600 font-medium"
        >
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <span>&lt; 20ms Cloudflare DNS</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Automated SSL & HTTPS</span>
          </div>
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-indigo-600" />
            <span>100% Free & Open Source</span>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-sky-600" />
            <span>A / CNAME / TXT Support</span>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
