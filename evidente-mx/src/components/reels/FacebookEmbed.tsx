'use client';

import { useEffect, useRef } from 'react';

interface FacebookEmbedProps {
    url: string;
    caption?: string;
}

// Declare Facebook SDK types
declare global {
    interface Window {
        FB?: {
            XFBML: {
                parse: (element?: HTMLElement) => void;
            };
            init: (params: { xfbml: boolean; version: string }) => void;
        };
        fbAsyncInit?: () => void;
    }
}

export function FacebookEmbed({ url, caption }: FacebookEmbedProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Load Facebook SDK
        const loadFacebookSDK = () => {
            // Check if SDK is already loaded
            if (window.FB) {
                window.FB.XFBML.parse(containerRef.current || undefined);
                return;
            }

            // Set up the async init
            window.fbAsyncInit = function () {
                window.FB?.init({
                    xfbml: true,
                    version: 'v18.0'
                });
                window.FB?.XFBML.parse(containerRef.current || undefined);
            };

            // Check if script already exists
            if (document.getElementById('facebook-jssdk')) {
                // Script exists but FB not ready yet, wait for it
                return;
            }

            // Create and inject the SDK script
            const script = document.createElement('script');
            script.id = 'facebook-jssdk';
            script.src = 'https://connect.facebook.net/es_LA/sdk.js';
            script.async = true;
            script.defer = true;
            script.crossOrigin = 'anonymous';

            const firstScript = document.getElementsByTagName('script')[0];
            firstScript.parentNode?.insertBefore(script, firstScript);
        };

        loadFacebookSDK();

        // Re-parse when URL changes
        if (window.FB) {
            setTimeout(() => {
                window.FB?.XFBML.parse(containerRef.current || undefined);
            }, 100);
        }
    }, [url]);

    return (
        <div
            ref={containerRef}
            className="w-full h-full flex items-center justify-center bg-black overflow-hidden"
        >
            {/* Facebook Video Embed */}
            <div
                className="fb-video"
                data-href={url}
                data-width="auto"
                data-show-text="false"
                data-autoplay="true"
                data-allowfullscreen="true"
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                {/* Fallback while loading */}
                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center text-white p-4"
                >
                    {/* Facebook icon */}
                    <div className="w-16 h-16 bg-[#1877F2] rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                        <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                    </div>
                    <span className="text-lg font-bold mb-2">Cargando video...</span>
                    {caption && (
                        <p className="text-sm text-gray-300 text-center line-clamp-2">{caption}</p>
                    )}
                </a>
            </div>
        </div>
    );
}
