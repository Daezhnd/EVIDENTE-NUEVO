import Link from 'next/link';
import Image from 'next/image';
import { Article, ArticleCategory } from '@/types/database';
import { ArrowRight, Clock, TrendingUp, Newspaper, Trophy, Palmtree } from 'lucide-react';

interface CategorySectionProps {
  title: string;
  category: ArticleCategory;
  articles: Article[];
  showViewMore?: boolean;
}

const categorySlugMap: Record<ArticleCategory, string> = {
  'Destacadas': 'destacadas',
  'Noticias': 'noticias',
  'Deportes': 'deportes',
  'Turismo': 'turismo',
};

const categoryConfig: Record<ArticleCategory, { 
  gradient: string; 
  icon: typeof TrendingUp;
  bgLight: string;
  textColor: string;
}> = {
  'Destacadas': { 
    gradient: 'from-red-500 to-orange-500', 
    icon: TrendingUp,
    bgLight: 'bg-red-50',
    textColor: 'text-red-600'
  },
  'Noticias': { 
    gradient: 'from-blue-500 to-cyan-500', 
    icon: Newspaper,
    bgLight: 'bg-blue-50',
    textColor: 'text-blue-600'
  },
  'Deportes': { 
    gradient: 'from-green-500 to-emerald-500', 
    icon: Trophy,
    bgLight: 'bg-green-50',
    textColor: 'text-green-600'
  },
  'Turismo': { 
    gradient: 'from-amber-500 to-yellow-500', 
    icon: Palmtree,
    bgLight: 'bg-amber-50',
    textColor: 'text-amber-600'
  },
};

function formatTimeAgo(date: string | Date): string {
  const now = new Date();
  const articleDate = new Date(date);
  const diffInMinutes = Math.floor((now.getTime() - articleDate.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 60) return `${diffInMinutes}m`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
  return `${Math.floor(diffInMinutes / 1440)}d`;
}

export function CategorySection({ 
  title, 
  category, 
  articles,
  showViewMore = true 
}: CategorySectionProps) {
  if (articles.length === 0) return null;

  const slug = categorySlugMap[category];
  const config = categoryConfig[category];
  const IconComponent = config.icon;

  const mainArticle = articles[0];
  const sideArticles = articles.slice(1, 5);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header de sección mejorado */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 bg-gradient-to-br ${config.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
            <IconComponent className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900">{title}</h2>
            <p className="text-sm text-gray-500">Las últimas noticias de {title.toLowerCase()}</p>
          </div>
        </div>
        
        {showViewMore && (
          <Link
            href={`/categoria/${slug}`}
            className={`hidden sm:flex items-center gap-2 px-4 py-2 ${config.bgLight} ${config.textColor} hover:bg-gradient-to-r hover:${config.gradient} hover:text-white rounded-full font-semibold text-sm transition-all duration-300`}
          >
            Ver todas
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* Layout de artículos: Principal + Lista lateral */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Artículo principal */}
        <Link 
          href={`/noticia/${mainArticle.slug}`}
          className="lg:col-span-2 group relative overflow-hidden rounded-3xl min-h-[400px] card-hover"
        >
          <Image
            src={mainArticle.image_url || '/placeholder-news.jpg'}
            alt={mainArticle.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          
          {/* Badge */}
          <div className="absolute top-4 left-4">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r ${config.gradient} text-white text-xs font-bold rounded-full shadow-lg`}>
              <IconComponent className="w-3 h-3" />
              {category}
            </span>
          </div>

          {/* Contenido */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex items-center gap-3 mb-3 text-white/80 text-sm">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {formatTimeAgo(mainArticle.published_at || mainArticle.created_at)}
              </span>
              {mainArticle.views && (
                <span>{mainArticle.views.toLocaleString()} lecturas</span>
              )}
            </div>
            <h3 className="text-2xl lg:text-3xl font-black text-white line-clamp-3 group-hover:text-red-200 transition-colors">
              {mainArticle.title}
            </h3>
            <p className="mt-2 text-white/70 line-clamp-2 text-sm">
              {mainArticle.excerpt}
            </p>
          </div>
        </Link>

        {/* Lista de artículos secundarios */}
        <div className="flex flex-col gap-4">
          {sideArticles.map((article, index) => (
            <Link
              key={article.id}
              href={`/noticia/${article.slug}`}
              className="group flex gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-all duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Thumbnail */}
              <div className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden">
                <Image
                  src={article.image_url || '/placeholder-news.jpg'}
                  alt={article.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className={`absolute bottom-1 right-1 w-6 h-6 bg-gradient-to-br ${config.gradient} rounded-md flex items-center justify-center text-white text-xs font-bold`}>
                  {index + 2}
                </div>
              </div>

              {/* Contenido */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>{formatTimeAgo(article.published_at || article.created_at)}</span>
                </div>
                <h4 className="font-bold text-gray-900 line-clamp-2 group-hover:text-red-600 transition-colors leading-tight">
                  {article.title}
                </h4>
              </div>
            </Link>
          ))}

          {/* Ver más en móvil */}
          {showViewMore && (
            <Link
              href={`/categoria/${slug}`}
              className={`mt-2 flex items-center justify-center gap-2 py-3 ${config.bgLight} ${config.textColor} rounded-xl font-semibold text-sm hover:opacity-80 transition-opacity lg:hidden`}
            >
              Ver todas las {title.toLowerCase()}
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
