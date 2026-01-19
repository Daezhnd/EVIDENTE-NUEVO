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
 * Obtener el rol del usuario actual
 */
export async function getUserRole(): Promise<string | null> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  return profile?.role || null;
}

/**
 * Verificar que el usuario tenga uno de los roles permitidos
 * Redirige a /admin si no tiene permisos
 */
export async function requireRole(allowedRoles: string[]) {
  const user = await requireAuth();
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !allowedRoles.includes(profile.role)) {
    redirect('/admin');
  }

  return { user, role: profile.role };
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

