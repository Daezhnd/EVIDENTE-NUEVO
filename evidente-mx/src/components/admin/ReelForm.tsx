'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Reel } from '@/types/database';
import { createClient } from '@/lib/supabase/client';
import { generateThumbnailFromUrl } from '@/lib/video-utils';
import { VideoUploader } from './VideoUploader';
import {
  Save,
  ArrowLeft,
  Video,
  Image as ImageIcon,
  ImagePlus,
  Loader2,
  X,
  Play,
  Link as LinkIcon,
  Upload
} from 'lucide-react';

interface ReelFormProps {
  reel?: Reel;
  isEditing?: boolean;
}

// Detectar tipo de URL
function detectVideoSource(url: string): 'instagram' | 'tiktok' | 'direct' | null {
  if (!url) return null;
  if (url.includes('instagram.com') || url.includes('instagr.am')) return 'instagram';
  if (url.includes('tiktok.com') || url.includes('vm.tiktok.com')) return 'tiktok';
  return 'direct';
}

export function ReelForm({ reel, isEditing = false }: ReelFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoSource, setVideoSource] = useState<'instagram' | 'tiktok' | 'direct' | null>(null);
  const [inputMode, setInputMode] = useState<'upload' | 'url'>('upload');

  const [formData, setFormData] = useState({
    title: reel?.title || '',
    video_url: reel?.video_url || '',
    thumbnail_url: reel?.thumbnail_url || '',
    caption: reel?.caption || '',
    is_published: reel?.is_published || false,
  });

  // Detectar fuente cuando cambia la URL
  useEffect(() => {
    setVideoSource(detectVideoSource(formData.video_url));
  }, [formData.video_url]);

  const handleGenerateThumbnail = async () => {
    if (!formData.video_url) return;

    setIsLoading(true);
    try {
      const blob = await generateThumbnailFromUrl(formData.video_url);
      const supabase = createClient();
      const timestamp = Date.now();
      const filename = `thumbnails/manual-${timestamp}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from('videos')
        .upload(filename, blob, {
          contentType: 'image/jpeg',
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('videos')
        .getPublicUrl(filename);

      setFormData(prev => ({ ...prev, thumbnail_url: data.publicUrl }));
    } catch (err) {
      console.error('Error generando thumbnail:', err);
      setError('No se pudo generar la miniatura. Verifique que la URL del video sea accesible.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent, publish: boolean = false) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      // Solo incluir campos que existen en la tabla
      const reelData: Record<string, unknown> = {
        video_url: formData.video_url,
        thumbnail_url: formData.thumbnail_url || null,
        caption: formData.caption || null,
        is_published: publish,
        published_at: publish ? new Date().toISOString() : null,
      };

      // console.log('Intentando guardar reel:', reelData);

      if (isEditing && reel?.id) {
        // Actualizar reel existente
        const { error: updateError } = await supabase
          .from('reels')
          .update(reelData)
          .eq('id', reel.id);

        if (updateError) {
          console.error('Error de Supabase (update):', updateError);
          throw new Error(updateError.message || updateError.details || JSON.stringify(updateError));
        }
      } else {
        // Crear nuevo reel
        const { error: insertError } = await supabase
          .from('reels')
          .insert([reelData])
          .select();

        if (insertError) {
          console.error('Error de Supabase (insert):', insertError);
          throw new Error(insertError.message || insertError.details || JSON.stringify(insertError));
        }
        // console.log('Reel creado:', data);
      }

      router.push('/admin/reels');
      router.refresh();
    } catch (err: unknown) {
      console.error('Error completo guardando reel:', err);
      let errorMessage = 'Error desconocido';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null) {
        errorMessage = JSON.stringify(err);
      }
      setError(`Error al guardar: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={(e) => handleSubmit(e, false)}>
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título del Reel
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Título breve para el reel..."
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0067b2] focus:border-transparent"
            />
          </div>

          {/* Video URL */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Video *
            </label>

            {/* Tabs para elegir método */}
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => setInputMode('upload')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${inputMode === 'upload'
                  ? 'bg-[#0067b2] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                <Upload className="w-4 h-4" />
                Subir video
              </button>
              <button
                type="button"
                onClick={() => setInputMode('url')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${inputMode === 'url'
                  ? 'bg-[#0067b2] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                <LinkIcon className="w-4 h-4" />
                Pegar URL
              </button>
            </div>

            {/* Modo Upload */}
            {inputMode === 'upload' && (
              <VideoUploader
                currentUrl={videoSource === 'direct' ? formData.video_url : undefined}
                onUploadComplete={(url, thumbnailUrl) => {
                  setFormData(prev => ({
                    ...prev,
                    video_url: url,
                    thumbnail_url: thumbnailUrl || prev.thumbnail_url
                  }));
                }}
              />
            )}

            {/* Modo URL */}
            {inputMode === 'url' && (
              <>
                <div className="flex items-center gap-2">
                  <Video className="w-5 h-5 text-gray-400" />
                  <input
                    type="url"
                    value={formData.video_url}
                    onChange={(e) => {
                      let val = e.target.value;
                      // Detectar si es un embed code de TikTok
                      if (val.includes('<blockquote') && val.includes('tiktok.com')) {
                        // Intentar extraer la URL del atributo cite
                        const citeMatch = val.match(/cite="([^"]*)"/);
                        if (citeMatch && citeMatch[1]) {
                          val = citeMatch[1];
                        }
                      }
                      setFormData(prev => ({ ...prev, video_url: val }));
                    }}
                    placeholder="https://ejemplo.com/video.mp4 o Código Embed de TikTok"
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0067b2] focus:border-transparent"
                  />
                </div>

                <p className="text-sm text-gray-400 mt-3">
                  Pega una URL directa (MP4), enlace de TikTok/Instagram, o el <strong>Código de Insertar</strong> de TikTok.
                </p>

                {/* Video Preview para URL directa */}
                {formData.video_url && videoSource === 'direct' && (
                  <div className="mt-4">
                    <video
                      src={formData.video_url}
                      controls
                      className="w-full max-w-sm aspect-[9/16] rounded-lg bg-black mx-auto"
                    >
                      Tu navegador no soporta el elemento de video.
                    </video>
                  </div>
                )}
              </>
            )}

            {/* Mostrar URL actual si existe */}
            {formData.video_url && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg space-y-2">
                <div>
                  <p className="text-xs text-green-600 font-medium mb-1">✓ Video configurado:</p>
                  <p className="text-xs text-green-700 truncate">{formData.video_url}</p>
                </div>

                {videoSource === 'direct' && (
                  <button
                    type="button"
                    onClick={handleGenerateThumbnail}
                    disabled={isLoading}
                    className="flex items-center gap-2 text-xs font-medium text-green-700 hover:text-green-800 underline disabled:opacity-50"
                  >
                    <ImagePlus className="w-4 h-4" />
                    Generar miniatura automáticamente
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Caption */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción / Caption
            </label>
            <textarea
              value={formData.caption}
              onChange={(e) => setFormData(prev => ({ ...prev, caption: e.target.value }))}
              placeholder="Escribe una descripción atractiva con emojis y hashtags..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0067b2] focus:border-transparent resize-none"
            />
            <p className="text-sm text-gray-400 mt-2">
              {formData.caption.length}/300 caracteres · Usa #hashtags para mejor alcance
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
                disabled={isLoading || !formData.video_url}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#0067b2] hover:bg-[#00528e] text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                disabled={isLoading || !formData.video_url}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Guardar borrador
              </button>
              <Link
                href="/admin/reels"
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-gray-500 hover:text-gray-700 font-medium transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Cancelar
              </Link>
            </div>
          </div>

          {/* Thumbnail */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Miniatura</h3>

            {formData.thumbnail_url ? (
              <div className="relative aspect-[9/16] rounded-lg overflow-hidden mb-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={formData.thumbnail_url}
                  alt="Thumbnail preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, thumbnail_url: '' }))}
                  className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                {/* Play icon overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="p-3 bg-black/30 rounded-full">
                    <Play className="w-8 h-8 text-white" fill="white" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="aspect-[9/16] border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center gap-2 mb-4">
                <ImageIcon className="w-10 h-10 text-gray-300" />
                <p className="text-sm text-gray-400 text-center">
                  Sin miniatura<br />
                  <span className="text-xs">(Opcional)</span>
                </p>
              </div>
            )}

            <input
              type="url"
              value={formData.thumbnail_url}
              onChange={(e) => setFormData(prev => ({ ...prev, thumbnail_url: e.target.value }))}
              placeholder="URL de la miniatura..."
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0067b2] focus:border-transparent text-sm"
            />
            <p className="text-xs text-gray-400 mt-2">
              Si no se proporciona, se usará el primer frame del video
            </p>
          </div>

          {/* Tips */}
          <div className="bg-blue-50 rounded-xl p-6">
            <h3 className="font-semibold text-[#0067b2] mb-3">💡 Cómo agregar Reels</h3>
            <ul className="text-sm text-[#00528e] space-y-2">
              <li><strong>Instagram:</strong> Copia el enlace del reel desde la app o web</li>
              <li><strong>TikTok:</strong> Usa &quot;Copiar enlace&quot; del video</li>
              <li><strong>Video propio:</strong> Sube a un hosting y pega la URL directa</li>
              <li className="pt-2 border-t border-blue-200">• Videos de 15-60 segundos funcionan mejor</li>
              <li>• Agrega hashtags en la descripción</li>
            </ul>
          </div>
        </div>
      </div>
    </form>
  );
}
