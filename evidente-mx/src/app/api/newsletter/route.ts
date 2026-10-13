import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/article-api';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // Validar email
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email es requerido' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email no válido' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    // Verificar si ya existe
    const { data: existing, error: lookupError } = await supabase
      .from('newsletter_subscribers')
      .select('id, is_active')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (lookupError) throw lookupError;

    if (existing) {
      if (existing.is_active) {
        return NextResponse.json(
          { error: 'Este email ya está suscrito' },
          { status: 400 }
        );
      } else {
        // Reactivar suscripción
        const { error: updateError } = await supabase
          .from('newsletter_subscribers')
          .update({ is_active: true, unsubscribed_at: null })
          .eq('id', existing.id);

        if (updateError) throw updateError;

        return NextResponse.json({ 
          success: true, 
          message: 'Suscripción reactivada' 
        });
      }
    }

    // Crear nueva suscripción
    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert({
        email: email.toLowerCase(),
        subscribed_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error al suscribir:', error);
      return NextResponse.json(
        { error: 'Error al procesar la suscripción' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Suscripción exitosa' 
    });
  } catch (error) {
    console.error('Newsletter error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
