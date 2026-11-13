import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CategoryListing } from '@/components/articles/CategoryListing';
import { getArticlesByCategoryPaginated } from '@/lib/api';
import { CATEGORY_PAGE_SIZE, categoryDescriptions, categoryMap } from '@/lib/categories';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
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

// Primera página de la categoría. No lee parámetros de consulta para poder servirse desde caché:
// `?page=N` se reescribe a /categoria/[slug]/pagina/[page] en next.config.ts.
export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = categoryMap[slug];

  if (!category) {
    notFound();
  }

  const { data, totalPages } = await getArticlesByCategoryPaginated(category, 1, CATEGORY_PAGE_SIZE);

  return (
    <CategoryListing
      slug={slug}
      category={category}
      articles={data}
      currentPage={1}
      totalPages={totalPages}
    />
  );
}

// Generar rutas estáticas para las categorías
export function generateStaticParams() {
  return Object.keys(categoryMap).map((slug) => ({ slug }));
}

export const revalidate = 3600;
