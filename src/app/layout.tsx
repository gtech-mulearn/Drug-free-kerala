import type { Metadata, Viewport } from "next";
import { connection } from "next/server";
import type { ReactNode } from "react";
import { MotionRuntime } from "@/components/motion/motion-runtime";
import { Toaster } from "@/components/ui/toaster";
import { brandColors } from "@/config/brand";
import { siteConfig } from "@/config/site";
import { fontVariables } from "@/lib/fonts";
import "./globals.css";

const title = `${siteConfig.name} | Take the pledge`;

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: title, template: `%s | ${siteConfig.name}` },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: ["Drug Free Kerala", "anti-drug pledge", "μLearn", "GTech", "Kerala", "NammalOttakkettu"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: siteConfig.name,
    title,
    description: siteConfig.description,
    locale: siteConfig.locale,
  },
  twitter: { card: "summary_large_image", title, description: siteConfig.description, site: "@GtechMulearn" },
};

export const viewport: Viewport = {
  themeColor: brandColors.forest,
  colorScheme: "light",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  // The nonce-based CSP (src/proxy.ts) requires rendering every page per request.
  await connection();

  return (
    <html lang="en" className={fontVariables}>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-card focus:px-4 focus:py-2 focus:text-card-foreground focus:shadow-raised"
        >
          Skip to content
        </a>
        {children}
        <Toaster />
        <MotionRuntime />
      </body>
    </html>
  );
}
