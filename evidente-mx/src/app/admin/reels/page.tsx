import { Metadata } from 'next';
import Link from 'next/link';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { ReelsGrid } from '@/components/admin/ReelsGrid';
import { requireAuth } from '@/lib/auth';
import { Plus, Search } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Reels | Admin - Evidente.mx',
};

export default async function AdminReelsPage() {
  await requireAuth();
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      
      <main className="flex-1 p-8 ml-64">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reels</h1>
            <p className="text-gray-500 mt-1">Gestiona los videos cortos del portal</p>
          </div>
          <Link
            href="/admin/reels/nuevo"
            className="flex items-center gap-2 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white font-medium rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nuevo Reel
          </Link>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="search"
              placeholder="Buscar reels..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Grid */}
        <ReelsGrid />
      </main>
    </div>
  );
}
