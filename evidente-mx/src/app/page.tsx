import { HeroCombo } from '@/components/home/HeroCombo';
import { SocialFeed } from '@/components/home/SocialFeed';
import { ReelsSidebar } from '@/components/home/ReelsSidebar';
import { AdBanner } from '@/components/ads/AdBanner';
import { PollWidget } from '@/components/widgets/PollWidget';
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
            className="inline-block px-6 py-3 bg-[#0067b2] text-white rounded-lg hover:bg-[#00528e]"
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

      {/* Feed Red Social + Sidebar Widgets */}
      <section className="bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">

          {/* Layout Split: Top part has Sidebar, Bottom part is full width */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

            {/* Top Feed Column (3 cols) - Wraps first 3 articles */}
            <div className="lg:col-span-3">
              <div className="bg-red-100 p-4 text-red-900 border border-red-300 mb-4 hidden">
                DEBUG: Featured: {featuredArticles.length}, Latest: {latestArticles.length}, Reels: {reels.length}
              </div>
              <SocialFeed articles={latestArticles.slice(0, 3)} showLoading={false} />
            </div>

            {/* Sidebar Column (1 col) - Static */}
            <div className="hidden lg:block lg:col-span-1 space-y-8 pt-12 self-start h-fit">
              <PollWidget />
              <AdBanner position="sidebar" />
            </div>

          </div>

          {/* Remaining Feed (Full Width) */}
          <div className="mt-8">
            <SocialFeed
              articles={latestArticles.slice(3)}
              showHeader={false}
              startIndex={3}
            />
          </div>

        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 mb-12">
        <AdBanner position="footer" />
      </div>
    </div>
  );
}

// Revalidar cada 60 segundos para mantener contenido fresco
export const revalidate = 60;