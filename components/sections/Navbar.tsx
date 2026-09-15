"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Menu, X, Sparkles } from "lucide-react";
import { GithubIcon, FaviconIcon } from "@/components/ui/Icons";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks: { label: string; href: string; external?: boolean }[] = [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Showcase", href: "#showcase" },
    { label: "FAQ", href: "#faq" },
    { label: "Stats", href: "#stats" },
  ];

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/85 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_10px_30px_rgba(0,0,0,0.03)] py-3.5"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Brand Logo with 3D depth icon */}
        <a href="#" className="flex items-center gap-2.5 group">
          <div className="relative w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center p-1 group-hover:scale-105 transition-transform shadow-sm">
            <FaviconIcon className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 text-lg tracking-tight flex items-center gap-1">
              is-a-coder<span className="text-indigo-600 font-extrabold">.in</span>
            </span>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 -mt-1">
              Free Developer Identity
            </span>
          </div>
        </a>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-1 bg-white/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200/80 shadow-xs">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noreferrer" : undefined}
              className="px-3.5 py-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-slate-50/80 rounded-full transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right Action buttons */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            href="/login"
            className="group relative inline-flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-[0_4px_14px_rgba(79,70,229,0.3)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.4)] transition-all active:scale-95"
          >
            <span>Sign In</span>
          </Link>

        </div>

        {/* Mobile menu trigger button */}
        <div className="flex md:hidden items-center gap-2">
          
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 focus:outline-none"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white/95 backdrop-blur-2xl border-b border-slate-200 px-6 py-4 space-y-3"
          >
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-base font-medium text-slate-700 hover:text-indigo-600"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <a
                href="https://github.com/is-a-coder/register"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-sm text-slate-600 font-medium"
              >
                <GithubIcon className="w-4 h-4" />
                GitHub Repository
              </a>
              <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                Operational 99.99%
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
