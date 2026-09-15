import React from "react";
import Link from "next/link";
import {
  Mail,
  ArrowLeft,
  MessageSquare,
  Globe2,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  ExternalLink,
} from "lucide-react";
import { GithubIcon, TwitterIcon } from "@/components/ui/Icons";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";

export const metadata = {
  title: "Contact & Developer Support",
  description: "Get in touch with the is-a-coder.in team for domain help, inquiries, or feedback.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-20 w-full">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Homepage</span>
        </Link>

        {/* Header */}
        <div className="space-y-3 pb-8 border-b border-slate-200">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Developer Support &amp; Help</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Contact &amp; Support
          </h1>
          <p className="text-sm text-slate-500">
            Have questions about subdomain configurations, DNS propagation, or partnership? Reach out to us.
          </p>
        </div>

        {/* Support Channels Grid */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Email Support Card */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3 hover:border-indigo-300 transition">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <Mail className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-slate-900">General &amp; Technical Support</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              For assistance with DNS records, domain ownership transfer, or dashboard issues.
            </p>
            <a
              href="mailto:support@is-a-coder.in"
              className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline pt-1"
            >
              support@is-a-coder.in →
            </a>
          </div>

          {/* Abuse & Security Card */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3 hover:border-rose-300 transition">
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-slate-900">Security &amp; Abuse Reports</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Report phishing, scam pages, trademark violations, or security vulnerabilities.
            </p>
            <a
              href="mailto:abuse@is-a-coder.in"
              className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:underline pt-1"
            >
              abuse@is-a-coder.in →
            </a>
          </div>

          {/* GitHub Community Card */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3 hover:border-indigo-300 transition">
            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800">
              <GithubIcon className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-slate-900">GitHub Community &amp; Issues</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Contribute to the registry, file bugs, request new features, or view documentation.
            </p>
            <a
              href="https://github.com/is-a-coder"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs font-bold text-slate-900 hover:underline pt-1"
            >
              github.com/is-a-coder <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* FAQs & Knowledge Base Card */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3 hover:border-indigo-300 transition">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-slate-900">Frequently Asked Questions</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Find instant answers to common questions about setting up GitHub Pages and Vercel.
            </p>
            <Link
              href="/faq"
              className="inline-flex items-center gap-1 text-xs font-bold text-cyan-600 hover:underline pt-1"
            >
              View Knowledge Base →
            </Link>
          </div>
        </div>

        {/* Dashboard Quick Access */}
        <div className="mt-10 p-6 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold">Already have an account?</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage all your DNS records and subdomains in real-time from your dashboard.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs transition shadow-md shadow-cyan-500/20 text-center shrink-0"
          >
            Go to Dashboard
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
