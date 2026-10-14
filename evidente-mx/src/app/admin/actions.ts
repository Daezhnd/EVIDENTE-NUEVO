'use server';

import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth';
import { invalidatePublicContent } from '@/lib/content-cache';
import { redirect } from 'next/navigation';

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/admin/login');
}

export async function refreshPublicContent(type: 'articles' | 'reels', slugs: string[] = []) {
  await requireRole(['admin', 'editor', 'publisher']);
  invalidatePublicContent(type, slugs);
}
