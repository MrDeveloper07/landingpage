"use client";

import React from "react";
import Link from "next/link";
import { Terminal, Heart, Shield, Sparkles, ExternalLink, ShieldCheck } from "lucide-react";
import { GithubIcon, TwitterIcon } from "@/components/ui/Icons";

export default function Footer() {
  return (
    <footer className="relative bg-white border-t border-slate-200/80 pt-16 pb-12 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top 5-Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-100">
          {/* Col 1: Brand Info (2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-sm">
                <Terminal className="w-4 h-4" />
              </div>
              <span className="font-bold text-slate-900 text-lg tracking-tight">
                is-a-coder<span className="text-indigo-600 font-extrabold">.in</span>
              </span>
            </Link>

            <p className="text-sm text-slate-600 max-w-sm leading-relaxed">
              A free, permanent subdomain service dedicated to software engineers, researchers, and creators worldwide. Fast Anycast DNS with instant dashboard management.
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200/70">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>All Global DNS Nodes Operational (99.99%)</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-600">
              <li>
                <a href="#features" className="hover:text-indigo-600 transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-indigo-600 transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#showcase" className="hover:text-indigo-600 transition-colors">
                  Showcase Gallery
                </a>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-indigo-600 transition-colors">
                  User Dashboard
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-indigo-600 transition-colors">
                  Sign In / Register
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Resources & Standards */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
              Resources &amp; AI
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-600">
              <li>
                <Link href="/sitemap.xml" className="hover:text-indigo-600 transition-colors">
                  Sitemap XML
                </Link>
              </li>
              <li>
                <Link href="/robots.txt" className="hover:text-indigo-600 transition-colors">
                  Robots.txt
                </Link>
              </li>
              <li>
                <Link href="/llms.txt" className="hover:text-indigo-600 transition-colors">
                  LLMs.txt (AI Context)
                </Link>
              </li>
              <li>
                <Link href="/.well-known/security.txt" className="hover:text-indigo-600 transition-colors">
                  Security.txt
                </Link>
              </li>
              <li>
                <Link href="/humans.txt" className="hover:text-indigo-600 transition-colors">
                  Humans.txt
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Legal & Connect */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
              Legal &amp; Trust
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-600 mb-6">
              <li>
                <Link href="/privacy" className="hover:text-indigo-600 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-indigo-600 transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>

            <div className="flex items-center gap-3 mb-3">
              <a
                href="https://github.com/is-a-coder"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 flex items-center justify-center text-slate-700 transition-colors"
                aria-label="GitHub"
              >
                <GithubIcon className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 flex items-center justify-center text-slate-700 transition-colors"
                aria-label="Twitter"
              >
                <TwitterIcon className="w-4 h-4" />
              </a>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Open-source initiative for developer identity.
            </p>
          </div>
        </div>

        {/* Bottom copyright & attribution */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2024 is-a-coder.in. Free developer subdomain registry.</p>
          <div className="flex items-center gap-1">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
            <span>for developers everywhere.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
