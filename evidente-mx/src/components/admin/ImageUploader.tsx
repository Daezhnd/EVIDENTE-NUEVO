'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { Upload, X, Loader2, Image as ImageIcon, Link as LinkIcon, AlertTriangle } from 'lucide-react';

interface ImageUploaderProps {
  currentImageUrl?: string | null;
  onImageChange: (url: string | null) => void;
  folder?: string;
}

export function ImageUploader({ currentImageUrl, onImageChange, folder = 'articles' }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const [error, setError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      setError('Por favor selecciona una imagen');
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen debe ser menor a 5MB');
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      const supabase = createClient();
      
      // Generar nombre único
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      // Subir a Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error('Error uploading:', uploadError);
        // Si el bucket no existe, usar URL externa
        if (uploadError.message.includes('Bucket not found')) {
          setError('Bucket de storage no configurado. Usa una URL externa.');
          setShowUrlInput(true);
          return;
        }
        throw uploadError;
      }

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(data.path);

      setPreview(publicUrl);
      onImageChange(publicUrl);
    } catch (err) {
      console.error('Error al subir imagen:', err);
      setError('Error al subir la imagen. Intenta con una URL externa.');
      setShowUrlInput(true);
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Valida y sanitiza una URL de imagen
   * Previene URLs maliciosas y verifica que sea una imagen válida
   */
  const handleUrlSubmit = async () => {
    if (!urlInput.trim()) return;
    
    setError(null);
    
    try {
      const parsed = new URL(urlInput);
      
      // Solo permitir HTTPS (y HTTP en desarrollo local)
      const allowedProtocols = ['https:'];
      if (process.env.NODE_ENV === 'development') {
        allowedProtocols.push('http:');
      }
      
      if (!allowedProtocols.includes(parsed.protocol)) {
        setError('Solo se permiten URLs HTTPS');
        return;
      }
      
      // Bloquear acortadores de URL y dominios sospechosos
      const blockedDomains = ['bit.ly', 'tinyurl.com', 'goo.gl', 't.co', 'ow.ly'];
      if (blockedDomains.some(domain => parsed.hostname.includes(domain))) {
        setError('No se permiten URLs acortadas. Usa la URL directa de la imagen.');
        return;
      }
      
      // Verificar que la URL termina en extensión de imagen común (opcional pero recomendado)
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.avif'];
      const hasImageExtension = imageExtensions.some(ext => 
        parsed.pathname.toLowerCase().endsWith(ext)
      );
      
      // Si no tiene extensión de imagen, mostrar advertencia pero permitir
      // (algunas CDNs no usan extensiones)
      if (!hasImageExtension && !parsed.hostname.includes('unsplash') && 
          !parsed.hostname.includes('cloudinary') && !parsed.hostname.includes('imgur')) {
        console.warn('URL sin extensión de imagen reconocida:', urlInput);
      }
      
      setPreview(urlInput);
      onImageChange(urlInput);
      setShowUrlInput(false);
      setUrlInput('');
    } catch {
      setError('URL inválida. Verifica el formato.');
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onImageChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      {/* Preview */}
      {preview ? (
        <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
          <Image
            src={preview}
            alt="Preview"
            fill
            className="object-cover"
            unoptimized
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => !showUrlInput && fileInputRef.current?.click()}
          className={`aspect-video rounded-lg border-2 border-dashed transition-colors flex flex-col items-center justify-center cursor-pointer ${
            isUploading ? 'border-blue-300 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          }`}
        >
          {isUploading ? (
            <>
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-2" />
              <p className="text-sm text-blue-600">Subiendo imagen...</p>
            </>
          ) : (
            <>
              <ImageIcon className="w-10 h-10 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 mb-1">Haz clic para subir una imagen</p>
              <p className="text-xs text-gray-400">PNG, JPG o WebP (máx. 5MB)</p>
            </>
          )}
        </div>
      )}

      {/* Input de archivo oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Opciones adicionales */}
      {!preview && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            Subir archivo
          </button>
          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <LinkIcon className="w-4 h-4" />
            Usar URL
          </button>
        </div>
      )}

      {/* Input de URL */}
      {showUrlInput && !preview && (
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://ejemplo.com/imagen.jpg"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
          <button
            type="button"
            onClick={handleUrlSubmit}
            className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 text-sm"
          >
            Usar
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
