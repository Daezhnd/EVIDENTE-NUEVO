/**
 * Validación de variables de entorno
 * Este archivo asegura que todas las variables necesarias estén configuradas
 * 
 * IMPORTANTE: Las variables NEXT_PUBLIC_* deben accederse con el nombre literal
 * completo para que Next.js las reemplace correctamente en el bundle del cliente.
 */

// Variables públicas (disponibles en cliente y servidor)
// Accedemos directamente con el nombre literal para que Next.js las inline correctamente
export const env = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  },
} as const;

// Validación solo en servidor durante el build/runtime inicial
if (typeof window === 'undefined') {
  if (!env.supabase.url) {
    console.warn('⚠️ NEXT_PUBLIC_SUPABASE_URL no está definida');
  }
  if (!env.supabase.anonKey) {
    console.warn('⚠️ NEXT_PUBLIC_SUPABASE_ANON_KEY no está definida');
  }
}
