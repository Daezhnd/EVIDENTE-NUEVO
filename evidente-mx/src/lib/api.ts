/**
 * API Functions - Supabase
 * Evidente.mx - Portal de Noticias
 */

import { createClient } from '@/lib/supabase/public';
import { logError } from '@/lib/errors';
import type {
  Article,
  ArticleWithAuthor,
  ArticleCategory,
  Reel,
  ReelWithAuthor,
  PaginatedResponse
} from '@/types/database';

// Re-exportar tipos para compatibilidad con código existente
export type { Article, ArticleWithAuthor, ArticleCategory, Reel, ReelWithAuthor, PaginatedResponse };

const PAGE_SIZE = 9;

// =============================================
// ARTÍCULOS
// =============================================

/**
 * Obtener artículos destacados para el Hero
 * Si no hay artículos en "Destacadas", devuelve los más recientes
 */
export async function getFeaturedArticles(limit: number = 3): Promise<Article[]> {
  const supabase = await createClient();

  // Primero intentar obtener de "Destacadas"
  const { data: destacadas } = await supabase
    .from('articles')
    .select('*')
    .eq('category', 'Destacadas')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(limit)
    .throwOnError();

  if (destacadas && destacadas.length > 0) {
    return destacadas;
  }

  // Fallback: obtener los más recientes de cualquier categoría
  const { data: recientes } = await supabase
    .from('articles')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(limit)
    .throwOnError();

  return recientes || [];
}

/**
 * Obtener artículos por categoría
 */
export async function getArticlesByCategory(
  category: ArticleCategory,
  limit: number = 3
): Promise<Article[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('articles')
    .select('*')
    .eq('category', category)
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(limit)
    .throwOnError();

  return data || [];
}

/**
 * Obtener artículos paginados por categoría
 */
export async function getArticlesByCategoryPaginated(
  category: ArticleCategory,
  page: number = 1,
  pageSize: number = PAGE_SIZE
): Promise<PaginatedResponse<Article>> {
  const supabase = await createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, count } = await supabase
    .from('articles')
    .select('*', { count: 'exact' })
    .eq('category', category)
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .range(from, to)
    .throwOnError();

  const totalCount = count || 0;

  return {
    data: data || [],
    count: totalCount,
    page,
    pageSize,
    totalPages: Math.ceil(totalCount / pageSize),
  };
}

/**
 * Obtener todos los artículos paginados
 */
export async function getAllArticlesPaginated(
  page: number = 1,
  pageSize: number = PAGE_SIZE
): Promise<PaginatedResponse<Article>> {
  const supabase = await createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, count } = await supabase
    .from('articles')
    .select('*', { count: 'exact' })
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .range(from, to)
    .throwOnError();

  const totalCount = count || 0;

  return {
    data: data || [],
    count: totalCount,
    page,
    pageSize,
    totalPages: Math.ceil(totalCount / pageSize),
  };
}

/**
 * Obtener un artículo por su slug
 */
export async function getArticleBySlug(slug: string): Promise<ArticleWithAuthor | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('public_articles')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle()
    .throwOnError();

  if (!data) return null;

  return {
    ...data,
    author_name: data.author_name || undefined,
    author_avatar: data.author_avatar || undefined,
  };
}

/**
 * Incrementar contador de vistas de un artículo
 */
export async function incrementArticleViews(id: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.rpc('increment_views', { article_id: id });

  if (error) {
    logError('incrementArticleViews', error);
  }
}

/**
 * Obtener artículos relacionados (misma categoría, excluyendo el actual)
 */
export async function getRelatedArticles(
  category: ArticleCategory,
  excludeId: string,
  limit: number = 3
): Promise<Article[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('articles')
    .select('*')
    .eq('category', category)
    .eq('is_published', true)
    .neq('id', excludeId)
    .order('published_at', { ascending: false })
    .limit(limit)
    .throwOnError();

  return data || [];
}

/**
 * Obtener artículos recientes para el ticker de noticias
 * Devuelve solo id, title y slug para optimizar
 */
export async function getRecentArticlesForTicker(limit: number = 10): Promise<{ id: string; title: string; slug: string }[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('articles')
    .select('id, title, slug')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(limit)
    .throwOnError();

  return data || [];
}

/**
 * Obtener los artículos más recientes (mezclados, sin categoría específica)
 * Para el feed dinámico de la página principal
 */
export async function getLatestArticles(limit: number = 12): Promise<Article[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('articles')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(limit)
    .throwOnError();

  return data || [];
}

// =============================================
// REELS
// =============================================

/**
 * Obtener reels publicados
 */
export async function getReels(limit: number = 10): Promise<Reel[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('reels')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(limit)
    .throwOnError();

  return data || [];
}

/**
 * Obtener reels paginados
 */
export async function getReelsPaginated(
  page: number = 1,
  pageSize: number = 6
): Promise<PaginatedResponse<Reel>> {
  const supabase = await createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, count } = await supabase
    .from('reels')
    .select('*', { count: 'exact' })
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .range(from, to)
    .throwOnError();

  const totalCount = count || 0;

  return {
    data: data || [],
    count: totalCount,
    page,
    pageSize,
    totalPages: Math.ceil(totalCount / pageSize),
  };
}

/**
 * Obtener un reel por ID
 */
export async function getReelById(id: string): Promise<ReelWithAuthor | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('public_reels')
    .select('*')
    .eq('id', id)
    .eq('is_published', true)
    .maybeSingle()
    .throwOnError();

  if (!data) return null;

  return {
    ...data,
    author_name: data.author_name || undefined,
  };
}

// =============================================
// BÚSQUEDA
// =============================================

/**
 * Buscar artículos por término
 * Incluye sanitización avanzada para prevenir inyecciones
 */
export async function searchArticles(
  query: string,
  page: number = 1,
  pageSize: number = PAGE_SIZE
): Promise<PaginatedResponse<Article>> {
  const supabase = await createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // Validar que el query no esté vacío
  if (!query || query.trim().length === 0) {
    return { data: [], count: 0, page, pageSize, totalPages: 0 };
  }

  // Sanitizar query: escapar caracteres especiales, limitar longitud y validar
  const sanitizedQuery = query
    .trim()
    .slice(0, 100)  // Limitar longitud máxima
    .replace(/[%_\\]/g, '\\$&')  // Escapar caracteres especiales de LIKE
    .replace(/[<>"'`;(){}[\]]/g, '');  // Remover caracteres potencialmente peligrosos

  // Si después de sanitizar no queda nada útil, retornar vacío
  if (sanitizedQuery.length < 2) {
    return { data: [], count: 0, page, pageSize, totalPages: 0 };
  }

  const { data, count } = await supabase
    .from('articles')
    .select('*', { count: 'exact' })
    .eq('is_published', true)
    .or(`title.ilike.%${sanitizedQuery}%,summary.ilike.%${sanitizedQuery}%,content.ilike.%${sanitizedQuery}%`)
    .order('published_at', { ascending: false })
    .range(from, to)
    .throwOnError();

  const totalCount = count || 0;

  return {
    data: data || [],
    count: totalCount,
    page,
    pageSize,
    totalPages: Math.ceil(totalCount / pageSize),
  };
}
