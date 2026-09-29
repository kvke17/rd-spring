import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { checkRateLimit } from '@/lib/rateLimit';
import { isValidEmail, sanitizeString } from '@/lib/sanitize';

export async function POST(req: Request) {
  // 1. Mitigación de Fuerza Bruta y DoS: Rate limiting en registros
  const rateLimit = checkRateLimit(req, {
    keyPrefix: 'register',
    maxRequests: 5,
    windowSeconds: 600, // 5 registros cada 10 minutos por IP
  });
  if (!rateLimit.allowed) {
    return rateLimit.errorResponse!;
  }

  try {
    const body = await req.json();
    const { name, email, password } = body;

    // 2. Validación y sanitización estricta de entradas
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Todos los campos son obligatorios.' }, { status: 400 });
    }

    const cleanName = sanitizeString(name, 100);
    const cleanEmail = email.toLowerCase().trim();

    if (cleanName.length < 2) {
      return NextResponse.json({ error: 'El nombre debe tener al menos 2 caracteres.' }, { status: 400 });
    }

    if (!isValidEmail(cleanEmail)) {
      return NextResponse.json({ error: 'Ingresa un correo electrónico válido.' }, { status: 400 });
    }

    // Prevención de DoS en bcrypt y requisitos mínimos de contraseña
    if (typeof password !== 'string' || password.length < 8) {
      return NextResponse.json({ error: 'La contraseña debe tener un mínimo de 8 caracteres.' }, { status: 400 });
    }

    if (password.length > 128) {
      return NextResponse.json({ error: 'La contraseña no puede exceder los 128 caracteres.' }, { status: 400 });
    }

    // 3. Verificamos si el usuario ya existe
    const exists = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (exists) {
      return NextResponse.json({ error: 'El correo ya se encuentra registrado.' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name: cleanName,
        email: cleanEmail,
        password: hashedPassword,
        role: 'CUSTOMER',
      },
    });

    return NextResponse.json({ message: 'Cuenta creada exitosamente.' }, { status: 201 });
  } catch (error) {
    console.error('Error en registro:', error);
    return NextResponse.json({ error: 'Error al procesar el registro.' }, { status: 500 });
  }
}
