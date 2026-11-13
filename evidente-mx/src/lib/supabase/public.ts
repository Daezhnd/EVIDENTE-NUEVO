import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

// Cada regeneración escribe la página y cada consulta en la caché de Vercel (ISR Writes).
// Los cambios editoriales se publican al instante con revalidateTag; estos plazos son solo
// el respaldo, así que deben ser largos para que los rastreadores no fuercen regeneraciones.
export const LIST_REVALIDATE = 3600; // Portada, listados, RSS y sitemap: 1 hora.
export const ARTICLE_REVALIDATE = 2592000; // Noticias individuales: 30 días.

// Public reads never inherit an editor's session or cache private rows.
// `revalidate = 0` omite la caché: úsalo solo en rutas dinámicas con entradas ilimitadas (búsqueda).
export function createClient(tags: string[] = [], revalidate: number = LIST_REVALIDATE) {
  return createSupabaseClient(env.supabase.url, env.supabase.anonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: {
      fetch: (input, init) => {
        const method = (init?.method || 'GET').toUpperCase();
        return fetch(input, {
          ...init,
          ...((method === 'GET' || method === 'HEAD') && revalidate > 0
            ? { cache: 'force-cache', next: { revalidate, tags } }
            : { cache: 'no-store' }),
        });
      },
    },
  });
}
