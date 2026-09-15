import Link from 'next/link';
import Image from 'next/image';
import { STORE_CONFIG } from '@/config/constants';
import { prisma } from '@/lib/prisma';
import productsData from '@/data/products.json'; // <-- Importamos el JSON para rescatar los nombres reales

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
      // BUSCAMOS EL NOMBRE REAL EN EL JSON ORIGINAL USANDO EL SKU BASE
      const jsonMatch = (productsData as any[]).find(item => 
        item.formats?.some((f: any) => f.sku?.startsWith(skuBase)) || 
        item.id?.includes(skuBase)
      );

      groupedMap.set(skuBase, {
        id: skuBase,
        // Si el JSON tiene el nombre real, lo usa; si no, limpia el nombre de la BD
        name: jsonMatch?.name || p.name.replace(/(-?\d{5}-\d{4}-\d{2})/g, '').trim() || `Aceite ROWE ${skuBase}`,
        slug: jsonMatch?.slug || p.slug,
        brand: p.brand,
        category: p.category,
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
    <div className="min-h-screen bg-white text-gray-900 pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200 pb-8 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-[#FF0000] mb-2">
              {categoriaQuery ? `FILTRADO POR: ${categoriaQuery.toUpperCase()}` : 'CATÁLOGO OFICIAL'}
            </p>
            <h1 className="text-4xl font-bold uppercase tracking-tight">Componentes y Fluidos</h1>
          </div>
          {categoriaQuery && (
            <Link href="/catalogo" className="text-xs text-gray-500 hover:text-gray-900 underline underline-offset-4">
              Borrar filtros
            </Link>
          )}
        </div>

        {products.length === 0 ? (
          <p className="text-gray-600 text-sm">No se encontraron productos para esta categoría.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                <div key={p.id} className="border border-gray-200 bg-gray-50 flex flex-col group">
                  <div className="aspect-square relative bg-white overflow-hidden group">
                    <span className="absolute top-3 right-3 text-[9px] tracking-wider px-2 py-1 uppercase font-bold z-10 bg-[#FF0000] text-white">
                      VENTA ONLINE
                    </span>
                    
                    <Image 
                      src={imgSrc} 
                      alt={p.name} 
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                      className={`object-cover transition-all duration-500 ease-in-out ${
                        hoverSrc ? 'group-hover:opacity-0' : 'group-hover:scale-105'
                      }`} 
                    />

                    {hoverSrc && (
                      <Image 
                        src={hoverSrc} 
                        alt={`${p.name} formato mayor`} 
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                        className="absolute inset-0 object-cover opacity-0 transition-opacity duration-500 ease-in-out group-hover:opacity-100" 
                      />
                    )}
                  </div>
                  
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-[#FF0000] mb-1">{p.brand} · {p.category}</p>
                      <Link href={`/productos/${p.id}`}>
                        <h3 className="text-sm font-bold text-gray-900 line-clamp-2 hover:text-[#FF0000] transition">{p.name}</h3>
                      </Link>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                      <p className="text-sm font-bold text-gray-900">
                        {hasFormats && (
                          <span className="text-[10px] text-gray-500 mr-2 font-normal">DESDE</span>
                        )}
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
        )}
      </div>
    </div>
  );
}