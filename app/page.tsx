import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma'; 
import productsData from '@/data/products.json'; 
import ProductCarousel from '@/components/ProductCarousel';
import EditorialHero from '@/components/EditorialHero';
import BrandShowcase from '@/components/BrandShowcase';
import SectionHeader from '@/components/SectionHeader';

export default async function HomePage() {
  // 1. OBTENEMOS LOS PRODUCTOS DIRECTAMENTE DESDE LA BASE DE DATOS DE TURSO
  const dbProducts = await prisma.product.findMany({
    orderBy: {
      sku: 'asc'
    }
  });

  // 2. AGRUPAMOS LOS PRODUCTOS POR SKU BASE
  const groupedMap = new Map();

  dbProducts.forEach((p) => {
    const skuBase = p.sku ? p.sku.split('-')[0] : p.id;

    if (!groupedMap.has(skuBase)) {
      const jsonMatch = (productsData as any[]).find(item => 
        item.formats?.some((f: any) => f.sku?.startsWith(skuBase)) || 
        item.id?.includes(skuBase)
      );

      groupedMap.set(skuBase, {
        id: skuBase,
        name: jsonMatch?.name || p.name.replace(/(-?\d{5}-\d{4}-\d{2})/g, '').trim() || `Aceite ROWE ${skuBase}`,
        slug: jsonMatch?.slug || p.slug,
        brand: "ROWE", 
        category: "Lubricantes",
        type: p.type || 'venta_online',
        image: p.image,
        formats: []
      });
    }

    let size = '1LT';
    if (p.sku?.includes('-0040-')) size = '4LT';
    if (p.sku?.includes('-0050-')) size = '5LT';

    const productGroup = groupedMap.get(skuBase);
    productGroup.formats.push({
      size: size,
      sku: p.sku,
      price: p.price || 0,
      stock: 10
    });
  });

  // Convertimos a arreglo y enviamos TODOS los productos al carrusel
  const allProducts = Array.from(groupedMap.values());

  return (
    <div className="bg-white text-gray-900 min-h-screen">
      {/* 1. SECCIÓN HERO EDITORIAL DE ALTA GAMA (INSPIRACIÓN PORSCHE DESIGN) */}
      <EditorialHero />

      {/* 2. SECCIÓN DE MARCAS CON REVELACIÓN POR SCROLL (ONCE: TRUE) */}
      <BrandShowcase />

      {/* 3. SECCIÓN VENTA ONLINE (CARRUSEL CON ENTRADA ESCALONADA) */}
      <section className="py-24 bg-slate-50/60 overflow-hidden relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            badge="VENTA ONLINE"
            title="Aceites y Lubricantes"
            actionText="VER TODOS"
            actionHref="/catalogo"
          />
          <ProductCarousel products={allProducts} />
        </div>
      </section>
    </div>
  );
}