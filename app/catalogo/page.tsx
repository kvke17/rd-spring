import { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import productsData from '@/data/products.json';
import { roweProducts } from '@/config/roweProducts';
import OilCatalogClient from '@/components/catalog/OilCatalogClient';
import { CatalogOilProduct, CatalogFormat } from '@/components/catalog/types';

export const metadata = {
  title: 'Catálogo de Aceites y Fluidos ROWE | RD Spring Chile',
  description:
    'Catálogo completo de lubricantes y fluidos sintéticos ROWE de fabricación alemana. Homologaciones oficiales para Porsche, BMW, Audi, Mercedes-Benz y Volkswagen con despacho a todo Chile.',
};

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; q?: string }>;
}) {
  const params = await searchParams;
  const categoriaQuery = params.categoria?.trim();
  const searchQuery = params.q?.trim();

  // 1. Obtener productos desde Turso mediante Prisma
  const dbProducts = await prisma.product.findMany({
    orderBy: {
      sku: 'asc',
    },
  });

  // 2. Filtro estricto: excluir cualquier ítem de repuestos/suspensión
  const soloAceitesDb = dbProducts.filter((p: any) => {
    const categoria = (p.category || '').toLowerCase().trim();
    return (
      categoria !== 'suspensión' &&
      categoria !== 'suspension' &&
      categoria !== 'frenos' &&
      categoria !== 'repuestos'
    );
  });

  // 3. Agrupación por SKU base (ej: 20001, 20118, etc.)
  const groupedMap = new Map<string, CatalogOilProduct>();

  soloAceitesDb.forEach((p: any) => {
    const skuBase = p.sku ? p.sku.split('-')[0] : p.id;

    if (!groupedMap.has(skuBase)) {
      const jsonMatch = (productsData as any[]).find(
        (item) =>
          item.formats?.some((f: any) => f.sku?.startsWith(skuBase)) ||
          item.id?.includes(skuBase)
      );

      // Extraer viscosidad con regex
      const viscRegex = /\b(\d+W-\d+)\b/i;
      const viscMatch =
        (p.name || '').match(viscRegex) ||
        (jsonMatch?.name || '').match(viscRegex) ||
        (jsonMatch?.specs?.['Base / Viscosidad'] || '').match(viscRegex);
      const viscosity = viscMatch ? viscMatch[1].toUpperCase() : '';

      // Determinar homologaciones de marcas
      const fullText = (
        (p.name || '') +
        ' ' +
        (jsonMatch?.name || '') +
        ' ' +
        (jsonMatch?.description || '') +
        ' ' +
        JSON.stringify(jsonMatch?.specs || {}) +
        ' ' +
        (jsonMatch?.compatibility?.join(' ') || '')
      ).toLowerCase();

      const approvals: string[] = [];
      if (/(porsche)/i.test(fullText)) approvals.push('porsche');
      if (/(bmw|longlife)/i.test(fullText)) approvals.push('bmw');
      if (/(mercedes|mb-freigabe|229\.)/i.test(fullText)) approvals.push('mb');
      if (/(vw|volkswagen|audi|504|507|502|505)/i.test(fullText)) approvals.push('vw');
      if (/(ford|wss-m2c)/i.test(fullText)) approvals.push('ford');
      if (/(gm|dexos|opel|vauxhall)/i.test(fullText)) approvals.push('gm');
      if (/(racing|competición|competicion|multi-ester)/i.test(fullText)) approvals.push('racing');

      // Determinar si es producto destacado
      const isFeatured =
        roweProducts.some((r) =>
          (p.name || '').toLowerCase().includes(r.id.replace('rowe-', ''))
        ) ||
        skuBase === '20118' || // DLS 5W-30
        skuBase === '20125' || // DPF 5W-30
        skuBase === '20058';   // SYNTH RS 5W-40

      groupedMap.set(skuBase, {
        id: skuBase,
        sku: p.sku || skuBase,
        name:
          jsonMatch?.name ||
          p.name.replace(/(-?\d{5}-\d{4}-\d{2})/g, '').trim() ||
          `Aceite ROWE ${skuBase}`,
        slug: jsonMatch?.slug || p.slug || skuBase,
        brand: p.brand || 'ROWE',
        category: p.category || 'Aceite de Motor',
        type: p.type || 'venta_online',
        image: p.image || jsonMatch?.image || `/images/rowe/${p.sku}.png`,
        description: jsonMatch?.description || '',
        specs: jsonMatch?.specs || null,
        compatibility: jsonMatch?.compatibility || [],
        formats: [],
        viscosity,
        approvals,
        lowestPrice: 0,
        highestPrice: 0,
        isFeatured,
      });
    }

    let size = '1LT';
    if (p.sku?.includes('-0040-')) size = '4LT';
    if (p.sku?.includes('-0050-')) size = '5LT';

    const productGroup = groupedMap.get(skuBase)!;
    productGroup.formats.push({
      size,
      sku: p.sku || `${skuBase}-${size}`,
      price: p.price || 0,
      stock: 10,
    });
  });

  // 4. Calcular precios mínimos/máximos y ordenar formatos
  const allProducts = Array.from(groupedMap.values()).map((product) => {
    product.formats.sort((a, b) => {
      const order: Record<string, number> = { '1LT': 1, '4LT': 2, '5LT': 3 };
      return (order[a.size] || 9) - (order[b.size] || 9);
    });

    const prices = product.formats.map((f) => f.price).filter((pr) => pr > 0);
    product.lowestPrice = prices.length > 0 ? Math.min(...prices) : 0;
    product.highestPrice = prices.length > 0 ? Math.max(...prices) : 0;

    return product;
  });

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50/50 flex items-center justify-center pt-28">
          <div className="w-8 h-8 rounded-full border-2 border-neutral-300 border-t-[#b3131b] animate-spin" />
        </div>
      }
    >
      <OilCatalogClient
        initialProducts={allProducts}
        initialCategory={categoriaQuery}
        initialQuery={searchQuery}
      />
    </Suspense>
  );
}