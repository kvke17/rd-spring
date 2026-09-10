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
        await prisma.product.upsert({
          where: { sku: format.sku },
          update: { 
            stock: format.stock || 15 
          },
          create: {
            id: format.sku,   // 🚨 Pasamos el SKU como ID
            sku: format.sku,
            stock: format.stock || 15,
          },
        });
        console.log(`✅ Upserted SKU: ${format.sku}`);
      }
    } else if (product.sku) {
      await prisma.product.upsert({
        where: { sku: product.sku },
        update: { 
          stock: product.stock || 15 
        },
        create: {
          id: product.id || product.sku, // 🚨 Pasamos el ID del JSON o el SKU
          sku: product.sku,
          stock: product.stock || 15,
        },
      });
      console.log(`✅ Upserted SKU: ${product.sku}`);
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