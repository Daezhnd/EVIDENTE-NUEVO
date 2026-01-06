'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Reel } from '@/types/database';
import { Play, Pause, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, X, Maximize2, Minimize2, Volume2, VolumeX } from 'lucide-react';
import { AdBanner } from '@/components/ads/AdBanner';

interface ReelsSidebarProps {
  reels: Reel[];
}

// Detectar tipo de video
function detectVideoSource(url: string): 'instagram' | 'tiktok' | 'direct' {
  if (!url) return 'direct';
  if (url.includes('instagram.com') || url.includes('instagr.am')) return 'instagram';
  if (url.includes('tiktok.com') || url.includes('vm.tiktok.com')) return 'tiktok';
  return 'direct';
}

export function ReelsSidebar({ reels }: ReelsSidebarProps) {
  const [isHidden, setIsHidden] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Si no hay reels, no renderizar nada
  if (!reels || reels.length === 0) {
    return null;
  }

  const visibleReels = reels.slice(currentIndex, currentIndex + 3);
  const canScrollUp = currentIndex > 0;
  const canScrollDown = currentIndex + 3 < reels.length;

  const scrollUp = () => {
    if (canScrollUp) setCurrentIndex(prev => prev - 1);
  };

  const scrollDown = () => {
    if (canScrollDown) setCurrentIndex(prev => prev + 1);
  };

  const currentReel = reels[currentReelIndex];

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SIDEBAR DESKTOP - Con botones ocultar/expandir */}
      {/* ═══════════════════════════════════════════════════════════════════ */}

      {/* Botón para mostrar sidebar cuando está oculta */}
      {isHidden && !isFullscreen && (
        <button
          onClick={() => setIsHidden(false)}
          className="hidden lg:flex fixed right-0 top-1/2 -translate-y-1/2 z-30 bg-blue-900 text-white p-2 rounded-l-lg shadow-lg hover:bg-blue-800 transition-colors items-center gap-1"
        >
          <Play className="w-5 h-5" fill="white" />
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}

      {/* Sidebar normal */}
      {!isHidden && !isFullscreen && (
        <div className="hidden lg:block fixed right-0 top-1/2 -translate-y-1/2 z-30">
          <div className="bg-gray-950 rounded-l-xl shadow-2xl shadow-black/50 overflow-hidden">
            {/* Header con botones */}
            <div className="px-2 py-2 bg-blue-900 flex items-center justify-between gap-1">
              <div className="flex items-center justify-center w-6">
                <Play className="w-4 h-4 text-white" fill="white" />
              </div>
              <div className="flex items-center gap-0.5">
                {/* Botón expandir */}
                <button
                  onClick={() => setIsFullscreen(true)}
                  className="w-6 h-6 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors"
                  title="Ver reels"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
                {/* Botón ocultar */}
                <button
                  onClick={() => setIsHidden(true)}
                  className="w-6 h-6 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors"
                  title="Ocultar"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Navegación arriba */}
            <button
              onClick={scrollUp}
              disabled={!canScrollUp}
              className={`w-full py-1 flex justify-center ${canScrollUp ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-700 cursor-not-allowed'} transition-colors`}
            >
              <ChevronUp className="w-4 h-4" />
            </button>

            {/* Reels visibles */}
            <div className="px-2 space-y-2">
              {visibleReels.map((reel) => (
                <button
                  key={reel.id}
                  onClick={() => {
                    setCurrentReelIndex(reels.findIndex(r => r.id === reel.id));
                    setIsFullscreen(true);
                  }}
                  className="block group relative w-full"
                >
                  <div className="relative w-16 aspect-[9/16] rounded-md overflow-hidden">
                    <Image
                      src={reel.thumbnail_url || '/placeholder.svg'}
                      alt={reel.caption || 'Reel'}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors" />

                    {/* Play icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-blue-900 group-hover:scale-110 transition-all">
                        <Play className="w-3 h-3 text-white ml-0.5" fill="white" />
                      </div>
                    </div>

                    {/* Duración - removido porque no existe en el schema */}
                    <div className="absolute bottom-1 right-1">
                      <span className="text-[10px] text-white bg-black/60 px-1 rounded">
                        Reel
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Navegación abajo */}
            <button
              onClick={scrollDown}
              disabled={!canScrollDown}
              className={`w-full py-2 flex justify-center ${canScrollDown ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-700 cursor-not-allowed'} transition-colors`}
            >
              <ChevronDown className="w-5 h-5" />
            </button>

            {/* Ver todos */}
            <button
              onClick={() => setIsFullscreen(true)}
              className="block w-full px-4 py-3 text-center text-xs text-gray-400 hover:text-white hover:bg-gray-800 border-t border-gray-800 transition-colors"
            >
              Ver todos ({reels.length})
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* MODO FULLSCREEN - Visor de reels */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black flex">
          {/* Área principal del reel */}
          <div className="flex-1 flex items-center justify-center relative">
            {/* Botón cerrar */}
            <button
              onClick={() => {
                setIsFullscreen(false);
                setIsPlaying(false);
                if (videoRef.current) videoRef.current.pause();
              }}
              className="absolute top-4 right-4 z-10 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Botón minimizar */}
            <button
              onClick={() => {
                setIsFullscreen(false);
                setIsPlaying(false);
                if (videoRef.current) videoRef.current.pause();
              }}
              className="absolute top-4 left-4 z-10 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
              <Minimize2 className="w-5 h-5" />
            </button>

            {/* Navegación anterior */}
            <button
              onClick={() => {
                setCurrentReelIndex((prev) => (prev - 1 + reels.length) % reels.length);
                setIsPlaying(false);
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>

            {/* Reel actual - VIDEO REAL */}
            <div className="relative w-full max-w-md aspect-[9/16] mx-auto bg-gray-900 rounded-2xl overflow-hidden">
              {(() => {
                const videoSource = detectVideoSource(currentReel?.video_url || '');

                // Video directo - reproducible
                if (videoSource === 'direct' && currentReel?.video_url) {
                  return (
                    <>
                      <video
                        ref={videoRef}
                        src={currentReel.video_url}
                        poster={currentReel.thumbnail_url || undefined}
                        className="absolute inset-0 w-full h-full object-cover"
                        loop
                        muted={isMuted}
                        playsInline
                        onClick={() => {
                          if (videoRef.current) {
                            if (isPlaying) {
                              videoRef.current.pause();
                            } else {
                              videoRef.current.play();
                            }
                            setIsPlaying(!isPlaying);
                          }
                        }}
                      />

                      {/* Play/Pause overlay */}
                      {!isPlaying && (
                        <div
                          className="absolute inset-0 flex items-center justify-center cursor-pointer"
                          onClick={() => {
                            if (videoRef.current) {
                              videoRef.current.play();
                              setIsPlaying(true);
                            }
                          }}
                        >
                          <div className="w-20 h-20 bg-blue-900/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-blue-800 hover:scale-110 transition-all">
                            <Play className="w-10 h-10 text-white ml-1" fill="white" />
                          </div>
                        </div>
                      )}

                      {/* Controles de volumen */}
                      <button
                        onClick={() => {
                          setIsMuted(!isMuted);
                          if (videoRef.current) videoRef.current.muted = !isMuted;
                        }}
                        className="absolute bottom-24 right-4 w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20"
                      >
                        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                      </button>
                    </>
                  );
                }

                // Instagram o TikTok - mostrar card con link
                return (
                  <a
                    href={currentReel?.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 flex flex-col"
                  >
                    {currentReel?.thumbnail_url ? (
                      <Image
                        src={currentReel.thumbnail_url}
                        alt={currentReel?.caption || 'Reel'}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className={`absolute inset-0 ${videoSource === 'instagram' ? 'bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400' : 'bg-gradient-to-br from-cyan-400 via-pink-500 to-red-500'}`} />
                    )}
                    <div className="absolute inset-0 bg-black/40" />
                    <div className="relative z-10 flex-1 flex flex-col items-center justify-center">
                      <div className={`w-16 h-16 ${videoSource === 'instagram' ? 'bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400' : 'bg-black'} rounded-2xl flex items-center justify-center mb-4 shadow-lg`}>
                        {videoSource === 'instagram' ? (
                          <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                          </svg>
                        ) : (
                          <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                          </svg>
                        )}
                      </div>
                      <span className="text-white font-bold text-lg mb-2">
                        Ver en {videoSource === 'instagram' ? 'Instagram' : 'TikTok'}
                      </span>
                      <Play className="w-12 h-12 text-white opacity-80" fill="white" />
                    </div>
                  </a>
                );
              })()}

              {/* Info del reel */}
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                <p className="text-white font-medium text-sm line-clamp-2 mb-2">{currentReel?.caption}</p>
                <div className="flex items-center gap-4 text-white/70 text-sm">
                  <span>{(currentReel?.views_count || 0).toLocaleString()} views</span>
                </div>
              </div>

              {/* Contador */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2">
                <span className="px-4 py-2 bg-black/50 backdrop-blur-sm text-white text-sm rounded-full">
                  {currentReelIndex + 1} / {reels.length}
                </span>
              </div>
            </div>

            {/* Navegación siguiente */}
            <button
              onClick={() => {
                setCurrentReelIndex((prev) => (prev + 1) % reels.length);
                setIsPlaying(false);
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
              <ChevronRight className="w-8 h-8" />
            </button>

            {/* Indicadores */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-1.5">
              {reels.slice(0, 10).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentReelIndex(idx);
                    setIsPlaying(false);
                  }}
                  className={`h-1.5 rounded-full transition-all ${idx === currentReelIndex ? 'bg-blue-500 w-8' : 'bg-white/30 w-1.5 hover:bg-white/50'
                    }`}
                />
              ))}
              {reels.length > 10 && (
                <span className="text-white/50 text-xs ml-2">+{reels.length - 10}</span>
              )}
            </div>
          </div>

          {/* Lista lateral de reels */}
          <div className="hidden xl:block w-80 bg-gray-900 border-l border-gray-800 overflow-y-auto">
            <div className="p-4 border-b border-gray-800 sticky top-0 bg-gray-900 z-10">
              <h3 className="text-white font-bold">Todos los reels</h3>
              <p className="text-gray-500 text-sm">{reels.length} videos</p>
            </div>

            {/* Banner publicitario en Sidebar */}
            <div className="px-4 pt-4">
              <AdBanner position="sidebar" className="my-0 h-[200px]" />
            </div>

            <div className="p-4 space-y-3">
              {reels.map((reel, idx) => (
                <button
                  key={reel.id}
                  onClick={() => {
                    setCurrentReelIndex(idx);
                    setIsPlaying(false);
                  }}
                  className={`w-full flex gap-3 p-2 rounded-lg transition-colors ${idx === currentReelIndex ? 'bg-blue-900/30' : 'hover:bg-gray-800'
                    }`}
                >
                  <div className="relative w-16 aspect-[9/16] rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={reel.thumbnail_url || '/placeholder.svg'}
                      alt={reel.caption || 'Reel'}
                      fill
                      className="object-cover"
                    />
                    {idx === currentReelIndex && (
                      <div className="absolute inset-0 bg-blue-900/50 flex items-center justify-center">
                        <Play className="w-4 h-4 text-white" fill="white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className={`font-medium text-sm line-clamp-2 ${idx === currentReelIndex ? 'text-blue-400' : 'text-white'}`}>
                      {reel.caption || 'Sin descripción'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* MÓVIL - Botón flotante */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <button
        onClick={() => setIsFullscreen(true)}
        className="lg:hidden fixed bottom-24 right-4 z-40 w-14 h-14 bg-blue-900 rounded-full shadow-lg shadow-blue-900/30 flex items-center justify-center"
      >
        <Play className="w-6 h-6 text-white ml-0.5" fill="white" />
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-blue-900 text-xs font-bold rounded-full flex items-center justify-center">
          {reels.length}
        </span>
      </button>
    </>
  );
}
