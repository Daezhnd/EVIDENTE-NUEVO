import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  // En middleware no podemos usar el env helper porque se ejecuta en edge
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Si no hay variables de Supabase, simplemente continuar sin auth
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  try {
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
  } catch (error) {
    // Si hay cualquier error con Supabase, continuar sin bloquear
    console.error('Middleware error:', error);
    return NextResponse.next({ request });
  }
}
