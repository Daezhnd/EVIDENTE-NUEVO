import { revalidateTag } from 'next/cache';
import { articleCacheTag } from '@/lib/content-tags';

export function invalidatePublicContent(type: 'articles' | 'reels', slugs: string[] = []) {
  if (type !== 'articles' && type !== 'reels') throw new Error('Tipo de contenido inválido');
  if (!Array.isArray(slugs) || slugs.some(slug => typeof slug !== 'string' || !slug)) {
    throw new Error('Direcciones de artículos inválidas');
  }
  if (type === 'articles' && slugs.length === 0) return;

  try {
    revalidateTag(`${type}:list`);
    if (type === 'articles') {
      for (const slug of new Set(slugs)) revalidateTag(articleCacheTag(slug));
    }
  } catch (error) {
    // La escritura ya se guardó. El respaldo es la renovación por tiempo: 1 hora en listados
    // y 30 días en cada noticia.
    console.error('Error al actualizar la caché pública:', error);
  }
}
