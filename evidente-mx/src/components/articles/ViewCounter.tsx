'use client';

import { useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

interface ViewCounterProps {
    articleId: string;
}

export function ViewCounter({ articleId }: ViewCounterProps) {
    const hasIncremented = useRef(false);

    useEffect(() => {
        // Evitar múltiples incrementos en modo estricto de React o re-renders rápidos
        if (hasIncremented.current) return;

        const incrementView = async () => {
            // Verificar si ya se contó esta vista en esta sesión para no inflar artificialmente
            const storageKey = `viewed_${articleId}`;
            if (sessionStorage.getItem(storageKey)) {
                return;
            }

            try {
                const supabase = createClient();
                const { error } = await supabase.rpc('increment_views', { article_id: articleId });

                if (!error) {
                    hasIncremented.current = true;
                    sessionStorage.setItem(storageKey, 'true');
                } else {
                    console.error('Error incrementing views:', error);
                }
            } catch (err) {
                console.error('Error in view counter:', err);
            }
        };

        incrementView();
    }, [articleId]);

    return null; // Este componente no renderiza nada visualmente
}
