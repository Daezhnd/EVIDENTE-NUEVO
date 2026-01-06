'use client';

import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Reel } from '@/types/database';
import { Play, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

interface ReelsShowcaseProps {
  reels: Reel[];
}

export function ReelsShowcase({ reels }: ReelsShowcaseProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 280;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="py-12 bg-black relative overflow-hidden">
      {/* Fondo con gradiente sutil */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black" />
      
      <div className="relative z-10">
        {/* Header creativo */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Logo animado de reels */}
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center">
                  <Play className="w-6 h-6 text-white ml-0.5" fill="white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center">
                  <span className="text-[10px] font-bold text-red-600">{reels.length}</span>
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-black text-white">Reels</h2>
                <p className="text-gray-500 text-sm">Las noticias en video</p>
              </div>
            </div>

            {/* Controles de navegación */}
            <div className="hidden md:flex items-center gap-2">
              <button 
                onClick={() => scroll('left')}
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              <button 
                onClick={() => scroll('right')}
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
              <Link 
                href="/reels" 
                className="ml-4 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-full hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                Ver todos <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Carrusel de reels - Estilo stories */}
        <div 
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide px-4 sm:px-6 lg:px-8 pb-4 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {reels.map((reel, idx) => (
            <Link
              key={reel.id}
              href={`/reels/${reel.id}`}
              className="flex-shrink-0 group snap-start"
            >
              {/* Card del reel con efecto glow */}
              <div className="relative w-44 sm:w-52">
                {/* Glow effect en hover */}
                <div className="absolute -inset-1 bg-gradient-to-t from-red-600/50 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-md" />
                
                <div className="relative aspect-[9/16] rounded-xl overflow-hidden bg-gray-800">
                  <Image
                    src={reel.thumbnail_url || '/placeholder.svg'}
                    alt={reel.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30" />
                  
                  {/* Play button */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center shadow-lg shadow-red-600/50">
                      <Play className="w-6 h-6 text-white ml-0.5" fill="white" />
                    </div>
                  </div>
                  
                  {/* Número de orden */}
                  <div className="absolute top-3 left-3">
                    <span className="text-6xl font-black text-white/20 leading-none">
                      {idx + 1}
                    </span>
                  </div>
                  
                  {/* Duración */}
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-0.5 bg-black/60 backdrop-blur-sm text-white text-xs rounded">
                      {reel.duration || '0:30'}
                    </span>
                  </div>
                  
                  {/* Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h3 className="text-white font-semibold text-sm leading-tight line-clamp-2 mb-1">
                      {reel.title}
                    </h3>
                    <div className="flex items-center gap-2 text-white/60 text-xs">
                      <span>{(reel.views || 0).toLocaleString()} views</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}

          {/* Card "Ver más" al final */}
          <Link
            href="/reels"
            className="flex-shrink-0 snap-start"
          >
            <div className="relative w-44 sm:w-52 aspect-[9/16] rounded-xl overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 flex flex-col items-center justify-center gap-4 group hover:from-red-900/30 hover:to-gray-900 transition-colors">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-red-600 transition-colors">
                <ArrowRight className="w-8 h-8 text-white" />
              </div>
              <span className="text-white font-semibold">Ver todos</span>
              <span className="text-gray-500 text-sm">{reels.length} reels</span>
            </div>
          </Link>
        </div>

        {/* Link móvil */}
        <div className="md:hidden flex justify-center mt-6 px-4">
          <Link 
            href="/reels" 
            className="w-full py-3 bg-white/10 text-white text-sm font-semibold rounded-full hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
          >
            Ver todos los reels <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
