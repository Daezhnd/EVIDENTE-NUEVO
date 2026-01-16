import { Article } from '@/types/database';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, Eye, ArrowRight, Flame } from 'lucide-react';

interface HeroGridProps {
  articles: Article[];
}

function formatTimeAgo(date: string | Date): string {
  const now = new Date();
  const articleDate = new Date(date);
  const diffInMinutes = Math.floor((now.getTime() - articleDate.getTime()) / (1000 * 60));

  if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;
  if (diffInMinutes < 1440) return `Hace ${Math.floor(diffInMinutes / 60)}h`;
  return `Hace ${Math.floor(diffInMinutes / 1440)}d`;
}

export function HeroGrid({ articles }: HeroGridProps) {
  if (articles.length === 0) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="h-96 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center">
          <p className="text-gray-500">No hay artículos destacados disponibles</p>
        </div>
      </section>
    );
  }

  const mainArticle = articles[0];
  const secondaryArticles = articles.slice(1, 5);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Título de sección épico */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/30">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-gray-900">Lo Más Destacado</h2>
            <p className="text-sm text-gray-500">Actualizado en tiempo real</p>
          </div>
        </div>
        <Link
          href="/categoria/destacadas"
          className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 hover:text-white hover:bg-red-600 rounded-full border-2 border-red-600 transition-all duration-300"
        >
          Ver todas
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Bento Grid Mejorado */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 auto-rows-[minmax(200px,auto)]">
        {/* Artículo principal - Hero gigante */}
        <Link
          href={`/noticia/${mainArticle.slug}`}
          className="lg:col-span-2 lg:row-span-2 group relative overflow-hidden rounded-3xl min-h-[400px] lg:min-h-[500px] card-hover"
        >
          <Image
            src={mainArticle.image_url || '/placeholder-news.jpg'}
            alt={mainArticle.title}
            fill
            unoptimized
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            priority
          />
          {/* Overlay con gradiente intenso */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80" />

          {/* Badge DESTACADO */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="px-3 py-1.5 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg animate-pulse-glow">
              🔥 DESTACADO
            </span>
            {mainArticle.is_featured && (
              <span className="px-3 py-1.5 bg-white/20 backdrop-blur-md text-white text-xs font-medium rounded-full">
                En portada
              </span>
            )}
          </div>

          {/* Contenido */}
          <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
            <div className="flex items-center gap-3 mb-3">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-medium rounded-full">
                {typeof mainArticle.category === 'string' ? mainArticle.category : mainArticle.category?.name || 'Noticias'}
              </span>
              <span className="flex items-center gap-1 text-white/80 text-xs">
                <Clock className="w-3 h-3" />
                {formatTimeAgo(mainArticle.published_at || mainArticle.created_at)}
              </span>
            </div>
            <h3 className="text-2xl lg:text-4xl font-black text-white mb-3 leading-tight line-clamp-3 group-hover:text-red-200 transition-colors">
              {mainArticle.title}
            </h3>
            <p className="text-white/80 text-sm lg:text-base line-clamp-2 mb-4">
              {mainArticle.excerpt}
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <Eye className="w-4 h-4" />
                <span>{mainArticle.views?.toLocaleString() || 0} lecturas</span>
              </div>
              <span className="flex items-center gap-1 text-red-400 font-semibold text-sm group-hover:translate-x-2 transition-transform">
                Leer más <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>
        </Link>

        {/* Artículos secundarios - Cards más pequeñas */}
        {secondaryArticles.map((article, index) => (
          <Link
            key={article.id}
            href={`/noticia/${article.slug}`}
            className={`group relative overflow-hidden rounded-2xl card-hover ${index < 2 ? 'min-h-[240px]' : 'lg:col-span-2 min-h-[200px]'
              }`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <Image
              src={article.image_url || '/placeholder-news.jpg'}
              alt={article.title}
              fill
              unoptimized
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-90" />

            {/* Badge de categoría */}
            <div className="absolute top-3 left-3">
              <span className={`px-2.5 py-1 text-white text-xs font-semibold rounded-full shadow-lg ${getCategoryColor(typeof article.category === 'string' ? article.category.toLowerCase() : article.category?.slug)
                }`}>
                {typeof article.category === 'string' ? article.category : article.category?.name || 'Noticias'}
              </span>
            </div>

            {/* Contenido */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-white/70 text-xs flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTimeAgo(article.published_at || article.created_at)}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white line-clamp-2 group-hover:text-red-200 transition-colors">
                {article.title}
              </h3>
            </div>

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-red-600/0 group-hover:bg-red-600/10 transition-colors duration-300" />
          </Link>
        ))}

        {/* Placeholders si faltan artículos */}
        {secondaryArticles.length < 4 && Array.from({ length: 4 - secondaryArticles.length }).map((_, i) => (
          <div
            key={`placeholder-${i}`}
            className="min-h-[200px] bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center"
          >
            <p className="text-gray-400 text-sm">Próximamente</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function getCategoryColor(slug?: string): string {
  const colors: Record<string, string> = {
    'noticias': 'bg-blue-600',
    'deportes': 'bg-green-600',
    'turismo': 'bg-amber-600',
    'destacadas': 'bg-red-600',
  };
  return colors[slug || ''] || 'bg-gray-600';
}
