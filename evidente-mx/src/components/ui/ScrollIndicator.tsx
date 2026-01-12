'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

export function ScrollIndicator() {
    const [isVisible, setIsVisible] = useState(true);
    const [hasScrolled, setHasScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;

            if (scrollY > 600) {
                setHasScrolled(true);
                setIsVisible(false);
            } else if (!hasScrolled) {
                setIsVisible(true);
            }
        };

        const checkContentHeight = () => {
            const documentHeight = document.documentElement.scrollHeight;
            const windowHeight = window.innerHeight;

            if (documentHeight <= windowHeight + 200) {
                setIsVisible(false);
            }
        };

        checkContentHeight();
        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', checkContentHeight);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', checkContentHeight);
        };
    }, [hasScrolled]);

    const scrollDown = () => {
        window.scrollBy({
            top: window.innerHeight * 0.6,
            behavior: 'smooth'
        });
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8, y: 20 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    onClick={scrollDown}
                    className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 cursor-pointer group"
                    aria-label="Desplazarse hacia abajo"
                >
                    {/* Contenedor principal con efecto glassmorphism */}
                    <motion.div
                        className="relative flex flex-col items-center"
                        animate={{ y: [0, 12, 0] }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    >
                        {/* Resplandor de fondo animado */}
                        <motion.div
                            className="absolute inset-0 rounded-full bg-gradient-to-b from-[#0067b2] to-blue-600 blur-xl opacity-30"
                            animate={{
                                scale: [1, 1.3, 1],
                                opacity: [0.3, 0.5, 0.3]
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        />

                        {/* Icono de mouse con rueda animada */}
                        <div className="relative w-8 h-12 border-2 border-[#0067b2] rounded-full bg-white/90 backdrop-blur-sm shadow-lg group-hover:border-[#004d87] group-hover:shadow-xl transition-all duration-300">
                            {/* Rueda del mouse animada */}
                            <motion.div
                                className="absolute left-1/2 -translate-x-1/2 top-2 w-1.5 h-3 bg-[#0067b2] rounded-full group-hover:bg-[#004d87]"
                                animate={{
                                    y: [0, 8, 0],
                                    opacity: [1, 0.4, 1]
                                }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            />
                        </div>

                        {/* Flechas múltiples animadas debajo */}
                        <div className="mt-2 flex flex-col items-center -space-y-1">
                            <motion.svg
                                className="w-4 h-4 text-[#0067b2]"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                animate={{ opacity: [0.3, 1, 0.3] }}
                                transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                            </motion.svg>
                            <motion.svg
                                className="w-4 h-4 text-[#0067b2]"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                animate={{ opacity: [0.3, 1, 0.3] }}
                                transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                            </motion.svg>
                            <motion.svg
                                className="w-4 h-4 text-[#0067b2]"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                animate={{ opacity: [0.3, 1, 0.3] }}
                                transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                            </motion.svg>
                        </div>
                    </motion.div>
                </motion.button>
            )}
        </AnimatePresence>
    );
}
