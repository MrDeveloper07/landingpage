"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  CheckCircle2,
  Send,
  Loader2,
  Copy,
  Check,
  Search,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useDashboard } from "../DashboardContext";

export default function SupportPage() {
  const { user, handleCopy, copiedId } = useDashboard();

  const [supportSearch, setSupportSearch] = useState("");
  const [supportCategory, setSupportCategory] = useState<"all" | "dns" | "ssl" | "subdomain" | "account">("all");
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketCategory, setTicketCategory] = useState("DNS Resolution & Propagation");
  const [ticketPriority, setTicketPriority] = useState<"normal" | "high" | "urgent">("normal");
  const [ticketMessage, setTicketMessage] = useState("");
  const [ticketSubmitting, setTicketSubmitting] = useState(false);
  const [ticketSubmitted, setTicketSubmitted] = useState<{
    id: string;
    subject: string;
    category: string;
    priority: string;
    time: string;
  } | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const supportFaqs = [
    {
      q: "Why is my custom CNAME or A Record not resolving yet?",
      cat: "dns",
      a: "DNS updates propagate globally within 30 seconds to 2 minutes across our Anycast edge nodes. If you just set up your record, please allow 2 minutes. You can also flush your resolver cache using 1.1.1.1/purge-cache or run `ipconfig /flushdns` in your terminal.",
      tag: "DNS Propagation",
    },
    {
      q: "How do I set up automatic Let's Encrypt SSL on my host?",
      cat: "ssl",
      a: "When you link your subdomain in Vercel, GitHub Pages, Netlify, or Cloudflare Pages, the platform automatically validates the CNAME and provisions an encrypted Let's Encrypt certificate.",
      tag: "SSL / TLS",
    },
    {
      q: "Can I update the target IP or CNAME after approval?",
      cat: "subdomain",
      a: "Yes! If you need to point your subdomain to a different server or cloud host, delete and re-claim it with your updated target, or submit a quick support ticket.",
      tag: "Routing Target",
    },
    {
      q: "What causes a subdomain request to be rejected?",
      cat: "subdomain",
      a: "Rejections typically happen due to reserved keywords (e.g. api, auth, admin, google), trademark infringement, or an invalid destination target address.",
      tag: "Moderation",
    },
    {
      q: "How many subdomains can I register?",
      cat: "account",
      a: "Each developer account is allocated a quota of 5 active subdomains under .is-a-coder.in for open-source projects, personal portfolios, and web apps.",
      tag: "Quota",
    },
    {
      q: "How do I report abuse, phishing, or impersonation?",
      cat: "account",
      a: "We maintain zero tolerance for malware and phishing. Please forward infringing URLs directly to sync2pixel@gmail.com for immediate removal.",
      tag: "Security",
    },
  ];

  const searchFilter = supportSearch.toLowerCase().trim();
  const filteredFaqs = supportFaqs.filter((f) => {
    const matchesCat = supportCategory === "all" || f.cat === supportCategory;
    const matchesQuery =
      !searchFilter ||
      f.q.toLowerCase().includes(searchFilter) ||
      f.a.toLowerCase().includes(searchFilter) ||
      f.tag.toLowerCase().includes(searchFilter);
    return matchesCat && matchesQuery;
  });

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="pb-2">
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          Help &amp; Developer Support
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Get quick assistance with DNS routing, SSL verification, or submit a support ticket.
        </p>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left (7 Cols): Support Ticket Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 sm:p-7 rounded-3xl bg-[#0c1222] border border-slate-800/80 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">Create Support Ticket</h2>
                  <p className="text-xs text-slate-400">Send an inquiry to platform engineers</p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Active Queue
              </span>
            </div>

            {/* Ticket Submitted Success State */}
            <AnimatePresence>
              {ticketSubmitted && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/40 space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-white">Ticket Dispatched!</h4>
                      <p className="text-[11px] text-emerald-300">
                        Ref ID: <strong className="font-mono text-white">{ticketSubmitted.id}</strong>
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Replies regarding &quot;{ticketSubmitted.subject}&quot; will be sent to <span className="text-cyan-300 font-mono">{user?.email}</span>.
                  </p>
                  <button
                    onClick={() => setTicketSubmitted(null)}
                    className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 transition cursor-pointer"
                  >
                    Submit Another Ticket
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {!ticketSubmitted && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!ticketSubject.trim() || !ticketMessage.trim()) return;
                  setTicketSubmitting(true);
                  setTimeout(() => {
                    const newId = `ISAC-${Math.floor(10000 + Math.random() * 90000)}`;
                    setTicketSubmitted({
                      id: newId,
                      subject: ticketSubject,
                      category: ticketCategory,
                      priority: ticketPriority,
                      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                    });
                    setTicketSubmitting(false);
                    setTicketSubject("");
                    setTicketMessage("");
                  }, 500);
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Issue Category</label>
                    <select
                      value={ticketCategory}
                      onChange={(e) => setTicketCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-400 text-xs"
                    >
                      <option value="DNS Resolution & Propagation">DNS Propagation</option>
                      <option value="SSL / TLS Certificate Handshake">SSL / TLS Handshake</option>
                      <option value="Subdomain Target Update / Transfer">Target Update</option>
                      <option value="Moderation Review & Appeal">Moderation Appeal</option>
                      <option value="Account & Security Inquiry">Account / Security</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Urgency</label>
                    <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                      {(["normal", "high", "urgent"] as const).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setTicketPriority(p)}
                          className={`py-1.5 rounded-lg capitalize font-medium text-xs transition cursor-pointer ${
                            ticketPriority === p
                              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Subject</label>
                  <input
                    type="text"
                    required
                    maxLength={120}
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    placeholder="e.g. CNAME not resolving for myportfolio.is-a-coder.in"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Message &amp; Details</label>
                  <textarea
                    rows={4}
                    required
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                    placeholder="Describe the issue, target host (GitHub/Vercel), and any error messages..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 text-xs resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={ticketSubmitting || !ticketSubject.trim() || !ticketMessage.trim()}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs shadow-lg shadow-cyan-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  {ticketSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending Ticket...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Ticket</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Right (5 Cols): Direct Contacts & FAQs */}
        <div className="lg:col-span-5 space-y-6">
          {/* Direct Contact Channels */}
          <div className="p-6 rounded-3xl bg-[#0c1222] border border-slate-800/80 shadow-xl space-y-3.5">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider text-slate-400">
              Direct Email Desks
            </h3>

            <div className="space-y-2.5">
              <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <div className="font-semibold text-white">Technical Support</div>
                  <div className="text-[11px] font-mono text-cyan-300">sync2pixel@gmail.com</div>
                </div>
                <button
                  onClick={() => handleCopy("sync2pixel@gmail.com", "contact-sup")}
                  className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                  title="Copy Email"
                >
                  {copiedId === "contact-sup" ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <div className="font-semibold text-white">Abuse &amp; Security</div>
                  <div className="text-[11px] font-mono text-rose-300">sync2pixel@gmail.com</div>
                </div>
                <button
                  onClick={() => handleCopy("sync2pixel@gmail.com", "contact-abs")}
                  className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                  title="Copy Email"
                >
                  {copiedId === "contact-abs" ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* FAQs Accordion */}
          <div className="p-6 rounded-3xl bg-[#0c1222] border border-slate-800/80 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Frequently Asked Questions
              </h3>
            </div>

            {/* FAQ Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search questions..."
                value={supportSearch}
                onChange={(e) => setSupportSearch(e.target.value)}
                className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400"
              />
              {supportSearch && (
                <button
                  onClick={() => setSupportSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* FAQ List */}
            <div className="space-y-2">
              {filteredFaqs.map((faq, index) => {
                const isExpanded = expandedFaq === index;
                return (
                  <div
                    key={faq.q}
                    className="rounded-xl bg-slate-950/70 border border-slate-800/80 overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedFaq(isExpanded ? null : index)}
                      className="w-full p-3 text-left flex items-center justify-between gap-2 text-xs font-medium text-white hover:text-cyan-300 transition cursor-pointer"
                    >
                      <span className="leading-snug">{faq.q}</span>
                      <div className="shrink-0 text-slate-400">
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5 text-cyan-400" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </div>
                    </button>
                    {isExpanded && (
                      <div className="px-3 pb-3 pt-0 text-[11px] text-slate-400 leading-relaxed border-t border-slate-900">
                        <p className="mt-2">{faq.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
