import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface AdBannerProps {
    position?: 'top' | 'sidebar' | 'feed' | 'footer';
    className?: string;
    imageUrl?: string;
    sizeOverride?: string;
    linkUrl?: string;
}

export function AdBanner({ position = 'feed', className, imageUrl, sizeOverride, linkUrl }: AdBannerProps) {
    // Dimensiones sugeridas según posición
    const sizeClasses = {
        top: 'w-full h-[80px] md:h-[160px]',
        sidebar: 'w-full h-[200px]',
        feed: 'w-full h-[170px] md:h-[100px]',
        footer: 'w-full h-[120px]',
    };

    const bannerContent = (
        <div
            className={cn(
                "rounded-lg flex flex-col items-center justify-center overflow-hidden relative group cursor-pointer transition-colors",
                !imageUrl && "bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:bg-gray-200 dark:hover:bg-gray-800",
                sizeOverride || sizeClasses[position]
            )}
        >
            {imageUrl ? (
                <div className="relative w-full h-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={imageUrl}
                        alt="Publicidad"
                        className="w-full h-full object-cover"
                    />
                </div>
            ) : (
                <>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest border border-gray-300 dark:border-gray-700 px-2 py-0.5 rounded mb-2">
                        Publicidad
                    </span>
                    <p className="text-gray-400 text-sm font-medium">Espacio Disponible</p>
                </>
            )}

            {/* Overlay hover effect */}
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
    );

    return (
        <div className={cn("flex flex-col items-center justify-center my-8", className)}>
            {linkUrl ? (
                <a href={linkUrl} target="_blank" rel="noopener noreferrer" className="w-full">
                    {bannerContent}
                </a>
            ) : (
                bannerContent
            )}
        </div>
    );
}
