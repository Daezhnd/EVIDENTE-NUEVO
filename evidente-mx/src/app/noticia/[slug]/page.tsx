import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { formatDate, formatDistanceToNow, calculateReadingTime } from '@/lib/utils';
import { sanitizeHtml } from '@/lib/sanitize';
import { ArticleCard } from '@/components/articles/ArticleCard';
import { Article } from '@/types/database';
import { Clock, Eye, Share2, Facebook, Twitter, Linkedin, ArrowLeft, MessageCircle, BookOpen } from 'lucide-react';
import { ViewCounter } from '@/components/articles/ViewCounter';

/**
 * Formatea contenido de texto plano a HTML si es necesario
 * y lo sanitiza para prevenir XSS
 */
function formatContent(content: string): string {
  if (!content) return '';

  let htmlContent: string;

  // Si ya tiene tags HTML, usarlo directamente
  if (/<[a-z][\s\S]*>/i.test(content)) {
    htmlContent = content;
  } else {
    // Convertir texto plano a párrafos HTML
    const paragraphs = content
      .split(/\n\s*\n/)
      .map(p => p.trim())
      .filter(p => p.length > 0);

    if (paragraphs.length === 1 && content.includes('\n')) {
      const lines = content
        .split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 0);
      htmlContent = lines.map(line => `<p>${line}</p>`).join('\n');
    } else {
      htmlContent = paragraphs.map(p => {
        const withBreaks = p.replace(/\n/g, '<br>');
        return `<p>${withBreaks}</p>`;
      }).join('\n');
    }
  }

  // SEGURIDAD: Sanitizar HTML para prevenir XSS
  return sanitizeHtml(htmlContent);
}

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
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

  return {
    title: `${article.title} | Evidente.mx`,
    description: article.summary,
    openGraph: {
      title: article.title,
      description: article.summary || '',
      images: article.image_url ? [article.image_url] : [],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.summary || '',
      images: article.image_url ? [article.image_url] : [],
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
    'Destacadas': 'bg-blue-900',
    'Noticias': 'bg-blue-900',
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
            <Link href="/" className="text-gray-500 hover:text-blue-900 transition-colors">
              Inicio
            </Link>
            <span className="text-gray-300">/</span>
            <Link
              href={`/categoria/${catSlug}`}
              className="text-gray-500 hover:text-blue-900 transition-colors"
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
            className={`inline-block px-3 py-1 text-xs font-semibold text-white rounded-full ${categoryColors[categoryName] || 'bg-blue-900'} mb-4`}
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

        {/* Imagen principal */}
        {article.image_url && (
          <div className="relative aspect-video rounded-2xl overflow-hidden mb-8">
            <Image
              src={article.image_url}
              alt={article.title}
              fill
              className="object-cover"
              priority
              unoptimized
            />
          </div>
        )}

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
            className="p-2 bg-blue-700 text-white rounded-full hover:bg-blue-800 transition-colors"
            aria-label="Compartir en LinkedIn"
          >
            <Linkedin className="w-4 h-4" />
          </a>
        </div>

        {/* Contenido del artículo */}
        <div
          className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4 prose-a:text-blue-900 prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl"
          dangerouslySetInnerHTML={{ __html: formatContent(article.content || '') }}
        />

        {/* Botón volver */}
        <div className="mt-12 pt-8 border-t border-gray-100">
          <Link
            href={`/categoria/${catSlug}`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-900 transition-colors"
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
      {/* Contador de vistas (invisible) */}
      <ViewCounter articleId={article.id} />
    </article>
  );
}

// Revalidar cada 60 segundos para mostrar contenido actualizado
export const revalidate = 60;
