import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { LogoHeader } from "@/components/layout/LogoHeader";
import { Navbar } from "@/components/layout/Navbar";
import { BreakingNewsTicker } from "@/components/layout/BreakingNewsTicker";
import { Footer } from "@/components/layout/Footer";
import { GlobalCampaignBanner } from "@/components/ads/GlobalCampaignBanner";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { BackToTop } from "@/components/ui/BackToTop";
import { getRecentArticlesForTicker } from "@/lib/api";
import { env } from "@/lib/env";
import { RSS_ALTERNATE, SITE_URL } from "@/lib/site";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#111111',
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Evidente.mx | Portal de Noticias",
    template: "%s | Evidente.mx",
  },
  description: "Tu fuente confiable de noticias en México. Cobertura de noticias destacadas, deportes y turismo con información verificada y actualizada.",
  keywords: ["noticias", "México", "deportes", "turismo", "actualidad", "noticias verificadas", "portal de noticias"],
  authors: [{ name: "Evidente.mx" }],
  creator: "Evidente.mx",
  publisher: "Evidente.mx",
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'es_MX',
    // Relativo a cada ruta, igual que el canónico.
    url: './',
    siteName: 'Evidente.mx',
    title: 'Evidente.mx | Portal de Noticias',
    description: 'Tu fuente confiable de noticias en México.',
    images: [
      {
        url: `${SITE_URL}/favicon.png`,
        width: 512,
        height: 512,
        alt: 'Evidente.mx - Portal de Noticias',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'Evidente.mx | Portal de Noticias',
    description: 'Tu fuente confiable de noticias en México.',
    images: [`${SITE_URL}/favicon.png`],
    creator: '@evidentemx',
  },
  alternates: {
    // Relativo a cada ruta: un valor fijo declaraba la portada como canónica de todas las páginas.
    canonical: './',
    types: RSS_ALTERNATE,
  },
  verification: {
    // Agregar cuando tengas las claves
    // google: 'tu-codigo-de-verificacion',
  },
};

import { ScrollProgress } from "@/components/ui/ScrollProgress";

// ...

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Obtener noticias para el ticker
  const tickerNews = await getRecentArticlesForTicker(8);

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Preconnect hints for faster resource loading */}
        <link rel="preconnect" href={env.supabase.url} />
        <link rel="preconnect" href="https://cdn.jwplayer.com" />
        <link rel="dns-prefetch" href={env.supabase.url} />
        <link rel="dns-prefetch" href="https://cdn.jwplayer.com" />
      </head>
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors`}>
        <ThemeProvider>
          <ScrollProgress />
          {/* Logo grande y centrado */}
          <LogoHeader />
          {/* Navbar sticky */}
          <Navbar />
          {/* Ticker de últimas noticias debajo del nav */}
          <BreakingNewsTicker news={tickerNews} />
          <GlobalCampaignBanner />
          <main className="min-h-screen">
            {children}
          </main>
          <BackToTop />
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
