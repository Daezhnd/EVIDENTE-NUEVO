'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface ViewCounterProps {
    articleId: string;
    initialViews: number;
}

// Cuenta la visita y muestra el total actual. La página se sirve desde caché durante
// mucho tiempo, así que el número se consulta en el navegador en lugar de regenerarla.
export function ViewCounter({ articleId, initialViews }: ViewCounterProps) {
    const hasRun = useRef(false);
    const [views, setViews] = useState(initialViews);

    useEffect(() => {
        // Evitar múltiples incrementos en modo estricto de React o re-renders rápidos
        if (hasRun.current) return;
        hasRun.current = true;

        const run = async () => {
            try {
                const supabase = createClient();

                // Verificar si ya se contó esta vista en esta sesión para no inflar artificialmente
                const storageKey = `viewed_${articleId}`;
                if (!sessionStorage.getItem(storageKey)) {
                    const { error } = await supabase.rpc('increment_views', { article_id: articleId });
                    if (error) {
                        console.error('Error incrementing views:', error);
                    } else {
                        sessionStorage.setItem(storageKey, 'true');
                    }
                }

                const { data } = await supabase
                    .from('articles')
                    .select('views_count')
                    .eq('id', articleId)
                    .maybeSingle();
                if (typeof data?.views_count === 'number') setViews(data.views_count);
            } catch (err) {
                console.error('Error in view counter:', err);
            }
        };

        run();
    }, [articleId]);

    return <span suppressHydrationWarning>{views.toLocaleString()}</span>;
}
