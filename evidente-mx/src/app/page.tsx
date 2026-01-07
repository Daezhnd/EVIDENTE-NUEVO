import { HeroCombo } from '@/components/home/HeroCombo';
import { SocialFeed } from '@/components/home/SocialFeed';
import { ReelsSidebar } from '@/components/home/ReelsSidebar';
import { AdBanner } from '@/components/ads/AdBanner';
import {
  getFeaturedArticles,
  getLatestArticles,
  getReels
} from '@/lib/api';

export default async function HomePage() {
  // Cargar datos usando funciones centralizadas
  const [featuredArticles, latestArticles, reels] = await Promise.all([
    getFeaturedArticles(5),
    getLatestArticles(20), // Cargar más artículos para scroll infinito
    getReels(10),
  ]);

  const mainArticle = featuredArticles[0];
  const secondaryArticles = featuredArticles.slice(1, 5);

  // Si no hay artículos, mostrar mensaje
  if (!mainArticle) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Bienvenido a Evidente.mx</h1>
          <p className="text-gray-500 mb-6">Aún no hay artículos publicados.</p>
          <a
            href="/admin/articulos/nuevo"
            className="inline-block px-6 py-3 bg-blue-900 text-white rounded-lg hover:bg-blue-800"
          >
            Crear primer artículo
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Sidebar de Reels - Fijo en el lateral derecho */}
      <ReelsSidebar reels={reels} />

      {/* Hero: Split Imagen | Texto */}

      {/* (Publicidad movida al feed) */}

      <HeroCombo
        mainArticle={mainArticle}
        secondaryArticles={secondaryArticles}
      />

      {/* Feed Red Social - Noticias estilo feed infinito */}
      <div className="bg-red-100 p-4 text-red-900 border border-red-300 m-4">
        DEBUG: Featured: {featuredArticles.length}, Latest: {latestArticles.length}, Reels: {reels.length}
      </div>
      <SocialFeed articles={latestArticles} />

      <div className="max-w-7xl mx-auto px-4 mb-12">
        <AdBanner position="footer" />
      </div>
    </div>
  );
}

// Revalidar cada 60 segundos para mantener contenido fresco
export const revalidate = 60;