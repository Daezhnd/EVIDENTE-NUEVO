import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CategoryListing } from '@/components/articles/CategoryListing';
import { getArticlesByCategoryPaginated } from '@/lib/api';
import { CATEGORY_PAGE_SIZE, categoryDescriptions, categoryMap } from '@/lib/categories';

interface CategoryPaginatedPageProps {
  params: Promise<{ slug: string; page: string }>;
}

function parsePage(value: string): number | null {
  if (!/^[1-9]\d{0,2}$/.test(value)) return null;
  return Number(value);
}

export async function generateMetadata({ params }: CategoryPaginatedPageProps): Promise<Metadata> {
  const { slug, page } = await params;
  const category = categoryMap[slug];

  if (!category) {
    return { title: 'Categoría no encontrada | Evidente.mx' };
  }

  return {
    title: `${category} | Evidente.mx`,
    description: categoryDescriptions[category],
    alternates: {
      canonical: page === '1' ? `/categoria/${slug}` : `/categoria/${slug}?page=${page}`,
    },
  };
}

// Recibe las visitas a /categoria/[slug]?page=N (reescritas en next.config.ts) para que
// cada página del listado se guarde en caché en lugar de renderizarse en cada petición.
export default async function CategoryPaginatedPage({ params }: CategoryPaginatedPageProps) {
  const { slug, page } = await params;
  const category = categoryMap[slug];
  const currentPage = parsePage(page);

  if (!category || currentPage === null) {
    notFound();
  }

  const { data, totalPages } = await getArticlesByCategoryPaginated(category, currentPage, CATEGORY_PAGE_SIZE);

  // Las páginas fuera de rango responden 404 para que los rastreadores no las acumulen.
  if (currentPage > 1 && currentPage > totalPages) {
    notFound();
  }

  return (
    <CategoryListing
      slug={slug}
      category={category}
      articles={data}
      currentPage={currentPage}
      totalPages={totalPages}
    />
  );
}

// Las páginas se generan en la primera visita y se conservan en caché.
export function generateStaticParams() {
  return [];
}

export const revalidate = 3600;
