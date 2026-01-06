'use client';

import { LogOut } from 'lucide-react';
import { signOut } from '@/app/admin/actions';

export function LogoutButton() {
  return (
    <button
      onClick={async () => {
        await signOut();
      }}
      className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-colors"
    >
      <LogOut className="w-5 h-5" />
      <span className="font-medium">Cerrar Sesión</span>
    </button>
  );
}
