import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminSession } from '@/lib/adminAuth';
import { sanitizeString } from '@/lib/sanitize';

export const dynamic = 'force-dynamic'; 

export async function GET(request: Request) {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        slug: true,
        sku: true,
        brand: true,
        category: true,
        description: true,
        price: true,
        image: true,
        type: true,
        createdAt: true,
        updatedAt: true,
      }
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    return NextResponse.json({ error: 'Error al obtener productos' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireAdminSession();
  if (!auth.authorized) {
    return auth.errorResponse!;
  }

  try {
    const body = await request.json();

    if (!body.name || typeof body.name !== 'string') {
      return NextResponse.json({ error: 'El nombre del producto es obligatorio' }, { status: 400 });
    }

    const price = typeof body.price === 'number' ? body.price : parseFloat(body.price);
    if (isNaN(price) || price < 0) {
      return NextResponse.json({ error: 'El precio debe ser un número válido mayor o igual a 0' }, { status: 400 });
    }

    const payloadDescription = JSON.stringify({
      text: sanitizeString(body.description || '', 5000),
      specs: sanitizeString(body.specs || '', 5000),
      compatibility: sanitizeString(body.compatibility || '', 5000)
    });

    const newProduct = await prisma.product.create({
      data: {
        name: sanitizeString(body.name, 255),
        slug: sanitizeString(body.slug || body.sku || '', 255).toLowerCase(),
        sku: sanitizeString(body.sku || '', 100),
        brand: sanitizeString(body.brand || 'ROWE', 100),
        category: sanitizeString(body.category || 'General', 100),
        description: payloadDescription,
        price,
        image: sanitizeString(body.image || '', 1000),
        type: sanitizeString(body.type || 'venta_online', 50),
      },
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error("Error al crear producto:", error);
    return NextResponse.json({ error: 'Error al crear producto en la base de datos' }, { status: 500 });
  }
}