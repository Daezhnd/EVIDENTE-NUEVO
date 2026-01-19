import { createClient } from '@/lib/supabase/server';
import { UsersManager } from '@/components/admin/UsersManager';
import { requireRole } from '@/lib/auth';

interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  role?: string;
}

async function getUsers(): Promise<User[]> {
  const supabase = await createClient();

  // Obtener usuarios de la tabla users (si existe)
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching users:', error);
    // Si no existe la tabla o hay error, devolver array vacío
    return [];
  }

  return data || [];
}

export default async function AdminUsersPage() {
  // Solo admin y editor pueden gestionar usuarios
  await requireRole(['admin', 'editor']);

  const users = await getUsers();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Gestión de Usuarios
        </h1>
      </div>

      <UsersManager initialUsers={users} />
    </div>
  );
}

