require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });
const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@libsql/client');
const { PrismaLibSQL } = require('@prisma/adapter-libsql');

const libsql = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const adapter = new PrismaLibSQL(libsql);
const prisma = new PrismaClient({ adapter });

async function main() {
  const p = await prisma.product.findFirst({
    where: { slug: 'radiador-porsche-macan-95b121251' }
  });
  if (!p) {
    console.log('Product not found in Turso');
    return;
  }

  let parsed = {};
  try {
    parsed = JSON.parse(p.description || '{}');
  } catch {}

  parsed.images = [
    'https://res.cloudinary.com/ce1oyy5d/image/upload/v1792690608/syfzzvzz6a8rwgn1wvzn.webp',
    'https://res.cloudinary.com/ce1oyy5d/image/upload/e_contrast:30/v1792690608/syfzzvzz6a8rwgn1wvzn.webp',
    'https://res.cloudinary.com/ce1oyy5d/image/upload/e_saturation:50/v1792690608/syfzzvzz6a8rwgn1wvzn.webp'
  ];

  await prisma.product.update({
    where: { id: p.id },
    data: {
      description: JSON.stringify(parsed),
      brand: 'Behr / OEM'
    }
  });

  console.log('Successfully updated radiator with 3 valid Cloudinary images in Turso!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
