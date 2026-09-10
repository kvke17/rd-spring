import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt'; // Usa 'bcryptjs' si fue la que instalaste

export async function POST(request: Request) {
  try {
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return NextResponse.json({ error: 'Faltan datos obligatorios.' }, { status: 400 });
    }

    // 1. Buscamos el token en la base de datos
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token }
    });

    // 2. Verificamos si existe y si no ha expirado
    if (!resetToken || resetToken.expires < new Date()) {
      return NextResponse.json({ error: 'El enlace es inválido o ha expirado.' }, { status: 400 });
    }

    // 3. Encriptamos la nueva clave
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 4. Actualizamos el usuario
    await prisma.user.update({
      where: { email: resetToken.email },
      data: { password: hashedPassword }
    });

    // 5. Borramos el token para que no se pueda volver a usar
    await prisma.passwordResetToken.delete({
      where: { id: resetToken.id }
    });

    return NextResponse.json({ message: 'Contraseña actualizada correctamente.' });

  } catch (error) {
    console.error('Error al resetear clave:', error);
    return NextResponse.json({ error: 'Ocurrió un error en el servidor.' }, { status: 500 });
  }
}