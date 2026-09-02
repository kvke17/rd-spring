import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  // 1. Leemos el archivo JSON como texto de forma segura
  const dataPath = path.join(process.cwd(), 'data', 'products.json');
  const fileContents = fs.readFileSync(dataPath, 'utf-8');
  const products = JSON.parse(fileContents);

  // 2. Filtramos los productos
  const ventaOnline = products.filter((p: any) => p.type === 'venta_online');

  // 3. Recorremos cada producto y sus formatos para guardar el stock individual
  for (const p of ventaOnline) {
    // Verificamos si el producto tiene el arreglo de formatos
    if (p.formats && p.formats.length > 0) {
      for (const format of p.formats) {
        await prisma.product.upsert({
          where: { sku: format.sku },
          update: { stock: format.stock ?? 0 },
          // Usamos el SKU como ID único en la base de datos, ya que cada formato tiene el suyo
          create: { id: format.sku, sku: format.sku, stock: format.stock ?? 0 },
        });
        console.log(`Stock cargado: ${format.sku} -> ${format.stock} unidades`);
      }
    }
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