import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ErrorBoundary } from "@/lib/error-boundary";
import ServiceWorkerRegister from "./components/ServiceWorkerRegister";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nichtraucher - Dein Weg zur rauchfreien Zukunft",
  description: "Track dein Fortschritt, chatte mit deinem AI Buddy, erhalte täglich Motivation",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "nichtraucher.app",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    themeColor: "#10b981",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="min-h-full flex flex-col bg-slate-950 text-white" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
