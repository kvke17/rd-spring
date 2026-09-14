import Link from 'next/link';
import Image from 'next/image';
import productsData from '@/data/products.json';
import { STORE_CONFIG } from '@/config/constants';


export default async function CatalogoPage({ searchParams }: { searchParams: Promise<{ categoria?: string }> }) {
  const params = await searchParams;
  const categoriaQuery = params.categoria?.toLowerCase();
  const normalize = (s: string) => s.toLowerCase().replace(/[-\s]/g, '');
  
  let products = (productsData as any[]).filter((p) => p.type === 'venta_online');

  if (categoriaQuery) {
    products = products.filter(
      (p) =>
        normalize(p.category).includes(normalize(categoriaQuery)) ||
        normalize(p.brand).includes(normalize(categoriaQuery)) ||
        (p.vehicleBrands && p.vehicleBrands.some((vb: string) => normalize(vb).includes(normalize(categoriaQuery))))
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200 pb-8 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-[#FF0000]  mb-2">
              {categoriaQuery ? `FILTRADO POR: ${categoriaQuery.toUpperCase()}` : 'CATÁLOGO OFICIAL'}
            </p>
            <h1 className="text-4xl font-bold uppercase tracking-tight">Componentes y Fluidos</h1>
          </div>
          {categoriaQuery && (
            <Link href="/catalogo" className="text-xs  text-gray-500 hover:text-gray-900 underline underline-offset-4">
              Borrar filtros
            </Link>
          )}
        </div>

        {products.length === 0 ? (
          <p className="text-gray-600  text-sm">No se encontraron productos para esta categoría.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p) => {
              
              // 🚨 LÓGICA DINÁMICA DE IMÁGENES
              const hasFormats = p.formats && p.formats.length > 0;
              
              // 1. Imagen Principal: Usa el SKU del primer formato (ej: 1 Litro), si no existe usa la por defecto
              const imgSrc = hasFormats 
                ? `/images/rowe/${p.formats[0].sku}.png` 
                : (p.image || '/images/logo-rd.png');
              
              // 2. Imagen Hover: Usa el SKU del último formato (ej: 4 o 5 Litros)
              let hoverSrc = p.imageHover;
              if (!hoverSrc && hasFormats && p.formats.length > 1) {
                // Toma el último formato de la lista para el hover
                const lastFormat = p.formats[p.formats.length - 1];
                hoverSrc = `/images/rowe/${lastFormat.sku}.png`;
              }

              return (
                <div key={p.id} className="border border-gray-200 bg-gray-50 flex flex-col group">
                  
                  {/* CONTENEDOR DE IMAGEN MODIFICADO */}
                  <div className="aspect-square relative bg-white overflow-hidden group">
                    <span className={`absolute top-3 right-3 text-[9px]  tracking-wider px-2 py-1 uppercase font-bold z-10 ${p.type === 'venta_online' ? 'bg-[#FF0000] text-white' : 'border border-white/30 text-gray-900 bg-black/60 backdrop-blur-sm'}`}>
                      {p.type === 'venta_online' ? 'VENTA ONLINE' : 'COTIZACIÓN'}
                    </span>
                    
                    {/* Imagen Principal (1 Litro) */}
                    <Image 
                      src={imgSrc} 
                      alt={p.name} 
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                      className={`object-cover transition-all duration-500 ease-in-out ${
                        hoverSrc ? 'group-hover:opacity-0' : 'group-hover:scale-105'
                      }`} 
                    />

                    {/* Imagen Secundaria (5 Litros al pasar el mouse) */}
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
                      <p className="text-[10px] uppercase  tracking-widest text-[#FF0000] mb-1">{p.brand} · {p.category}</p>
                      <Link href={`/producto/${p.slug}`}>
                        <h3 className="text-sm font-bold text-gray-900 line-clamp-2 hover:text-[#FF0000] transition">{p.name}</h3>
                      </Link>
                    </div>
                    
                    {/* LÓGICA DE PRECIO Y SKU DINÁMICOS */}
                    <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between ">
                      <p className="text-sm font-bold text-gray-900">
                        {p.formats && p.formats.length > 0 && (
                          <span className="text-[10px] text-gray-500  mr-2 font-normal">DESDE</span>
                        )}
                        {STORE_CONFIG.CURRENCY_FORMAT.format(
                          p.price || (p.formats && p.formats.length > 0 ? p.formats[0].price : 0)
                        )}
                      </p>
                      <span className="text-[10px] text-gray-500">
                        {p.sku || (p.formats && p.formats.length > 0 ? p.formats[0].sku : '')}
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