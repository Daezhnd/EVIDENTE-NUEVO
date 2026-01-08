import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    reactCompiler: true,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
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
        hostname: '*.supabase.co',
        pathname: '/**',
      },
      {
        // Permitir cualquier dominio .com para flexibilidad con imágenes externas
        protocol: 'https',
        hostname: '*.com',
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
