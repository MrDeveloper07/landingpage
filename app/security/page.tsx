import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ArrowLeft,
  AlertTriangle,
  Lock,
  Server,
  Zap,
  CheckCircle2,
  Mail,
  FileCode2,
} from "lucide-react";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";

export const metadata = {
  title: "Security & Abuse Policy",
  description: "Security architecture, abuse reporting, and safety commitments for is-a-coder.in.",
};

export default function SecurityPage() {
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Trust, Security &amp; Safety</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Security &amp; Abuse Policy
          </h1>
          <p className="text-sm text-slate-500">
            How we protect the developer ecosystem, maintain 99.99% uptime, and enforce zero tolerance against malicious abuse.
          </p>
        </div>

        {/* Sections */}
        <div className="mt-8 space-y-8 text-sm sm:text-base text-slate-700 leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-5 h-5 text-indigo-600" />
              1. Platform &amp; Authentication Security
            </h2>
            <p>
              Our authentication and dashboard infrastructure utilizes defense-in-depth engineering to ensure user data and DNS configurations are safeguarded:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-slate-600 text-sm">
              <li><strong>Password Protection:</strong> Passwords are cryptographically salted and hashed with <code>bcrypt</code> before persistent database storage.</li>
              <li><strong>Session Tokens:</strong> JWT tokens are stored exclusively in <code>httpOnly</code>, <code>Secure</code>, and <code>SameSite=Lax</code> cookies to prevent Cross-Site Scripting (XSS) and CSRF token theft.</li>
              <li><strong>Brute-Force Rate Limiting:</strong> Automated IP and account-level rate limiters throttle login and registration attempts, locking accounts after repeated failures.</li>
              <li><strong>OTP Email Verification:</strong> All account signups require 6-digit one-time code verification to ensure verified email ownership.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <Server className="w-5 h-5 text-indigo-600" />
              2. Anycast DNS &amp; DDoS Mitigation
            </h2>
            <p>
              Our authoritative DNS servers are distributed across global edge nodes with automated Anycast routing and multi-gigabit DDoS mitigation to ensure low latency and high availability for developer domains worldwide.
            </p>
          </section>

          {/* Section 3: Abuse Policy */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
              3. Zero-Tolerance Abuse Enforcement
            </h2>
            <p>
              We actively monitor and scan subdomains to prevent malicious activities. Immediate revocation and domain blacklisting apply to any subdomain involved in:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200/80 text-xs text-rose-900 space-y-1">
                <p className="font-bold">🚫 Phishing &amp; Brand Spoofing</p>
                <p className="text-slate-600">Deceptive login portals mimicking Google, banks, social networks, or cryptocurrency wallets.</p>
              </div>
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200/80 text-xs text-rose-900 space-y-1">
                <p className="font-bold">🚫 Malware &amp; Ransomware</p>
                <p className="text-slate-600">Hosting executable payloads, exploit kits, spyware, or keyloggers.</p>
              </div>
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200/80 text-xs text-rose-900 space-y-1">
                <p className="font-bold">🚫 Command &amp; Control / Botnets</p>
                <p className="text-slate-600">Pointing subdomains to unauthorized C2 infrastructure or DDoS networks.</p>
              </div>
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200/80 text-xs text-rose-900 space-y-1">
                <p className="font-bold">🚫 Trademark Impersonation</p>
                <p className="text-slate-600">Squatting or registering names of registered companies without authorization.</p>
              </div>
            </div>
          </section>

          {/* Section 4: Reporting */}
          <section className="space-y-3 p-6 rounded-2xl bg-indigo-50/70 border border-indigo-200/80">
            <h2 className="text-lg font-bold text-indigo-950 flex items-center gap-2">
              <Mail className="w-5 h-5 text-indigo-600" />
              4. How to Report Malicious Subdomains
            </h2>
            <p className="text-indigo-900 text-sm">
              If you discover any <code>is-a-coder.in</code> subdomain violating these safety rules, please report it immediately. Our security team reviews and acts on reports within 4–12 hours:
            </p>
            <p className="font-mono text-sm font-bold text-indigo-700">
              abuse@is-a-coder.in
            </p>
            <p className="text-xs text-indigo-700/80">
              Please include the full subdomain URL, evidence/screenshots, and target IP or host in your report.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
