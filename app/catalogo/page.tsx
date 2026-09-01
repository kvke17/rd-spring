import Link from 'next/link';
import Image from 'next/image';
import productsData from '@/data/products.json';
import { Product } from '@/types';
import { STORE_CONFIG } from '@/config/constants';

export default async function CatalogoPage({ searchParams }: { searchParams: Promise<{ categoria?: string }> }) {
  const params = await searchParams;
  const categoriaQuery = params.categoria?.toLowerCase();
  const normalize = (s: string) => s.toLowerCase().replace(/[-\s]/g, '');
  let products = (productsData as Product[]).filter((p) => p.type === 'venta_online');

  if (categoriaQuery) {
    products = products.filter(
      (p) =>
        normalize(p.category).includes(normalize(categoriaQuery)) ||
        normalize(p.brand).includes(normalize(categoriaQuery)) ||
        p.vehicleBrands.some((vb) => normalize(vb).includes(normalize(categoriaQuery)))
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-white/10 pb-8 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-[#E88A5C] font-mono mb-2">
              {categoriaQuery ? `FILTRADO POR: ${categoriaQuery.toUpperCase()}` : 'CATÁLOGO OFICIAL'}
            </p>
            <h1 className="text-4xl font-bold uppercase tracking-tight">Componentes y Fluidos</h1>
          </div>
          {categoriaQuery && (
            <Link href="/catalogo" className="text-xs font-mono text-gray-500 hover:text-white underline underline-offset-4">
              Borrar filtros
            </Link>
          )}
        </div>

        {products.length === 0 ? (
          <p className="text-gray-400 font-mono text-sm">No se encontraron productos para esta categoría.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p) => (
              <div key={p.id} className="border border-white/10 bg-[#121212] flex flex-col group">
                
                {/* CONTENEDOR DE IMAGEN MODIFICADO PARA OCUPAR EL 100% */}
                <div className="aspect-square relative bg-[#0a0a0a] overflow-hidden group">
                  <span className={`absolute top-3 right-3 text-[9px] font-mono tracking-wider px-2 py-1 uppercase font-bold z-10 ${p.type === 'venta_online' ? 'bg-[#E88A5C] text-black' : 'border border-white/30 text-white bg-black/60 backdrop-blur-sm'}`}>
                    {p.type === 'venta_online' ? 'VENTA ONLINE' : 'COTIZACIÓN'}
                  </span>
                  
                  {/* Imagen Principal (Ocupa todo el recuadro con object-cover) */}
                  <Image 
                    src={p.image} 
                    alt={p.name} 
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                    className={`object-cover transition-all duration-500 ease-in-out ${
                      // Si tiene imagen hover, se oculta; si no, hace el scale original
                      p.imageHover ? 'group-hover:opacity-0' : 'group-hover:scale-105'
                    }`} 
                  />

                  {/* Imagen Secundaria (Hover) */}
                  {p.imageHover && (
                    <Image 
                      src={p.imageHover} 
                      alt={`${p.name} reverso`} 
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                      className="absolute inset-0 object-cover opacity-0 transition-opacity duration-500 ease-in-out group-hover:opacity-100" 
                    />
                  )}
                </div>
                
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-[10px] uppercase font-mono tracking-widest text-[#E88A5C] mb-1">{p.brand} · {p.category}</p>
                    <Link href={`/producto/${p.slug}`}>
                      <h3 className="text-sm font-bold text-white line-clamp-2 hover:text-[#E88A5C] transition">{p.name}</h3>
                    </Link>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between font-mono">
                    <span className="text-sm font-bold text-white">{STORE_CONFIG.CURRENCY_FORMAT.format(p.price)}</span>
                    <span className="text-[10px] text-gray-500">{p.sku}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}