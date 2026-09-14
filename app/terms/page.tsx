import React from "react";
import Link from "next/link";
import { ShieldCheck, ArrowLeft, AlertTriangle, CheckCircle2, Scale } from "lucide-react";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";

export const metadata = {
  title: "Terms of Service",
  description: "Terms of Service and Acceptable Use Policy for is-a-coder.in subdomains.",
};

export default function TermsPage() {
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

        <div className="space-y-3 pb-8 border-b border-slate-200">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold">
            <Scale className="w-3.5 h-3.5" />
            <span>Acceptable Use &amp; Platform Rules</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Terms of Service
          </h1>
          <p className="text-sm text-slate-500">
            Last updated: September 14, 2024 • Applies to all registered subdomains
          </p>
        </div>

        <div className="mt-8 space-y-8 text-sm sm:text-base text-slate-700 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              1. Service Overview
            </h2>
            <p>
              <strong>is-a-coder.in</strong> provides free subdomains to developers, designers, researchers, and open-source software creators. By registering or using a subdomain under <code>is-a-coder.in</code>, you agree to these Terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
              2. Acceptable Use Policy (Zero Tolerance)
            </h2>
            <p>You may NOT use any <code>is-a-coder.in</code> subdomain for:</p>
            <ul className="list-disc pl-6 space-y-1.5 text-slate-600 text-sm">
              <li><strong>Phishing or Scams:</strong> Creating fake login pages, impersonating financial institutions, brands, or popular platforms.</li>
              <li><strong>Malware &amp; Exploits:</strong> Distributing malicious software, ransomware, keyloggers, or spyware.</li>
              <li><strong>Spam &amp; Illegal Content:</strong> Unsolicited mass communications, illegal file sharing, or content violating applicable laws.</li>
              <li><strong>Subdomain Squatting:</strong> Registering trademarked company names without ownership or active deployment.</li>
            </ul>
            <p className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-medium">
              Violations will result in immediate subdomain revocation, permanent account ban, and IP blocklist reporting.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              3. Service Availability &amp; Disclaimer
            </h2>
            <p>
              This service is provided free of charge on an &ldquo;as-is&rdquo; and &ldquo;as-available&rdquo; basis. While we strive for 99.99% uptime through redundant DNS networks, we do not warrant that service will be uninterrupted.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              4. Termination &amp; Revocation
            </h2>
            <p>
              We reserve the right to suspend or terminate any subdomain that remains inactive with broken targets for over 12 months, or that violates our Acceptable Use Policy.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              5. Abuse Reports
            </h2>
            <p>
              To report abuse, phishing, or trademark violations associated with any <code>is-a-coder.in</code> subdomain, please contact us immediately at{" "}
              <a href="mailto:abuse@is-a-coder.in" className="text-indigo-600 hover:underline font-semibold">
                abuse@is-a-coder.in
              </a>.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
