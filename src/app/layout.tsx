import type { Metadata, Viewport } from "next";
import { Inter, Lora, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import { cn } from "@/lib/utils";
import "./globals.css";

/**
 * PHASE 4 NOTE: Inter / Lora / JetBrains Mono are placeholders until
 * the real Design System doc specifies typefaces. Swap the imports
 * and CSS variable names below only — every consumer reads
 * var(--font-sans) / var(--font-display) / var(--font-mono) via
 * tailwind.config.ts, so nothing else needs to change.
 */
const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const fontDisplay = Lora({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// Phase 6 (SEO/AEO/GEO) note: this is a framework-default metadata
// baseline only. Structured data (JSON-LD), OG image generation,
// sitemap/robots strategy, and canonical/hreflang rules should be
// implemented per that doc in a later phase — flagging rather than
// guessing at specifics here.
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "SEO Growth Hub",
    template: "%s | SEO Growth Hub",
  },
  description:
    "SEO Growth Hub — placeholder description pending Phase 6 SEO/AEO/GEO copy.",
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          fontSans.variable,
          fontDisplay.variable,
          fontMono.variable,
          "font-sans",
        )}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
