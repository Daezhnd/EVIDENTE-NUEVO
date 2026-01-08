'use client';

import { MapPin, Calendar } from 'lucide-react';
// capitalize removed as it's not used

export function DateLocationWidget() {
    // Date formatting
    const today = new Date();

    // Custom formatting to match "Jueves 8 Enero 2026"
    // Intl.DateTimeFormat 'es-MX' usually gives lowercase "jueves", we need to capitalize.
    const dayName = today.toLocaleDateString('es-MX', { weekday: 'long' });
    const dayNumber = today.getDate();
    const monthName = today.toLocaleDateString('es-MX', { month: 'long' });
    const year = today.getFullYear();

    const formattedDate = `${dayName.charAt(0).toUpperCase() + dayName.slice(1)} ${dayNumber} ${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`;

    return (
        <div className="flex flex-col items-start gap-0.5 text-gray-600 dark:text-gray-300">
            <div className="flex items-center gap-1 font-medium">
                <MapPin className="w-3 h-3 text-gray-900 dark:text-white" />
                <span className="text-[10px] uppercase tracking-wide">Cd. Chihuahua, Chihuahua, México.</span>
            </div>
            <div className="flex items-center gap-1 font-bold text-gray-900 dark:text-white">
                <Calendar className="w-3 h-3" />
                <span className="text-xs uppercase tracking-wide">{formattedDate}</span>
            </div>
        </div>
    );
}
