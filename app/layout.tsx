import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { SessionProvider } from "@/lib/contexts/session-context";
import { AudioPlayerProvider } from "@/lib/contexts/audio-player-context";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { SkipToMainContent, SkipToNavigation } from "@/components/ui/skip-link";

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap', // Better font loading performance
  preload: true,
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: "Hope – AI Mental Health App | Journaling, Meditation, AI Chat & Community",
  description:
    "Hope is your all-in-one mental wellness app. Journal your thoughts, chat with an empathetic AI companion, practice calming meditations, and connect with a supportive mental health community. Heal and grow with Hope.",
  keywords: [
    "mental health app",
    "AI mental health",
    "meditation app",
    "guided meditation",
    "journaling app",
    "AI journaling",
    "self-care app",
    "therapy chat",
    "anxiety relief",
    "depression support",
    "mindfulness app",
    "AI companion",
    "mental wellness app",
    "Hope app",
    "stress management",
    "mental health community",
    "emotional support",
    "healing",
    "calm mind",
    "wellness tracker"
  ],
  authors: [{ name: "Hope Mental Wellness Team" }],
  robots: {
    index: true,
    follow: true,
    // Use quoted hyphen-keys to match Next's Metadata type
    'max-snippet': -1,
    'max-image-preview': 'large',
    'max-video-preview': -1,
  },
  icons: {
    icon: [
      { url: "/app-icon.png", sizes: "16x16", type: "image/png" },
      { url: "/app-icon.png", sizes: "32x32", type: "image/png" },
      { url: "/app-icon.png", sizes: "48x48", type: "image/png" },
      { url: "/app-icon.png", sizes: "192x192", type: "image/png" },
      { url: "/app-icon.png", sizes: "512x512", type: "image/png" }
    ],
    shortcut: "/app-icon.png",
    apple: [
      { url: "/app-icon.png", sizes: "180x180", type: "image/png" }
    ]
  },
  metadataBase: new URL("https://hopementalhealthsupport.xyz"),
  alternates: {
    canonical: "https://hopementalhealthsupport.xyz/hope",
    languages: { en: "https://hopementalhealthsupport.xyz/hope" },
  },
  openGraph: {
    type: "website",
    url: "https://hopementalhealthsupport.xyz/hope",
    title: "Hope – AI Mental Health App for Journaling, Meditation & Support",
    description:
      "Heal your mind through journaling, guided meditations, and AI companionship. Join Hope – your safe space for mental wellness and community support.",
    siteName: "Hope",
    images: [
      {
        url: "https://hopementalhealthsupport.xyz/assets/hope-cover.jpg",
        width: 1200,
        height: 630,
        alt: "Hope — AI Mental Health App Preview",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hope – Find Peace Through Journaling & Meditation",
    description:
      "Hope is your AI-powered mental wellness app for journaling, meditation, and emotional support. Heal with every thought you write.",
    images: ["https://hopementalhealthsupport.xyz/assets/hope-cover.jpg"],
    site: "@HopeAppOfficial",
  },
  manifest: "/manifest.json",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Structured Data (JSON-LD for Google Rich Results) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "MobileApplication",
              "name": "Hope",
              "url": "https://hopementalhealthsupport.xyz/hope",
              "image": "https://hopementalhealthsupport.xyz/assets/hope-cover.jpg",
              "operatingSystem": "Android, iOS, Web",
              "applicationCategory": "HealthApplication",
              "description": "Hope is a holistic AI mental health app offering AI journaling, guided meditations, mindful AI chat, and a supportive community to promote emotional balance and mental wellness.",
              "publisher": {
                "@type": "Organization",
                "name": "Hope Mental Wellness",
                "url": "https://hopementalhealthsupport.xyz"
              },
              "featureList": [
                "AI journaling for stress and anxiety management",
                "guided meditations for relaxation and focus",
                "AI chat for mental support, empathy, and motivation",
                "mental health community for shared healing and encouragement"
              ],
              "offers": {
                "@type": "Offer",
                "price": "0.00",
                "priceCurrency": "USD",
                "availability": "https://schema.org/InStock"
              }
            })
          }}
        />
      </head>
      <body className={inter.className}>
        {/* Fonts are handled by next/font/google automatically */}
        {/* Google tag (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-6JJDGJTFDJ"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-6JJDGJTFDJ');
          `}
        </Script>
        <SkipToMainContent />
        <SkipToNavigation />
        <ThemeProvider>
          <SessionProvider>
            <AudioPlayerProvider>
              <Header />
              <main id="main-content" className="min-h-screen pt-[calc(env(safe-area-inset-top,0px)+3.5rem)] sm:pt-[calc(env(safe-area-inset-top,0px)+4rem)] pb-20" role="main">
                {children}
              </main>
              <Footer />
              <Toaster />
            </AudioPlayerProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
