import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateTwoFactorSetup } from '@/lib/twoFactor';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const setupData = await generateTwoFactorSetup(session.user.email);

    return NextResponse.json({
      secret: setupData.secret,
      qrCodeUrl: setupData.qrCodeUrl,
      backupCodes: setupData.backupCodes,
    });
  } catch (error) {
    console.error('Error generando configuración 2FA:', error);
    return NextResponse.json({ error: 'Error al generar configuración de 2FA' }, { status: 500 });
  }
}
