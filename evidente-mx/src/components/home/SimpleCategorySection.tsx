import Link from 'next/link';
import Image from 'next/image';
import { Article } from '@/types/database';
import { Clock, ArrowRight } from 'lucide-react';

interface SimpleCategorySectionProps {
  title: string;
  slug: string;
  articles: Article[];
}

function timeAgo(date: string): string {
  const now = new Date();
  const d = new Date(date);
  const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60));
  if (diff < 60) return `${diff}m`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h`;
  return `${Math.floor(diff / 1440)}d`;
}

export function SimpleCategorySection({ title, slug, articles }: SimpleCategorySectionProps) {
  if (articles.length === 0) return null;

  const main = articles[0];
  const rest = articles.slice(1, 5);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header simple */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        <Link
          href={`/categoria/${slug}`}
          className="text-sm font-medium text-red-600 hover:text-red-700 flex items-center gap-1"
        >
          Ver más <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Artículo principal */}
        <Link
          href={`/noticia/${main.slug}`}
          className="group block"
        >
          <div className="relative aspect-[16/10] rounded-lg overflow-hidden mb-3">
            <Image
              src={main.image_url || '/placeholder.svg'}
              alt={main.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <h3 className="font-bold text-lg text-gray-900 group-hover:text-red-600 transition-colors line-clamp-2 mb-2">
            {main.title}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-2 mb-2">
            {main.excerpt || main.summary}
          </p>
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {timeAgo(main.published_at || main.created_at)}
          </span>
        </Link>

        {/* Lista de artículos */}
        <div className="space-y-4">
          {rest.map((article) => (
            <Link
              key={article.id}
              href={`/noticia/${article.slug}`}
              className="group flex gap-4 pb-4 border-b border-gray-100 last:border-0"
            >
              <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                <Image
                  src={article.image_url || '/placeholder.svg'}
                  alt={article.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 text-sm group-hover:text-red-600 transition-colors line-clamp-2 leading-snug mb-1">
                  {article.title}
                </h4>
                <span className="text-xs text-gray-500">
                  {timeAgo(article.published_at || article.created_at)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
