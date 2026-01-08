'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Article } from '@/types/database';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

interface CreativeCategorySectionProps {
  title: string;
  slug: string;
  articles: Article[];
  variant?: 'default' | 'dark' | 'featured';
}

function timeAgo(date: string): string {
  const now = new Date();
  const d = new Date(date);
  const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60));
  if (diff < 60) return `${diff}m`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h`;
  return `${Math.floor(diff / 1440)}d`;
}

export function CreativeCategorySection({ title, slug, articles, variant = 'default' }: CreativeCategorySectionProps) {
  if (articles.length === 0) return null;

  const main = articles[0];
  const rest = articles.slice(1, 5);

  // ═══════════════════════════════════════════════════════════════════
  // VARIANTE DEFAULT - Estilo editorial con línea vertical y tipografía bold
  // ═══════════════════════════════════════════════════════════════════
  if (variant === 'default') {
    return (
      <section className="py-10 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header estilo periódico */}
          <div className="flex items-end gap-6 mb-8">
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tight leading-none">
              {title}
            </h2>
            <div className="h-px flex-1 bg-gray-300 mb-2" />
            <Link
              href={`/categoria/${slug}`}
              className="text-sm font-medium text-gray-500 hover:text-evident flex items-center gap-1 mb-2 whitespace-nowrap"
            >
              Explorar sección <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Layout principal con línea vertical */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            {/* Nota principal - Grande a la izquierda */}
            <div className="lg:col-span-7 lg:pr-8 lg:border-r border-gray-200">
              <Link href={`/noticia/${main.slug}`} className="group block">
                <div className="relative aspect-[16/10] overflow-hidden mb-5">
                  <Image
                    src={main.image_url || '/placeholder.svg'}
                    alt={main.title}
                    fill
                    className="object-cover group-hover:scale-[1.02] transition-transform duration-700"
                  />
                </div>
                <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 group-hover:text-evident transition-colors leading-tight mb-3">
                  {main.title}
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed line-clamp-2 mb-3">
                  {main.excerpt || main.summary}
                </p>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <span>{timeAgo(main.published_at || main.created_at)}</span>
                  <span>•</span>
                  <span>{(main.views || 0).toLocaleString()} lecturas</span>
                </div>
              </Link>
            </div>

            {/* Lista de notas - Derecha con números */}
            <div className="lg:col-span-5 lg:pl-8 mt-8 lg:mt-0">
              <div className="space-y-0">
                {rest.map((article, idx) => (
                  <Link
                    key={article.id}
                    href={`/noticia/${article.slug}`}
                    className="group flex items-start gap-4 py-5 border-b border-gray-100 last:border-0 hover:bg-gray-50 -mx-3 px-3 transition-colors"
                  >
                    {/* Número grande */}
                    <span className="text-4xl font-black text-gray-200 group-hover:text-blue-200 transition-colors leading-none w-10 flex-shrink-0">
                      {idx + 2}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 group-hover:text-[#0067b2] transition-colors line-clamp-2 leading-snug mb-1">
                        {article.title}
                      </h4>
                      <span className="text-gray-400 text-sm">
                        {timeAgo(article.published_at || article.created_at)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // VARIANTE DARK - Grid asimétrico con imagen destacada y texto sobre imagen
  // ═══════════════════════════════════════════════════════════════════
  if (variant === 'dark') {
    return (
      <section className="bg-gray-950 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header con línea azul */}
          <div className="flex items-center gap-6 mb-8">
            <div className="w-12 h-1 bg-[#0067b2]" />
            <h2 className="text-3xl lg:text-4xl font-black text-white tracking-tight">
              {title}
            </h2>
            <Link
              href={`/categoria/${slug}`}
              className="ml-auto text-sm text-gray-500 hover:text-white flex items-center gap-1"
            >
              Ver todo <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Grid asimétrico */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-1">
            {/* Nota principal - 2 columnas */}
            <Link
              href={`/noticia/${main.slug}`}
              className="lg:col-span-2 lg:row-span-2 relative group overflow-hidden"
            >
              <div className="relative aspect-[4/3] lg:aspect-auto lg:h-full min-h-[300px]">
                <Image
                  src={main.image_url || '/placeholder.svg'}
                  alt={main.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
                  <h3 className="text-xl lg:text-3xl font-bold text-white leading-tight mb-2 group-hover:text-blue-200 transition-colors">
                    {main.title}
                  </h3>
                  <p className="text-white/70 text-sm lg:text-base line-clamp-2 mb-3 hidden sm:block">
                    {main.excerpt || main.summary}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-400 text-sm font-semibold">Leer nota</span>
                    <ArrowUpRight className="w-4 h-4 text-blue-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>

            {/* Notas secundarias - Apiladas */}
            {rest.slice(0, 2).map((article) => (
              <Link
                key={article.id}
                href={`/noticia/${article.slug}`}
                className="relative group overflow-hidden"
              >
                <div className="relative aspect-video lg:aspect-[4/3]">
                  <Image
                    src={article.image_url || '/placeholder.svg'}
                    alt={article.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h4 className="font-semibold text-white text-sm lg:text-base leading-snug line-clamp-2 group-hover:text-blue-200 transition-colors">
                      {article.title}
                    </h4>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Fila inferior con texto grande */}
          {rest.length > 2 && (
            <div className="mt-8 pt-8 border-t border-gray-800 grid grid-cols-1 md:grid-cols-2 gap-6">
              {rest.slice(2, 4).map((article) => (
                <Link
                  key={article.id}
                  href={`/noticia/${article.slug}`}
                  className="group flex items-start gap-4"
                >
                  <div className="relative w-20 h-20 flex-shrink-0 overflow-hidden">
                    <Image
                      src={article.image_url || '/placeholder.svg'}
                      alt={article.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-white text-sm group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
                      {article.title}
                    </h4>
                    <span className="text-gray-600 text-xs mt-2 block">
                      {timeAgo(article.published_at || article.created_at)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // VARIANTE FEATURED - Estilo magazine con foto grande y overlay elegante
  // ═══════════════════════════════════════════════════════════════════
  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header minimalista con badge */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <span className="w-3 h-3 bg-[#0067b2] rounded-full" />
            <h2 className="text-3xl lg:text-4xl font-black text-gray-900">{title}</h2>
          </div>
          <Link
            href={`/categoria/${slug}`}
            className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium hover:bg-[#0067b2] hover:text-white transition-colors rounded-full"
          >
            Descubrir más <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Layout Magazine - Full width hero + grid */}
        <div className="space-y-6">
          {/* Hero de sección - Full width con texto superpuesto */}
          <Link href={`/noticia/${main.slug}`} className="group block relative">
            <div className="relative aspect-[21/9] overflow-hidden">
              <Image
                src={main.image_url || '/placeholder.svg'}
                alt={main.title}
                fill
                className="object-cover group-hover:scale-[1.02] transition-transform duration-700"
              />
              {/* Overlay con gradiente lateral */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

              {/* Contenido sobre la imagen */}
              <div className="absolute inset-y-0 left-0 flex flex-col justify-center p-6 lg:p-12 max-w-2xl">
                <span className="inline-block px-3 py-1 bg-[#0067b2] text-white text-xs font-bold uppercase tracking-wider mb-4 w-fit">
                  {title}
                </span>
                <h3 className="text-2xl lg:text-4xl font-bold text-white leading-tight mb-4 group-hover:text-blue-200 transition-colors">
                  {main.title}
                </h3>
                <p className="text-white/80 text-base lg:text-lg leading-relaxed line-clamp-2 mb-4 hidden md:block">
                  {main.excerpt || main.summary}
                </p>
                <div className="flex items-center gap-3 text-white/60 text-sm">
                  <span>{timeAgo(main.published_at || main.created_at)}</span>
                  <span>•</span>
                  <span>{(main.views || 0).toLocaleString()} lecturas</span>
                </div>
              </div>
            </div>
          </Link>

          {/* Grid de secundarias - Estilo tarjetas horizontales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {rest.map((article) => (
              <Link
                key={article.id}
                href={`/noticia/${article.slug}`}
                className="group bg-gray-50 hover:bg-gray-100 transition-colors p-4 flex gap-4"
              >
                <div className="relative w-16 h-16 flex-shrink-0 overflow-hidden">
                  <Image
                    src={article.image_url || '/placeholder.svg'}
                    alt={article.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 text-sm group-hover:text-[#0067b2] transition-colors line-clamp-2 leading-snug">
                    {article.title}
                  </h4>
                  <span className="text-gray-400 text-xs mt-1 block">
                    {timeAgo(article.published_at || article.created_at)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Link móvil */}
        <Link
          href={`/categoria/${slug}`}
          className="md:hidden flex items-center justify-center gap-2 mt-6 py-3 bg-gray-100 text-gray-700 text-sm font-medium rounded-full"
        >
          Ver todo en {title} <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
