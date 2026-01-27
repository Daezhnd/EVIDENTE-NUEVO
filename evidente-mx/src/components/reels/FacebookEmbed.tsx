'use client';

import { useState } from 'react';
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



// Build embed URL for Facebook video plugin
function buildEmbedUrl(videoUrl: string): string {
    const videoId = extractVideoId(videoUrl);

    if (videoId) {
        const watchUrl = `https://www.facebook.com/watch/?v=${videoId}`;
        return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(watchUrl)}&show_text=false&width=350&height=622&autoplay=1&mute=0`;
    }

    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(videoUrl)}&show_text=false&width=350&height=622&autoplay=1&mute=0`;
}

export function FacebookEmbed({ url, caption, thumbnailUrl }: FacebookEmbedProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const videoId = extractVideoId(url);
    const embedUrl = videoId ? buildEmbedUrl(url) : null;

    // Handle play button click
    const handlePlay = () => {
        if (!embedUrl) {
            // Open in Facebook if we can't embed
            window.open(url, '_blank');
            return;
        }
        setIsLoading(true);
        setIsPlaying(true);
    };

    // Click-to-play overlay (initial state)
    if (!isPlaying) {
        return (
            <div
                className="absolute inset-0 flex flex-col cursor-pointer group"
                onClick={handlePlay}
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
                    <div className="absolute inset-0 bg-gradient-to-br from-[#1877F2] via-[#166fe5] to-[#0a5dc2]">
                        {/* Animated background pattern */}
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white rounded-full blur-3xl animate-pulse" />
                            <div className="absolute bottom-1/3 right-1/4 w-24 h-24 bg-white rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
                        </div>
                    </div>
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />

                {/* Content */}
                <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-4">
                    {/* Facebook logo */}
                    <div className="w-16 h-16 bg-[#1877F2] rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-[#1877F2]/40">
                        <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                    </div>

                    {/* Play button - prominent */}
                    <div className="w-20 h-20 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 shadow-2xl group-hover:scale-110 group-hover:bg-white transition-all duration-300">
                        <Play className="w-10 h-10 text-[#1877F2] ml-1" fill="#1877F2" />
                    </div>

                    <span className="text-white font-bold text-lg mb-1">Reproducir video</span>
                    <span className="text-white/70 text-sm">Toca para ver en Facebook</span>
                </div>

                {/* Caption at bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                    {caption && (
                        <p className="text-white text-sm line-clamp-2 mb-2">{caption}</p>
                    )}
                    <div className="flex items-center gap-2 text-blue-400 text-xs font-medium">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                        <span>facebook.com</span>
                    </div>
                </div>
            </div>
        );
    }

    // Playing state - show iframe
    return (
        <div className="absolute inset-0 bg-black flex items-center justify-center overflow-hidden">
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
            {embedUrl && (
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
                        setIsPlaying(false);
                        // Open in Facebook as fallback
                        window.open(url, '_blank');
                    }}
                />
            )}

            {/* Open in Facebook button */}
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
