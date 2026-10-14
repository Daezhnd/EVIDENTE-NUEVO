import { createHash } from 'node:crypto';

export function articleCacheTag(slug: string): string {
  // Los slugs importados pueden exceder el límite de 256 caracteres de Next.
  return slug.length <= 248 ? `article:${slug}` : `article:hash:${createHash('sha256').update(slug).digest('hex')}`;
}
