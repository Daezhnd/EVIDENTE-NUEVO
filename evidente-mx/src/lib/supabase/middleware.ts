import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// En middleware no podemos usar el env helper porque se ejecuta en edge
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Rate limiting simple en memoria (en producción usar Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minuto
const RATE_LIMIT_MAX = 100; // Máximo de requests por ventana

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }
  
  record.count++;
  return true;
}

export async function updateSession(request: NextRequest) {
  // Verificar que las variables existan
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Variables de Supabase no configuradas');
    return NextResponse.next({ request });
  }

  // Rate limiting básico
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
             request.headers.get('x-real-ip') || 
             'unknown';
  
  if (!checkRateLimit(ip)) {
    return new NextResponse('Too Many Requests', { status: 429 });
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANTE: No escribas lógica entre createServerClient y supabase.auth.getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Proteger rutas de admin con verificación de rol
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Permitir acceso a la página de login sin autenticación
    if (request.nextUrl.pathname === '/admin/login') {
      // Si ya está autenticado, redirigir al dashboard
      if (user) {
        const url = request.nextUrl.clone();
        url.pathname = '/admin';
        return NextResponse.redirect(url);
      }
      return supabaseResponse;
    }
    
    // Para todas las demás rutas admin, verificar autenticación
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      return NextResponse.redirect(url);
    }
    
    // Verificar rol del usuario (admin o editor)
    // Nota: La verificación completa de rol se hace en el cliente
    // porque el middleware no puede hacer queries adicionales fácilmente
    // La segunda capa de verificación está en AdminLoginForm y requireAuth
  }

  return supabaseResponse;
}
