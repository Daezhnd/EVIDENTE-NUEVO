'use client';

import { Reel } from '@/types/database';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Play, Eye, Heart, MessageCircle, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef, useState } from 'react';

interface ReelsSectionProps {
  reels: Reel[];
  title?: string;
  showViewMore?: boolean;
}

export function ReelsSection({ 
  reels, 
  title = 'Reels',
  showViewMore = true 
}: ReelsSectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 280; // Ancho de una card + gap
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (reels.length === 0) return null;

  return (
    <section className="relative py-16 overflow-hidden">
      {/* Fondo con gradiente moderno */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-red-900/20 via-transparent to-transparent" />
      
      {/* Patrón decorativo */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-40 h-40 border border-white rounded-full" />
        <div className="absolute bottom-10 right-10 w-60 h-60 border border-white rounded-full" />
        <div className="absolute top-1/2 left-1/4 w-20 h-20 bg-red-500 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header épico */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-red-500 via-pink-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/30 animate-float">
                <Play className="w-7 h-7 text-white" fill="white" />
              </div>
              <div className="absolute -top-1 -right-1 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-yellow-400" />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-black text-white flex items-center gap-2">
                {title}
                <span className="text-xs px-2 py-1 bg-gradient-to-r from-red-500 to-pink-500 rounded-full font-bold uppercase tracking-wider">
                  Nuevo
                </span>
              </h2>
              <p className="text-gray-400 mt-1">Videos cortos que te mantendrán informado</p>
            </div>
          </div>
          
          {showViewMore && (
            <Link
              href="/reels"
              className="group flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white text-white hover:text-gray-900 rounded-full font-semibold transition-all duration-300 backdrop-blur-sm border border-white/20"
            >
              Ver todos
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </div>

        {/* Carousel con controles */}
        <div className="relative group">
          {/* Botón izquierdo */}
          {canScrollLeft && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/90 hover:bg-white rounded-full shadow-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 -translate-x-4 group-hover:translate-x-0"
            >
              <ChevronLeft className="w-6 h-6 text-gray-900" />
            </button>
          )}

          {/* Botón derecho */}
          {canScrollRight && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/90 hover:bg-white rounded-full shadow-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 translate-x-4 group-hover:translate-x-0"
            >
              <ChevronRight className="w-6 h-6 text-gray-900" />
            </button>
          )}

          {/* Gradientes de fade en los bordes */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-gray-900 to-transparent z-[5] pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-gray-900 to-transparent z-[5] pointer-events-none" />

          {/* Carousel de reels */}
          <div 
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory px-4"
          >
            {reels.map((reel, index) => (
              <Link 
                key={reel.id}
                href={`/reels/${reel.id}`}
                className="flex-shrink-0 snap-start group/card"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="reel-card w-[200px] sm:w-[220px] bg-gray-800 shadow-2xl">
                  {/* Thumbnail */}
                  <Image
                    src={reel.thumbnail_url || '/placeholder-reel.jpg'}
                    alt={reel.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover/card:scale-105"
                  />
                  
                  {/* Overlay gradiente */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />

                  {/* Play button hover */}
                  <div className="reel-play-button">
                    <div className="w-16 h-16 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center border border-white/50">
                      <Play className="w-8 h-8 text-white ml-1" fill="white" />
                    </div>
                  </div>

                  {/* Duración */}
                  <div className="absolute top-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-md text-white text-xs font-medium">
                    {formatDuration(reel.duration || 0)}
                  </div>

                  {/* Stats overlay */}
                  <div className="absolute right-3 bottom-20 flex flex-col gap-3">
                    <div className="flex flex-col items-center text-white">
                      <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-1">
                        <Heart className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-medium">{formatNumber(reel.likes_count || 0)}</span>
                    </div>
                    <div className="flex flex-col items-center text-white">
                      <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-1">
                        <MessageCircle className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-medium">{formatNumber(reel.comments_count || 0)}</span>
                    </div>
                    <div className="flex flex-col items-center text-white">
                      <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-1">
                        <Eye className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-medium">{formatNumber(reel.views || 0)}</span>
                    </div>
                  </div>

                  {/* Contenido inferior */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white font-bold text-sm line-clamp-2 leading-tight mb-2">
                      {reel.title}
                    </h3>
                    {reel.author && (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {reel.author.name?.[0] || 'E'}
                        </div>
                        <span className="text-gray-300 text-xs">{reel.author.name || 'Evidente'}</span>
                      </div>
                    )}
                  </div>

                  {/* Border glow effect */}
                  <div className="absolute inset-0 rounded-[20px] border-2 border-transparent group-hover/card:border-red-500/50 transition-all duration-300" />
                </div>
              </Link>
            ))}

            {/* Card de "Ver más" al final */}
            <Link 
              href="/reels"
              className="flex-shrink-0 snap-start"
            >
              <div className="reel-card w-[200px] sm:w-[220px] bg-gradient-to-br from-red-500 via-pink-500 to-purple-600 flex flex-col items-center justify-center text-white">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <ArrowRight className="w-10 h-10" />
                </div>
                <span className="font-bold text-lg">Ver todos</span>
                <span className="text-sm text-white/80">los reels</span>
              </div>
            </Link>
          </div>
        </div>

        {/* Indicadores de scroll en móvil */}
        <div className="flex justify-center gap-2 mt-6 md:hidden">
          {reels.slice(0, 5).map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === 0 ? 'bg-red-500 w-6' : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}
