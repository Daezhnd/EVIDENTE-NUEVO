'use client';

import Link from 'next/link';
import { AlertCircle, ChevronRight, Radio } from 'lucide-react';

interface BreakingNews {
  id: string;
  title: string;
  slug: string;
}

interface BreakingNewsTickerProps {
  news: BreakingNews[];
}

export function BreakingNewsTicker({ news }: BreakingNewsTickerProps) {
  if (!news || news.length === 0) return null;

  // Duplicamos para scroll infinito
  const duplicatedNews = [...news, ...news, ...news];

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-red-600 via-red-500 to-orange-500">
      {/* Efecto de brillo animado */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-10">
          {/* Badge ÚLTIMA HORA */}
          <div className="flex-shrink-0 flex items-center gap-2 pr-4 border-r border-white/30">
            <div className="relative">
              <Radio className="w-4 h-4 text-white" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-white rounded-full animate-ping" />
            </div>
            <span className="text-white font-bold text-sm uppercase tracking-wider">
              Última Hora
            </span>
          </div>

          {/* Ticker con scroll infinito */}
          <div className="flex-1 overflow-hidden mx-4">
            <div className="ticker-content animate-ticker">
              {duplicatedNews.map((item, index) => (
                <Link
                  key={`${item.id}-${index}`}
                  href={`/noticia/${item.slug}`}
                  className="inline-flex items-center gap-2 px-6 text-white hover:text-yellow-200 transition-colors whitespace-nowrap group"
                >
                  <AlertCircle className="w-4 h-4 text-yellow-300" />
                  <span className="font-medium">{item.title}</span>
                  <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
            </div>
          </div>

          {/* Botón Ver más */}
          <Link 
            href="/categoria/ultima-hora"
            className="flex-shrink-0 hidden sm:flex items-center gap-1 px-3 py-1 bg-white/20 hover:bg-white/30 text-white text-sm font-medium rounded-full transition-all duration-300"
          >
            Ver más
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
