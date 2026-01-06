/**
 * Manejo de errores centralizado
 * Evidente.mx
 */

export interface AppError {
  message: string;
  code?: string;
  details?: string;
  statusCode?: number;
}

/**
 * Parsear errores de Supabase u otras fuentes a un formato consistente
 */
export function parseError(error: unknown): AppError {
  // Error de Supabase
  if (error && typeof error === 'object') {
    const e = error as Record<string, unknown>;
    
    if ('message' in e) {
      return {
        message: String(e.message),
        code: e.code ? String(e.code) : undefined,
        details: e.details ? String(e.details) : undefined,
        statusCode: typeof e.status === 'number' ? e.status : undefined,
      };
    }
  }

  // Error estándar de JavaScript
  if (error instanceof Error) {
    return {
      message: error.message,
    };
  }

  // Fallback
  return {
    message: 'Ha ocurrido un error inesperado',
  };
}

/**
 * Formatear error para mostrar al usuario
 */
export function formatErrorMessage(error: AppError): string {
  let message = error.message;
  
  // Traducir mensajes comunes de Supabase
  const translations: Record<string, string> = {
    'Invalid login credentials': 'Credenciales inválidas',
    'Email not confirmed': 'Email no confirmado. Revisa tu correo.',
    'User not found': 'Usuario no encontrado',
    'duplicate key value': 'Ya existe un registro con estos datos',
    'violates foreign key constraint': 'No se puede eliminar porque tiene registros relacionados',
    'JWT expired': 'Tu sesión ha expirado. Por favor, inicia sesión de nuevo.',
    'Failed to fetch': 'Error de conexión. Verifica tu internet.',
  };

  for (const [key, value] of Object.entries(translations)) {
    if (message.toLowerCase().includes(key.toLowerCase())) {
      message = value;
      break;
    }
  }

  return message;
}

/**
 * Log de errores (solo en desarrollo muestra detalles)
 */
export function logError(context: string, error: unknown): void {
  const parsed = parseError(error);
  
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${context}]`, {
      message: parsed.message,
      code: parsed.code,
      details: parsed.details,
    });
  } else {
    // En producción, solo loguear mensaje básico
    console.error(`[${context}] ${parsed.message}`);
  }
}

/**
 * Wrapper para operaciones async con manejo de errores
 */
export async function tryCatch<T>(
  operation: () => Promise<T>,
  context: string
): Promise<{ data: T | null; error: AppError | null }> {
  try {
    const data = await operation();
    return { data, error: null };
  } catch (e) {
    logError(context, e);
    return { data: null, error: parseError(e) };
  }
}
