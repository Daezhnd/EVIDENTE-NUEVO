import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

/**
 * Verificar autenticación para rutas protegidas
 * Redirige a login si no hay sesión válida
 */
export async function requireAuth() {
  const supabase = await createClient();
  
  const { data, error } = await supabase.auth.getUser();
  
  if (error || !data?.user) {
    redirect('/admin/login');
  }

  return data.user;
}

/**
 * Obtener usuario actual sin redirigir
 * Útil para componentes que necesitan saber si hay sesión
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  
  const { data, error } = await supabase.auth.getUser();
  
  if (error || !data?.user) {
    return null;
  }

  return data.user;
}
