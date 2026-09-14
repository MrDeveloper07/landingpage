import React from "react";
import Link from "next/link";
import { Globe2, ArrowLeft, Sparkles, ShieldCheck, Zap } from "lucide-react";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import DomainChecker from "@/components/ui/DomainChecker";
import { FAQ_ITEMS } from "@/utils/constants";

export const metadata = {
  title: "Subdomain Availability Checker — Check & Claim Your Free Handle",
  description:
    "Instantly search and check if your desired username.is-a-coder.in subdomain is available. Free DNS hosting for developers with zero renewal fees.",
};

export default function CheckPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-20 w-full text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Homepage</span>
        </Link>

        {/* Header */}
        <div className="space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Live DNS &amp; Database Registry</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Subdomain Availability Checker
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
            Search for your developer handle or project name below. Instant verification with zero cost or renewal fees.
          </p>
        </div>

        {/* Interactive Domain Searcher */}
        <div className="mb-14">
          <DomainChecker />
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-left pt-10 border-t border-slate-200">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-3 font-bold">
              ⚡
            </div>
            <h2 className="font-bold text-slate-900 text-base">Instant Verification</h2>
            <p className="text-xs text-slate-500 mt-1">
              Checks against live database records and reserved system names in real-time.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-3 font-bold">
              🔒
            </div>
            <h2 className="font-bold text-slate-900 text-base">Free TLS 1.3 SSL</h2>
            <p className="text-xs text-slate-500 mt-1">
              Automatic HTTPS certificates provided for GitHub Pages, Vercel, and Netlify.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 mb-3 font-bold">
              🛠️
            </div>
            <h2 className="font-bold text-slate-900 text-base">All Record Types</h2>
            <p className="text-xs text-slate-500 mt-1">
              Complete support for CNAME, A (IPv4), AAAA (IPv6), and TXT verification records.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
