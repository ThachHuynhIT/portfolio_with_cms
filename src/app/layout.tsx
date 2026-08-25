import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { domAnimation, LazyMotion, MotionConfig } from "motion/react";
import { getSiteSettings } from "@/lib/queries";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bricolageGrotesque = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const siteName = settings?.siteName || "Portfolio";
  const description =
    settings?.defaultSeoDescription ||
    settings?.tagline ||
    "Personal portfolio with a self-built CMS.";

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: settings?.defaultSeoTitle || siteName,
      template: `%s | ${siteName}`,
    },
    description,
    openGraph: {
      siteName,
      type: "website",
      ...(settings?.ogImageUrl ? { images: [{ url: settings.ogImageUrl }] } : {}),
    },
    twitter: {
      card: settings?.ogImageUrl ? "summary_large_image" : "summary",
    },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${bricolageGrotesque.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LazyMotion features={domAnimation} strict>
            <MotionConfig reducedMotion="user">{children}</MotionConfig>
          </LazyMotion>
        </ThemeProvider>
      </body>
    </html>
  );
}
