import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    reactCompiler: true,
  },
  images: {
    // === OPTIMIZACIONES PARA REDUCIR COSTOS DE VERCEL ===
    // Solo webp (reduce transformaciones a la mitad vs avif+webp)
    formats: ['image/webp'],
    // Cache de 31 días para imágenes que no cambian frecuentemente
    minimumCacheTTL: 2678400,
    // Reducir tamaños de dispositivos (menos transformaciones)
    deviceSizes: [640, 828, 1200, 1920],
    // Reducir tamaños de imagen (menos variantes)
    imageSizes: [32, 64, 128, 256],
    // Calidades permitidas (menos variantes = menos transformaciones)
    qualities: [75],
    remotePatterns: [
      {
        // Imágenes de Unsplash
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        // Supabase Storage
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/**',
      },
      {
        // Permitir dominios .com (con o sin subdominios) para imágenes externas
        protocol: 'https',
        hostname: '**.com',
        pathname: '/**',
      },
      {
        // Permitir dominios .com.mx para fuentes mexicanas
        protocol: 'https',
        hostname: '**.com.mx',
        pathname: '/**',
      },
      {
        // Permitir dominios .es para fuentes españolas
        protocol: 'https',
        hostname: '**.es',
        pathname: '/**',
      },
      {
        // Permitir dominios .mx para fuentes mexicanas
        protocol: 'https',
        hostname: '**.mx',
        pathname: '/**',
      },
      {
        // Permitir dominios .net
        protocol: 'https',
        hostname: '**.net',
        pathname: '/**',
      },
      {
        // JWPlayer CDN
        protocol: 'https',
        hostname: 'cdn.jwplayer.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;

// Trigger restart
