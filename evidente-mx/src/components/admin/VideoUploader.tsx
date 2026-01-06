'use client';

import { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Upload, Loader2, Check, X, Video } from 'lucide-react';

interface VideoUploaderProps {
  onUploadComplete: (url: string) => void;
  currentUrl?: string;
}

export function VideoUploader({ onUploadComplete, currentUrl }: VideoUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('video/')) {
      setError('Por favor selecciona un archivo de video');
      return;
    }

    // Validar tamaño (máximo 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      setError('El video no debe superar los 50MB');
      return;
    }

    setIsUploading(true);
    setError(null);
    setProgress(0);

    try {
      const supabase = createClient();
      
      // Generar nombre único
      const timestamp = Date.now();
      const extension = file.name.split('.').pop() || 'mp4';
      const fileName = `reels/${timestamp}.${extension}`;

      // Simular progreso (Supabase no tiene callback de progreso)
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      // Subir archivo
      const { data, error: uploadError } = await supabase.storage
        .from('videos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      clearInterval(progressInterval);

      if (uploadError) {
        throw uploadError;
      }

      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from('videos')
        .getPublicUrl(fileName);

      setProgress(100);
      
      // Llamar callback con la URL
      onUploadComplete(urlData.publicUrl);
      
      // Reset después de un momento
      setTimeout(() => {
        setProgress(0);
        setIsUploading(false);
      }, 1000);

    } catch (err) {
      console.error('Error subiendo video:', err);
      setError(err instanceof Error ? err.message : 'Error al subir el video');
      setIsUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-3">
      {/* Área de upload */}
      <div
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer
          transition-colors
          ${isUploading 
            ? 'border-blue-300 bg-blue-50' 
            : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50/50'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />

        {isUploading ? (
          <div className="space-y-3">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto" />
            <p className="text-sm text-blue-600 font-medium">Subiendo video...</p>
            <div className="w-full bg-blue-100 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-blue-500">{progress}%</p>
          </div>
        ) : progress === 100 ? (
          <div className="space-y-2">
            <Check className="w-10 h-10 text-green-500 mx-auto" />
            <p className="text-sm text-green-600 font-medium">¡Video subido!</p>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="w-10 h-10 text-gray-400 mx-auto" />
            <p className="text-sm text-gray-600 font-medium">
              Haz clic para subir un video
            </p>
            <p className="text-xs text-gray-400">
              MP4, WebM, MOV · Máximo 50MB
            </p>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <X className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Preview del video actual */}
      {currentUrl && !isUploading && (
        <div className="mt-4">
          <p className="text-xs text-gray-500 mb-2">Video actual:</p>
          <video
            src={currentUrl}
            controls
            className="w-full max-w-xs aspect-[9/16] rounded-lg bg-black mx-auto"
          />
        </div>
      )}
    </div>
  );
}
