import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rateLimit';

export async function POST(request: Request) {
  // 1. Rate limiting defensivo (máximo 5 intentos por minuto por IP)
  const rateLimit = checkRateLimit(request, {
    keyPrefix: 'pwd-change',
    maxRequests: 5,
    windowSeconds: 60,
  });
  if (!rateLimit.allowed) {
    return rateLimit.errorResponse!;
  }

  try {
    // 2. Control de Acceso: Exigir sesión válida del servidor (Anti-IDOR)
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Debes iniciar sesión para realizar esta acción.' }, { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Faltan datos obligatorios.' }, { status: 400 });
    }

    if (typeof newPassword !== 'string' || newPassword.length < 8) {
      return NextResponse.json({ error: 'La nueva contraseña debe tener al menos 8 caracteres.' }, { status: 400 });
    }

    // 3. El correo SIEMPRE se obtiene de la sesión autenticada, nunca del body del cliente
    const authenticatedEmail = session.user.email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: authenticatedEmail },
    });

    if (!user || !user.password) {
      return NextResponse.json({ error: 'Usuario no encontrado.' }, { status: 404 });
    }

    // 4. Verificamos la contraseña actual
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'La contraseña actual es incorrecta.' }, { status: 401 });
    }

    // 5. Encriptamos la nueva contraseña con salt de costo 10
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedNewPassword },
    });

    return NextResponse.json({ message: 'Contraseña actualizada con éxito.' });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    return NextResponse.json({ error: 'Ocurrió un error en el servidor.' }, { status: 500 });
  }
}