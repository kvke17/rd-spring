import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma'; 
import productsData from '@/data/products.json'; 
import ProductCarousel from '@/components/ProductCarousel';
import MotionVideoHero from '@/components/MotionVideoHero';

// Las 7 marcas de alta gama
const marcas = [
  { nombre: 'Porsche', logo: '/images/marcas/porsche.png' },
  { nombre: 'Audi', logo: '/images/marcas/audi.png' },
  { nombre: 'BMW', logo: '/images/marcas/bmw.png' },
  { nombre: 'Land Rover', logo: '/images/marcas/landrover.png' },
  { nombre: 'Volkswagen', logo: '/images/marcas/vw.png' },
  { nombre: 'Mercedes-Benz', logo: '/images/marcas/mercedes.png' },
  { nombre: 'Jaguar', logo: '/images/marcas/jaguar.png' },
];

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
      {/* 1. SECCIÓN HERO CON VIDEO DE FONDO MOTION DE ALTA GAMA (PORSCHE EN LOOP CINEMÁTICO) */}
      <MotionVideoHero />

      {/* 2. SECCIÓN DE MARCAS */}
    <section className="py-24 border-b border-gray-100 bg-white relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-gray-400 font-bold mb-4">ESPECIALISTAS EN ALTA GAMA</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-16 tracking-tight">Marcas con las que trabajamos</h2>
          
          <div className="flex flex-col gap-12 md:gap-16 items-center">
            {/* FILA 1: Las primeras 4 marcas */}
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 w-full">
              {marcas.slice(0, 4).map((marca, idx) => (
                <div 
                  key={idx} 
                  className="relative w-32 h-14 sm:w-44 sm:h-20 md:w-60 md:h-28 opacity-100 hover:scale-[1.16] hover:-translate-y-2 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] transform-gpu cursor-pointer"
                >
                  <Image
                    src={marca.logo} 
                    alt={`Logo de ${marca.nombre}`}
                    fill
                    className="object-contain"
                  />
                </div>
              ))}
            </div>

            {/* FILA 2: Las 3 marcas restantes */}
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 w-full">
              {marcas.slice(4).map((marca, idx) => (
                <div 
                  key={idx + 4} 
                  className="relative w-32 h-14 sm:w-44 sm:h-20 md:w-60 md:h-28 opacity-100 hover:scale-[1.16] hover:-translate-y-2 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] transform-gpu cursor-pointer"
                >
                  <Image
                    src={marca.logo} 
                    alt={`Logo de ${marca.nombre}`}
                    fill
                    className="object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. SECCIÓN VENTA ONLINE (CARRUSEL) */}
      <section className="py-24 bg-slate-50/60 overflow-hidden relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-[#b3131b] mb-2 font-bold">VENTA ONLINE</p>
              <h2 className="text-3xl font-bold uppercase tracking-tight text-gray-900">Aceites y Lubricantes</h2>
            </div>
            <Link 
              href="/catalogo" 
              className="btn-shine border border-slate-200 bg-white text-xs uppercase tracking-widest px-5 py-2.5 rounded-xl hover:bg-slate-50 text-gray-900 font-bold shadow-sm hover:shadow transition-all duration-200 whitespace-nowrap ml-4 active:scale-95 cursor-pointer"
            >
              <span className="relative z-10">VER TODOS</span>
            </Link>
          </div>
          
          <ProductCarousel products={allProducts} />
        </div>
      </section>
    </div>
  );
}