'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Article } from '@/types/database';
import { Clock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { TextReveal } from '@/components/ui/TextReveal';
import { AdBanner } from '@/components/ads/AdBanner';

interface SocialFeedProps {
    articles: Article[];
    showHeader?: boolean;
    startIndex?: number;
    showLoading?: boolean;
}

function timeAgo(date: string): string {
    const now = new Date();
    const d = new Date(date);
    const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60));
    if (diff < 60) return `${diff}m`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h`;
    return `${Math.floor(diff / 1440)}d`;
}

// Función para mapear categorías antiguas a 'Internacionales' visualmente
function getDisplayCategory(category: string | unknown): string {
    const catName = typeof category === 'object' && category && 'name' in category ? (category as { name: string }).name : String(category || '');

    if (!catName) return 'General';

    // Normalizar: Si es Deportes, Turismo o Noticias -> Internacionales
    if (['Deportes', 'Turismo', 'Noticias'].includes(catName)) {
        return 'Internacionales';
    }

    return catName;
}

function getCategoryColor(displayCategory: string): string {
    const colors: Record<string, string> = {
        'Noticias': 'text-blue-700 bg-blue-50 dark:text-blue-300 dark:bg-[#0067b2]/30',
        'Internacionales': 'text-cyan-700 bg-cyan-50 dark:text-cyan-300 dark:bg-cyan-900/30',
        'Entretenimiento': 'text-purple-700 bg-purple-50 dark:text-purple-300 dark:bg-purple-900/30',
        'Destacadas': 'text-red-700 bg-red-50 dark:text-red-300 dark:bg-red-900/30',
        'default': 'text-gray-700 bg-gray-50 dark:text-gray-300 dark:bg-gray-800',
    };
    return colors[displayCategory] || colors['default'];
}

function getJwPlayerDirectUrl(url: string): string {
    // Extract ID from https://cdn.jwplayer.com/previews/MEDIAID...
    const match = url.match(/previews\/([a-zA-Z0-9]+)/);
    if (match && match[1]) {
        return `https://cdn.jwplayer.com/videos/${match[1]}-720.mp4`;
    }
    return url;
}

function FeedVideoPlayer({ url, poster }: { url: string; poster: string }) {
    const videoRef = React.useRef<HTMLVideoElement>(null);
    const [isMuted, setIsMuted] = React.useState(true);

    React.useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        video.play().catch(() => {
                            // Autoplay might be blocked if not muted or user interaction required
                            console.log('Autoplay prevented');
                        });
                    } else {
                        video.pause();
                    }
                });
            },
            { threshold: 0.6 } // Play when 60% visible
        );

        observer.observe(video);

        return () => {
            observer.unobserve(video);
        };
    }, []);

    return (
        <div className="relative w-full h-full group">
            <video
                ref={videoRef}
                src={url}
                className="w-full h-full object-cover"
                poster={poster}
                muted={isMuted}
                loop
                playsInline
            />

            {/* Controls Overlay */}
            <div className="absolute bottom-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsMuted(!isMuted);
                    }}
                    className="p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 backdrop-blur-sm"
                >
                    {isMuted ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><line x1="23" x2="17" y1="9" y2="15" /><line x1="17" x2="23" y1="9" y2="15" /></svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" /></svg>
                    )}
                </button>
            </div>
        </div>
    );
}

export function SocialFeed({ articles, showHeader = true, startIndex = 0, showLoading = true }: SocialFeedProps) {
    if (!articles || articles.length === 0) return null;

    // Defines groups of ads to show in pairs
    const adGroups = [
        ['/ads/top-banner-1.jpg', '/ads/top-banner-2.jpg'],
        ['/ads/top-banner-3.jpg', '/ads/top-banner-4.jpg']
    ];

    return (
        <section className="py-2 bg-gray-50 dark:bg-gray-950">
            <div className="max-w-7xl mx-auto px-4 lg:px-6">
                {showHeader && (
                    <div className="flex items-center gap-4 mb-10 pb-6 border-b border-gray-200 dark:border-gray-800">
                        <TextReveal text="Para ti" className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter" />
                        <span className="text-sm md:text-base font-medium text-gray-500 dark:text-gray-400 border-l-2 border-gray-300 dark:border-gray-700 pl-4 py-1 flex items-center">
                            Últimas actualizaciones
                        </span>
                    </div>
                )}

                <div className="space-y-6">
                    {articles.map((article, index) => {
                        // Calcular la categoría visual
                        const displayCategory = getDisplayCategory(article.category);
                        const tagColorClass = getCategoryColor(displayCategory);

                        // Show ads after every 5th article (index 4, 9, 14...)
                        // Ensure we don't repeat ads - only show if we have a unique group available
                        const globalIndex = index + startIndex;
                        const blockNumber = Math.floor((globalIndex + 1) / 5); // 1, 2, 3...
                        const adGroupIndex = blockNumber - 1; // 0, 1, 2...

                        // Show ad only if it's a multiple of 5 AND we have a unique group for this position
                        const showAdBlock = (globalIndex + 1) % 5 === 0 && adGroupIndex >= 0 && adGroupIndex < adGroups.length;
                        const currentAds = showAdBlock ? adGroups[adGroupIndex] : [];

                        return (
                            <div key={article.id} className="space-y-8">
                                <motion.article
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
                                    className="group bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-800"
                                >
                                    <Link href={`/noticia/${article.slug}`} className="flex flex-col md:flex-row h-full">

                                        {/* Imagen o Video a la izquierda (Desktop) - 40% ancho fijo */}
                                        <div className="md:w-5/12 lg:w-4/12 relative aspect-video md:aspect-auto">
                                            <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800">
                                                {article.video_url ? (
                                                    <FeedVideoPlayer
                                                        url={getJwPlayerDirectUrl(article.video_url)}
                                                        poster={article.image_url || '/placeholder.svg'}
                                                    />
                                                ) : (
                                                    <>
                                                        <Image
                                                            src={article.image_url || '/placeholder.svg'}
                                                            alt={article.title}
                                                            fill
                                                            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                                        />
                                                        {/* Overlay sutil solo para imágenes */}
                                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* Contenido a la derecha */}
                                        <div className="flex-1 p-6 md:p-8 flex flex-col justify-center">
                                            <div className="flex items-center justify-between mb-4">
                                                <span className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${tagColorClass}`}>
                                                    {displayCategory}
                                                </span>
                                                <div className="flex items-center gap-2 text-gray-400 text-xs font-bold tracking-widest uppercase">
                                                    <Clock className="w-4 h-4" />
                                                    <span>{timeAgo(article.published_at || article.created_at)}</span>
                                                </div>
                                            </div>

                                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-50 leading-tight mb-4 group-hover:text-evident dark:group-hover:text-blue-400 transition-colors">
                                                {article.title}
                                            </h2>

                                            <p className="text-gray-600 dark:text-gray-300 text-base md:text-lg leading-relaxed line-clamp-3 mb-6 flex-1">
                                                {article.excerpt || article.summary}
                                            </p>

                                            <div className="flex items-center text-evident dark:text-blue-400 font-bold text-sm tracking-wide group-hover:translate-x-1 transition-transform w-fit">
                                                LEER ARTÍCULO
                                                <ArrowRight className="w-4 h-4 ml-2" />
                                            </div>
                                        </div>
                                    </Link>
                                </motion.article>

                                {showAdBlock && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <AdBanner position="feed" imageUrl={currentAds[0]} />
                                        <AdBanner position="feed" imageUrl={currentAds[1]} />
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {showLoading && (
                        <Link
                            href="/categoria/destacadas"
                            className="flex justify-center items-center gap-2 pt-12 pb-8 group cursor-pointer"
                        >
                            <span className="text-gray-400 group-hover:text-[#0067b2] transition-colors text-sm mr-2">Ver más noticias</span>
                            <div className="w-2 h-2 bg-gray-400 group-hover:bg-[#0067b2] rounded-full animate-bounce transition-colors" />
                            <div className="w-2 h-2 bg-gray-400 group-hover:bg-[#0067b2] rounded-full animate-bounce transition-colors" style={{ animationDelay: '75ms' }} />
                            <div className="w-2 h-2 bg-gray-400 group-hover:bg-[#0067b2] rounded-full animate-bounce transition-colors" style={{ animationDelay: '150ms' }} />
                        </Link>
                    )}
                </div>
            </div>
        </section >
    );
}
