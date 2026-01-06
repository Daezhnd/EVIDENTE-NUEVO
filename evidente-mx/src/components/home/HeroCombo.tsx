'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Article } from '@/types/database';
import { Clock, ArrowRight } from 'lucide-react';

interface HeroComboProps {
  mainArticle: Article;
  secondaryArticles: Article[];
}

function timeAgo(date: string): string {
  const now = new Date();
  const d = new Date(date);
  const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60));
  if (diff < 60) return `${diff}m`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h`;
  return `${Math.floor(diff / 1440)}d`;
}

import { ScrollIndicator } from '@/components/ui/ScrollIndicator';

export function HeroCombo({ mainArticle, secondaryArticles }: HeroComboProps) {
  return (
    <section className="relative">
      <ScrollIndicator />

      {/* HERO PRINCIPAL - Split Diagonal Original Restaurado */}
      <div className="relative min-h-[600px] lg:h-[calc(100vh-140px)] w-full overflow-hidden bg-white">

        {/* Lado izquierdo - IMAGEN */}
        <div className="absolute inset-0 w-full lg:w-[60%] h-full">
          <Link href={`/noticia/${mainArticle.slug}`} className="block h-full w-full group relative">
            <Image
              src={mainArticle.image_url || '/placeholder.svg'}
              alt={mainArticle.title}
              fill
              className="object-cover transition-transform duration-1000 group-hover:scale-105"
              priority
            />
            {/* Overlay sutil */}
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />

            {/* Badge - Top Left */}
            <div className="absolute top-8 left-8 z-10">
              <span className="px-4 py-1.5 bg-blue-900 text-white text-xs font-bold uppercase tracking-widest shadow-lg">
                Destacado
              </span>
            </div>

            {/* Texto en Móvil (Visible solo < lg) */}
            <div className="absolute bottom-0 left-0 right-0 p-8 lg:hidden bg-gradient-to-t from-black/90 via-black/60 to-transparent">
              <h1 className="text-3xl font-black text-white leading-tight mb-4">
                {mainArticle.title}
              </h1>
              <div className="flex items-center gap-3 text-white/80 text-xs font-medium uppercase tracking-wider">
                <Clock className="w-3 h-3" />
                <span>{timeAgo(mainArticle.published_at || mainArticle.created_at)}</span>
              </div>
            </div>
          </Link>
        </div>

        {/* ELEMENTO DIAGONAL (SVG) - Original Direction */}
        <div className="hidden lg:block absolute inset-y-0 left-[55%] w-[6%] z-20 pointer-events-none">
          <svg className="h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
            <polygon points="0,0 100,0 0,100" fill="white" />
          </svg>
        </div>

        {/* Lado derecho - TEXTO (Sólido blanco) */}
        <div className="hidden lg:flex absolute inset-0 left-[58%] bg-white items-center p-12 xl:p-16 z-10">
          <div className="max-w-xl">
            {/* Categoría con línea */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-8 h-1 bg-blue-900" />
              <span className="text-blue-900 text-sm font-bold uppercase tracking-wider">
                {typeof mainArticle.category === 'object' ? mainArticle.category.name : 'Noticias'}
              </span>
            </div>

            {/* Título Grande */}
            <Link href={`/noticia/${mainArticle.slug}`} className="group block mb-6">
              <h1 className="text-4xl xl:text-5xl font-black text-gray-900 leading-[1.1] group-hover:text-blue-900 transition-colors">
                {mainArticle.title}
              </h1>
            </Link>

            {/* Excerpt */}
            <p className="text-gray-500 text-lg leading-relaxed mb-8 line-clamp-3">
              {mainArticle.excerpt || mainArticle.summary}
            </p>

            {/* Footer Meta */}
            <div className="flex items-center gap-4 text-sm text-gray-400 mb-8">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {timeAgo(mainArticle.published_at || mainArticle.created_at)}
              </span>
              <span className="w-1 h-1 bg-gray-300 rounded-full" />
              <span>{(mainArticle.views || 0).toLocaleString()} lecturas</span>
            </div>

            {/* CTA */}
            <Link
              href={`/noticia/${mainArticle.slug}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-900 text-white font-semibold hover:bg-blue-800 transition-colors w-fit group"
            >
              Leer nota completa
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

      </div>

      {/* Espaciado inferior limpio (sin línea negra) */}
      <div className="h-10 w-full bg-white" />
    </section>
  );
}
