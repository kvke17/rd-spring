import { PrismaClient } from '@prisma/client';
import { createClient } from '@libsql/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
import fs from 'fs';
import path from 'path';

import * as dotenv from 'dotenv';
dotenv.config();

const libsql = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

const adapter = new PrismaLibSQL(libsql as any);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Iniciando la población de la base de datos en Turso...');

  const productsFilePath = path.join(process.cwd(), 'data', 'products.json');
  const productsData = JSON.parse(fs.readFileSync(productsFilePath, 'utf8'));

  for (const product of productsData) {
    if (product.formats && product.formats.length > 0) {
      for (const format of product.formats) {
        
        // 1. Verificamos si existe con findFirst
        const productoExistente = await prisma.product.findFirst({
          where: { sku: format.sku }
        });

        // 2. Lo creamos si no existe, pasando todos los campos requeridos
        if (!productoExistente) {
          await prisma.product.create({
            data: {
              id: format.sku,
              sku: format.sku,
              name: product.name ? `${product.name} ${format.size || ''}`.trim() : `Producto ${format.sku}`,
              slug: product.slug ? `${product.slug}-${format.size || format.sku}`.toLowerCase() : format.sku.toLowerCase(),
              brand: product.brand || 'Generico',
              category: product.category || 'Sin Categoria',
              image: product.image || '/images/logo-rd.png',
              price: format.price || product.price || 0
            }
          });
          console.log(`✅ Created SKU: ${format.sku}`);
        } else {
          console.log(`⏩ Skipped existing SKU: ${format.sku}`);
        }
      }
    } else if (product.sku) {
      
      // 1. Verificamos si existe con findFirst
      const productoExistente = await prisma.product.findFirst({
        where: { sku: product.sku }
      });

      // 2. Lo creamos si no existe, pasando todos los campos requeridos
      if (!productoExistente) {
        await prisma.product.create({
          data: {
            id: product.id || product.sku,
            sku: product.sku,
            name: product.name || `Producto ${product.sku}`,
            slug: product.slug || product.sku.toLowerCase(),
            brand: product.brand || 'Generico',
            category: product.category || 'Sin Categoria',
            image: product.image || '/images/logo-rd.png',
            price: product.price || 0
          }
        });
        console.log(`✅ Created SKU: ${product.sku}`);
      } else {
        console.log(`⏩ Skipped existing SKU: ${product.sku}`);
      }
    }
  }

  console.log('🎉 ¡Base de datos poblada exitosamente!');
}

main()
  .catch((e) => {
    console.error('🔥 Error poblando BD:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });