import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { checkRateLimit } from '@/lib/rateLimit';
import { sanitizeString } from '@/lib/sanitize';

export async function POST(request: Request) {
  // 0. Mitigación contra fuerza bruta sobre tokens de reseteo (10 intentos / 15 min)
  const rateLimit = checkRateLimit(request, {
    keyPrefix: 'reset-password',
    maxRequests: 10,
    windowSeconds: 900,
  });

  if (!rateLimit.allowed && rateLimit.errorResponse) {
    return rateLimit.errorResponse;
  }

  try {
    const body = await request.json();
    const token = typeof body?.token === 'string' ? sanitizeString(body.token, 128) : '';
    const newPassword = body?.newPassword;

    if (!token || !newPassword) {
      return NextResponse.json({ error: 'Faltan datos obligatorios.' }, { status: 400 });
    }

    if (typeof newPassword !== 'string' || newPassword.length < 8) {
      return NextResponse.json({ error: 'La nueva contraseña debe tener al menos 8 caracteres.' }, { status: 400 });
    }

    if (newPassword.length > 128) {
      return NextResponse.json({ error: 'La nueva contraseña no debe exceder 128 caracteres.' }, { status: 400 });
    }

    // 1. Buscamos el token en la base de datos
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token }
    });

    // 2. Verificamos si existe y si no ha expirado
    if (!resetToken || resetToken.expires < new Date()) {
      return NextResponse.json({ error: 'El enlace es inválido o ha expirado.' }, { status: 400 });
    }

    // 3. Encriptamos la nueva clave
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 4. Actualizamos el usuario
    await prisma.user.update({
      where: { email: resetToken.email },
      data: { password: hashedPassword }
    });

    // 5. Borramos el token para que no se pueda volver a usar
    await prisma.passwordResetToken.delete({
      where: { id: resetToken.id }
    });

    return NextResponse.json({ message: 'Contraseña actualizada correctamente.' });

  } catch (error) {
    console.error('Error al resetear clave:', error);
    return NextResponse.json({ error: 'Ocurrió un error en el servidor.' }, { status: 500 });
  }
}