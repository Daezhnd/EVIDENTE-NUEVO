import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { formatDate, formatDistanceToNow, calculateReadingTime } from '@/lib/utils';
import { sanitizeHtml } from '@/lib/sanitize';
import { ArticleCard } from '@/components/articles/ArticleCard';
import { Article } from '@/types/database';
import { Clock, Eye, Share2, Facebook, Twitter, Linkedin, ArrowLeft, MessageCircle, BookOpen } from 'lucide-react';
import { ViewCounter } from '@/components/articles/ViewCounter';
import { ArticleHeroImage } from '@/components/articles/ArticleHeroImage';
import { ScrollIndicator } from '@/components/ui/ScrollIndicator';
import { CampaignBannerInline } from '@/components/ads/GlobalCampaignBanner';

/**
 * Formatea contenido de texto plano a HTML si es necesario
 * y lo sanitiza para prevenir XSS
 */
function formatContent(content: string): string {
  if (!content) return '';

  let htmlContent: string;

  // Si ya tiene tags HTML, mejorar el espaciado
  if (/<[a-z][\s\S]*>/i.test(content)) {
    // Asegurar que los párrafos tengan clases de espaciado
    htmlContent = content
      .replace(/<p>/g, '<p class="mb-6">')
      .replace(/<p\s+/g, '<p class="mb-6" ');
  } else {
    // Convertir texto plano a párrafos HTML
    // Primero, normalizar los saltos de línea
    const normalizedContent = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    // Dividir por doble salto de línea (párrafos) o por punto seguido de salto
    const paragraphs = normalizedContent
      .split(/\n\s*\n|(?<=\.)\s*\n/)
      .map(p => p.trim())
      .filter(p => p.length > 0);

    if (paragraphs.length === 1 && normalizedContent.includes('\n')) {
      // Si solo hay un párrafo pero tiene saltos de línea, dividir por líneas
      const lines = normalizedContent
        .split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 0);
      htmlContent = lines.map(line => `<p class="mb-6">${line}</p>`).join('\n');
    } else {
      htmlContent = paragraphs.map(p => {
        // No usar <br> dentro de párrafos, crear párrafos separados
        return `<p class="mb-6">${p}</p>`;
      }).join('\n');
    }
  }

  // SEGURIDAD: Sanitizar HTML para prevenir XSS
  return sanitizeHtml(htmlContent);
}

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

function buildShareDescription(article: Article): string {
  const summary = article.summary?.trim();
  if (summary) return summary;

  const excerpt = article.excerpt?.trim();
  if (excerpt) return excerpt;

  const plainContent = (article.content || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!plainContent) {
    return 'Lee esta nota en Evidente.mx';
  }

  return plainContent.length > 170
    ? `${plainContent.slice(0, 167)}...`
    : plainContent;
}

function buildAbsoluteUrl(pathOrUrl: string): string {
  try {
    return new URL(pathOrUrl, 'https://evidente.mx').toString();
  } catch {
    return 'https://evidente.mx/favicon.png';
  }
}

async function getArticleBySlug(slug: string): Promise<Article | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (error || !data) return null;
  return data;
}

async function getRelatedArticles(category: string, excludeId: string): Promise<Article[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('articles')
    .select('*')
    .eq('category', category)
    .eq('is_published', true)
    .neq('id', excludeId)
    .order('published_at', { ascending: false })
    .limit(3);

  return data || [];
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return { title: 'Artículo no encontrado | Evidente.mx' };
  }

  const articleUrl = buildAbsoluteUrl(`/noticia/${article.slug}`);
  const imageUrl = article.image_url
    ? buildAbsoluteUrl(article.image_url)
    : 'https://evidente.mx/favicon.png';
  const description = buildShareDescription(article);

  return {
    title: article.title,
    description,
    alternates: {
      canonical: articleUrl,
    },
    openGraph: {
      title: article.title,
      description,
      url: articleUrl,
      siteName: 'Evidente.mx',
      locale: 'es_MX',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
      type: 'article',
      publishedTime: article.published_at || undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;

  // Buscar en Supabase
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  // Obtener categoría como string
  const categoryName = typeof article.category === 'string'
    ? article.category
    : (article.category as { name?: string })?.name || 'Noticias';

  // Obtener artículos relacionados (misma categoría)
  const relatedArticles = await getRelatedArticles(categoryName, article.id);

  const categoryColors: Record<string, string> = {
    'Destacadas': 'bg-[#0067b2]',
    'Noticias': 'bg-[#0067b2]',
    'Deportes': 'bg-green-600',
    'Turismo': 'bg-amber-600',
  };

  const categorySlugMap: Record<string, string> = {
    'Destacadas': 'destacadas',
    'Noticias': 'noticias',
    'Deportes': 'deportes',
    'Turismo': 'turismo',
  };

  const catSlug = categorySlugMap[categoryName] || 'noticias';

  return (
    <article className="min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-gray-500 hover:text-[#0067b2] transition-colors">
              Inicio
            </Link>
            <span className="text-gray-300">/</span>
            <Link
              href={`/categoria/${catSlug}`}
              className="text-gray-500 hover:text-[#0067b2] transition-colors"
            >
              {categoryName}
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-900 truncate max-w-[200px]">{article.title}</span>
          </nav>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header del artículo */}
        <header className="mb-8">
          <Link
            href={`/categoria/${catSlug}`}
            className={`inline-block px-3 py-1 text-xs font-semibold text-white rounded-full ${categoryColors[categoryName] || 'bg-[#0067b2]'} mb-4`}
          >
            {categoryName}
          </Link>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            {article.title}
          </h1>

          <p className="text-xl text-gray-600 mb-6">
            {article.summary}
          </p>

          {/* Meta información */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            {article.published_at && (
              <>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatDistanceToNow(article.published_at)}
                </span>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline">
                  {formatDate(article.published_at)}
                </span>
              </>
            )}
            <span>•</span>
            <span className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              {calculateReadingTime(article.content || '')}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {((article.views_count ?? article.views) || 0).toLocaleString()} vistas
            </span>
          </div>
        </header>

        {/* Imagen o Video principal con efecto hover */}
        <ArticleHeroImage
          imageUrl={article.image_url || ''}
          title={article.title}
          videoUrl={article.video_url || undefined}
        />

        {/* Botones de compartir */}
        <div className="flex items-center gap-3 mb-8 pb-8 border-b border-gray-100">
          <span className="text-sm text-gray-500 flex items-center gap-1">
            <Share2 className="w-4 h-4" />
            Compartir:
          </span>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(article.title + ' - https://evidente.mx/noticia/' + article.slug)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
            aria-label="Compartir en WhatsApp"
          >
            <MessageCircle className="w-4 h-4" />
          </a>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://evidente.mx/noticia/${article.slug}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
            aria-label="Compartir en Facebook"
          >
            <Facebook className="w-4 h-4" />
          </a>
          <a
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(`https://evidente.mx/noticia/${article.slug}`)}&text=${encodeURIComponent(article.title)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 bg-sky-500 text-white rounded-full hover:bg-sky-600 transition-colors"
            aria-label="Compartir en Twitter"
          >
            <Twitter className="w-4 h-4" />
          </a>
          <a
            href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(`https://evidente.mx/noticia/${article.slug}`)}&title=${encodeURIComponent(article.title)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 bg-blue-700 text-white rounded-full hover:bg-[#00528e] transition-colors"
            aria-label="Compartir en LinkedIn"
          >
            <Linkedin className="w-4 h-4" />
          </a>
        </div>

        <CampaignBannerInline />

        {/* Contenido del artículo */}
        <div
          className="article-content prose prose-lg max-w-none prose-headings:text-gray-900 prose-headings:mt-8 prose-headings:mb-4 prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6 prose-p:text-lg prose-a:text-[#0067b2] prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-li:mb-2"
          dangerouslySetInnerHTML={{ __html: formatContent(article.content || '') }}
        />

        {/* Botón volver */}
        <div className="mt-12 pt-8 border-t border-gray-100">
          <Link
            href={`/categoria/${catSlug}`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-[#0067b2] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a {categoryName}
          </Link>
        </div>
      </div>

      {/* Artículos relacionados */}
      {relatedArticles.length > 0 && (
        <section className="bg-gray-50 py-12 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Artículos relacionados
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((relatedArticle) => (
                <ArticleCard
                  key={relatedArticle.id}
                  article={relatedArticle}
                  showCategory={false}
                />
              ))}
            </div>
          </div>
        </section>
      )}
      {/* Indicador de scroll para pantallas pequeñas */}
      <ScrollIndicator />
      {/* Contador de vistas (invisible) */}
      <ViewCounter articleId={article.id} />
    </article>
  );
}

// Revalidar cada 60 segundos para mostrar contenido actualizado
export const revalidate = 60;
