'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface ArticleHeroImageProps {
    imageUrl: string;
    title: string;
    videoUrl?: string;
}

function getJwPlayerDirectUrl(url: string): string {
    const match = url.match(/previews\/([a-zA-Z0-9]+)/);
    if (match && match[1]) {
        return `https://cdn.jwplayer.com/videos/${match[1]}-720.mp4`;
    }
    return url;
}

export function ArticleHeroImage({ imageUrl, title, videoUrl }: ArticleHeroImageProps) {
    const [isHovered, setIsHovered] = useState(false);

    // Si hay video, mostrar video con poster
    if (videoUrl) {
        return (
            <motion.div
                className="relative aspect-video rounded-2xl overflow-hidden mb-8 bg-black cursor-pointer"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
            >
                <video
                    src={getJwPlayerDirectUrl(videoUrl)}
                    poster={imageUrl || undefined}
                    controls
                    className="w-full h-full object-contain"
                >
                    Tu navegador no soporta el elemento de video.
                </video>

                {/* Sutil resplandor en hover */}
                <motion.div
                    className="absolute inset-0 pointer-events-none rounded-2xl"
                    animate={{
                        boxShadow: isHovered
                            ? '0 0 60px rgba(0, 103, 178, 0.3), inset 0 0 0 2px rgba(255,255,255,0.1)'
                            : '0 0 0px rgba(0, 103, 178, 0)'
                    }}
                    transition={{ duration: 0.4 }}
                />
            </motion.div>
        );
    }

    // Solo imagen con efectos hover
    if (imageUrl) {
        return (
            <motion.div
                className="relative aspect-video rounded-2xl overflow-hidden mb-8 cursor-zoom-in group"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
            >
                {/* Imagen con zoom en hover */}
                <motion.div
                    className="absolute inset-0"
                    animate={{ scale: isHovered ? 1.08 : 1 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    <Image
                        src={imageUrl}
                        alt={title}
                        fill
                        className="object-cover"
                        priority
                        unoptimized
                    />
                </motion.div>

                {/* Overlay sutil que aparece en hover */}
                <motion.div
                    className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none"
                    animate={{ opacity: isHovered ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                />

                {/* Efecto de brillo/resplandor en los bordes */}
                <motion.div
                    className="absolute inset-0 pointer-events-none rounded-2xl"
                    animate={{
                        boxShadow: isHovered
                            ? 'inset 0 0 100px rgba(255,255,255,0.1), 0 0 40px rgba(0, 103, 178, 0.25)'
                            : 'inset 0 0 0px rgba(255,255,255,0), 0 0 0px rgba(0, 103, 178, 0)'
                    }}
                    transition={{ duration: 0.4 }}
                />

                {/* Indicador de "Click para ampliar" que aparece en hover */}
                <motion.div
                    className="absolute bottom-4 right-4 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-lg text-white text-sm flex items-center gap-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                    Ver imagen
                </motion.div>
            </motion.div>
        );
    }

    return null;
}
