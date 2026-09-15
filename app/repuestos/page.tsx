'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { STORE_CONFIG } from '@/config/constants';

export default function RepuestosPage() {
  const [repuestos, setRepuestos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRepuestos = async () => {
      try {
        const res = await fetch('/api/admin/products');
        if (res.ok) {
          const allProducts = await res.json();
          
          const soloRepuestos = allProducts.filter((p: any) => {
  const categoria = (p.category || '').toLowerCase().trim();
  // Excluye explícitamente los lubricantes o aceites, dejando todo lo demás para repuestos
  return categoria !== 'lubricantes' && categoria !== 'aceites';
});
          
          setRepuestos(soloRepuestos);
        }
      } catch (error) {
        console.error("Error al cargar repuestos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRepuestos();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500 font-bold">Cargando repuestos...</div>;
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ENCABEZADO DE SECCIÓN */}
        <div className="mb-12 border-b border-gray-200 pb-6 flex justify-between items-end">
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">Componentes de Alta Calidad</p>
            <h1 className="text-3xl font-bold uppercase tracking-tight">Catálogo de Repuestos</h1>
          </div>
          <p className="text-xs text-gray-500 hidden sm:block">
            {repuestos.length} {repuestos.length === 1 ? 'producto disponible' : 'productos disponibles'}
          </p>
        </div>

        {/* GRILLA DE PRODUCTOS ESTILO ACEITES */}
        {repuestos.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded border border-gray-200">
            <p className="text-sm text-gray-500 uppercase tracking-wider mb-2">No hay repuestos registrados</p>
            <p className="text-xs text-gray-400">Pronto agregaremos nuevos componentes al catálogo.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {repuestos.map((item: any) => (
              <Link 
  key={item.id} 
  href={`/productos/${item.id}`} // <--- Usamos el ID directamente, que siempre existe en la BD
  className="group border border-gray-200 rounded-sm bg-white hover:border-black transition flex flex-col justify-between overflow-hidden relative"
>
                <div>
                  {/* Etiqueta Venta Online superior derecha */}
                  <div className="absolute top-3 right-3 z-10">
                    <span className="bg-[#b3131b] text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider">
                      Venta Online
                    </span>
                  </div>

                  {/* Imagen */}
                  <div className="aspect-square relative bg-gray-50 flex items-center justify-center p-6">
                    <Image 
                      src={item.image || '/images/logo-rd.png'} 
                      alt={item.name} 
                      fill 
                      className="object-contain p-6 group-hover:scale-105 transition duration-300"
                    />
                  </div>

                  {/* Info de marca y categoría */}
                  <div className="p-6 pb-2">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">
                      {item.brand || 'Genérico'} - {item.category || 'General'}
                    </p>
                    <h3 className="font-bold text-gray-900 text-sm uppercase tracking-tight mb-4 line-clamp-2 group-hover:text-[#b3131b] transition leading-snug">
                      {item.name}
                    </h3>
                  </div>
                </div>
                
                {/* Pie de tarjeta con precio y SKU idéntico al catálogo de aceites */}
                <div className="px-6 pb-6 pt-4 border-t border-gray-100 flex items-end justify-between">
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Desde</span>
                    <span className="text-lg font-bold text-gray-900">
                      {STORE_CONFIG.CURRENCY_FORMAT.format(item.price || 0)}
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-400 font-mono">
                    {item.sku || 'N/A'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}