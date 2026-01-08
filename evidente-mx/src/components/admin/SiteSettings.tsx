'use client';

import { useState } from 'react';
import { Save, Loader2, Globe, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

interface SiteConfig {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  socialFacebook: string;
  socialTwitter: string;
  socialInstagram: string;
  socialYoutube: string;
}

export function SiteSettings() {
  const [isLoading, setIsLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  
  const [config, setConfig] = useState<SiteConfig>({
    siteName: 'Evidente.mx',
    siteDescription: 'Portal de noticias de México',
    siteUrl: 'https://evidente.mx',
    contactEmail: 'contacto@evidente.mx',
    contactPhone: '+52 555 123 4567',
    address: 'Ciudad de México, México',
    socialFacebook: 'https://facebook.com/evidentemx',
    socialTwitter: 'https://twitter.com/evidentemx',
    socialInstagram: 'https://instagram.com/evidentemx',
    socialYoutube: 'https://youtube.com/evidentemx',
  });

  const handleSave = async () => {
    setIsLoading(true);
    setSaved(false);
    
    // Simular guardado (en producción guardaría en Supabase)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Guardar en localStorage como ejemplo
    localStorage.setItem('site_config', JSON.stringify(config));
    
    setIsLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Información General */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <Globe className="w-5 h-5 text-[#0067b2]" />
          Información General
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Sitio
            </label>
            <input
              type="text"
              value={config.siteName}
              onChange={(e) => setConfig(prev => ({ ...prev, siteName: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0067b2] focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL del Sitio
            </label>
            <input
              type="url"
              value={config.siteUrl}
              onChange={(e) => setConfig(prev => ({ ...prev, siteUrl: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0067b2] focus:border-transparent"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción del Sitio
            </label>
            <textarea
              value={config.siteDescription}
              onChange={(e) => setConfig(prev => ({ ...prev, siteDescription: e.target.value }))}
              rows={3}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0067b2] focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">Esta descripción aparecerá en los motores de búsqueda</p>
          </div>
        </div>
      </div>

      {/* Información de Contacto */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <Mail className="w-5 h-5 text-[#0067b2]" />
          Información de Contacto
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email de Contacto
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={config.contactEmail}
                onChange={(e) => setConfig(prev => ({ ...prev, contactEmail: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0067b2] focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teléfono
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                value={config.contactPhone}
                onChange={(e) => setConfig(prev => ({ ...prev, contactPhone: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0067b2] focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dirección
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={config.address}
                onChange={(e) => setConfig(prev => ({ ...prev, address: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0067b2] focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Redes Sociales */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <Instagram className="w-5 h-5 text-[#0067b2]" />
          Redes Sociales
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Facebook
            </label>
            <div className="relative">
              <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="url"
                value={config.socialFacebook}
                onChange={(e) => setConfig(prev => ({ ...prev, socialFacebook: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0067b2] focus:border-transparent"
                placeholder="https://facebook.com/..."
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Twitter / X
            </label>
            <div className="relative">
              <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="url"
                value={config.socialTwitter}
                onChange={(e) => setConfig(prev => ({ ...prev, socialTwitter: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0067b2] focus:border-transparent"
                placeholder="https://twitter.com/..."
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Instagram
            </label>
            <div className="relative">
              <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="url"
                value={config.socialInstagram}
                onChange={(e) => setConfig(prev => ({ ...prev, socialInstagram: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0067b2] focus:border-transparent"
                placeholder="https://instagram.com/..."
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              YouTube
            </label>
            <div className="relative">
              <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="url"
                value={config.socialYoutube}
                onChange={(e) => setConfig(prev => ({ ...prev, socialYoutube: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0067b2] focus:border-transparent"
                placeholder="https://youtube.com/..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Botón Guardar */}
      <div className="flex items-center justify-end gap-4">
        {saved && (
          <span className="text-green-600 text-sm">✓ Configuración guardada</span>
        )}
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-3 bg-[#0067b2] hover:bg-[#00528e] text-white font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          Guardar Cambios
        </button>
      </div>

      {/* Info Box */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-sm text-amber-800">
          <strong>Nota:</strong> La configuración se guarda localmente en este momento. 
          Para persistencia en producción, configura una tabla de settings en Supabase.
        </p>
      </div>
    </div>
  );
}
