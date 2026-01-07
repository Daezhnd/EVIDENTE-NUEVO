'use client';

import { useEffect, useRef } from 'react';

interface TikTokEmbedProps {
    url: string;
    caption?: string;
}

export function TikTokEmbed({ url, caption }: TikTokEmbedProps) {
    const blockquoteRef = useRef<HTMLQuoteElement>(null);

    // Clean URL and extract ID
    const cleanUrl = url.split('?')[0]; // Remove query params
    const videoId = cleanUrl.split('/video/')[1] || '';

    useEffect(() => {
        // Manually inject script to ensure it runs every time component remounts
        const script = document.createElement('script');
        script.src = 'https://www.tiktok.com/embed.js';
        script.async = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    return (
        <div className="w-full h-full flex items-center justify-center bg-black">
            <blockquote
                ref={blockquoteRef}
                className="tiktok-embed"
                cite={cleanUrl}
                data-video-id={videoId}
                style={{ maxWidth: '605px', minWidth: '325px', width: '100%', margin: 0 }}
            >
                <section>
                    <a target="_blank" href={cleanUrl} rel="noopener noreferrer">
                        {caption || 'Ver en TikTok'}
                    </a>
                </section>
            </blockquote>
        </div>
    );
}
