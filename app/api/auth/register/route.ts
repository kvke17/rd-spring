import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json({ error: 'El correo ya está registrado' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'CUSTOMER' // Por defecto, todos los que se registran son clientes
      }
    });

    return NextResponse.json({ message: 'Cuenta creada exitosamente' });
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear la cuenta' }, { status: 500 });
  }
}