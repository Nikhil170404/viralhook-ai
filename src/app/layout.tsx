import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ErrorBoundaryWrapper } from "@/app/error-boundary-wrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "ViralHook AI | Create Viral Video Concepts Instantly",
  description: "Generate chaos-driven, viral video prompts for Instagram Reels & YouTube Shorts using DeepSeek AI. Turn everyday objects into trending content.",
  manifest: "/manifest.json",
  icons: {
    icon: '/favicon.ico',
    apple: '/icons/icon-192x192.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Viral Hook',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundaryWrapper>
          {children}
        </ErrorBoundaryWrapper>
      </body>
    </html>
  );
}
