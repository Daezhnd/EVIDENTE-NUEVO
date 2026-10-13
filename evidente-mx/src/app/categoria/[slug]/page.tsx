import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArticleCard } from '@/components/articles/ArticleCard';
import { Pagination } from '@/components/ui/Pagination';
import { ArticleCategory, Article } from '@/types/database';
import { createClient } from '@/lib/supabase/public';

// Mapeo de slugs a categorías
const categoryMap: Record<string, ArticleCategory> = {
  'destacadas': 'Destacadas',
  'internacionales': 'Internacionales',
  'entretenimiento': 'Entretenimiento',
  'noticias': 'Noticias', // Legacy support
  'deportes': 'Deportes', // Legacy support
  'turismo': 'Turismo', // Legacy support
};

const categoryDescriptions: Record<ArticleCategory, string> = {
  'Destacadas': 'Las noticias más importantes y relevantes del momento.',
  'Internacionales': 'Acontecimientos globales y noticias de impacto mundial.',
  'Entretenimiento': 'Cultura, espectáculos y novedades del mundo del entretenimiento.',
  'Noticias': 'Mantente informado con las últimas noticias de México y el mundo.',
  'Deportes': 'Todo sobre fútbol, boxeo, tenis y más deportes.',
  'Turismo': 'Descubre los mejores destinos y experiencias de viaje en México.',
};

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

async function getArticlesByCategory(
  category: ArticleCategory,
  page: number = 1,
  pageSize: number = 9
): Promise<{ articles: Article[]; totalPages: number; total: number }> {
  const supabase = await createClient();

  // Obtener el total
  const { count } = await supabase
    .from('articles')
    .select('*', { count: 'exact', head: true })
    .eq('category', category)
    .eq('is_published', true)
    .throwOnError();

  const total = count || 0;
  const totalPages = Math.ceil(total / pageSize);

  // Obtener los artículos paginados
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data } = await supabase
    .from('articles')
    .select('*')
    .eq('category', category)
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .range(from, to)
    .throwOnError();

  return { articles: data || [], totalPages, total };
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = categoryMap[slug];

  if (!category) {
    return { title: 'Categoría no encontrada | Evidente.mx' };
  }

  return {
    title: `${category} | Evidente.mx`,
    description: categoryDescriptions[category],
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const category = categoryMap[slug];

  if (!category) {
    notFound();
  }

  const currentPage = pageParam ? parseInt(pageParam) : 1;
  const pageSize = 9;

  // Cargar desde Supabase
  const { articles, totalPages } = await getArticlesByCategory(category, currentPage, pageSize);

  return (
    <div className="min-h-screen">
      {/* Header de categoría */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{category}</h1>
          <p className="text-xl text-gray-300 max-w-2xl">
            {categoryDescriptions[category]}
          </p>
        </div>
      </div>

      {/* Grid de artículos */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {articles.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {articles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  showCategory={false}
                />
              ))}
            </div>

            {/* Paginación */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              baseUrl={`/categoria/${slug}`}
            />
          </>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">
              No hay artículos disponibles en esta categoría.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Generar rutas estáticas para las categorías
export function generateStaticParams() {
  return Object.keys(categoryMap).map((slug) => ({ slug }));
}

export const revalidate = 300;
