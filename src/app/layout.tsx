import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppProviders } from "@/components/providers/app-providers";
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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#176b5d" },
    { media: "(prefers-color-scheme: dark)", color: "#62c3a5" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ),
  title: {
    default: "RozNaamcha | Daily Finance Tracker",
    template: "%s | RozNaamcha",
  },
  description:
    "A premium calendar-based finance tracker for income, expenses, budgets, and reports.",
  applicationName: "RozNaamcha",
  keywords: [
    "finance tracker",
    "expense tracker",
    "budget app",
    "calendar finance",
    "RozNaamcha",
  ],
  authors: [{ name: "RozNaamcha" }],
  creator: "RozNaamcha",
  openGraph: {
    title: "RozNaamcha | Daily Finance Tracker",
    description:
      "Track daily income, expenses, budgets, reports, and calendar-based cashflow.",
    url: "/",
    siteName: "RozNaamcha",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RozNaamcha | Daily Finance Tracker",
    description:
      "A premium calendar-based finance tracker for income, expenses, budgets, and reports.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full bg-background text-foreground"
        suppressHydrationWarning
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
