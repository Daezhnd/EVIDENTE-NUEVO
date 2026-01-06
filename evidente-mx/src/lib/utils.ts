/**
 * Formatea una fecha a tiempo relativo en español
 */
export function formatDistanceToNow(date: string | Date): string {
  const now = new Date();
  const targetDate = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - targetDate.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'hace un momento';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `hace ${diffInMinutes} ${diffInMinutes === 1 ? 'minuto' : 'minutos'}`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `hace ${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'}`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `hace ${diffInDays} ${diffInDays === 1 ? 'día' : 'días'}`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `hace ${diffInWeeks} ${diffInWeeks === 1 ? 'semana' : 'semanas'}`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `hace ${diffInMonths} ${diffInMonths === 1 ? 'mes' : 'meses'}`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `hace ${diffInYears} ${diffInYears === 1 ? 'año' : 'años'}`;
}

/**
 * Formatea una fecha completa en español
 */
export function formatDate(date: string | Date): string {
  const targetDate = new Date(date);
  return targetDate.toLocaleDateString('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Genera un slug a partir de un título
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^a-z0-9\s-]/g, '') // Solo letras, números, espacios y guiones
    .trim()
    .replace(/\s+/g, '-') // Espacios a guiones
    .replace(/-+/g, '-'); // Múltiples guiones a uno
}

/**
 * Trunca un texto a cierta longitud
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

/**
 * Formatea un número grande (ej: 1500 -> 1.5K)
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toString();
}

/**
 * Combina clases de Tailwind condicionalmente
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Calcula el tiempo estimado de lectura
 * Basado en velocidad promedio de 200 palabras por minuto en español
 */
export function calculateReadingTime(content: string): string {
  // Remover HTML tags para contar solo texto
  const textOnly = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  const wordCount = textOnly.split(/\s+/).filter(word => word.length > 0).length;
  const minutes = Math.ceil(wordCount / 200);
  
  if (minutes < 1) return '1 min de lectura';
  if (minutes === 1) return '1 min de lectura';
  return `${minutes} min de lectura`;
}

/**
 * Cuenta las palabras de un texto
 */
export function countWords(content: string): number {
  const textOnly = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  return textOnly.split(/\s+/).filter(word => word.length > 0).length;
}

// =============================================
// VALIDACIONES
// =============================================

export interface ValidationError {
  field: string;
  message: string;
}

export interface ArticleValidation {
  title: string;
  slug: string;
  summary: string;
  content: string;
}

/**
 * Valida los datos de un artículo antes de guardar
 * Incluye validaciones de seguridad y calidad de contenido
 */
export function validateArticle(data: ArticleValidation): ValidationError[] {
  const errors: ValidationError[] = [];

  // Título
  const trimmedTitle = data.title.trim();
  if (!trimmedTitle) {
    errors.push({ field: 'title', message: 'El título es requerido' });
  } else if (trimmedTitle.length < 10) {
    errors.push({ field: 'title', message: 'El título debe tener al menos 10 caracteres' });
  } else if (trimmedTitle.length > 200) {
    errors.push({ field: 'title', message: 'El título no puede exceder 200 caracteres' });
  } else if (/<script|javascript:|on\w+=/i.test(trimmedTitle)) {
    errors.push({ field: 'title', message: 'El título contiene caracteres no permitidos' });
  }

  // Slug
  if (data.slug) {
    if (!/^[a-z0-9-]+$/.test(data.slug)) {
      errors.push({ field: 'slug', message: 'El slug solo puede contener letras minúsculas, números y guiones' });
    }
    if (data.slug.length > 150) {
      errors.push({ field: 'slug', message: 'El slug no puede exceder 150 caracteres' });
    }
    // Validar que no empiece o termine con guión
    if (data.slug.startsWith('-') || data.slug.endsWith('-')) {
      errors.push({ field: 'slug', message: 'El slug no puede empezar ni terminar con guión' });
    }
  }

  // Resumen
  const trimmedSummary = data.summary.trim();
  if (!trimmedSummary) {
    errors.push({ field: 'summary', message: 'El resumen es requerido' });
  } else if (trimmedSummary.length < 20) {
    errors.push({ field: 'summary', message: 'El resumen debe tener al menos 20 caracteres' });
  } else if (trimmedSummary.length > 500) {
    errors.push({ field: 'summary', message: 'El resumen no puede exceder 500 caracteres' });
  }

  // Contenido
  const trimmedContent = data.content.trim();
  if (!trimmedContent) {
    errors.push({ field: 'content', message: 'El contenido es requerido' });
  } else if (trimmedContent.length < 100) {
    errors.push({ field: 'content', message: 'El contenido debe tener al menos 100 caracteres' });
  } else if (trimmedContent.length > 50000) {
    errors.push({ field: 'content', message: 'El contenido excede el límite máximo (50,000 caracteres)' });
  }

  return errors;
}

/**
 * Sanitiza HTML básico para prevenir XSS
 */
export function sanitizeHtml(html: string): string {
  // Permitir solo tags básicos de formato
  const allowedTags = ['p', 'br', 'b', 'i', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'a', 'blockquote'];
  
  // Remover scripts y eventos
  let clean = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '');
  
  // Esto es una sanitización básica - en producción usar DOMPurify
  return clean;
}
