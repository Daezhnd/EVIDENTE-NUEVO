import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/public';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://evidente.mx';

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  // Obtener todos los artículos publicados
  const { data: articles } = await supabase
    .from('articles')
    .select('slug, updated_at, published_at')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .throwOnError();

  // URLs de artículos
  const articleUrls: MetadataRoute.Sitemap = (articles || []).map((article) => ({
    url: `${BASE_URL}/noticia/${article.slug}`,
    lastModified: new Date(article.updated_at || article.published_at),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // URLs estáticas
  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1,
    },
    {
      url: `${BASE_URL}/categoria/destacadas`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/categoria/noticias`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/categoria/deportes`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/categoria/turismo`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/reels`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/contacto`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  return [...staticUrls, ...articleUrls];
}
