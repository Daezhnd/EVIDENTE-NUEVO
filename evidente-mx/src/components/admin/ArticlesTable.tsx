'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { formatDistanceToNow } from '@/lib/utils';
import { Article } from '@/types/database';
import { Edit, Trash2, ExternalLink, Loader2, RefreshCw } from 'lucide-react';

const categoryColors: Record<string, string> = {
  'Destacadas': 'bg-blue-100 text-blue-700',
  'Noticias': 'bg-blue-100 text-blue-700',
  'Deportes': 'bg-green-100 text-green-700',
  'Turismo': 'bg-amber-100 text-amber-700',
};

export function ArticlesTable() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const fetchArticles = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const supabase = createClient();
      const { data, error: fetchError } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setArticles(data || []);
    } catch (e) {
      console.error('Error cargando artículos:', e);
      setError('Error al cargar los artículos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este artículo?')) return;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setArticles(prev => prev.filter(a => a.id !== id));
    } catch (e) {
      console.error('Error eliminando artículo:', e);
      alert('Error al eliminar el artículo');
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === articles.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(articles.map(a => a.id));
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#0067b2] animate-spin mb-3" />
        <p className="text-gray-500">Cargando artículos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 flex flex-col items-center justify-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchArticles}
          className="flex items-center gap-2 px-4 py-2 bg-[#0067b2] text-white rounded-lg hover:bg-[#00528e]"
        >
          <RefreshCw className="w-4 h-4" />
          Reintentar
        </button>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 flex flex-col items-center justify-center">
        <p className="text-gray-500 mb-4">No hay artículos todavía</p>
        <Link
          href="/admin/articulos/nuevo"
          className="px-4 py-2 bg-[#0067b2] text-white rounded-lg hover:bg-[#00528e]"
        >
          Crear primer artículo
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header with refresh */}
      <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50">
        <span className="text-sm text-gray-600">
          {articles.length} artículo(s)
        </span>
        <button
          onClick={fetchArticles}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <RefreshCw className="w-4 h-4" />
          Actualizar
        </button>
      </div>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="bg-blue-50 px-6 py-3 border-b border-gray-100 flex items-center justify-between">
          <span className="text-sm text-gray-600">
            {selectedIds.length} artículo(s) seleccionado(s)
          </span>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
              Eliminar seleccionados
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-left">
                <input
                  type="checkbox"
                  checked={selectedIds.length === articles.length && articles.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded border-gray-300 text-[#0067b2] focus:ring-[#0067b2]"
                />
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Artículo
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Categoría
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Vistas
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {articles.map((article) => (
              <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(article.id)}
                    onChange={() => toggleSelect(article.id)}
                    className="rounded border-gray-300 text-[#0067b2] focus:ring-[#0067b2]"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    {article.image_url && (
                      <div className="relative w-16 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                        <Image
                          src={article.image_url}
                          alt={article.title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate max-w-xs">
                        {article.title}
                      </p>
                      <p className="text-sm text-gray-500 truncate max-w-xs">
                        {article.summary}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {(() => {
                    const categoryName = typeof article.category === 'string' 
                      ? article.category 
                      : (article.category as { name?: string })?.name || 'Sin categoría';
                    return (
                      <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${categoryColors[categoryName] || 'bg-gray-100 text-gray-700'}`}>
                        {categoryName}
                      </span>
                    );
                  })()}
                </td>
                <td className="px-6 py-4">
                  {article.is_published ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                      Publicado
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-full">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                      Borrador
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {((article.views_count ?? article.views) || 0).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {article.published_at ? formatDistanceToNow(article.published_at) : article.created_at ? formatDistanceToNow(article.created_at) : '-'}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/noticia/${article.slug}`}
                      target="_blank"
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Ver en sitio"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`/admin/articulos/${article.id}/editar`}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(article.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Mostrando {articles.length} artículo(s)
        </p>
      </div>
    </div>
  );
}
