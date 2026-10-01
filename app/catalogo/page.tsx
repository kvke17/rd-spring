import Link from 'next/link';
import Image from 'next/image';
import { STORE_CONFIG } from '@/config/constants';
import { prisma } from '@/lib/prisma';
import productsData from '@/data/products.json';
import { ChevronRight, Droplets, Sparkles } from 'lucide-react';

export default async function CatalogoPage({ searchParams }: { searchParams: Promise<{ categoria?: string }> }) {
  const params = await searchParams;
  const categoriaQuery = params.categoria?.toLowerCase();
  
  const normalize = (s: string) => s ? s.toLowerCase().replace(/[-\s]/g, '') : '';
  
  const dbProducts = await prisma.product.findMany({
    orderBy: {
      sku: 'asc'
    }
  });

  // FILTRO ESTRICTO: Excluimos explícitamente cualquier categoría que sea de repuestos
  const soloAceitesDb = dbProducts.filter((p: any) => {
    const categoria = (p.category || '').toLowerCase().trim();
    return categoria !== 'suspensión' && categoria !== 'suspension' && categoria !== 'frenos' && categoria !== 'repuestos';
  });

  // AGRUPACIÓN INTELIGENTE POR SKU BASE (ej: 20001)
  const groupedMap = new Map();

  soloAceitesDb.forEach((p) => {
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
        brand: p.brand || 'ROWE',
        category: p.category || 'Lubricantes',
        type: p.type,
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

  let products = Array.from(groupedMap.values()) as any[];

  if (categoriaQuery) {
    products = products.filter(
      (p) =>
        normalize(p.category).includes(normalize(categoriaQuery)) ||
        normalize(p.brand).includes(normalize(categoriaQuery))
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 text-gray-900 pt-28 sm:pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Encabezado Principal */}
        <div className="border-b border-slate-200/80 pb-8 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-100 text-[#b3131b] text-[10px] font-mono font-bold uppercase tracking-wider mb-3">
              <Droplets className="w-3 h-3" />
              <span>{categoriaQuery ? `FILTRADO: ${categoriaQuery.toUpperCase()}` : 'LUBRICANTES SINTÉTICOS ALEMÁNES · ROWE'}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-gray-900">
              Aceites y Fluidos
            </h1>
            <p className="text-sm text-slate-500 mt-2 max-w-xl">
              Fluidos de motor y transmisión de alto rendimiento con homologación oficial de fabricantes europeos.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs font-mono text-slate-500 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
              {products.length} {products.length === 1 ? 'línea disponible' : 'líneas disponibles'}
            </span>
            {categoriaQuery && (
              <Link 
                href="/catalogo" 
                className="text-xs text-slate-500 hover:text-[#b3131b] underline underline-offset-4 transition-colors font-medium cursor-pointer"
              >
                Borrar filtros
              </Link>
            )}
          </div>
        </div>

        {/* Grilla de Productos */}
        {products.length === 0 ? (
          <div className="max-w-md mx-auto my-16 bg-white rounded-3xl border border-slate-200 p-10 text-center shadow-sm">
            <p className="text-base font-bold text-gray-900 mb-2">No se encontraron productos</p>
            <p className="text-sm text-slate-500 mb-6">No hay lubricantes registrados para la categoría seleccionada.</p>
            <Link 
              href="/catalogo" 
              className="btn-shine bg-[#b3131b] hover:bg-[#8f0f15] text-white font-bold px-6 py-3 rounded-xl uppercase text-xs tracking-wider transition-all inline-block shadow-sm"
            >
              Ver Todo el Catálogo
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {products.map((p) => {
              const hasFormats = p.formats && p.formats.length > 0;
              
              p.formats.sort((a: any, b: any) => {
                if (a.size === '1LT') return -1;
                if (b.size === '1LT') return 1;
                return 0;
              });

              const imgSrc = hasFormats 
                ? `/images/rowe/${p.formats[0].sku}.png` 
                : (p.image || '/images/logo-rd.png');
              
              let hoverSrc = null;
              if (hasFormats && p.formats.length > 1) {
                const lastFormat = p.formats[p.formats.length - 1];
                hoverSrc = `/images/rowe/${lastFormat.sku}.png`;
              }

              const lowestPrice = hasFormats ? Math.min(...p.formats.map((f: any) => f.price)) : 0;

              return (
                <div 
                  key={p.id} 
                  className="bg-white rounded-3xl border border-slate-200/80 gpu-shadow-hover hover:-translate-y-1.5 transition-transform duration-300 ease-out transform-gpu flex flex-col overflow-hidden group cursor-pointer"
                >
                  {/* Contenedor de Imagen con Tag */}
                  <Link href={`/productos/${p.id}`} className="block relative aspect-square bg-slate-50/80 overflow-hidden p-8 flex items-center justify-center">
                    <span className="absolute top-4 right-4 text-[10px] tracking-widest px-3 py-1 uppercase font-bold z-10 bg-[#b3131b] text-white rounded-full shadow-sm">
                      VENTA ONLINE
                    </span>
                    
                    <Image 
                      src={imgSrc} 
                      alt={p.name} 
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                      className={`object-contain p-6 transition-all duration-500 ease-in-out ${
                        hoverSrc ? 'group-hover:opacity-0 group-hover:scale-105' : 'group-hover:scale-105'
                      }`} 
                    />

                    {hoverSrc && (
                      <Image 
                        src={hoverSrc} 
                        alt={`${p.name} formato mayor`} 
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                        className="absolute inset-0 object-contain p-6 opacity-0 transition-all duration-500 ease-in-out group-hover:opacity-100 group-hover:scale-105" 
                      />
                    )}
                  </Link>
                  
                  {/* Detalles del Producto */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] font-mono uppercase tracking-widest text-[#b3131b] font-bold">
                          {p.brand} · {p.category}
                        </p>
                        {hasFormats && (
                          <div className="flex gap-1">
                            {p.formats.map((f: any) => (
                              <span key={f.size} className="text-[9px] font-mono font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                                {f.size}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <Link href={`/productos/${p.id}`}>
                        <h3 className="text-base font-bold text-gray-900 line-clamp-2 group-hover:text-[#b3131b] transition-colors leading-snug">
                          {p.name}
                        </h3>
                      </Link>
                    </div>
                    
                    {/* Precio y Botón Ver Formatos */}
                    <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        {hasFormats && (
                          <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                            DESDE
                          </span>
                        )}
                        <p className="text-lg font-black text-gray-900 font-mono tracking-tight">
                          {STORE_CONFIG.CURRENCY_FORMAT.format(lowestPrice)}
                        </p>
                      </div>

                      <Link 
                        href={`/productos/${p.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 group-hover:text-[#b3131b] bg-slate-100 group-hover:bg-red-50 px-3.5 py-2 rounded-xl transition-all"
                      >
                        <span>VER</span>
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}