"use client";

import React from "react";
import { motion } from "framer-motion";
import { Zap, GitPullRequest, Cpu, Shield, ArrowUpRight, Terminal, Check } from "lucide-react";
import { FEATURES_DATA } from "@/utils/constants";
import Card3D from "@/components/ui/Card3D";

const renderFeatureIcon = (iconName: string) => {
  switch (iconName) {
    case "GitPullRequest":
      return <GitPullRequest className="w-7 h-7" />;
    case "Cpu":
      return <Cpu className="w-7 h-7" />;
    case "Shield":
      return <Shield className="w-7 h-7" />;
    default:
      return <Zap className="w-7 h-7" />;
  }
};

export default function FeaturesSection() {
  return (
    <section id="features" className="relative py-28 overflow-hidden">
      
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-4"
          >
            <Terminal className="w-3.5 h-3.5" />
            Developer-First Architecture
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight"
          >
            Everything You Need to Claim & Scale
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-4 text-slate-600 text-base sm:text-lg"
          >
            No cryptic registrar control panels. No payment prompts. Complete developer freedom with modern GitOps workflows.
          </motion.p>
        </div>

        {/* 4 Feature Cards Grid with 3D Tilt and Depth Layers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          {FEATURES_DATA.map((feature, idx) => {
            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 40, rotateX: 8 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.7, delay: idx * 0.15 }}
              >
                <Card3D intensity={14} glareIntensity={0.25} className="h-full">
                  <div className="h-full p-8 sm:p-9 rounded-3xl bg-white/95 border border-slate-200/90 shadow-[0_20px_45px_rgba(0,0,0,0.04)] hover:shadow-[0_30px_60px_rgba(79,70,229,0.12)] transition-all duration-300 flex flex-col justify-between group">
                    
                    {/* Top Header Row */}
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500/10 to-violet-500/10 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-xs">
                          {renderFeatureIcon(feature.iconName)}
                        </div>
                        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100/90 text-slate-700 border border-slate-200/60 font-mono">
                          {feature.badge}
                        </span>
                      </div>

                      {/* Title & Description */}
                      <h3 className="text-xl sm:text-2xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {feature.title}
                      </h3>
                      <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>

                    {/* Interactive Code Preview Box inside the 3D card */}
                    {feature.codeSnippet && (
                      <div className="mt-6 rounded-2xl bg-slate-900 p-4 font-mono text-xs text-slate-200 border border-slate-800 shadow-inner overflow-x-auto relative preserve-3d">
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[11px] text-slate-400">
                          <span className="flex items-center gap-1.5 text-indigo-400">
                            <Terminal className="w-3 h-3" />
                            {feature.highlight}
                          </span>
                          <span className="text-emerald-400 flex items-center gap-1">
                            <Check className="w-3 h-3" /> active
                          </span>
                        </div>
                        <pre className="text-slate-300 leading-snug whitespace-pre-wrap">
                          {feature.codeSnippet}
                        </pre>
                      </div>
                    )}

                    {/* Bottom Link indicator */}
                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500 group-hover:text-indigo-600 transition-colors">
                      <span>Learn specification</span>
                      <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>

                  </div>
                </Card3D>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
