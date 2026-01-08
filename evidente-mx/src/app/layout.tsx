import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { LogoHeader } from "@/components/layout/LogoHeader";
import { Navbar } from "@/components/layout/Navbar";
import { BreakingNewsTicker } from "@/components/layout/BreakingNewsTicker";
import { Footer } from "@/components/layout/Footer";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { BackToTop } from "@/components/ui/BackToTop";
import { getRecentArticlesForTicker } from "@/lib/api";

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
  themeColor: '#1e3a8a', // [#0067b2]
};

export const metadata: Metadata = {
  title: {
    default: "Evidente.mx | Portal de Noticias",
    template: "%s | Evidente.mx",
  },
  description: "Tu fuente confiable de noticias en México. Cobertura de noticias destacadas, deportes y turismo con información verificada y actualizada.",
  keywords: ["noticias", "México", "deportes", "turismo", "actualidad", "noticias verificadas", "portal de noticias"],
  authors: [{ name: "Evidente.mx" }],
  creator: "Evidente.mx",
  publisher: "Evidente.mx",
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
    url: 'https://evidente.mx',
    siteName: 'Evidente.mx',
    title: 'Evidente.mx | Portal de Noticias',
    description: 'Tu fuente confiable de noticias en México.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Evidente.mx | Portal de Noticias',
    description: 'Tu fuente confiable de noticias en México.',
  },
  alternates: {
    canonical: 'https://evidente.mx',
    types: {
      'application/rss+xml': 'https://evidente.mx/feed.xml',
    },
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
        <link rel="preconnect" href="https://fnlvkexkimhgptasngbw.supabase.co" />
        <link rel="preconnect" href="https://cdn.jwplayer.com" />
        <link rel="dns-prefetch" href="https://fnlvkexkimhgptasngbw.supabase.co" />
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
