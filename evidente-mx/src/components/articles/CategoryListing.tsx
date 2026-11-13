import { ArticleCard } from '@/components/articles/ArticleCard';
import { Pagination } from '@/components/ui/Pagination';
import { categoryDescriptions } from '@/lib/categories';
import type { Article, ArticleCategory } from '@/types/database';

interface CategoryListingProps {
  slug: string;
  category: ArticleCategory;
  articles: Article[];
  currentPage: number;
  totalPages: number;
}

export function CategoryListing({ slug, category, articles, currentPage, totalPages }: CategoryListingProps) {
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
