import { createClient } from '@/lib/supabase/public';
import { SITE_URL } from '@/lib/site';

const BASE_URL = SITE_URL;

export const revalidate = 3600;

export async function GET() {
  const supabase = await createClient(['articles:list']);

  // Obtener artículos recientes
  const { data: articles } = await supabase
    .from('articles')
    .select('title, slug, summary, published_at, category')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(50)
    .throwOnError();

  const rssItems = (articles || [])
    .map((article) => {
      const pubDate = new Date(article.published_at).toUTCString();
      return `
    <item>
      <title><![CDATA[${article.title}]]></title>
      <link>${BASE_URL}/noticia/${article.slug}</link>
      <description><![CDATA[${article.summary || ''}]]></description>
      <pubDate>${pubDate}</pubDate>
      <guid isPermaLink="true">${BASE_URL}/noticia/${article.slug}</guid>
      <category>${article.category}</category>
    </item>`;
    })
    .join('\n');

  // Fecha de la nota más reciente, no la hora actual: así el RSS solo cambia con el contenido.
  const lastBuildDate = new Date(articles?.[0]?.published_at ?? 0).toUTCString();

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Evidente.mx</title>
    <link>${BASE_URL}</link>
    <description>Tu fuente confiable de noticias en México. Cobertura de noticias destacadas, deportes y turismo.</description>
    <language>es-MX</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${BASE_URL}/logo.png</url>
      <title>Evidente.mx</title>
      <link>${BASE_URL}</link>
    </image>
    ${rssItems}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=0, s-maxage=3600',
    },
  });
}
