import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import SmoothScroll from "@/components/providers/SmoothScroll";
import { FAQ_ITEMS } from "@/utils/constants";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://is-a-coder.in"),
  title: {
    default: "is-a-coder.in — Free Developer Subdomains & Identity",
    template: "%s | is-a-coder.in",
  },
  description:
    "Claim your free, permanent username.is-a-coder.in subdomain. Fast DNS with instant dashboard, custom CNAME/A records, and free SSL certificates.",
  applicationName: "is-a-coder.in",
  keywords: [
    "free subdomain",
    "developer portfolio",
    "is-a-coder",
    "free domain for developers",
    "github pages custom domain",
    "vercel custom domain",
    "dns manager",
    "developer identity",
    "custom cname",
    "developer web hosting",
    "free ssl domain",
  ],
  authors: [{ name: "is-a-coder.in Community", url: "https://is-a-coder.in" }],
  creator: "is-a-coder.in",
  publisher: "is-a-coder.in",
  category: "Technology & Developer Tools",
  classification: "Developer Tools & DNS Hosting",
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
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "is-a-coder.in — Free Developer Subdomains",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "is-a-coder.in — Free Developer Subdomains & Identity",
    description:
      "Claim your free, permanent username.is-a-coder.in subdomain. Fast DNS with instant dashboard, custom CNAME/A records, and free SSL certificates.",
    creator: "@isacoder_in",
    images: ["/opengraph-image"],
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
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon", type: "image/png" },
    ],
    apple: "/apple-icon",
  },
  verification: {
    google: "googleab7518f2a3d2bb90",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Structured Data (Schema.org) for Google Rich Snippets
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://is-a-coder.in/#website",
        url: "https://is-a-coder.in",
        name: "is-a-coder.in",
        description: "Free Developer Subdomain Registry & Identity Platform",
        publisher: {
          "@type": "Organization",
          name: "is-a-coder.in",
          url: "https://is-a-coder.in",
          logo: "https://is-a-coder.in/opengraph-image",
        },
      },
      {
        "@type": "WebApplication",
        "@id": "https://is-a-coder.in/#webapp",
        name: "is-a-coder.in Developer Platform",
        url: "https://is-a-coder.in",
        applicationCategory: "DeveloperApplication",
        operatingSystem: "All",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
        },
        featureList: [
          "Free Developer Subdomains",
          "Fast Edge Anycast DNS Resolution",
          "Automatic TLS 1.3 SSL",
          "CNAME, A, AAAA, and TXT Record Support",
          "Interactive Self-Service Dashboard",
        ],
      },
      {
        "@type": "FAQPage",
        "@id": "https://is-a-coder.in/#faq",
        mainEntity: FAQ_ITEMS.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
    ],
  };

  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased scroll-smooth`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-[#fafafa] text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
