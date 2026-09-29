import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { verifyTwoFactorCode } from '@/lib/twoFactor';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { code, secret, backupCodes } = await req.json();

    if (!code || !secret) {
      return NextResponse.json({ error: 'Faltan parámetros requeridos' }, { status: 400 });
    }

    const isValid = verifyTwoFactorCode(code, secret);

    if (!isValid) {
      return NextResponse.json({ error: 'El código ingresado es incorrecto o expiró. Intenta con el nuevo código de tu app.' }, { status: 400 });
    }

    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        twoFactorEnabled: true,
        twoFactorSecret: secret,
        twoFactorBackupCodes: Array.isArray(backupCodes) ? JSON.stringify(backupCodes) : null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Autenticación de dos pasos activada exitosamente.',
    });
  } catch (error) {
    console.error('Error habilitando 2FA:', error);
    return NextResponse.json({ error: 'Error al activar 2FA en el servidor' }, { status: 500 });
  }
}
