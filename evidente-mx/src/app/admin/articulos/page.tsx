import { Metadata } from 'next';
import Link from 'next/link';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { ArticlesTable } from '@/components/admin/ArticlesTable';
import { requireAuth } from '@/lib/auth';
import { Plus, Search, Filter, FileJson } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Artículos | Admin - Evidente.mx',
};

export default async function AdminArticlesPage() {
  await requireAuth();
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      
      <main className="flex-1 p-8 ml-64">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Artículos</h1>
            <p className="text-gray-500 mt-1">Gestiona todas las noticias del portal</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/articulos/importar"
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
            >
              <FileJson className="w-5 h-5" />
              Importar JSON
            </Link>
            <Link
              href="/admin/articulos/nuevo"
              className="flex items-center gap-2 px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white font-medium rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              Nuevo Artículo
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="search"
                placeholder="Buscar artículos..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent appearance-none bg-white">
                <option value="">Todas las categorías</option>
                <option value="Destacadas">Destacadas</option>
                <option value="Noticias">Noticias</option>
                <option value="Deportes">Deportes</option>
                <option value="Turismo">Turismo</option>
              </select>
            </div>

            {/* Status Filter */}
            <select className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent appearance-none bg-white">
              <option value="">Todos los estados</option>
              <option value="published">Publicado</option>
              <option value="draft">Borrador</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <ArticlesTable />
      </main>
    </div>
  );
}
