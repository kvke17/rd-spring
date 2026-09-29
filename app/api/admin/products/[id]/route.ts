import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminSession } from '@/lib/adminAuth';
import { sanitizeString } from '@/lib/sanitize';

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
      // Formato plano
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

// 2. ACTUALIZAR EL PRODUCTO (Requiere sesión de ADMIN y valida campos)
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminSession();
  if (!auth.authorized) {
    return auth.errorResponse!;
  }

  try {
    const { id } = await params;
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

    const updatedProduct = await prisma.product.update({
      where: { id: id },
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

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("Error al actualizar:", error);
    return NextResponse.json({ error: 'Error al actualizar producto' }, { status: 500 });
  }
}

// 3. ELIMINAR EL PRODUCTO (Requiere sesión de ADMIN)
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminSession();
  if (!auth.authorized) {
    return auth.errorResponse!;
  }

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