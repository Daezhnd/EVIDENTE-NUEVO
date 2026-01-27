'use client';

import { useState } from 'react';
import { Play, ExternalLink } from 'lucide-react';

interface FacebookEmbedProps {
    url: string;
    caption?: string;
}

// Convert share URL to embeddable format
function getEmbedUrl(url: string): string {
    // Encode the URL for the embed
    const encodedUrl = encodeURIComponent(url);
    return `https://www.facebook.com/plugins/video.php?href=${encodedUrl}&show_text=false&width=350&height=622&appId`;
}

export function FacebookEmbed({ url, caption }: FacebookEmbedProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    const embedUrl = getEmbedUrl(url);

    if (hasError) {
        // Fallback: Show a card with link to Facebook
        return (
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#1877F2] to-[#0a5dc2] text-white p-4"
            >
                {/* Facebook icon */}
                <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                    <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                </div>

                <span className="text-xl font-bold mb-2">Ver en Facebook</span>
                <p className="text-white/80 text-sm text-center mb-4">
                    Toca para abrir el video en Facebook
                </p>

                <div className="flex items-center gap-2 px-6 py-3 bg-white/20 rounded-full">
                    <Play className="w-5 h-5" fill="white" />
                    <span className="font-medium">Reproducir</span>
                    <ExternalLink className="w-4 h-4 ml-1" />
                </div>

                {caption && (
                    <p className="absolute bottom-4 left-4 right-4 text-sm text-white/70 text-center line-clamp-2">
                        {caption}
                    </p>
                )}
            </a>
        );
    }

    return (
        <div className="relative w-full h-full bg-black flex items-center justify-center">
            {/* Loading state */}
            {isLoading && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black">
                    <div className="w-16 h-16 bg-[#1877F2] rounded-2xl flex items-center justify-center mb-4 animate-pulse">
                        <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                    </div>
                    <p className="text-white/80 text-sm">Cargando video de Facebook...</p>
                </div>
            )}

            {/* Facebook Video iFrame */}
            <iframe
                src={embedUrl}
                className="w-full h-full border-0"
                style={{
                    overflow: 'hidden',
                    border: 'none'
                }}
                scrolling="no"
                frameBorder="0"
                allowFullScreen={true}
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                onLoad={() => setIsLoading(false)}
                onError={() => {
                    setIsLoading(false);
                    setHasError(true);
                }}
            />

            {/* Fallback link if iframe doesn't work well */}
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
