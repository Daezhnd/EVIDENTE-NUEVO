import { Metadata } from 'next';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { SiteSettings } from '@/components/admin/SiteSettings';
import { requireAuth } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Configuración | Admin - Evidente.mx',
  description: 'Configuración del sitio',
};

export default async function ConfiguracionPage() {
  await requireAuth();
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      
      <main className="flex-1 p-8 ml-64">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
          <p className="text-gray-500 mt-1">Ajustes generales del sitio</p>
        </div>

        <SiteSettings />
      </main>
    </div>
  );
}
