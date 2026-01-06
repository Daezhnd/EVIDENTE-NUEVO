'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Article } from '@/types/database';
import { Clock, Share2, Heart, MessageCircle, Bookmark } from 'lucide-react';
import { useState } from 'react';

interface SocialFeedProps {
    articles: Article[];
}

function timeAgo(date: string): string {
    const now = new Date();
    const d = new Date(date);
    const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60));
    if (diff < 60) return `${diff}m`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h`;
    return `${Math.floor(diff / 1440)}d`;
}

function getCategoryColor(category: string | undefined): string {
    if (!category) return 'text-gray-500';
    const colors: Record<string, string> = {
        'Noticias': 'text-blue-600 dark:text-blue-400',
        'Deportes': 'text-emerald-600 dark:text-emerald-400',
        'Turismo': 'text-amber-600 dark:text-amber-400',
        'Destacadas': 'text-red-600 dark:text-red-400',
        'default': 'text-gray-600 dark:text-gray-400',
    };
    return colors[category] || colors['default'];
}

export function SocialFeed({ articles }: SocialFeedProps) {
    // Estado simple para likes visuales (no persistente)
    const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});

    if (!articles || articles.length === 0) return null;

    const toggleLike = (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setLikedPosts(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <section className="py-8 bg-gray-50 dark:bg-gray-950">
            <div className="max-w-2xl mx-auto px-4 sm:px-0">
                <h2 className="sr-only">Feed de Noticias</h2>

                <div className="space-y-8">
                    {articles.map((article) => (
                        <article
                            key={article.id}
                            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm"
                        >
                            {/* Header del Post */}
                            <div className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center overflow-hidden">
                                        {/* Placeholder para avatar de autor si existiera */}
                                        <span className="font-bold text-gray-500">E</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                                            Evidente.mx
                                            {article.category && (
                                                <span className="font-normal text-gray-500 ml-2">
                                                    en <span className={`font-medium ${getCategoryColor(typeof article.category === 'object' ? article.category.name : article.category)}`}>
                                                        {typeof article.category === 'object' ? article.category.name : article.category}
                                                    </span>
                                                </span>
                                            )}
                                        </h3>
                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                            {timeAgo(article.published_at || article.created_at)} ·
                                            <span className="flex items-center gap-0.5">
                                                <Clock className="w-3 h-3" /> lectura de 5 min
                                            </span>
                                        </p>
                                    </div>
                                </div>
                                <button className="text-gray-400 hover:text-gray-900 dark:hover:text-white">
                                    <span className="text-xl leading-none">•••</span>
                                </button>
                            </div>

                            {/* Contenido Principal (Linkeable) */}
                            <Link href={`/noticia/${article.slug}`} className="block group">
                                <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                                    <Image
                                        src={article.image_url || '/placeholder.svg'}
                                        alt={article.title}
                                        fill
                                        className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
                                    />
                                </div>

                                <div className="p-4 pb-2">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-tight mb-2 group-hover:text-blue-900 dark:group-hover:text-blue-400 transition-colors">
                                        {article.title}
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 leading-relaxed">
                                        {article.excerpt || article.summary}
                                    </p>
                                </div>
                            </Link>

                            {/* Acciones Footer */}
                            <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                    <button
                                        onClick={(e) => toggleLike(article.id, e)}
                                        className="flex items-center gap-2 group"
                                    >
                                        <Heart
                                            className={`w-6 h-6 transition-colors ${likedPosts[article.id] ? 'fill-red-500 text-red-500' : 'text-gray-600 dark:text-gray-400 group-hover:text-red-500'}`}
                                        />
                                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                            {(article.views || 0) > 1000 ? `${Math.floor((article.views || 0) / 1000)}k` : (article.views || 0)}
                                        </span>
                                    </button>

                                    <Link href={`/noticia/${article.slug}#comments`} className="flex items-center gap-2 group">
                                        <MessageCircle className="w-6 h-6 text-gray-600 dark:text-gray-400 group-hover:text-blue-500 transition-colors" />
                                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Comentar</span>
                                    </Link>

                                    <button className="flex items-center gap-2 group">
                                        <Share2 className="w-6 h-6 text-gray-600 dark:text-gray-400 group-hover:text-green-500 transition-colors" />
                                    </button>
                                </div>

                                <button className="text-gray-600 dark:text-gray-400 hover:text-blue-900 dark:hover:text-blue-400 transition-colors">
                                    <Bookmark className="w-6 h-6" />
                                </button>
                            </div>
                        </article>
                    ))}

                    {/* Loading / End of feed indicator */}
                    <div className="text-center py-8">
                        <p className="text-gray-400 text-sm uppercase tracking-widest">No hay más noticias recientes</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
