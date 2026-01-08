'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FacebookIcon, InstagramIcon, YouTubeIcon } from '@/components/ui/SocialIcons';
import { DateLocationWidget } from '@/components/ui/DateLocationWidget';

export function LogoHeader() {
    return (
        <div className="bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800 transition-colors">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-center py-2 lg:py-4">
                    <div className="relative flex items-center justify-center">

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

                        {/* Right Side: Social Icons (Top) + Date/Location (Bottom) - Stacked */}
                        <div className="hidden lg:flex flex-col items-start absolute left-full ml-6 top-1/2 -translate-y-1/2 whitespace-nowrap gap-2">

                            {/* Social Icons */}
                            <div className="flex items-center gap-3 pl-1">
                                <a
                                    href="https://www.facebook.com/EVIDENTE.MX"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-400 hover:text-blue-600 transition-colors"
                                >
                                    <FacebookIcon className="w-5 h-5" />
                                </a>
                                <a
                                    href="https://www.instagram.com/evidentemx/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-400 hover:text-pink-600 transition-colors"
                                >
                                    <InstagramIcon className="w-5 h-5" />
                                </a>
                                <a
                                    href="https://www.youtube.com/@EVIDENTEMX"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-400 hover:text-red-600 transition-colors"
                                >
                                    <YouTubeIcon className="w-5 h-5" />
                                </a>
                            </div>

                            {/* Date & Location Widget */}
                            <DateLocationWidget />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
