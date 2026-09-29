import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateBackupCodes, generateAndSendEmailCode } from '@/lib/twoFactor';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // 1. Generamos los 8 códigos de respaldo
    const backupCodes = generateBackupCodes();

    // 2. Enviamos el código de 6 dígitos al correo del usuario para confirmar la activación
    await generateAndSendEmailCode(session.user.email, 'setup');

    return NextResponse.json({
      success: true,
      email: session.user.email,
      backupCodes,
    });
  } catch (error) {
    console.error('Error generando configuración 2FA:', error);
    return NextResponse.json({ error: 'Error al enviar código de activación' }, { status: 500 });
  }
}
