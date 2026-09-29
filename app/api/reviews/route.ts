import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rateLimit';
import { sanitizeString } from '@/lib/sanitize';

export async function POST(request: Request) {
  // 0. Mitigación contra spam de reseñas (10 reseñas / 10 min)
  const rateLimit = checkRateLimit(request, {
    keyPrefix: 'reviews-post',
    maxRequests: 10,
    windowSeconds: 600,
  });

  if (!rateLimit.allowed && rateLimit.errorResponse) {
    return rateLimit.errorResponse;
  }

  try {
    // Verificar que el usuario esté logueado con sesión válida
    const session = await getServerSession(authOptions); 
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Debes iniciar sesión para dejar una reseña' }, { status: 401 });
    }

    const body = await request.json();
    const { productId, rating, comment } = body || {};

    const cleanProductId = sanitizeString(productId, 100);
    const numRating = Number(rating);

    // Validación rigurosa de rating y productId
    if (!cleanProductId || isNaN(numRating) || numRating < 1 || numRating > 5) {
      return NextResponse.json({ error: 'Calificación inválida o producto no especificado (debe ser entre 1 y 5 estrellas).' }, { status: 400 });
    }

    const intRating = Math.round(numRating);
    const cleanComment = comment ? sanitizeString(comment, 1000) : null;

    // Verificar existencia del producto
    const product = await prisma.product.findUnique({ where: { id: cleanProductId } });
    if (!product) {
      return NextResponse.json({ error: 'El producto especificado no existe.' }, { status: 404 });
    }

    // Buscar el ID del usuario en base a su email autenticado en sesión
    const user = await prisma.user.findUnique({ where: { email: session.user.email.toLowerCase().trim() } });
    if (!user) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });

    // Crear la reseña sanitizada
    const review = await prisma.review.create({
      data: {
        rating: intRating,
        comment: cleanComment,
        productId: product.id,
        userId: user.id,
      }
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error('Error creando reseña:', error);
    return NextResponse.json({ error: 'Error interno del servidor al procesar la reseña.' }, { status: 500 });
  }
}

// (Mantén la función export async function POST que ya tenías arriba)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawProductId = searchParams.get('productId');
    const productId = rawProductId ? sanitizeString(rawProductId, 100) : '';

    if (!productId) {
      return NextResponse.json({ error: 'Falta el ID del producto' }, { status: 400 });
    }

    // Buscamos las reseñas y también traemos el nombre del usuario
    const reviews = await prisma.review.findMany({
      where: { productId },
      include: {
        user: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' } // Las más nuevas primero
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Error al obtener reseñas:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}