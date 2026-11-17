'use client';

import { useEffect, useState } from 'react';
import { formatDistanceToNow } from '@/lib/utils';

// Formato corto de portada: 12m, 3h, 2d.
function shortDistance(date: string): string {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 60000));
  if (minutes < 60) return `${minutes}m`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h`;
  return `${Math.floor(minutes / 1440)}d`;
}

// Fecha fija (misma zona en servidor y navegador) para el HTML que se guarda en caché.
function absoluteDate(date: string): string {
  return new Date(date).toLocaleDateString('es-MX', {
    day: 'numeric', month: 'short', year: 'numeric', timeZone: 'America/Mexico_City',
  });
}

// El HTML se conserva en caché durante horas o días, así que el servidor escribe la fecha
// absoluta (que no cambia entre regeneraciones) y el texto relativo ("hace 2 horas") se
// calcula en el navegador al montar. Calcularlo durante el render lo dejaba congelado.
export function RelativeTime({ date, short = false }: { date: string; short?: boolean }) {
  const [relative, setRelative] = useState<string | null>(null);

  useEffect(() => {
    setRelative(short ? shortDistance(date) : formatDistanceToNow(date));
  }, [date, short]);

  return <span>{relative ?? absoluteDate(date)}</span>;
}
