'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Play, ExternalLink, Loader2 } from 'lucide-react';

interface FacebookEmbedProps {
    url: string;
    caption?: string;
    thumbnailUrl?: string;
}

// Extract video ID from various Facebook URL formats
function extractVideoId(url: string): string | null {
    // Format: facebook.com/watch?v=VIDEO_ID
    const watchMatch = url.match(/[?&]v=(\d+)/);
    if (watchMatch) return watchMatch[1];

    // Format: facebook.com/watch/?v=VIDEO_ID
    const watchMatch2 = url.match(/watch\/\?v=(\d+)/);
    if (watchMatch2) return watchMatch2[1];

    // Format: facebook.com/USER/videos/VIDEO_ID
    const videosMatch = url.match(/\/videos\/(\d+)/);
    if (videosMatch) return videosMatch[1];

    // Format: facebook.com/reel/VIDEO_ID
    const reelMatch = url.match(/\/reel\/(\d+)/);
    if (reelMatch) return reelMatch[1];

    // Format: facebook.com/photo.php?v=VIDEO_ID
    const photoMatch = url.match(/photo\.php\?v=(\d+)/);
    if (photoMatch) return photoMatch[1];

    // Format: facebook.com/video.php?v=VIDEO_ID
    const videoPhpMatch = url.match(/video\.php\?v=(\d+)/);
    if (videoPhpMatch) return videoPhpMatch[1];

    return null;
}

// Check if URL is a short/share URL that needs expansion
function isShortUrl(url: string): boolean {
    return url.includes('/share/v/') ||
        url.includes('fb.watch') ||
        url.includes('/reel/') && !url.match(/\/reel\/\d+/);
}

// Build embed URL for Facebook video plugin
function buildEmbedUrl(videoUrl: string): string {
    const videoId = extractVideoId(videoUrl);

    if (videoId) {
        // If we have a video ID, use the watch format which works better for embedding
        const watchUrl = `https://www.facebook.com/watch/?v=${videoId}`;
        // autoplay=1 enables autoplay, mute=1 is required for autoplay to work in browsers
        return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(watchUrl)}&show_text=false&width=350&height=622&autoplay=1&mute=1`;
    }

    // Fallback: try to embed the original URL
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(videoUrl)}&show_text=false&width=350&height=622&autoplay=1&mute=1`;
}

export function FacebookEmbed({ url, caption, thumbnailUrl }: FacebookEmbedProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [embedUrl, setEmbedUrl] = useState<string | null>(null);
    const [showFallback, setShowFallback] = useState(false);

    const videoId = extractVideoId(url);
    const isShort = isShortUrl(url);

    useEffect(() => {
        // If it's a short URL without extractable ID, show fallback card
        if (isShort && !videoId) {
            setShowFallback(true);
            setIsLoading(false);
            return;
        }

        // Build the embed URL
        setEmbedUrl(buildEmbedUrl(url));
    }, [url, isShort, videoId]);

    // After 5 seconds, if still loading, show fallback
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (isLoading) {
                setShowFallback(true);
                setIsLoading(false);
            }
        }, 5000);

        return () => clearTimeout(timeout);
    }, [isLoading]);

    // Fallback card - beautiful link to Facebook
    if (showFallback || !embedUrl) {
        return (
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute inset-0 flex flex-col group"
            >
                {/* Background - thumbnail or gradient */}
                {thumbnailUrl ? (
                    <div className="absolute inset-0">
                        <Image
                            src={thumbnailUrl}
                            alt={caption || 'Video de Facebook'}
                            fill
                            className="object-cover"
                            unoptimized
                        />
                    </div>
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#1877F2] via-[#166fe5] to-[#0a5dc2]" />
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />

                {/* Contenido */}
                <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-4">
                    <div className="w-20 h-20 bg-[#1877F2] rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-[#1877F2]/30 group-hover:scale-110 transition-transform">
                        <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                    </div>

                    <span className="text-white font-bold text-xl mb-3">Ver en Facebook</span>

                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 group-hover:bg-white/30 transition-colors">
                        <Play className="w-8 h-8 text-white ml-1" fill="white" />
                    </div>

                    <div className="flex items-center gap-2 text-white/70 text-sm">
                        <span>Toca para reproducir</span>
                        <ExternalLink className="w-4 h-4" />
                    </div>
                </div>

                {/* Caption */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                    {caption && (
                        <p className="text-white text-sm line-clamp-3 mb-2">{caption}</p>
                    )}
                    <div className="flex items-center gap-2 text-blue-400 text-xs font-medium">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                        <span>facebook.com</span>
                    </div>
                </div>
            </a>
        );
    }

    return (
        <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden">
            {/* Loading state */}
            {isLoading && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gradient-to-br from-[#1877F2] to-[#0a5dc2]">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                    <p className="text-white/80 text-sm">Cargando video...</p>
                </div>
            )}

            {/* Facebook Video iFrame */}
            <iframe
                src={embedUrl}
                className="w-full h-full border-0"
                style={{
                    overflow: 'hidden',
                    border: 'none',
                    minHeight: '100%'
                }}
                scrolling="no"
                frameBorder="0"
                allowFullScreen={true}
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                onLoad={() => setIsLoading(false)}
                onError={() => {
                    setIsLoading(false);
                    setShowFallback(true);
                }}
            />

            {/* Fallback link */}
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-3 right-3 z-20 p-2 bg-[#1877F2] rounded-full text-white hover:bg-[#166fe5] transition-colors shadow-lg"
                title="Abrir en Facebook"
            >
                <ExternalLink className="w-4 h-4" />
            </a>
        </div>
    );
}
