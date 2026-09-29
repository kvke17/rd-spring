import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { generateAndSendEmailCode } from '@/lib/twoFactor';
import { checkRateLimit } from '@/lib/rateLimit';
import { sanitizeString, isValidEmail } from '@/lib/sanitize';

export async function POST(req: Request) {
  // 0. Mitigación contra spam de OTP / bombardeo de correos (3 reenvíos / 5 min)
  const rateLimit = checkRateLimit(req, {
    keyPrefix: '2fa-resend-otp',
    maxRequests: 3,
    windowSeconds: 300,
  });

  if (!rateLimit.allowed && rateLimit.errorResponse) {
    return rateLimit.errorResponse;
  }

  try {
    const session = await getServerSession(authOptions);
    let targetEmail = session?.user?.email;

    // Si no hay sesión (pantalla de login), leemos el email del body
    if (!targetEmail) {
      const body = await req.json().catch(() => ({}));
      targetEmail = body.email;
    }

    if (!targetEmail || !isValidEmail(targetEmail)) {
      return NextResponse.json({ error: 'Correo no proporcionado o inválido' }, { status: 400 });
    }

    const cleanEmail = sanitizeString(targetEmail, 120).toLowerCase().trim();
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
