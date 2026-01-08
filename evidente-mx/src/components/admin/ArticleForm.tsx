'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Article, ArticleCategory } from '@/types/database';
import { generateSlug, validateArticle, ValidationError } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import {
  Save,
  Eye,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { ImageUploader } from './ImageUploader';

interface ArticleFormProps {
  article?: Article;
  isEditing?: boolean;
}

const categories: ArticleCategory[] = ['Destacadas', 'Internacionales', 'Entretenimiento'];

export function ArticleForm({ article, isEditing = false }: ArticleFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  const [formData, setFormData] = useState({
    title: article?.title || '',
    slug: article?.slug || '',
    summary: article?.summary || '',
    content: article?.content || '',
    image_url: article?.image_url || '',
    video_url: article?.video_url || '',
    category: article?.category || 'Noticias' as ArticleCategory,
    is_published: article?.is_published || false,
  });

  const handleTitleChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      title: value,
      slug: prev.slug || generateSlug(value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent, publish: boolean = false) => {
    e.preventDefault();
    setError(null);
    setValidationErrors([]);

    // Validar antes de enviar
    const errors = validateArticle({
      title: formData.title,
      slug: formData.slug,
      summary: formData.summary || '',
      content: formData.content || '',
    });

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();

      const articleData = {
        title: formData.title.trim(),
        slug: formData.slug || generateSlug(formData.title),
        summary: formData.summary.trim(),
        content: formData.content.trim(),
        image_url: formData.image_url || null,
        video_url: formData.video_url || null,
        category: formData.category as ArticleCategory,
        is_published: publish,
        published_at: publish ? new Date().toISOString() : null,
      };

      if (isEditing && article?.id) {
        // Actualizar artículo existente
        const { error: updateError } = await supabase
          .from('articles')
          .update(articleData)
          .eq('id', article.id)
          .select();

        if (updateError) throw updateError;
      } else {
        // Crear nuevo artículo
        const { error: insertError } = await supabase
          .from('articles')
          .insert([articleData])
          .select();

        if (insertError) throw insertError;
      }

      router.push('/admin/articulos');
      router.refresh();
    } catch (err: unknown) {
      const errorObj = err as { message?: string; details?: string; hint?: string; code?: string };
      const errorMessage = errorObj.message || 'Error desconocido';
      const hint = errorObj.hint ? ` (${errorObj.hint})` : '';
      const code = errorObj.code ? ` [${errorObj.code}]` : '';
      setError(`${errorMessage}${hint}${code}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper para obtener error de un campo específico
  // const getFieldError = (field: string) => {
  //   return validationErrors.find(e => e.field === field)?.message;
  // };

  return (
    <form onSubmit={(e) => handleSubmit(e, false)}>
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {validationErrors.length > 0 && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="font-medium text-amber-800 mb-2">Por favor corrige los siguientes errores:</p>
          <ul className="list-disc list-inside text-amber-700 text-sm">
            {validationErrors.map((err, i) => (
              <li key={i}>{err.message}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Escribe un título atractivo..."
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent text-lg"
              required
            />
          </div>

          {/* Slug */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL (Slug)
            </label>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm">/noticia/</span>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="url-del-articulo"
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent"
              />
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Resumen *
            </label>
            <textarea
              value={formData.summary}
              onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
              placeholder="Un breve resumen de la noticia (aparece en las tarjetas)..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent resize-none"
              required
            />
            <p className="text-sm text-gray-400 mt-2">
              {formData.summary.length}/200 caracteres recomendados
            </p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Contenido *
              </label>
              <button
                type="button"
                onClick={() => setIsPreview(!isPreview)}
                className="text-sm text-blue-900 hover:text-blue-800 font-medium flex items-center gap-1"
              >
                <Eye className="w-4 h-4" />
                {isPreview ? 'Editar' : 'Vista previa'}
              </button>
            </div>

            {isPreview ? (
              <div
                className="prose max-w-none p-4 border border-gray-200 rounded-lg min-h-[300px] bg-gray-50"
                dangerouslySetInnerHTML={{ __html: formData.content || '<p class="text-gray-400">Sin contenido...</p>' }}
              />
            ) : (
              <textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Escribe el contenido del artículo... (Puedes usar HTML básico)"
                rows={15}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent resize-none font-mono text-sm"
                required
              />
            )}
            <p className="text-sm text-gray-400 mt-2">
              Puedes usar HTML: &lt;p&gt;, &lt;h2&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;, etc.
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Publicar</h3>
            <div className="space-y-3">
              <button
                type="button"
                onClick={(e) => handleSubmit(e as unknown as React.FormEvent, true)}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-900 hover:bg-blue-800 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                Publicar ahora
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                Guardar borrador
              </button>
              <Link
                href="/admin/articulos"
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-gray-500 hover:text-gray-700 font-medium transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Cancelar
              </Link>
            </div>
          </div>

          {/* Category */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Categoría *</h3>
            <div className="space-y-2">
              {categories.map((category) => (
                <label
                  key={category}
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${formData.category === category
                    ? 'border-blue-900 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <input
                    type="radio"
                    name="category"
                    value={category}
                    checked={formData.category === category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as ArticleCategory }))}
                    className="text-blue-900 focus:ring-blue-900"
                  />
                  <span className="font-medium text-gray-700">{category}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Featured Image */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Imagen destacada</h3>
            <ImageUploader
              currentImageUrl={formData.image_url}
              onImageChange={(url) => setFormData(prev => ({ ...prev, image_url: url || '' }))}
              folder="articles"
            />
          </div>

          {/* Video URL (Optional) */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Video (Opcional)</h3>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL del video
            </label>
            <input
              type="text"
              value={formData.video_url}
              onChange={(e) => setFormData(prev => ({ ...prev, video_url: e.target.value }))}
              placeholder="https://ejemplo.com/video.mp4"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent text-sm"
            />
            <p className="text-xs text-gray-400 mt-2">
              Si agregas un video, este reemplazará a la imagen destacada en el feed.
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}
