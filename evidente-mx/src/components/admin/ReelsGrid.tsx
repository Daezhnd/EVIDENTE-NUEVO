'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Reel } from '@/types/database';
import { formatDistanceToNow, formatNumber } from '@/lib/utils';
import { Edit, Trash2, Play, Eye, Heart, RefreshCw, Loader2 } from 'lucide-react';

export function ReelsGrid() {
  const [reels, setReels] = useState<Reel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const fetchReels = async () => {
    setIsLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from('reels')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reels:', error);
    } else {
      setReels(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchReels();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este reel?')) return;

    const supabase = createClient();
    const { error } = await supabase.from('reels').delete().eq('id', id);

    if (error) {
      console.error('Error deleting reel:', error);
      alert('Error al eliminar el reel');
    } else {
      setReels(prev => prev.filter(r => r.id !== id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`¿Estás seguro de eliminar ${selectedIds.length} reels seleccionados?`)) return;

    const supabase = createClient();
    const { error } = await supabase.from('reels').delete().in('id', selectedIds);

    if (error) {
      console.error('Error deleting reels:', error);
      alert('Error al eliminar los reels seleccionados');
    } else {
      setReels(prev => prev.filter(r => !selectedIds.includes(r.id)));
      setSelectedIds([]);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-blue-900" />
      </div>
    );
  }

  return (
    <div>
      {/* Header con refresh */}
      <div className="flex justify-end mb-4">
        <button
          onClick={fetchReels}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Actualizar
        </button>
      </div>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 flex items-center justify-between">
          <span className="text-sm text-gray-600">
            {selectedIds.length} reel(s) seleccionado(s)
          </span>
          <button
            onClick={handleBulkDelete}
            className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            Eliminar seleccionados
          </button>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {reels.map((reel) => (
          <div
            key={reel.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group"
          >
            {/* Thumbnail */}
            <div className="relative aspect-[9/16]">
              {reel.thumbnail_url ? (
                <Image
                  src={reel.thumbnail_url}
                  alt={reel.caption || 'Reel'}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <Play className="w-12 h-12 text-gray-400" />
                </div>
              )}

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button className="p-4 bg-white/20 backdrop-blur-sm rounded-full">
                  <Play className="w-8 h-8 text-white" fill="white" />
                </button>
              </div>

              {/* Checkbox */}
              <div className="absolute top-3 left-3">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(reel.id)}
                  onChange={() => toggleSelect(reel.id)}
                  className="w-5 h-5 rounded border-gray-300 text-blue-900 focus:ring-blue-900 bg-white/80"
                />
              </div>

              {/* Status Badge */}
              <div className="absolute top-3 right-3">
                {reel.is_published ? (
                  <span className="px-2 py-1 text-xs font-medium text-white bg-green-500 rounded-full">
                    Publicado
                  </span>
                ) : (
                  <span className="px-2 py-1 text-xs font-medium text-white bg-gray-500 rounded-full">
                    Borrador
                  </span>
                )}
              </div>

              {/* Stats */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center gap-3 text-white text-sm">
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {formatNumber(reel.views_count || 0)}
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  {formatNumber(reel.likes_count || 0)}
                </span>
              </div>
            </div>

            {/* Info */}
            <div className="p-4">
              <p className="text-sm font-medium text-gray-900 line-clamp-1 mb-1">
                {reel.title || 'Sin título'}
              </p>
              <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                {reel.caption || 'Sin descripción'}
              </p>
              <p className="text-xs text-gray-400" suppressHydrationWarning>
                {reel.published_at ? formatDistanceToNow(reel.published_at) : 'Sin publicar'}
              </p>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-gray-100">
                <Link
                  href={`/admin/reels/${reel.id}/editar`}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Editar"
                >
                  <Edit className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => handleDelete(reel.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {reels.length === 0 && (
        <div className="text-center py-16">
          <Play className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay reels</h3>
          <p className="text-gray-500 mb-4">
            Crea tu primer reel para empezar a compartir videos cortos.
          </p>
          <Link
            href="/admin/reels/nuevo"
            className="inline-block px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800"
          >
            Crear reel
          </Link>
        </div>
      )}
    </div>
  );
}
