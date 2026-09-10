import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
// Importa tus opciones de NextAuth si es necesario, ej: import { authOptions } from '../auth/[...nextauth]/route';

export async function POST(request: Request) {
  try {
    // Verificar que el usuario esté logueado
    const session = await getServerSession(); 
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Debes iniciar sesión para dejar una reseña' }, { status: 401 });
    }

    const body = await request.json();
    const { productId, rating, comment } = body;

    // Validación básica
    if (!productId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
    }

    // Buscar el ID del usuario en base a su email
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });

    // 🌟 Opcional pero recomendado: Verificar si el usuario ya compró el producto antes de dejar reseña
    // (Puedes implementar esa lógica aquí consultando la tabla Order)

    // Crear la reseña
    const review = await prisma.review.create({
      data: {
        rating,
        comment,
        productId,
        userId: user.id,
      }
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error('Error creando reseña:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}