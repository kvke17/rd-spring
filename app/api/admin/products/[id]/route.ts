import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 1. OBTENER UN PRODUCTO ESPECÍFICO (Desempaqueta el JSON para el formulario de Admin)
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    const product = await prisma.product.findUnique({
      where: { id: id },
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

    if (!product) {
      return NextResponse.json({ error: 'No se encontró el producto' }, { status: 404 });
    }

    // Desempaquetamos la descripción si viene en formato JSON estructurado
    let realDescription = product.description || '';
    let parsedSpecs = '';
    let parsedCompatibility = '';

    try {
      const parsed = JSON.parse(product.description || '');
      if (parsed && typeof parsed === 'object') {
        realDescription = parsed.text || '';
        parsedSpecs = parsed.specs || '';
        parsedCompatibility = parsed.compatibility || '';
      }
    } catch {
      // Si era texto plano antiguo, se mantiene en description
    }

    return NextResponse.json({
      ...product,
      description: realDescription,
      specs: parsedSpecs,
      compatibility: parsedCompatibility
    });

  } catch (error) {
    console.error("Error al obtener producto individual:", error);
    return NextResponse.json({ error: 'Error al obtener producto' }, { status: 500 });
  }
}

// 2. ACTUALIZAR EL PRODUCTO (Empaqueta todo en la descripción para no tocar el esquema de Turso)
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Empaquetamos descripción, specs y compatibilidad juntos en formato JSON
    const payloadDescription = JSON.stringify({
      text: body.description || '',
      specs: body.specs || '',
      compatibility: body.compatibility || ''
    });

    const updatedProduct = await prisma.product.update({
      where: { id: id },
      data: {
        name: body.name,
        slug: body.slug,
        sku: body.sku,
        brand: body.brand,
        category: body.category,
        description: payloadDescription, // <--- Aquí viaja todo seguro sin alterar columnas de Turso
        price: parseFloat(body.price) || 0,
        image: body.image,
        type: body.type,
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("Error al actualizar:", error);
    return NextResponse.json({ error: 'Error al actualizar producto' }, { status: 500 });
  }
}

// 3. ELIMINAR EL PRODUCTO
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.product.delete({
      where: { id: id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    return NextResponse.json({ error: 'Error al eliminar producto' }, { status: 500 });
  }
}