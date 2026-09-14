"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Star, Globe, Sparkles, Terminal, ArrowUpRight } from "lucide-react";
import { GithubIcon } from "@/components/ui/Icons";
import { SHOWCASE_PROFILES } from "@/utils/constants";
import Card3D from "@/components/ui/Card3D";

const CATEGORIES = ["All", "Full Stack", "AI & ML", "DevOps", "Mobile"] as const;

export default function ShowcaseSection() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const filteredProfiles = selectedCategory === "All"
    ? SHOWCASE_PROFILES
    : SHOWCASE_PROFILES.filter((p) => p.category === selectedCategory);

  return (
    <section id="showcase" className="relative py-28 overflow-hidden">
      
      {/* Soft ambient background */}
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-4"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Developer Showcase
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight"
          >
            Built by Developers, for Developers
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-4 text-slate-600 text-base sm:text-lg"
          >
            Explore live portfolios, open source documentation hubs, and web experiments running on <code className="text-indigo-600 font-semibold font-mono">*.is-a-coder.in</code>.
          </motion.p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 scale-105"
                  : "bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 3D Showcase Grid */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {filteredProfiles.map((profile, idx) => (
              <motion.div
                key={profile.id}
                layout
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
              >
                <Card3D intensity={12} glareIntensity={0.2} className="h-full">
                  <div className="h-full p-6 sm:p-7 rounded-3xl bg-white/95 border border-slate-200/80 shadow-[0_15px_35px_rgba(0,0,0,0.03)] hover:shadow-[0_25px_50px_rgba(79,70,229,0.1)] transition-all duration-300 flex flex-col justify-between group">
                    
                    <div>
                      {/* Top: Avatar & Meta */}
                      <div className="flex items-start justify-between mb-5">
                        <div className="flex items-center gap-3.5">
                          <img
                            src={profile.avatar}
                            alt={profile.name}
                            className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-100 shadow-sm"
                          />
                          <div>
                            <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                              {profile.name}
                            </h3>
                            <p className="text-xs text-slate-500 font-medium">{profile.role}</p>
                          </div>
                        </div>

                        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100/80">
                          {profile.category}
                        </span>
                      </div>

                      {/* Subdomain Active Link Pill */}
                      <div className="mb-4 p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between group-hover:border-indigo-200 transition-colors">
                        <div className="flex items-center gap-2 text-xs font-mono font-bold text-indigo-600 truncate">
                          <Globe className="w-3.5 h-3.5 shrink-0 text-indigo-500" />
                          <span className="truncate">{profile.username}.is-a-coder.in</span>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
                      </div>

                      {/* Bio */}
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-2">
                        {profile.bio}
                      </p>
                    </div>

                    {/* Bottom: Tags & GitHub Stars */}
                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex flex-wrap gap-1.5">
                        {profile.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-1 text-xs text-amber-600 font-semibold font-mono">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                        <span>{profile.stars}</span>
                      </div>
                    </div>

                  </div>
                </Card3D>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Submit your portfolio banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm text-xs sm:text-sm text-slate-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Want your project featured here? Add your handle in the registry!</span>
            <a
              href="#claim"
              className="text-indigo-600 font-bold hover:underline flex items-center gap-1"
            >
              Claim your spot →
            </a>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
