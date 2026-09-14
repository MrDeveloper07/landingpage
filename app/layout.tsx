import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import SmoothScroll from "@/components/providers/SmoothScroll";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "is-a-coder.in — Free Subdomains & Developer Identity",
  description:
    "Claim your free, permanent username.is-a-coder.in subdomain. Powered by Cloudflare edge DNS with instantaneous GitHub GitOps automation and automatic TLS SSL certificates.",
  keywords: [
    "developer portfolio",
    "free subdomain",
    "is-a-coder",
    "gitops dns",
    "cloudflare anycast",
    "free domain for developers",
    "github pages custom domain",
    "vercel custom domain",
  ],
  authors: [{ name: "is-a-coder.in Community" }],
  openGraph: {
    title: "is-a-coder.in — Free Subdomains & Developer Identity",
    description:
      "Claim your free, permanent username.is-a-coder.in subdomain. Powered by Cloudflare Anycast DNS.",
    type: "website",
    url: "https://is-a-coder.in",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col font-sans bg-[#fafafa] text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
        <SmoothScroll>
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
