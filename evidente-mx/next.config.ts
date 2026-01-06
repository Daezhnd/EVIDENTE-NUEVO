import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    reactCompiler: true,
  },
  images: {
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
    ],
  },
};

export default nextConfig;
