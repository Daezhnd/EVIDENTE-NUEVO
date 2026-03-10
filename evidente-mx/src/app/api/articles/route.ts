import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@supabase/supabase-js';
import { generateSlug, validateArticle } from '@/lib/utils';

const VALID_CATEGORIES = [
  'Destacadas',
  'Internacionales',
  'Entretenimiento',
  'Noticias',
  'Deportes',
  'Turismo',
] as const;

type ArticleCategory = (typeof VALID_CATEGORIES)[number];

interface ArticlePayload {
  title: string;
  slug?: string;
  summary: string;
  content: string;
  image_url?: string | null;
  video_url?: string | null;
  category?: ArticleCategory;
  is_published?: boolean;
}

function verifyApiKey(request: NextRequest): boolean {
  const apiKey = process.env.API_SECRET_KEY;
  if (!apiKey) return false;

  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return false;

  return authHeader.slice(7) === apiKey;
}

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error('Faltan variables de entorno de Supabase');
  }

  return createServerClient(url, serviceKey);
}

function validateCategory(category: string): category is ArticleCategory {
  return VALID_CATEGORIES.includes(category as ArticleCategory);
}

function buildArticleData(article: ArticlePayload) {
  const slug = article.slug || generateSlug(article.title);
  const isPublished = article.is_published ?? false;

  return {
    title: article.title.trim(),
    slug,
    summary: article.summary.trim(),
    content: article.content.trim(),
    image_url: article.image_url || null,
    video_url: article.video_url || null,
    category: article.category || 'Noticias',
    is_published: isPublished,
    published_at: isPublished ? new Date().toISOString() : null,
  };
}

// POST: Crear uno o varios artículos
// Body: un objeto ArticlePayload o un array de ArticlePayload
export async function POST(request: NextRequest) {
  try {
    // Autenticación por API key
    if (!verifyApiKey(request)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const articles: ArticlePayload[] = Array.isArray(body) ? body : [body];

    if (articles.length === 0) {
      return NextResponse.json({ error: 'No se enviaron artículos' }, { status: 400 });
    }

    if (articles.length > 50) {
      return NextResponse.json(
        { error: 'Máximo 50 artículos por request' },
        { status: 400 }
      );
    }

    // Validar todos los artículos antes de insertar
    const errors: { index: number; errors: { field: string; message: string }[] }[] = [];

    for (let i = 0; i < articles.length; i++) {
      const article = articles[i];

      // Campos requeridos
      if (!article.title || !article.summary || !article.content) {
        errors.push({
          index: i,
          errors: [{ field: 'general', message: 'title, summary y content son requeridos' }],
        });
        continue;
      }

      // Validar categoría si fue enviada
      if (article.category && !validateCategory(article.category)) {
        errors.push({
          index: i,
          errors: [
            {
              field: 'category',
              message: `Categoría inválida. Opciones: ${VALID_CATEGORIES.join(', ')}`,
            },
          ],
        });
        continue;
      }

      // Validaciones de contenido (longitud, XSS, etc.)
      const slug = article.slug || generateSlug(article.title);
      const validationErrors = validateArticle({
        title: article.title,
        slug,
        summary: article.summary,
        content: article.content,
      });

      if (validationErrors.length > 0) {
        errors.push({ index: i, errors: validationErrors });
      }
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { error: 'Errores de validación', details: errors },
        { status: 400 }
      );
    }

    // Insertar en Supabase
    const supabase = getSupabaseAdmin();
    const rows = articles.map(buildArticleData);

    const { data, error: insertError } = await supabase
      .from('articles')
      .insert(rows)
      .select('id, title, slug, category, is_published');

    if (insertError) {
      if (insertError.code === '23505') {
        return NextResponse.json(
          { error: 'Slug duplicado. Ya existe un artículo con ese slug.' },
          { status: 409 }
        );
      }
      console.error('Error insertando artículos:', insertError);
      return NextResponse.json(
        { error: 'Error al insertar artículos', detail: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      count: data?.length ?? 0,
      articles: data,
    }, { status: 201 });
  } catch (error) {
    console.error('Error en POST /api/articles:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
