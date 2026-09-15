import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import productsData from '@/data/products.json'; // Tu catálogo real

export async function GET() {
  try {
    let count = 0;

    for (const item of productsData as any[]) {
      // 1. Buscamos si el producto ya existe usando findFirst
      const productoExistente = await prisma.product.findFirst({
        where: { sku: item.sku }
      });

      // 2. Si el producto no existe, lo creamos con TODOS los campos obligatorios
      if (!productoExistente) {
        await prisma.product.create({
          data: {
            id: item.id || item.sku,
            sku: item.sku,
            // Agregamos los campos que Prisma exige como obligatorios:
            name: item.name || `Producto ${item.sku}`,
            slug: item.slug || item.sku.toLowerCase(),
            brand: item.brand || 'Generico',
            category: item.category || 'Sin Categoria',
            image: item.image || '/images/logo-rd.png'
          }
        });
        count++; // Sumamos 1 al contador solo si realmente se creó
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `¡Magia! ${count} productos fueron migrados a Turso exitosamente.` 
    });

  } catch (error) {
    console.error('Error migrando productos:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}