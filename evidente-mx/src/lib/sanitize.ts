/**
 * Sanitización de HTML - Prevención de XSS
 * Evidente.mx
 * 
 * Este módulo proporciona funciones para sanitizar contenido HTML
 * antes de renderizarlo con dangerouslySetInnerHTML.
 */

import DOMPurify from 'isomorphic-dompurify';

// Configuración de DOMPurify
const ALLOWED_TAGS = [
  // Estructura
  'p', 'div', 'span', 'br', 'hr',
  // Encabezados
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  // Formato de texto
  'strong', 'b', 'em', 'i', 'u', 's', 'mark', 'small', 'sub', 'sup',
  // Listas
  'ul', 'ol', 'li',
  // Tablas
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
  // Citas
  'blockquote', 'q', 'cite',
  // Enlaces e imágenes
  'a', 'img',
  // Código
  'pre', 'code',
  // Figuras
  'figure', 'figcaption',
];

const ALLOWED_ATTR = [
  // Globales
  'class', 'id', 'style',
  // Enlaces
  'href', 'target', 'rel',
  // Imágenes
  'src', 'alt', 'width', 'height', 'loading',
  // Tablas
  'colspan', 'rowspan',
];

/**
 * Sanitiza HTML para prevenir ataques XSS
 * @param dirty - HTML sin sanitizar
 * @returns HTML limpio y seguro
 */
export function sanitizeHtml(dirty: string): string {
  if (!dirty) return '';
  
  // El adaptador reutiliza un DOM en servidor y el DOM nativo en el navegador.
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    KEEP_CONTENT: true,
  });
}

/**
 * Sanitiza una URL de imagen
 * @param url - URL a validar
 * @returns URL limpia o null si es inválida
 */
export function sanitizeImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  
  try {
    const parsed = new URL(url);
    
    // Solo permitir HTTPS (y HTTP en desarrollo)
    const allowedProtocols = process.env.NODE_ENV === 'development' 
      ? ['https:', 'http:'] 
      : ['https:'];
    
    if (!allowedProtocols.includes(parsed.protocol)) {
      return null;
    }
    
    // Bloquear dominios sospechosos conocidos
    const blockedDomains = [
      'bit.ly', 'tinyurl.com', 'goo.gl', // Acortadores
      'pastebin.com', // Potencial payload
    ];
    
    if (blockedDomains.some(domain => parsed.hostname.includes(domain))) {
      return null;
    }
    
    return url;
  } catch {
    return null;
  }
}

/**
 * Escapa caracteres especiales para uso en atributos HTML
 */
export function escapeHtmlAttribute(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
