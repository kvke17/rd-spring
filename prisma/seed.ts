import { PrismaClient } from '@prisma/client';
import products from '../data/products.json';

const prisma = new PrismaClient();

async function main() {
  const ventaOnline = (products as any[]).filter((p) => p.type === 'venta_online');

  for (const p of ventaOnline) {
    await prisma.product.upsert({
      where: { sku: p.sku },
      update: { stock: p.stock ?? 0 },
      create: { id: p.id, sku: p.sku, stock: p.stock ?? 0 },
    });
    console.log(`Stock cargado: ${p.sku} -> ${p.stock ?? 0} unidades`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
