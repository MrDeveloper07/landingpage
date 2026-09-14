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
  metadataBase: new URL("https://is-a-coder.in"),
  title: {
    default: "is-a-coder.in — Free Developer Subdomains & Identity",
    template: "%s | is-a-coder.in",
  },
  description:
    "Claim your free, permanent username.is-a-coder.in subdomain. Fast DNS with instant dashboard, custom CNAME/A records, and free SSL certificates.",
  keywords: [
    "developer portfolio",
    "free subdomain",
    "is-a-coder",
    "free domain for developers",
    "github pages custom domain",
    "vercel custom domain",
    "dns manager",
    "cname",
  ],
  authors: [{ name: "is-a-coder.in Community", url: "https://is-a-coder.in" }],
  creator: "is-a-coder.in",
  publisher: "is-a-coder.in",
  alternates: {
    canonical: "https://is-a-coder.in",
  },
  openGraph: {
    title: "is-a-coder.in — Free Developer Subdomains & Identity",
    description:
      "Claim your free, permanent username.is-a-coder.in subdomain. Fast DNS with instant dashboard, custom CNAME/A records, and free SSL certificates.",
    url: "https://is-a-coder.in",
    siteName: "is-a-coder.in",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "is-a-coder.in — Free Developer Subdomains & Identity",
    description:
      "Claim your free, permanent username.is-a-coder.in subdomain. Fast DNS with instant dashboard, custom CNAME/A records, and free SSL certificates.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
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
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col font-sans bg-[#fafafa] text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
