'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  LayoutDashboard,
  FileText,
  Video,
  Users,
  Settings,
  ChevronLeft,
  Menu,
  X
} from 'lucide-react';
import { LogoutButton } from './LogoutButton';

interface MenuItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  requiredRoles?: string[]; // Si está vacío, todos pueden ver
}

const menuItems: MenuItem[] = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Artículos', href: '/admin/articulos', icon: FileText },
  { name: 'Reels', href: '/admin/reels', icon: Video },
  { name: 'Usuarios', href: '/admin/usuarios', icon: Users, requiredRoles: ['admin', 'editor'] },
  { name: 'Configuración', href: '/admin/configuracion', icon: Settings, requiredRoles: ['admin'] },
];

interface AdminSidebarProps {
  userRole?: string;
}

export function AdminSidebar({ userRole: propUserRole }: AdminSidebarProps) {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<string | null>(propUserRole || null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (propUserRole) return;

    const fetchUserRole = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        if (profile) {
          setUserRole(profile.role);
        }
      }
    };
    fetchUserRole();
  }, [propUserRole]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  const filteredMenuItems = menuItems.filter(item => {
    if (!item.requiredRoles || item.requiredRoles.length === 0) {
      return true;
    }
    return userRole && item.requiredRoles.includes(userRole);
  });

  const linkClassName = (href: string) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive(href)
    ? 'bg-[#0067b2] text-white'
    : 'text-gray-400 hover:text-white hover:bg-gray-800'
    }`;

  return (
    <>
      {/* Mobile header */}
      <div className="md:hidden fixed left-0 top-0 right-0 z-40 bg-gray-900/95 backdrop-blur border-b border-gray-800">
        <div className="h-16 px-4 flex items-center justify-between">
          <Link href="/admin" className="text-lg font-bold text-white">
            Evidente<span className="text-blue-500">.mx</span>
          </Link>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(prev => !prev)}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-700 px-3 py-2 text-sm font-medium text-white"
            aria-label={isMobileMenuOpen ? 'Cerrar menú de administración' : 'Abrir menú de administración'}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            Menú
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={`md:hidden fixed inset-0 z-40 bg-black/50 transition-opacity ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />
      <aside
        className={`md:hidden fixed top-16 left-0 right-0 bottom-0 z-50 bg-gray-900 text-white flex flex-col transition-transform duration-200 ${isMobileMenuOpen ? 'translate-y-0' : '-translate-y-full pointer-events-none'
          }`}
      >
        <div className="p-4 border-b border-gray-800">
          <p className="text-sm text-gray-400">Panel de Administración</p>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {filteredMenuItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={linkClassName(item.href)}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-800 space-y-2">
          <Link
            href="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="font-medium">Volver al sitio</span>
          </Link>
          <LogoutButton />
        </div>
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-64 bg-gray-900 text-white flex-col z-50">
        <div className="p-6 border-b border-gray-800">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="text-xl font-bold">
              Evidente<span className="text-blue-500">.mx</span>
            </span>
          </Link>
          <p className="text-xs text-gray-500 mt-1">Panel de Administración</p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {filteredMenuItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={linkClassName(item.href)}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800 space-y-2">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="font-medium">Volver al sitio</span>
          </Link>

          <LogoutButton />
        </div>
      </aside>
    </>
  );
}

