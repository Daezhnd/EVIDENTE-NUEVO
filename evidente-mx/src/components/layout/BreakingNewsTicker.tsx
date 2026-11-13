'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Newspaper, ChevronRight } from 'lucide-react';
import { env } from '@/lib/env';

interface BreakingNews {
  id: string;
  title: string;
  slug: string;
}

interface BreakingNewsTickerProps {
  news: BreakingNews[];
}

export function BreakingNewsTicker({ news: initialNews }: BreakingNewsTickerProps) {
  const [news, setNews] = useState(initialNews);

  // El HTML llega desde una caché de larga duración; los titulares se refrescan aquí,
  // directo desde Supabase, para no regenerar todas las páginas con cada publicación.
  useEffect(() => {
    if (!env.supabase.url || !env.supabase.anonKey) return;
    const controller = new AbortController();
    const limit = Math.max(initialNews.length, 8);
    const url = `${env.supabase.url}/rest/v1/articles?select=id,title,slug&is_published=eq.true&order=published_at.desc&limit=${limit}`;

    fetch(url, {
      headers: { apikey: env.supabase.anonKey, Authorization: `Bearer ${env.supabase.anonKey}` },
      signal: controller.signal,
    })
      .then(response => (response.ok ? response.json() : null))
      .then((rows: BreakingNews[] | null) => {
        if (!Array.isArray(rows) || rows.length === 0) return;
        setNews(current =>
          current.length === rows.length && current.every((item, index) => item.id === rows[index].id && item.title === rows[index].title && item.slug === rows[index].slug)
            ? current
            : rows
        );
      })
      .catch(() => { /* Se conservan los titulares del servidor. */ });

    return () => controller.abort();
  }, [initialNews.length]);

  if (!news || news.length === 0) return null;

  // Duplicamos 10 veces para asegurar scroll infinito súper fluido sin cortes
  // Esto llena el ancho de pantalla varias veces
  const duplicatedNews = Array(10).fill(news).flat();

  return (
    <div className="relative overflow-hidden bg-black border-b border-black">
      {/* Efecto de brillo animado */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-10">
          {/* Badge ÚLTIMAS NOTICIAS */}
          <div className="flex-shrink-0 flex items-center gap-2 pr-4 border-r border-white/20">
            <Newspaper className="w-4 h-4 text-red-400" />
            <span className="text-white font-semibold text-sm uppercase tracking-wider">
              Últimas Noticias
            </span>
          </div>

          {/* Ticker con scroll infinito */}
          <div className="flex-1 overflow-hidden mx-4">
            <div className="ticker-content animate-ticker">
              {duplicatedNews.map((item, index) => (
                // Sin precarga: son 80 enlaces repetidos y cada precarga es una petición a Vercel.
                <Link
                  prefetch={false}
                  key={`${item.id}-${index}`}
                  href={`/noticia/${item.slug}`}
                  className="inline-flex items-center gap-2 px-6 text-white/90 hover:text-white transition-colors whitespace-nowrap group"
                >
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                  <span className="font-medium">{item.title}</span>
                  <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
            </div>
          </div>

          {/* Botón Ver más */}
          <Link
            href="/categoria/noticias"
            className="flex-shrink-0 hidden sm:flex items-center gap-1 px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-full transition-all duration-300"
          >
            Ver todo
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
