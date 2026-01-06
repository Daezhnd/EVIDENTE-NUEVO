import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST: Invitar un nuevo usuario
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Verificar autenticación
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { email, role } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email requerido' }, { status: 400 });
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
    }

    // Insertar en la tabla de usuarios con el rol
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        email: email.toLowerCase().trim(),
        role: role || 'editor',
        created_at: new Date().toISOString(),
      });

    if (insertError) {
      // Si el usuario ya existe
      if (insertError.code === '23505') {
        return NextResponse.json({ error: 'El usuario ya existe' }, { status: 400 });
      }
      console.error('Error inserting user:', insertError);
      return NextResponse.json({ error: 'Error al crear usuario' }, { status: 500 });
    }

    // En una implementación completa, aquí enviarías un email de invitación
    // usando Supabase Auth invite o un servicio de email

    return NextResponse.json({ 
      success: true,
      message: 'Usuario creado. En producción, se enviaría un email de invitación.'
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

// DELETE: Eliminar un usuario
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Verificar autenticación
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'userId requerido' }, { status: 400 });
    }

    // No permitir auto-eliminación
    if (userId === user.id) {
      return NextResponse.json({ error: 'No puedes eliminarte a ti mismo' }, { status: 400 });
    }

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) {
      console.error('Error deleting user:', error);
      return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
