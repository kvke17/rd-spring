import Link from 'next/link';
import Image from 'next/image';
import { STORE_CONFIG } from '@/config/constants';
import { prisma } from '@/lib/prisma'; // <-- Importamos Prisma para conectar con Turso
import productsData from '@/data/products.json'; // <-- Respaldo para los nombres exactos

// Las 7 marcas de tu imagen para la nueva sección
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

  // 2. AGRUPAMOS LOS PRODUCTOS POR SKU BASE PARA MOSTRARLOS COMO UN SOLO MODELO CON SUS FORMATOS
  const groupedMap = new Map();

  dbProducts.forEach((p) => {
    const skuBase = p.sku ? p.sku.split('-')[0] : p.id;

    if (!groupedMap.has(skuBase)) {
      // Rescatamos el nombre real desde el JSON original usando el SKU base
      const jsonMatch = (productsData as any[]).find(item => 
        item.formats?.some((f: any) => f.sku?.startsWith(skuBase)) || 
        item.id?.includes(skuBase)
      );

      groupedMap.set(skuBase, {
        id: skuBase,
        name: jsonMatch?.name || p.name.replace(/(-?\d{5}-\d{4}-\d{2})/g, '').trim() || `Aceite ROWE ${skuBase}`,
        slug: jsonMatch?.slug || p.slug,
        brand: "ROWE", // Forzamos la marca para lucir profesional
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

  // Convertimos a arreglo y tomamos los primeros 4 para la sección destacada del Home
  const featuredProducts = Array.from(groupedMap.values()).slice(0, 4);

  return (
    <div className="bg-white text-gray-900 min-h-screen">
      
      {/* 1. SECCIÓN HERO (LIMPIA Y BLANCA) */}
      <section className="pt-32 pb-20 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* LADO IZQUIERDO: Textos y Botones */}
            <div className="space-y-8">
              <p className="text-xs uppercase tracking-[0.25em] text-[#b3131b] font-bold">
                CHASSIS PRESTIGE · SANTIAGO DE CHILE
              </p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 leading-[1.1]">
                La ingeniería que sostiene el lujo en movimiento.
              </h1>
              <p className="text-base sm:text-lg text-gray-600 max-w-xl leading-relaxed">
                Amortiguadores, resortes y suspensión neumática original y de alto rendimiento para Porsche, BMW, Audi y Land Rover. Compatibilidad verificada por generación de chasis.
              </p>
              
              {/* Botones */}
              <div className="flex flex-wrap gap-4 pt-2">
                <Link href="/cotizacion" className="bg-[#b91c1c] text-white font-bold px-8 py-4 uppercase text-xs tracking-widest hover:bg-red-800 transition shadow-md">
                  COTIZAR REPUESTO
                </Link>
                <Link href="/catalogo" className="bg-white border border-gray-300 text-gray-900 font-bold px-8 py-4 uppercase text-xs tracking-widest hover:bg-gray-50 transition shadow-md">
                  VER ACEITES
                </Link>
                <Link href="/repuestos" className="bg-white border border-gray-300 text-gray-900 font-bold px-8 py-4 uppercase text-xs tracking-widest hover:bg-gray-50 transition shadow-md">
                  VER REPUESTOS DISPONIBLES
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-8 pt-10 mt-8 border-t border-gray-200">
                <div>
                  <span className="block text-3xl font-bold tracking-tight text-gray-900"></span>
                  <span className="text-[11px] text-gray-500 uppercase tracking-widest font-bold"></span>
                </div>
                <div>
                  <span className="block text-3xl font-bold tracking-tight text-gray-900"></span>
                  <span className="text-[11px] text-gray-500 uppercase tracking-widest font-bold"></span>
                </div>
                <div>
                  <span className="block text-3xl font-bold tracking-tight text-gray-900"></span>
                  <span className="text-[11px] text-gray-500 uppercase tracking-widest font-bold"></span>
                </div>
              </div>
            </div>

            {/* LADO DERECHO: Imagen de Suspensión */}
            <div className="relative h-[400px] lg:h-[600px] w-full rounded-2xl overflow-hidden shadow-2xl border border-gray-100 group">
              <Image 
                src="/images/suspension.jpg" 
                alt="Mecánico instalando suspensión de alto rendimiento"
                fill
                priority
                sizes="(max-width: 864px) 100vw, 50vw"
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
            </div>

          </div>
        </div>
      </section>

 {/* 2. NUEVA SECCIÓN DE MARCAS (4 arriba, 3 abajo) */}
      <section className="py-24 border-b border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-gray-400 font-bold mb-4">ESPECIALISTAS EN ALTA GAMA</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-16 tracking-tight">Marcas con las que trabajamos</h2>
          
          <div className="flex flex-col items-center gap-10 md:gap-14">
            
            {/* FILA 1: Las primeras 4 marcas */}
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 w-full">
              {marcas.slice(0, 4).map((marca, idx) => (
                <div key={idx} className="relative w-28 h-12 md:w-40 h-20 md:w-64 md:h-32 hover:scale-110 transition-transform duration-300">
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
                <div key={idx + 4} className="relative w-28 h-12 md:w-40 h-20 md:w-64 md:h-32 hover:scale-110 transition-transform duration-300">
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

      {/* 3. SECCIÓN VENTA ONLINE (DINÁMICA DESDE TURSO) */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-[#b3131b] mb-2 font-bold">VENTA ONLINE</p>
              <h2 className="text-3xl font-bold uppercase tracking-tight">Aceites y Lubricantes</h2>
            </div>
            <Link href="/catalogo" className="border border-gray-300 bg-white text-xs uppercase tracking-widest px-4 py-2 hover:bg-gray-100 text-gray-900 font-bold shadow-sm">VER TODOS</Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((p: any) => {
              const hasFormats = p.formats && p.formats.length > 0;
              
              p.formats.sort((a: any, b: any) => (a.size === '1LT' ? -1 : 1));

              const imgSrc = hasFormats ? `/images/rowe/${p.formats[0].sku}.png` : '/images/logo-rd.png';
              let hoverSrc = hasFormats && p.formats.length > 1 ? `/images/rowe/${p.formats[p.formats.length - 1].sku}.png` : null;

              const lowestPrice = hasFormats ? Math.min(...p.formats.map((f: any) => f.price)) : 0;

              return (
                <div key={p.id} className="border border-gray-200 bg-white flex flex-col group hover:shadow-lg transition">
                  <div className="aspect-square relative bg-white overflow-hidden group">
                    <span className="absolute top-3 right-3 text-[9px] tracking-wider px-2 py-1 uppercase font-bold z-10 bg-[#b3131b] text-white">
                      VENTA ONLINE
                    </span>
                    
                    <Image 
                      src={imgSrc} 
                      alt={p.name} 
                      fill
                      sizes="(max-width: 768px) 100vw, 25vw"
                      className={`object-cover transition-all duration-500 ease-in-out ${hoverSrc ? 'group-hover:opacity-0' : 'group-hover:scale-105'}`} 
                    />

                    {hoverSrc && (
                      <Image 
                        src={hoverSrc} 
                        alt={`${p.name} formato mayor`} 
                        fill
                        sizes="(max-width: 768px) 100vw, 25vw"
                        className="absolute inset-0 object-cover opacity-0 transition-opacity duration-500 ease-in-out group-hover:opacity-100" 
                      />
                    )}
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-[#b3131b] mb-1 font-bold">{p.brand} · {p.category}</p>
                      <Link href={`/productos/${p.id}`}>
                        <h3 className="text-sm font-bold text-gray-900 line-clamp-2 hover:text-[#b3131b] transition">{p.name}</h3>
                      </Link>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                      <p className="text-sm font-bold text-gray-900">
                        <span className="text-[10px] text-gray-500 mr-2 font-normal">DESDE</span>
                        {STORE_CONFIG.CURRENCY_FORMAT.format(lowestPrice)}
                      </p>
                      <span className="text-[10px] text-gray-500">
                        {hasFormats ? p.formats[0].sku : ''}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}