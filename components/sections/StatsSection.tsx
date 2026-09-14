"use client";

import React from "react";
import { motion } from "framer-motion";
import { Globe, Zap, ShieldCheck, Users, Cloud, GitBranch, Triangle, Lock, Server } from "lucide-react";
import { STATS_DATA, TRUST_BADGES } from "@/utils/constants";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import Card3D from "@/components/ui/Card3D";

const renderStatIcon = (iconName: string) => {
  switch (iconName) {
    case "Zap":
      return <Zap className="w-6 h-6" />;
    case "ShieldCheck":
      return <ShieldCheck className="w-6 h-6" />;
    case "Users":
      return <Users className="w-6 h-6" />;
    default:
      return <Globe className="w-6 h-6" />;
  }
};

const renderTrustIcon = (iconName: string) => {
  switch (iconName) {
    case "Cloud":
      return <Cloud className="w-4 h-4 text-indigo-500 group-hover:scale-110 transition-transform" />;
    case "GitBranch":
      return <GitBranch className="w-4 h-4 text-indigo-500 group-hover:scale-110 transition-transform" />;
    case "Triangle":
      return <Triangle className="w-4 h-4 text-indigo-500 group-hover:scale-110 transition-transform" />;
    case "Lock":
      return <Lock className="w-4 h-4 text-indigo-500 group-hover:scale-110 transition-transform" />;
    default:
      return <Zap className="w-4 h-4 text-indigo-500 group-hover:scale-110 transition-transform" />;
  }
};

export default function StatsSection() {
  return (
    <section id="stats" className="relative py-24 bg-gradient-to-b from-transparent via-slate-50/50 to-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-3"
          >
            Global Network Metrics
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight"
          >
            Engineered for High-Availability & Speed
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-4 text-slate-600 text-base sm:text-lg"
          >
            Join thousands of developers worldwide relying on our rock-solid Anycast DNS infrastructure.
          </motion.p>
        </div>

        {/* 3D Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {STATS_DATA.map((stat, idx) => {
            return (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, y: 30, rotateX: 10 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: idx * 0.12 }}
              >
                <Card3D intensity={12} glareIntensity={0.2} className="h-full">
                  <div className="h-full p-7 rounded-2xl bg-white/90 border border-slate-200/80 shadow-[0_15px_35px_rgba(0,0,0,0.03)] hover:shadow-[0_25px_50px_rgba(79,70,229,0.09)] transition-all duration-300 flex flex-col justify-between group">
                    
                    {/* Top Row: Icon & Badge */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-12 h-12 rounded-xl bg-indigo-50/80 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-xs">
                        {renderStatIcon(stat.icon)}
                      </div>
                      <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        LIVE
                      </span>
                    </div>

                    {/* Numeric Count-up Value */}
                    <div className="mb-2">
                      <div className="text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight flex items-baseline">
                        <AnimatedCounter
                          value={stat.value}
                          prefix={stat.prefix}
                          suffix={stat.suffix}
                          decimals={stat.value % 1 !== 0 ? 2 : 0}
                          duration={2200}
                        />
                      </div>
                      <h3 className="text-sm font-bold text-slate-800 mt-2">
                        {stat.label}
                      </h3>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-500 leading-relaxed mt-2 pt-3 border-t border-slate-100">
                      {stat.description}
                    </p>
                  </div>
                </Card3D>
              </motion.div>
            );
          })}
        </div>

        {/* Ecosystem Trust Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 p-6 rounded-2xl glass-panel flex flex-wrap items-center justify-around gap-6 text-slate-600 border border-slate-200/60"
        >
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Backed by Industry Standards
          </span>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
            {TRUST_BADGES.map((badge) => {
              return (
                <div
                  key={badge.name}
                  className="flex items-center gap-2 text-slate-700 hover:text-indigo-600 transition-colors group cursor-default"
                >
                  {renderTrustIcon(badge.icon)}
                  <span className="text-xs sm:text-sm font-semibold">{badge.name}</span>
                </div>
              );
            })}
          </div>
        </motion.div>

      </div>
    </section>
  );
}
