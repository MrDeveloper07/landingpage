import React from "react";
import Link from "next/link";
import { Globe2, ShieldCheck, ArrowLeft, Lock, Database, Eye } from "lucide-react";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";

export const metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for is-a-coder.in subdomain and identity platform.",
};

export default function PrivacyPage() {
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
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Legal &amp; Data Protection</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-sm text-slate-500">
            Last updated: September 14, 2024 • Effective immediately
          </p>
        </div>

        <div className="mt-8 space-y-8 text-sm sm:text-base text-slate-700 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <Eye className="w-5 h-5 text-indigo-600" />
              1. Information We Collect
            </h2>
            <p>
              When you create an account or request a subdomain on <strong>is-a-coder.in</strong>, we collect:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-slate-600 text-sm">
              <li><strong>Account Data:</strong> Your name and email address provided during registration.</li>
              <li><strong>Subdomain Configuration:</strong> The subdomain prefix, DNS record type (CNAME, A, AAAA, TXT), and target destination (e.g. your GitHub Pages or Vercel URL).</li>
              <li><strong>Security Logs:</strong> Standard server logs (IP address, browser user-agent) strictly for DDoS mitigation and preventing abuse.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-600" />
              2. How We Use Your Information
            </h2>
            <p>Your information is used strictly to:</p>
            <ul className="list-disc pl-6 space-y-1.5 text-slate-600 text-sm">
              <li>Provision and maintain your free subdomain DNS records.</li>
              <li>Allow you to access and edit your records via the developer dashboard.</li>
              <li>Detect and prevent malicious activity, phishing, or spam.</li>
            </ul>
            <p className="font-semibold text-slate-900">
              We never sell, rent, or monetize your personal data or email address.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-5 h-5 text-indigo-600" />
              3. Data Security &amp; Storage
            </h2>
            <p>
              All passwords are cryptographically hashed using salted <code>bcrypt</code> algorithms before storage in MongoDB. Authentication tokens are transmitted exclusively over secure HTTPS cookies with <code>httpOnly</code> and <code>SameSite</code> protection.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              4. Cookies &amp; Tracking
            </h2>
            <p>
              is-a-coder.in uses strictly necessary session cookies to maintain your login state. We do not use third-party behavioral advertising trackers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              5. Contact Us
            </h2>
            <p>
              If you have any questions about this Privacy Policy or wish to delete your account and associated records, please email us at{" "}
              <a href="mailto:privacy@is-a-coder.in" className="text-indigo-600 hover:underline font-semibold">
                privacy@is-a-coder.in
              </a>.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
