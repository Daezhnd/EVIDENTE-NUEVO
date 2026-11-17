import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/public';
import { SITE_URL } from '@/lib/site';

const BASE_URL = SITE_URL;

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient(['articles:list']);

  // Obtener todos los artículos publicados
  const { data: articles } = await supabase
    .from('articles')
    .select('slug, published_at')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .throwOnError();

  // URLs de artículos
  const articleUrls: MetadataRoute.Sitemap = (articles || []).map((article) => ({
    url: `${BASE_URL}/noticia/${article.slug}`,
    // `updated_at` cambia con cada visita (contador de vistas); la fecha de publicación es estable.
    lastModified: new Date(article.published_at),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // La salida solo debe cambiar cuando cambia el contenido: una fecha `new Date()` hacía
  // distinta cada regeneración y obligaba a reescribir el sitemap completo en la caché.
  const latest = articles?.[0]?.published_at ? new Date(articles[0].published_at) : undefined;

  // URLs estáticas
  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: latest,
      changeFrequency: 'hourly',
      priority: 1,
    },
    {
      url: `${BASE_URL}/categoria/destacadas`,
      lastModified: latest,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/categoria/noticias`,
      lastModified: latest,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/categoria/deportes`,
      lastModified: latest,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/categoria/turismo`,
      lastModified: latest,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/reels`,
      lastModified: latest,
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/contacto`,
      lastModified: latest,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  return [...staticUrls, ...articleUrls];
}
