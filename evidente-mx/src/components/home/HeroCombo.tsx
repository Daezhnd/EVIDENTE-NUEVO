// Test: Vercel auto-deploy conectado con GitHub
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

export function HeroCombo({ mainArticle, secondaryArticles }: HeroComboProps) {
  return (
    <section className="relative">
      {/* HERO PRINCIPAL - Split diagonal */}
      <div className="relative h-[85vh] min-h-[550px] max-h-[800px] overflow-hidden">

        {/* Lado izquierdo - IMAGEN DE LA NOTA */}
        <div className="absolute inset-0 w-full lg:w-[58%]">
          <Link href={`/noticia/${mainArticle.slug}`} className="block h-full group">
            <Image
              src={mainArticle.image_url || '/placeholder.svg'}
              alt={mainArticle.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              priority
            />
            {/* Overlay gradiente */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />

            {/* Badge */}
            <div className="absolute top-6 left-6">
              <span className="px-4 py-2 bg-blue-900 text-white text-xs font-bold uppercase tracking-wider">
                Destacado
              </span>
            </div>

            {/* Contenido sobre la imagen - visible en móvil */}
            <div className="lg:hidden absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/90 to-transparent p-6">
              <h1 className="text-2xl font-black text-white leading-tight mb-3 line-clamp-3">
                {mainArticle.title}
              </h1>
              <p className="text-white/70 text-sm line-clamp-2 mb-3">
                {mainArticle.excerpt || mainArticle.summary}
              </p>
              <div className="flex items-center gap-3 text-white/60 text-sm">
                <span>{timeAgo(mainArticle.published_at || mainArticle.created_at)}</span>
                <span>•</span>
                <span>{(mainArticle.views || 0).toLocaleString()} lecturas</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Divisor diagonal - solo desktop */}
        <div className="hidden lg:block absolute inset-y-0 left-[55%] w-[6%] z-10">
          <svg className="h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
            <polygon points="0,0 100,0 0,100" fill="white" />
          </svg>
        </div>

        {/* Lado derecho - TEXTO */}
        <div className="hidden lg:flex absolute inset-0 left-[58%] bg-white">
          <div className="flex flex-col justify-center p-8 xl:p-12 2xl:p-16 max-w-xl">
            {/* Categoría decorativa */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-0.5 bg-blue-900" />
              <span className="text-blue-900 text-sm font-semibold uppercase tracking-wider">
                {typeof mainArticle.category === 'object' ? mainArticle.category.name : 'Noticias'}
              </span>
            </div>

            {/* Título */}
            <Link href={`/noticia/${mainArticle.slug}`} className="group">
              <h1 className="text-3xl xl:text-4xl 2xl:text-5xl font-black text-gray-900 leading-[1.1] mb-6 group-hover:text-blue-900 transition-colors">
                {mainArticle.title}
              </h1>
            </Link>

            {/* Excerpt */}
            <p className="text-gray-600 text-lg leading-relaxed mb-6 line-clamp-3">
              {mainArticle.excerpt || mainArticle.summary}
            </p>

            {/* Meta info */}
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

      {/* NOTICIAS SECUNDARIAS - Barra inferior */}
      <div className="bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-gray-800">
            {secondaryArticles.slice(0, 4).map((article) => (
              <Link
                key={article.id}
                href={`/noticia/${article.slug}`}
                className="group p-4 lg:p-5 hover:bg-gray-900 transition-colors"
              >
                <span className="text-blue-400 text-xs font-semibold uppercase tracking-wide">
                  {typeof article.category === 'object' ? article.category.name : article.category}
                </span>
                <h3 className="text-white font-semibold text-sm lg:text-base mt-1 line-clamp-2 group-hover:text-blue-300 transition-colors leading-snug">
                  {article.title}
                </h3>
                <span className="text-gray-600 text-xs mt-2 block">
                  {timeAgo(article.published_at || article.created_at)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
