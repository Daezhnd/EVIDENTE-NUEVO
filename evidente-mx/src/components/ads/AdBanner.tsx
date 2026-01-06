import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface AdBannerProps {
    position?: 'top' | 'sidebar' | 'feed' | 'footer';
    className?: string;
    imageUrl?: string;
}

export function AdBanner({ position = 'feed', className, imageUrl }: AdBannerProps) {
    // Dimensiones sugeridas según posición
    const sizeClasses = {
        top: 'w-full h-[80px] md:h-[160px]',
        sidebar: 'w-full h-[200px]',
        feed: 'w-full h-[180px] md:h-[220px]',
        footer: 'w-full h-[120px]',
    };

    return (
        <div className={cn("flex flex-col items-center justify-center my-8", className)}>
            <div
                className={cn(
                    "bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg flex flex-col items-center justify-center overflow-hidden relative group cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors",
                    sizeClasses[position]
                )}
            >
                {imageUrl ? (
                    <div className="relative w-full h-full">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={imageUrl}
                            alt="Publicidad"
                            className="w-full h-full object-fill"
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
        </div>
    );
}
