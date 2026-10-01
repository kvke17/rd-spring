import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { checkRateLimit } from '@/lib/rateLimit';

export async function PATCH(request: Request) {
  // Rate limiting preventivo
  const rateLimit = checkRateLimit(request, {
    keyPrefix: 'profile-update',
    maxRequests: 10,
    windowSeconds: 60,
  });
  if (!rateLimit.allowed) {
    return rateLimit.errorResponse!;
  }

  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Debes iniciar sesión para realizar esta acción.' }, { status: 401 });
    }

    const { name } = await request.json();

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'El nombre no puede estar vacío.' }, { status: 400 });
    }

    const cleanName = name.trim();
    if (cleanName.length < 2 || cleanName.length > 80) {
      return NextResponse.json({ error: 'El nombre debe tener entre 2 y 80 caracteres.' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email.toLowerCase().trim() },
      data: { name: cleanName },
    });

    return NextResponse.json({
      message: 'Datos personales actualizados correctamente.',
      user: {
        name: updatedUser.name,
        email: updatedUser.email,
      },
    });
  } catch (error) {
    console.error('Error al actualizar datos de perfil:', error);
    return NextResponse.json({ error: 'Error interno del servidor al actualizar perfil.' }, { status: 500 });
  }
}
