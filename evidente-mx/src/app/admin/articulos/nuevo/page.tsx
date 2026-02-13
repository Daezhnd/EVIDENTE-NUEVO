import { Metadata } from 'next';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { ArticleForm } from '@/components/admin/ArticleForm';
import { requireAuth } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Nuevo Artículo | Admin - Evidente.mx',
};

export default async function NewArticlePage() {
  await requireAuth();
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      
      <main className="flex-1 p-4 pt-20 sm:p-6 sm:pt-20 md:p-8 md:pt-8 md:ml-64">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Nuevo Artículo</h1>
          <p className="text-gray-500 mt-1">Crea una nueva noticia para el portal</p>
        </div>

        {/* Form */}
        <ArticleForm />
      </main>
    </div>
  );
}
