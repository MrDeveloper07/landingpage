"use client";

import React, { useState } from "react";
import {
  Terminal,
  Zap,
  Layers,
  Activity,
  Server,
  Code2,
  Copy,
  Check,
  CheckCircle2,
} from "lucide-react";
import { useDashboard } from "../DashboardContext";

export default function DnsSetupPage() {
  const { handleCopy, copiedId } = useDashboard();
  const [selectedGuide, setSelectedGuide] = useState<"github" | "vercel" | "cloudflare" | "netlify" | "vps">("github");

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="pb-2">
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          DNS Setup &amp; Deployment Guides
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Connect your custom <code className="text-cyan-300 font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">*.is-a-coder.in</code> subdomain to your hosting provider in 3 quick steps.
        </p>
      </div>

      {/* Platform Selector Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#0c1222] border border-slate-800 overflow-x-auto">
        {(
          [
            { id: "github", label: "GitHub Pages", tag: "CNAME" },
            { id: "vercel", label: "Vercel", tag: "CNAME" },
            { id: "cloudflare", label: "Cloudflare Pages", tag: "CNAME" },
            { id: "netlify", label: "Netlify / Render", tag: "CNAME" },
            { id: "vps", label: "Custom VPS / Linux", tag: "A Record" },
          ] as const
        ).map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedGuide(p.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-2 ${
              selectedGuide === p.id
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <span>{p.label}</span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                selectedGuide === p.id
                  ? "bg-white/20 text-white"
                  : "bg-slate-800 text-slate-400"
              }`}
            >
              {p.tag}
            </span>
          </button>
        ))}
      </div>

      {/* Active Guide Card */}
      <div className="p-6 sm:p-7 rounded-3xl bg-[#0c1222] border border-slate-800/90 shadow-xl space-y-6">
        {selectedGuide === "github" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold">
                  <Terminal className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">GitHub Pages Deployment</h2>
                  <p className="text-xs text-slate-400">Host personal portfolios, documentation sites, and static blogs</p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                CNAME Record
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <h4 className="font-bold text-white">Open Repository Settings</h4>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Navigate to your repository on GitHub → <strong>Settings</strong> → <strong>Pages</strong>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <h4 className="font-bold text-white">Add Custom Domain</h4>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  In Custom domain, enter <code className="text-cyan-300 font-mono">yourname.is-a-coder.in</code>, click Save &amp; check &quot;Enforce HTTPS&quot;.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-xs">
                  3
                </div>
                <h4 className="font-bold text-white">Set Target in is-a-coder</h4>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Set your is-a-coder CNAME routing target to your GitHub Pages username address below.
                </p>
              </div>
            </div>

            {/* Copy Box */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono text-cyan-300">
              <div className="truncate flex items-center gap-2">
                <span className="text-slate-500 text-[11px]">Routing Target:</span>
                <span className="font-bold">your-username.github.io</span>
              </div>
              <button
                onClick={() => handleCopy("your-username.github.io", "guide-gh-c")}
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 hover:text-white transition cursor-pointer flex items-center gap-1.5"
              >
                {copiedId === "guide-gh-c" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-sans font-semibold">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span className="font-sans">Copy Target</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/20 text-[11px] text-slate-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>GitHub automatically provisions valid TLS/SSL certificates within 1-2 minutes.</span>
            </div>
          </div>
        )}

        {selectedGuide === "vercel" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Vercel Deployment</h2>
                  <p className="text-xs text-slate-400">Next.js, React, Astro, Remix, and Serverless frontend applications</p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                CNAME Record
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <h4 className="font-bold text-white">Open Vercel Project</h4>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Navigate to your project in Vercel → <strong>Settings</strong> → <strong>Domains</strong>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <h4 className="font-bold text-white">Add Subdomain</h4>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Add <code className="text-cyan-300 font-mono">yourname.is-a-coder.in</code> to your project domains list.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-xs">
                  3
                </div>
                <h4 className="font-bold text-white">Point CNAME Target</h4>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Set your is-a-coder CNAME Target to Vercel&apos;s DNS edge endpoint below.
                </p>
              </div>
            </div>

            {/* Copy Box */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono text-cyan-300">
              <div className="truncate flex items-center gap-2">
                <span className="text-slate-500 text-[11px]">Routing Target:</span>
                <span className="font-bold">cname.vercel-dns.com</span>
              </div>
              <button
                onClick={() => handleCopy("cname.vercel-dns.com", "guide-ver-c")}
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 hover:text-white transition cursor-pointer flex items-center gap-1.5"
              >
                {copiedId === "guide-ver-c" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-sans font-semibold">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span className="font-sans">Copy Target</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/20 text-[11px] text-slate-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Vercel verifies DNS instantly and issues an automatic Let&apos;s Encrypt certificate.</span>
            </div>
          </div>
        )}

        {selectedGuide === "cloudflare" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Cloudflare Pages &amp; Workers</h2>
                  <p className="text-xs text-slate-400">Edge functions, full-stack web applications, and static builds</p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                CNAME Record
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <h4 className="font-bold text-white">Cloudflare Pages</h4>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Open your project in Cloudflare Dashboard → <strong>Custom Domains</strong>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <h4 className="font-bold text-white">Set Custom Domain</h4>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Click &quot;Set up a custom domain&quot; and enter <code className="text-cyan-300 font-mono">yourname.is-a-coder.in</code>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-xs">
                  3
                </div>
                <h4 className="font-bold text-white">Point CNAME Target</h4>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Set your is-a-coder CNAME Target to your default <code className="text-cyan-300 font-mono">*.pages.dev</code> hostname.
                </p>
              </div>
            </div>

            {/* Copy Box */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono text-cyan-300">
              <div className="truncate flex items-center gap-2">
                <span className="text-slate-500 text-[11px]">Routing Target:</span>
                <span className="font-bold">your-project.pages.dev</span>
              </div>
              <button
                onClick={() => handleCopy("your-project.pages.dev", "guide-cf-c")}
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 hover:text-white transition cursor-pointer flex items-center gap-1.5"
              >
                {copiedId === "guide-cf-c" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-sans font-semibold">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span className="font-sans">Copy Target</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/20 text-[11px] text-slate-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Benefit from Cloudflare Anycast edge caching and zero egress costs worldwide.</span>
            </div>
          </div>
        )}

        {selectedGuide === "netlify" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Netlify &amp; Render Deployment</h2>
                  <p className="text-xs text-slate-400">Node, Python, static apps, and background web services</p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                CNAME Record
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <h4 className="font-bold text-white">Domain Management</h4>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  In your Netlify/Render site settings, open <strong>Domain Management</strong>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <h4 className="font-bold text-white">Add Custom Domain</h4>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Add <code className="text-cyan-300 font-mono">yourname.is-a-coder.in</code> to your domains list.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-xs">
                  3
                </div>
                <h4 className="font-bold text-white">Point CNAME Target</h4>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Set your is-a-coder CNAME Target to your default app slug (e.g. <code className="text-cyan-300 font-mono">your-app.netlify.app</code>).
                </p>
              </div>
            </div>

            {/* Copy Box */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono text-cyan-300">
              <div className="truncate flex items-center gap-2">
                <span className="text-slate-500 text-[11px]">Routing Target:</span>
                <span className="font-bold">your-app.netlify.app</span>
              </div>
              <button
                onClick={() => handleCopy("your-app.netlify.app", "guide-net-c")}
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 hover:text-white transition cursor-pointer flex items-center gap-1.5"
              >
                {copiedId === "guide-net-c" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-sans font-semibold">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span className="font-sans">Copy Target</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/20 text-[11px] text-slate-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Both platforms automatically verify CNAME records and issue SSL certificates.</span>
            </div>
          </div>
        )}

        {selectedGuide === "vps" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Custom Linux VPS / Dedicated Server</h2>
                  <p className="text-xs text-slate-400">Ubuntu, AWS EC2, DigitalOcean, Hetzner, Docker, Nginx, and Caddy</p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/10 border border-indigo-500/30 text-indigo-300">
                A / AAAA Record
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <h4 className="font-bold text-white">Configure A Record in is-a-coder</h4>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Select <strong>A Record</strong> (IPv4) or <strong>AAAA Record</strong> (IPv6) in your claim modal and enter your VPS public IP address (e.g. <code className="text-cyan-300 font-mono">159.65.120.45</code>).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <h4 className="font-bold text-white">Issue Free Let&apos;s Encrypt SSL</h4>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Run <code className="text-cyan-300 font-mono">sudo certbot --nginx -d yourname.is-a-coder.in</code> on your server for automatic SSL certificate setup.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Compact DNS Protocol Cheat Sheet */}
      <div className="p-6 rounded-3xl bg-[#0c1222] border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
          <Code2 className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white">DNS Record Protocol Reference</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Best Used For</th>
                <th className="py-2.5 px-3">Example Target</th>
                <th className="py-2.5 px-3">Protocol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              <tr>
                <td className="py-3 px-3">
                  <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-bold">
                    CNAME
                  </span>
                </td>
                <td className="py-3 px-3 font-sans text-slate-300">GitHub Pages, Vercel, Netlify, Cloudflare</td>
                <td className="py-3 px-3 text-cyan-400">cname.vercel-dns.com</td>
                <td className="py-3 px-3 text-slate-500">RFC 1035</td>
              </tr>
              <tr>
                <td className="py-3 px-3">
                  <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 font-bold">
                    A Record
                  </span>
                </td>
                <td className="py-3 px-3 font-sans text-slate-300">Linux VPS, AWS EC2, DigitalOcean (IPv4)</td>
                <td className="py-3 px-3 text-indigo-400">159.65.120.45</td>
                <td className="py-3 px-3 text-slate-500">RFC 1035</td>
              </tr>
              <tr>
                <td className="py-3 px-3">
                  <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30 font-bold">
                    AAAA
                  </span>
                </td>
                <td className="py-3 px-3 font-sans text-slate-300">Dual-stack IPv6 VPS servers</td>
                <td className="py-3 px-3 text-purple-400">2001:0db8:85a3::8a2e</td>
                <td className="py-3 px-3 text-slate-500">RFC 3596</td>
              </tr>
              <tr>
                <td className="py-3 px-3">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-bold">
                    TXT
                  </span>
                </td>
                <td className="py-3 px-3 font-sans text-slate-300">Google Search Console, Bluesky verification</td>
                <td className="py-3 px-3 text-emerald-400">google-site-verification=...</td>
                <td className="py-3 px-3 text-slate-500">RFC 1464</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
