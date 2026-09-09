
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import productsData from '@/data/products.json'; // Tu catálogo real

export async function GET() {
  try {
    let count = 0;

    for (const item of productsData as any[]) {
      // Usamos upsert: si el producto no existe lo crea, si ya existe lo ignora
      await prisma.product.upsert({
        where: { sku: item.sku },
        update: {}, 
        create: {
          id: item.id || item.sku,
          sku: item.sku,
          stock: item.stock || 10, // Si no tiene stock en el JSON, le pone 10 por defecto
        }
      });
      count++;
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