import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt'; // Si usas bcryptjs, cambia esto a 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { email, currentPassword, newPassword } = await request.json();

    if (!email || !currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Faltan datos obligatorios' }, { status: 400 });
    }

    // 1. Buscamos al usuario en la base de datos
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      return NextResponse.json({ error: 'Usuario no encontrado.' }, { status: 404 });
    }

    // 2. Verificamos que la contraseña actual ingresada sea correcta
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ error: 'La contraseña actual es incorrecta.' }, { status: 401 });
    }

    // 3. Encriptamos la nueva contraseña
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // 4. Actualizamos el registro en Prisma
    await prisma.user.update({
      where: { email },
      data: { password: hashedNewPassword },
    });

    return NextResponse.json({ message: 'Contraseña actualizada con éxito.' });

  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    return NextResponse.json({ error: 'Ocurrió un error en el servidor.' }, { status: 500 });
  }
}