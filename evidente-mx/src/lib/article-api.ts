import { createClient as createServerClient } from '@supabase/supabase-js';
import type { NextRequest } from 'next/server';
import type { ValidationError } from '@/lib/utils';

export const VALID_CATEGORIES = [
  'Destacadas',
  'Internacionales',
  'Entretenimiento',
  'Noticias',
  'Deportes',
  'Turismo',
] as const;

export type ArticleCategory = (typeof VALID_CATEGORIES)[number];

export interface ArticlePayload {
  title: string;
  slug?: string;
  summary: string;
  content: string;
  image_url?: string | null;
  video_url?: string | null;
  category?: ArticleCategory;
  is_published?: boolean;
  published_at?: string | null;
  date?: string | null;
  fecha?: string | null;
}

const ISO_8601_DATETIME_REGEX =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.\d{1,9})?)?(Z|[+-]\d{2}:\d{2})$/;

type ParsedDateResult =
  | { value: string | null; error?: never }
  | { value?: never; error: ValidationError };

export function verifyApiKey(request: NextRequest): boolean {
  const apiKey = process.env.API_SECRET_KEY;
  if (!apiKey) return false;

  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return false;

  return authHeader.slice(7) === apiKey;
}

export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error('Faltan variables de entorno de Supabase');
  }

  return createServerClient(url, serviceKey);
}

export function validateCategory(category: string): category is ArticleCategory {
  return VALID_CATEGORIES.includes(category as ArticleCategory);
}

function isValidIsoDateTime(value: string): boolean {
  const match = ISO_8601_DATETIME_REGEX.exec(value);
  if (!match) return false;

  const [, yearValue, monthValue, dayValue, hourValue, minuteValue, secondValue, timezone] = match;
  const year = Number(yearValue);
  const month = Number(monthValue);
  const day = Number(dayValue);
  const hour = Number(hourValue);
  const minute = Number(minuteValue);
  const second = secondValue ? Number(secondValue) : 0;

  if (month < 1 || month > 12) return false;
  if (hour > 23 || minute > 59 || second > 59) return false;

  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  if (day < 1 || day > daysInMonth) return false;

  if (timezone !== 'Z') {
    const offsetHour = Number(timezone.slice(1, 3));
    const offsetMinute = Number(timezone.slice(4, 6));
    if (offsetHour > 23 || offsetMinute > 59) return false;
  }

  return !Number.isNaN(Date.parse(value));
}

export function parseIsoDateTime(
  value: unknown,
  field: string,
  options: { allowNull?: boolean } = {}
): ParsedDateResult {
  if (value === null && options.allowNull) {
    return { value: null };
  }

  if (typeof value !== 'string' || !isValidIsoDateTime(value)) {
    return {
      error: {
        field,
        message: `${field} debe ser una fecha ISO 8601 válida`,
      },
    };
  }

  return { value: new Date(value).toISOString() };
}

export function resolvePublishedAtInput(
  payload: Record<string, unknown>,
  options: { allowNull?: boolean } = {}
): { provided: boolean; value?: string | null; error?: ValidationError } {
  if (Object.prototype.hasOwnProperty.call(payload, 'published_at')) {
    const result = parseIsoDateTime(payload.published_at, 'published_at', options);
    return result.error
      ? { provided: true, error: result.error }
      : { provided: true, value: result.value };
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'date')) {
    const result = parseIsoDateTime(payload.date, 'published_at', options);
    return result.error
      ? { provided: true, error: result.error }
      : { provided: true, value: result.value };
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'fecha')) {
    const result = parseIsoDateTime(payload.fecha, 'published_at', options);
    return result.error
      ? { provided: true, error: result.error }
      : { provided: true, value: result.value };
  }

  return { provided: false };
}
