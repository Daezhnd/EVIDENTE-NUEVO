'use server';

import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth';
import { revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/admin/login');
}

export async function refreshPublicContent() {
  await requireRole(['admin', 'editor', 'publisher']);
  try {
    revalidateTag('public-content');
  } catch (error) {
    console.error('Error al actualizar la caché pública:', error);
  }
}
