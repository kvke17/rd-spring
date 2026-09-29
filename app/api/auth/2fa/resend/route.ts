import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { generateAndSendEmailCode } from '@/lib/twoFactor';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    let targetEmail = session?.user?.email;

    // Si no hay sesión (pantalla de login), leemos el email del body
    if (!targetEmail) {
      const body = await req.json().catch(() => ({}));
      targetEmail = body.email;
    }

    if (!targetEmail) {
      return NextResponse.json({ error: 'Correo no proporcionado' }, { status: 400 });
    }

    const cleanEmail = targetEmail.toLowerCase().trim();
    const user = await prisma.user.findUnique({ where: { email: cleanEmail } });

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    await generateAndSendEmailCode(cleanEmail, 'login');

    return NextResponse.json({
      success: true,
      message: 'Nuevo código de 6 dígitos enviado a tu correo.',
    });
  } catch (error) {
    console.error('Error reenviando código 2FA:', error);
    return NextResponse.json({ error: 'Error al reenviar el código' }, { status: 500 });
  }
}
