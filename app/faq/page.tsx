import React from "react";
import Link from "next/link";
import {
  HelpCircle,
  ArrowLeft,
  Globe2,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Terminal,
  Server,
  Layers,
  Sparkles,
} from "lucide-react";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";

export const metadata = {
  title: "Frequently Asked Questions",
  description: "Common questions and setup instructions for is-a-coder.in subdomains.",
};

const FAQS = [
  {
    category: "General",
    questions: [
      {
        q: "Is is-a-coder.in really 100% free?",
        a: "Yes! is-a-coder.in is a free community initiative created to provide permanent, high-speed subdomain identities for developers, engineers, and open-source creators worldwide. There are no hidden fees or surprise renewals.",
      },
      {
        q: "How many subdomains can I register?",
        a: "Each developer account can register up to 5 active subdomains. If you are managing large open-source projects or educational workshops needing more, you can request an expansion through our support channel.",
      },
      {
        q: "Do my subdomains ever expire?",
        a: "Your subdomains remain active permanently as long as they adhere to our Acceptable Use Policy and point to active projects. Subdomains pointing to 404/broken targets for over 12 months may be archived after notification.",
      },
    ],
  },
  {
    category: "DNS & Configuration",
    questions: [
      {
        q: "What DNS record types are supported?",
        a: "We support CNAME (ideal for GitHub Pages, Vercel, Netlify, Render, Cloudflare Pages), A records (IPv4 addresses for VPS / EC2), AAAA records (IPv6 addresses), and TXT records (for domain verification and ownership proofs).",
      },
      {
        q: "How fast does DNS propagate?",
        a: "Our authoritative DNS infrastructure uses ultra-low TTLs across global Anycast edge networks. Approvals and DNS modifications generally propagate globally within 60 to 120 seconds.",
      },
      {
        q: "How do I get an SSL certificate for my subdomain?",
        a: "Modern hosting platforms (such as GitHub Pages, Vercel, Netlify, and Cloudflare) automatically issue free Let's Encrypt SSL/TLS certificates once you configure your custom subdomain in their settings.",
      },
    ],
  },
  {
    category: "Rules & Security",
    questions: [
      {
        q: "What content is prohibited?",
        a: "We maintain a zero-tolerance policy against phishing, malware distribution, scams, botnets, spam, copyright infringement, and illegal material. Violations are instantly revoked and reported.",
      },
      {
        q: "Can I transfer my subdomain to another user?",
        a: "Yes, you can release a subdomain from your dashboard or contact our support team from your registered email address to transfer ownership.",
      },
    ],
  },
];

export default function FaqPage() {
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
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Developer Knowledge Base</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-sm text-slate-500">
            Everything you need to know about registering, configuring, and deploying with is-a-coder.in
          </p>
        </div>

        {/* FAQ Categories */}
        <div className="mt-8 space-y-10">
          {FAQS.map((cat, idx) => (
            <div key={idx} className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wider text-xs px-1 text-indigo-600">
                {cat.category}
              </h2>

              <div className="space-y-3">
                {cat.questions.map((faq, fIdx) => (
                  <div
                    key={fIdx}
                    className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2 hover:border-indigo-300 transition"
                  >
                    <h3 className="text-base font-bold text-slate-900 flex items-start gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 text-xs font-bold shrink-0 mt-0.5">
                        Q
                      </span>
                      <span>{faq.q}</span>
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed pl-8.5">
                      {faq.a}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Quick CTA Box */}
        <div className="mt-12 p-8 rounded-3xl bg-gradient-to-tr from-indigo-900 via-indigo-950 to-slate-900 text-white text-center space-y-4 shadow-xl">
          <Sparkles className="w-8 h-8 text-cyan-400 mx-auto" />
          <h3 className="text-xl font-bold">Have another question or need help?</h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
            Our team is happy to help you configure custom records, GitHub pages routing, or apex domain setups.
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            <Link
              href="/dashboard"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs transition shadow-lg shadow-cyan-500/20"
            >
              Open Dashboard
            </Link>
            <Link
              href="/contact"
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition border border-white/15"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
