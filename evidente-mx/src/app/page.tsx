import { HeroCombo } from '@/components/home/HeroCombo';
import { CreativeCategorySection } from '@/components/home/CreativeCategorySection';
import { ReelsSidebar } from '@/components/home/ReelsSidebar';
import { 
  getFeaturedArticles, 
  getArticlesByCategory, 
  getReels 
} from '@/lib/api';

export default async function HomePage() {
  // Cargar datos usando funciones centralizadas
  const [featuredArticles, noticiasArticles, deportesArticles, turismoArticles, reels] = await Promise.all([
    getFeaturedArticles(5),
    getArticlesByCategory('Noticias', 5),
    getArticlesByCategory('Deportes', 5),
    getArticlesByCategory('Turismo', 5),
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
    <div className="min-h-screen bg-white">
      {/* Sidebar de Reels - Fijo en el lateral derecho */}
      <ReelsSidebar reels={reels} />

      {/* Hero: Split Imagen | Texto */}
      <HeroCombo 
        mainArticle={mainArticle} 
        secondaryArticles={secondaryArticles} 
      />

      {/* Noticias - Variante default editorial */}
      {noticiasArticles.length > 0 && (
        <CreativeCategorySection
          title="Noticias"
          slug="noticias"
          articles={noticiasArticles}
          variant="default"
        />
      )}

      {/* Deportes - Variante oscura con grid asimétrico */}
      {deportesArticles.length > 0 && (
        <CreativeCategorySection
          title="Deportes"
          slug="deportes"
          articles={deportesArticles}
          variant="dark"
        />
      )}

      {/* Turismo - Variante magazine */}
      {turismoArticles.length > 0 && (
        <CreativeCategorySection
          title="Turismo"
          slug="turismo"
          articles={turismoArticles}
          variant="featured"
        />
      )}
    </div>
  );
}

// Revalidar cada 60 segundos para mantener contenido fresco
export const revalidate = 60;