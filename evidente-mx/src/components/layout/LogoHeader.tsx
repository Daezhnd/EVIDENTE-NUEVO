'use client';

import Link from 'next/link';
import Image from 'next/image';

export function LogoHeader() {
    return (
        <div className="bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800 transition-colors">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-center py-2 lg:py-4">
                    {/* Logo placeholder - Reemplazar con imagen cuando esté disponible */}
                    <Link href="/" className="group" aria-label="Ir a inicio - Evidente.mx">
                        <div className="text-center">
                            {/* Logo Image */}
                            <div className="relative w-[12rem] sm:w-[28rem] h-20 sm:h-32 mx-auto grayscale-0">
                                <Image
                                    src="/logo.png"
                                    alt="Evidente.mx Logo"
                                    fill
                                    className="object-contain transition-opacity duration-300 group-hover:opacity-0"
                                    priority
                                />
                                <Image
                                    src="/logo-hover.png"
                                    alt="Evidente.mx Logo Hover"
                                    fill
                                    className="object-contain absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                                    priority
                                />
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
