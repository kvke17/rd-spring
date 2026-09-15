import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
  try {
    const body = await request.json();

    const payloadDescription = JSON.stringify({
      text: body.description || '',
      specs: body.specs || '',
      compatibility: body.compatibility || ''
    });

    const newProduct = await prisma.product.create({
      data: {
        name: body.name,
        slug: body.slug,
        sku: body.sku,
        brand: body.brand,
        category: body.category,
        description: payloadDescription,
        price: parseFloat(body.price) || 0,
        image: body.image || '',
        type: body.type || 'venta_online',
      },
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error("Error al crear producto:", error);
    return NextResponse.json({ error: 'Error al crear producto en la base de datos' }, { status: 500 });
  }
}