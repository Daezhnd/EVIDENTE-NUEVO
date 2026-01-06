'use client';

import Link from 'next/link';

export function LogoHeader() {
    return (
        <div className="bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800 transition-colors">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-center py-6 lg:py-8">
                    {/* Logo placeholder - Reemplazar con imagen cuando esté disponible */}
                    <Link href="/" className="group" aria-label="Ir a inicio - Evidente.mx">
                        <div className="text-center">
                            {/* Versión texto del logo - Grande y prominente */}
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight">
                                <span className="text-gray-900 dark:text-white group-hover:text-blue-900 dark:group-hover:text-blue-400 transition-colors">
                                    EVIDENTE
                                </span>
                                <span className="text-blue-900 dark:text-blue-400">.mx</span>
                            </h1>
                            {/* Tagline opcional */}
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium tracking-widest uppercase">
                                Noticias que importan
                            </p>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
