import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { generateSlug, validateArticle } from '@/lib/utils';
import {
  VALID_CATEGORIES,
  getSupabaseAdmin,
  resolvePublishedAtInput,
  validateCategory,
  verifyApiKey,
} from '@/lib/article-api';
import type { ArticlePayload } from '@/lib/article-api';
import type { ValidationError } from '@/lib/utils';

function buildArticleData(article: ArticlePayload) {
  const slug = article.slug || generateSlug(article.title);
  const isPublished = article.is_published ?? false;
  const publishedAtInput = resolvePublishedAtInput(article as unknown as Record<string, unknown>);
  const explicitPublishedAt = publishedAtInput.provided && !publishedAtInput.error
    ? publishedAtInput.value
    : undefined;
  const publishedAt = explicitPublishedAt ?? (isPublished ? new Date().toISOString() : null);

  const data: {
    title: string;
    slug: string;
    summary: string;
    content: string;
    image_url: string | null;
    video_url: string | null;
    category: string;
    is_published: boolean;
    published_at: string | null;
    created_at?: string;
  } = {
    title: article.title.trim(),
    slug,
    summary: article.summary.trim(),
    content: article.content.trim(),
    image_url: article.image_url || null,
    video_url: article.video_url || null,
    category: article.category || 'Noticias',
    is_published: isPublished,
    published_at: publishedAt,
  };

  if (explicitPublishedAt) {
    data.created_at = explicitPublishedAt;
  }

  return data;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function validatePayload(article: unknown): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!isRecord(article)) {
    return [{ field: 'general', message: 'El artículo debe ser un objeto' }];
  }

  const publishedAtInput = resolvePublishedAtInput(article);
  if (publishedAtInput.error) {
    errors.push(publishedAtInput.error);
  }

  // Campos requeridos
  if (
    !isNonEmptyString(article.title) ||
    !isNonEmptyString(article.summary) ||
    !isNonEmptyString(article.content)
  ) {
    errors.push({ field: 'general', message: 'title, summary y content son requeridos' });
    return errors;
  }

  // Validar categoría si fue enviada
  if (article.category && (typeof article.category !== 'string' || !validateCategory(article.category))) {
    errors.push({
      field: 'category',
      message: `Categoría inválida. Opciones: ${VALID_CATEGORIES.join(', ')}`,
    });
    return errors;
  }

  // Validaciones de contenido (longitud, XSS, etc.)
  const slug = typeof article.slug === 'string' && article.slug
    ? article.slug
    : generateSlug(article.title);
  errors.push(...validateArticle({
    title: article.title,
    slug,
    summary: article.summary,
    content: article.content,
  }));

  return errors;
}

// POST: Crear uno o varios artículos
// Body: un objeto ArticlePayload o un array de ArticlePayload
export async function POST(request: NextRequest) {
  try {
    // Autenticación por API key
    if (!verifyApiKey(request)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body: unknown = await request.json();
    const articles = Array.isArray(body) ? body : [body];

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
      const validationErrors = validatePayload(articles[i]);

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
    const rows = (articles as ArticlePayload[]).map(buildArticleData);

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

    try {
      revalidateTag('public-content');
    } catch (error) {
      console.error('Error al actualizar la caché pública:', error);
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
