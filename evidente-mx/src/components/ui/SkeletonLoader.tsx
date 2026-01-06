import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'card' | 'text' | 'circle';
}

export function SkeletonLoader({ className, variant = 'default', ...props }: SkeletonProps) {
    if (variant === 'card') {
        return (
            <div className={cn("rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden bg-white dark:bg-gray-900", className)} {...props}>
                {/* Image Skeleton */}
                <div className="h-48 w-full bg-gray-200 dark:bg-gray-800 animate-pulse" />
                <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse w-3/4" />
                    <div className="space-y-2">
                        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded animate-pulse w-full" />
                        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded animate-pulse w-5/6" />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div
            className={cn("animate-pulse rounded-md bg-gray-200 dark:bg-gray-800", className)}
            {...props}
        />
    );
}
