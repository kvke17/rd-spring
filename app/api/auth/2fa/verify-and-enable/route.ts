import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { verifyTwoFactorEmailOrBackupCode } from '@/lib/twoFactor';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { code, backupCodes } = await req.json();

    if (!code) {
      return NextResponse.json({ error: 'Debes ingresar el código de 6 dígitos enviado a tu correo' }, { status: 400 });
    }

    // Validar el código recibido por correo
    const verification = await verifyTwoFactorEmailOrBackupCode(session.user.email, code);

    if (!verification.isValid) {
      return NextResponse.json({ 
        error: 'El código ingresado es incorrecto o ha expirado. Revisa tu correo o solicita uno nuevo.' 
      }, { status: 400 });
    }

    // Activar 2FA y guardar los códigos de respaldo
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        twoFactorEnabled: true,
        twoFactorBackupCodes: Array.isArray(backupCodes) ? JSON.stringify(backupCodes) : null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Autenticación en dos pasos (2FA) por correo activada exitosamente.',
    });
  } catch (error) {
    console.error('Error habilitando 2FA por correo:', error);
    return NextResponse.json({ error: 'Error al activar 2FA' }, { status: 500 });
  }
}
