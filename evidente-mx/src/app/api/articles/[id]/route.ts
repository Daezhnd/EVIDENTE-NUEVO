import { NextRequest, NextResponse } from 'next/server';
import { invalidatePublicContent } from '@/lib/content-cache';
import { generateSlug, validateArticle } from '@/lib/utils';
import {
  VALID_CATEGORIES,
  getSupabaseAdmin,
  parseIsoDateTime,
  resolvePublishedAtInput,
  validateCategory,
  verifyApiKey,
} from '@/lib/article-api';
import type { ArticleCategory } from '@/lib/article-api';
import type { ValidationError } from '@/lib/utils';

interface RouteContext {
  params: Promise<{ id: string }>;
}

interface ExistingArticle {
  title: string;
  slug: string;
  summary: string;
  content: string;
  is_published: boolean;
}

interface ArticleUpdateData {
  title?: string;
  slug?: string;
  summary?: string;
  content?: string;
  image_url?: string | null;
  video_url?: string | null;
  category?: ArticleCategory;
  is_published?: boolean;
  published_at?: string | null;
  created_at?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasOwn(payload: Record<string, unknown>, field: string): boolean {
  return Object.prototype.hasOwnProperty.call(payload, field);
}

function validationResponse(errors: ValidationError[]) {
  return NextResponse.json(
    { error: 'Errores de validación', details: [{ index: 0, errors }] },
    { status: 400 }
  );
}

function validateStringField(
  payload: Record<string, unknown>,
  field: 'title' | 'summary' | 'content',
  updateData: ArticleUpdateData,
  changedFields: Set<string>,
  errors: ValidationError[]
) {
  if (!hasOwn(payload, field)) return;

  const value = payload[field];
  if (typeof value !== 'string') {
    errors.push({ field, message: `${field} debe ser texto` });
    return;
  }

  const trimmedValue = value.trim();
  updateData[field] = trimmedValue;
  changedFields.add(field);

  if (field === 'title') {
    updateData.slug = generateSlug(trimmedValue);
    changedFields.add('slug');
  }
}

function validateNullableStringField(
  payload: Record<string, unknown>,
  field: 'image_url' | 'video_url',
  updateData: ArticleUpdateData,
  errors: ValidationError[]
) {
  if (!hasOwn(payload, field)) return;

  const value = payload[field];
  if (value !== null && typeof value !== 'string') {
    errors.push({ field, message: `${field} debe ser texto o null` });
    return;
  }

  updateData[field] = value || null;
}

function addContentValidationErrors(
  existing: ExistingArticle,
  updateData: ArticleUpdateData,
  changedFields: Set<string>,
  errors: ValidationError[]
) {
  if (changedFields.size === 0) return;

  const validationErrors = validateArticle({
    title: updateData.title ?? existing.title,
    slug: updateData.slug ?? existing.slug,
    summary: updateData.summary ?? existing.summary,
    content: updateData.content ?? existing.content,
  });

  errors.push(...validationErrors.filter(error => changedFields.has(error.field)));
}

function buildUpdateData(
  payload: Record<string, unknown>,
  existing: ExistingArticle
): { updateData: ArticleUpdateData; errors: ValidationError[] } {
  const errors: ValidationError[] = [];
  const updateData: ArticleUpdateData = {};
  const changedFields = new Set<string>();

  validateStringField(payload, 'title', updateData, changedFields, errors);
  validateStringField(payload, 'summary', updateData, changedFields, errors);
  validateStringField(payload, 'content', updateData, changedFields, errors);
  validateNullableStringField(payload, 'image_url', updateData, errors);
  validateNullableStringField(payload, 'video_url', updateData, errors);

  if (hasOwn(payload, 'category')) {
    const category = payload.category;
    if (typeof category !== 'string' || !validateCategory(category)) {
      errors.push({
        field: 'category',
        message: `Categoría inválida. Opciones: ${VALID_CATEGORIES.join(', ')}`,
      });
    } else {
      updateData.category = category;
    }
  }

  if (hasOwn(payload, 'is_published')) {
    if (typeof payload.is_published !== 'boolean') {
      errors.push({ field: 'is_published', message: 'is_published debe ser booleano' });
    } else {
      updateData.is_published = payload.is_published;
    }
  }

  const publishedAtInput = resolvePublishedAtInput(payload, { allowNull: true });
  if (publishedAtInput.error) {
    errors.push(publishedAtInput.error);
  } else if (publishedAtInput.provided) {
    updateData.published_at = publishedAtInput.value ?? null;
  }

  if (hasOwn(payload, 'created_at')) {
    const result = parseIsoDateTime(payload.created_at, 'created_at');
    if (result.error) {
      errors.push(result.error);
    } else if (result.value !== null) {
      updateData.created_at = result.value;
    }
  }

  addContentValidationErrors(existing, updateData, changedFields, errors);

  return { updateData, errors };
}

function handleSupabaseError(error: { code?: string; message?: string }, fallbackMessage: string) {
  if (error.code === '23505') {
    return NextResponse.json(
      { error: 'Slug duplicado. Ya existe un artículo con ese slug.' },
      { status: 409 }
    );
  }

  if (error.code === '22P02') {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }

  if (error.code === 'PGRST116') {
    return NextResponse.json({ error: 'Artículo no encontrado' }, { status: 404 });
  }

  console.error(fallbackMessage, error);
  return NextResponse.json(
    { error: fallbackMessage, detail: error.message },
    { status: 500 }
  );
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    if (!verifyApiKey(request)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await context.params;
    const body: unknown = await request.json();

    if (!isRecord(body)) {
      return validationResponse([{ field: 'general', message: 'El body debe ser un objeto' }]);
    }

    const supabase = getSupabaseAdmin();
    const { data: existing, error: fetchError } = await supabase
      .from('articles')
      .select('title, slug, summary, content, is_published')
      .eq('id', id)
      .maybeSingle();

    if (fetchError) {
      return handleSupabaseError(fetchError, 'Error al buscar artículo');
    }

    if (!existing) {
      return NextResponse.json({ error: 'Artículo no encontrado' }, { status: 404 });
    }

    const { updateData, errors } = buildUpdateData(body, existing);

    if (errors.length > 0) {
      return validationResponse(errors);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No se enviaron campos para actualizar' },
        { status: 400 }
      );
    }

    const { data, error: updateError } = await supabase
      .from('articles')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (updateError) {
      return handleSupabaseError(updateError, 'Error al actualizar artículo');
    }

    invalidatePublicContent('articles', [existing, data].filter(article => article.is_published).map(article => article.slug));

    return NextResponse.json({ success: true, article: data });
  } catch (error) {
    console.error('Error en PATCH /api/articles/[id]:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    if (!verifyApiKey(request)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await context.params;
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('articles')
      .delete()
      .eq('id', id)
      .select('id, slug, is_published')
      .maybeSingle();

    if (error) {
      return handleSupabaseError(error, 'Error al eliminar artículo');
    }

    if (!data) {
      return NextResponse.json({ error: 'Artículo no encontrado' }, { status: 404 });
    }

    invalidatePublicContent('articles', data.is_published ? [data.slug] : []);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error en DELETE /api/articles/[id]:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
