'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Article } from '@/types/database';
import { formatDistanceToNow } from '@/lib/utils';
import { Clock, Eye, ArrowUpRight, Bookmark } from 'lucide-react';
import { motion } from 'framer-motion';

interface ArticleCardProps {
  article: Article;
  variant?: 'default' | 'compact' | 'featured';
  showCategory?: boolean;
}

// Helper para obtener el nombre de categoría
function getCategoryName(category: Article['category']): string {
  if (typeof category === 'string') return category;
  return category?.name || 'Noticias';
}

// Helper para obtener el slug de categoría
function getCategorySlug(category: Article['category']): string {
  if (typeof category === 'string') return category.toLowerCase();
  return category?.slug || 'noticias';
}

// Helper para obtener vistas
function getViews(article: Article): number {
  return article.views || article.views_count || 0;
}

export function ArticleCard({
  article,
  variant = 'default',
  showCategory = true
}: ArticleCardProps) {
  const categoryColors: Record<string, { bg: string; text: string; glow: string }> = {
    'destacadas': { bg: 'bg-gradient-to-r from-red-500 to-orange-500', text: 'text-white', glow: 'shadow-red-500/30' },
    'noticias': { bg: 'bg-gradient-to-r from-blue-500 to-cyan-500', text: 'text-white', glow: 'shadow-blue-500/30' },
    'deportes': { bg: 'bg-gradient-to-r from-green-500 to-emerald-500', text: 'text-white', glow: 'shadow-green-500/30' },
    'turismo': { bg: 'bg-gradient-to-r from-amber-500 to-yellow-500', text: 'text-white', glow: 'shadow-amber-500/30' },
  };

  const catSlug = getCategorySlug(article.category);
  const catColors = categoryColors[catSlug] || categoryColors['noticias'];

  if (variant === 'compact') {
    return (
      <motion.div whileHover={{ y: -2, x: 2 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}>
        <Link href={`/noticia/${article.slug}`} className="group flex gap-4 p-3 rounded-xl hover:bg-gray-50 transition-all duration-300">
          {/* Imagen */}
          <div className="relative w-24 h-24 flex-shrink-0 overflow-hidden rounded-xl">
            {article.image_url ? (
              <Image
                src={article.image_url}
                alt={article.title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <span className="text-gray-400 text-xs">Sin imagen</span>
              </div>
            )}
          </div>

          {/* Contenido */}
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <h3 className="font-bold text-gray-900 group-hover:text-red-600 transition-colors line-clamp-2 text-sm leading-tight">
              {article.title}
            </h3>
            {article.published_at && (
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDistanceToNow(article.published_at)}
              </p>
            )}
          </div>
        </Link>
      </motion.div>
    );
  }

  if (variant === 'featured') {
    return (
      <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.3, ease: "easeOut" }} className="h-full">
        <Link href={`/noticia/${article.slug}`} className="group relative block h-full card-hover">
          {/* Imagen de fondo */}
          <div className="absolute inset-0 overflow-hidden rounded-2xl">
            {article.image_url ? (
              <Image
                src={article.image_url}
                alt={article.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900" />
            )}
            {/* Overlay gradiente intenso */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-90" />
          </div>

          {/* Contenido */}
          <div className="relative h-full flex flex-col justify-end p-6 text-white">
            {showCategory && (
              <span className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-full ${catColors.bg} ${catColors.text} w-fit mb-3 shadow-lg ${catColors.glow}`}>
                {getCategoryName(article.category)}
              </span>
            )}
            <h2 className="text-xl md:text-2xl font-black mb-3 group-hover:text-red-300 transition-colors line-clamp-3 leading-tight font-serif tracking-wide">
              {article.title}
            </h2>
            <p className="text-gray-300 line-clamp-2 mb-4 text-sm">
              {article.excerpt || article.summary}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-gray-400">
                {article.published_at && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatDistanceToNow(article.published_at)}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {getViews(article).toLocaleString()}
                </span>
              </div>
              <span className="flex items-center gap-1 text-red-400 font-semibold text-sm opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                Leer más <ArrowUpRight className="w-4 h-4" />
              </span>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  // Variante default - rediseñada con efectos modernos
  return (
    <motion.div whileHover={{ y: -8 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
      <Link href={`/noticia/${article.slug}`} className="group block card-hover">
        {/* Imagen */}
        <div className="relative aspect-[16/10] overflow-hidden rounded-2xl mb-4">
          {article.image_url ? (
            <Image
              src={article.image_url}
              alt={article.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <span className="text-gray-400">Sin imagen</span>
            </div>
          )}

          {/* Overlay en hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {showCategory && (
            <span className={`absolute top-3 left-3 px-3 py-1.5 text-xs font-bold rounded-full ${catColors.bg} ${catColors.text} shadow-lg ${catColors.glow}`}>
              {getCategoryName(article.category)}
            </span>
          )}

          {/* Botón de guardar */}
          <button className="absolute top-3 right-3 w-9 h-9 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-110">
            <Bookmark className="w-4 h-4 text-gray-700" />
          </button>

          {/* Tiempo de lectura */}
          <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-lg text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            3 min lectura
          </div>
        </div>

        {/* Contenido */}
        <div>
          <h3 className="font-bold text-gray-900 group-hover:text-red-600 transition-colors line-clamp-2 text-lg mb-2 leading-tight font-serif tracking-normal">
            {article.title}
          </h3>
          <p className="text-gray-600 line-clamp-2 text-sm mb-3">
            {article.excerpt || article.summary}
          </p>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-3">
              {article.published_at && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {formatDistanceToNow(article.published_at)}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                {getViews(article).toLocaleString()}
              </span>
            </div>
            <span className="flex items-center gap-1 text-red-500 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
              Leer <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
