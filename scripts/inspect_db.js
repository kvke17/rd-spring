const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@libsql/client');
const { PrismaLibSQL } = require('@prisma/adapter-libsql');
require('dotenv').config();

const libsql = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
const adapter = new PrismaLibSQL(libsql);
const prisma = new PrismaClient({ adapter });

async function run() {
  const products = await prisma.product.findMany();
  console.log('Total products in DB:', products.length);

  const isLubricant = (cat) => {
    const c = (cat || '').toLowerCase().trim();
    return c === 'lubricantes' || c === 'aceites' || c === 'aceite';
  };

  const repuestos = products.filter(p => !isLubricant(p.category));
  const lubricantes = products.filter(p => isLubricant(p.category));

  console.log('\n--- REPUESTOS ---');
  console.log('Count:', repuestos.length);
  let repuestosStock = 0;
  repuestos.forEach(r => {
    repuestosStock += (r.stock || 0);
    console.log(`- ${r.name} | Cat: ${r.category} | Stock: ${r.stock} | Price: $${r.price}`);
  });
  console.log('Total Repuestos Stock:', repuestosStock);

  console.log('\n--- LUBRICANTES ---');
  console.log('Count:', lubricantes.length);
  const totalLubStock = lubricantes.reduce((sum, p) => sum + (p.stock || 1), 0);
  console.log('Total Lubricantes Stock:', totalLubStock);

  const totalStock = repuestosStock + totalLubStock;
  console.log('\nTotal Available Units:', totalStock);

  const totalValuation = products.reduce((acc, p) => acc + (p.price || 0) * (p.stock || 1), 0);
  console.log('Total Inventory Valuation CLP:', totalValuation);

  const lowStockRepuestos = repuestos.filter(p => (p.stock || 0) <= 2);
  console.log('Low stock repuestos (<= 2):', lowStockRepuestos.length);

  const outOfStockRepuestos = repuestos.filter(p => (p.stock || 0) === 0);
  console.log('Out of stock repuestos (=== 0):', outOfStockRepuestos.length);

  const orders = await prisma.order.findMany();
  console.log('\nTotal Orders in DB:', orders.length);
}

run()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
