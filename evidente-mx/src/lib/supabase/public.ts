import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

// Public reads never inherit an editor's session or cache private rows.
export function createClient(tags: string[] = []) {
  return createSupabaseClient(env.supabase.url, env.supabase.anonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: {
      fetch: (input, init) => {
        const method = (init?.method || 'GET').toUpperCase();
        return fetch(input, {
          ...init,
          ...(method === 'GET' || method === 'HEAD'
            ? { cache: 'force-cache', next: { revalidate: 300, tags } }
            : { cache: 'no-store' }),
        });
      },
    },
  });
}
