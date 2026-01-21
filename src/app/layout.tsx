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
  description: "Generate chaos-driven, viral video prompts for Instagram Reels & YouTube Shorts using AI. Turn everyday objects into trending content.",
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
  // SEO Enhancements
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL || 'https://viralhook.ai'),
  keywords: ['AI video prompts', 'viral content', 'Kling AI', 'video generator', 'content creator tools'],
  authors: [{ name: 'ViralHook AI' }],
  creator: 'ViralHook AI',
  publisher: 'ViralHook AI',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    title: 'ViralHook AI | AI Video Prompt Generator',
    description: 'Turn any object into a viral video with AI. Generate prompts for Kling, Runway & more.',
    url: 'https://viralhook.ai',
    siteName: 'ViralHook AI',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ViralHook AI - Create Viral Video Concepts',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ViralHook AI | Create Viral Video Concepts',
    description: 'AI-powered viral video prompts for content creators',
    images: ['/twitter-image.png'],
  },
  alternates: {
    canonical: 'https://viralhook.ai',
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
