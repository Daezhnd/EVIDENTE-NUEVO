'use client';

import { useRef } from 'react';
import Script from 'next/script';

interface TikTokEmbedProps {
    url: string;
    caption?: string;
}

export function TikTokEmbed({ url, caption }: TikTokEmbedProps) {
    const blockquoteRef = useRef<HTMLQuoteElement>(null);

    // Extraer el ID del video si es necesario, o usar la URL completa
    // TikTok embed requiere la URL del video en el atributo data-video-id
    // O simplemente el blockquote con la clase tiktok-embed y cite=URL

    return (
        <div className="w-full h-full flex items-center justify-center bg-black">
            <blockquote
                ref={blockquoteRef}
                className="tiktok-embed"
                cite={url}
                data-video-id={url.split('/video/')[1] || ''}
                style={{ maxWidth: '605px', minWidth: '325px', width: '100%', margin: 0 }}
            >
                <section>
                    <a target="_blank" href={url} rel="noopener noreferrer">
                        {caption || 'Ver en TikTok'}
                    </a>
                </section>
            </blockquote>
            <Script
                src="https://www.tiktok.com/embed.js"
                strategy="lazyOnload"
            />
        </div>
    );
}
