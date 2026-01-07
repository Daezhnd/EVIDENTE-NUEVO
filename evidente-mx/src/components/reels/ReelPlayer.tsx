'use client';

import { useState, useRef, useEffect } from 'react';
import { Reel } from '@/types/database';
import { Play, Pause, Volume2, VolumeX, Heart, MessageCircle, Share2, AlertCircle, RefreshCw } from 'lucide-react';
import { formatNumber } from '@/lib/utils';
import { TikTokEmbed } from './TikTokEmbed';

interface ReelPlayerProps {
  reel: Reel;
  isActive?: boolean;
  onVideoEnd?: () => void;
}

// Detectar tipo de video
function detectVideoSource(url: string): 'instagram' | 'tiktok' | 'direct' {
  if (!url) return 'direct';
  if (url.includes('instagram.com') || url.includes('instagr.am')) return 'instagram';
  if (url.includes('tiktok.com') || url.includes('vm.tiktok.com')) return 'tiktok';
  return 'direct';
}

export function ReelPlayer({ reel, isActive = false, onVideoEnd }: ReelPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const videoSource = detectVideoSource(reel.video_url);

  // Auto-play cuando está activo
  useEffect(() => {
    if (videoRef.current && videoSource === 'direct') {
      if (isActive) {
        videoRef.current.play().catch(() => {
          // Autoplay bloqueado, necesita interacción del usuario
        });
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
        setIsPlaying(false);
      }
    }
  }, [isActive, videoSource]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(progress);
    }
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
    if (onVideoEnd) {
      onVideoEnd();
    }
  };

  return (
    <div className="relative w-full max-w-[350px] aspect-[9/16] bg-black rounded-2xl overflow-hidden group">
      {/* Instagram Embed - Card con link */}
      {videoSource === 'instagram' && (
        <a
          href={reel.video_url}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 flex flex-col"
        >
          {/* Thumbnail o gradient */}
          {reel.thumbnail_url ? (
            <img
              src={reel.thumbnail_url}
              alt={reel.caption || 'Reel de Instagram'}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400" />
          )}

          {/* Overlay oscuro */}
          <div className="absolute inset-0 bg-black/40" />

          {/* Contenido */}
          <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-4">
            {/* Instagram icon */}
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </div>

            <span className="text-white font-bold text-lg mb-2">Ver en Instagram</span>
            <Play className="w-12 h-12 text-white opacity-80" fill="white" />
          </div>

          {/* Caption en la parte inferior */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
            {reel.caption && (
              <p className="text-white text-sm line-clamp-3">{reel.caption}</p>
            )}
          </div>
        </a>
      )}

      {/* TikTok - Native Embed */}
      {videoSource === 'tiktok' && (
        <div className="absolute inset-0 bg-black flex items-center justify-center overflow-y-auto">
          <TikTokEmbed url={reel.video_url} caption={reel.caption || undefined} />
        </div>
      )}

      {/* Direct Video */}
      {videoSource === 'direct' && (
        <>
          {/* Error state */}
          {videoError && (
            <div className="absolute inset-0 bg-gray-900 flex flex-col items-center justify-center p-4 text-center">
              <AlertCircle className="w-12 h-12 text-red-400 mb-3" />
              <p className="text-white font-medium mb-2">Error al cargar video</p>
              <p className="text-gray-400 text-sm mb-4">{videoError}</p>
              <button
                onClick={() => {
                  setVideoError(null);
                  setIsLoading(true);
                  if (videoRef.current) {
                    videoRef.current.load();
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <RefreshCw className="w-4 h-4" />
                Reintentar
              </button>
              <p className="text-gray-500 text-xs mt-4 max-w-[200px] truncate">{reel.video_url}</p>
            </div>
          )}

          {/* Loading state */}
          {isLoading && !videoError && (
            <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
            </div>
          )}

          <video
            ref={videoRef}
            src={reel.video_url}
            poster={reel.thumbnail_url || undefined}
            className="absolute inset-0 w-full h-full object-cover"
            loop
            muted={isMuted}
            playsInline
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleVideoEnd}
            onClick={togglePlay}
            onLoadedData={() => setIsLoading(false)}
            onCanPlay={() => setIsLoading(false)}
            onError={(e) => {
              const video = e.target as HTMLVideoElement;
              const error = video.error;
              let errorMsg = 'No se pudo cargar el video';
              if (error) {
                switch (error.code) {
                  case 1: errorMsg = 'La carga fue abortada'; break;
                  case 2: errorMsg = 'Error de red'; break;
                  case 3: errorMsg = 'Error al decodificar'; break;
                  case 4: errorMsg = 'Formato no soportado o URL inválida'; break;
                }
              }
              setVideoError(errorMsg);
              setIsLoading(false);
            }}
          />

          {/* Overlay de controles */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60">
            {/* Barra de progreso */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-white/20">
              <div
                className="h-full bg-white transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Botón de play central (visible cuando está pausado) */}
            {!isPlaying && (
              <button
                onClick={togglePlay}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Play className="w-8 h-8 text-white ml-1" fill="white" />
                </div>
              </button>
            )}

            {/* Controles laterales */}
            <div className="absolute right-3 bottom-24 flex flex-col gap-4">
              {/* Like */}
              <button className="flex flex-col items-center gap-1 text-white">
                <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                  <Heart className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium">{formatNumber(reel.likes_count || 0)}</span>
              </button>

              {/* Comentarios */}
              <button className="flex flex-col items-center gap-1 text-white">
                <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium">0</span>
              </button>

              {/* Compartir */}
              <button className="flex flex-col items-center gap-1 text-white">
                <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                  <Share2 className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium">Enviar</span>
              </button>

              {/* Mute/Unmute */}
              <button
                onClick={toggleMute}
                className="flex flex-col items-center gap-1 text-white"
              >
                <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </div>
              </button>
            </div>

            {/* Caption y info */}
            <div className="absolute bottom-4 left-3 right-16">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-800 to-blue-900 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">E</span>
                </div>
                <span className="text-white font-semibold text-sm">Evidente.mx</span>
              </div>
              {reel.caption && (
                <p className="text-white text-sm line-clamp-2">{reel.caption}</p>
              )}
              <p className="text-white/60 text-xs mt-2">
                {formatNumber(reel.views_count || 0)} reproducciones
              </p>
            </div>

            {/* Botón de pausa (visible en hover cuando está reproduciendo) */}
            {isPlaying && (
              <button
                onClick={togglePlay}
                className="absolute top-4 left-4 w-8 h-8 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Pause className="w-4 h-4 text-white" />
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
