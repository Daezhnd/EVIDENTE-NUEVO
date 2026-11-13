'use client';

import { useEffect, useState } from 'react';
import { formatDistanceToNow } from '@/lib/utils';

// El HTML de las páginas se conserva en caché durante mucho tiempo; el texto relativo
// ("hace 2 horas") se recalcula en el navegador para no quedar congelado.
export function RelativeTime({ date }: { date: string }) {
  const [text, setText] = useState(() => formatDistanceToNow(date));

  useEffect(() => {
    setText(formatDistanceToNow(date));
  }, [date]);

  return <span suppressHydrationWarning>{text}</span>;
}
