'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { STORE_CONFIG } from '@/config/constants';
import { Wrench, Search, ShieldCheck, ChevronRight, Sparkles, Filter } from 'lucide-react';

export default function RepuestosPage() {
  const [repuestos, setRepuestos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('ALL');

  useEffect(() => {
    const fetchRepuestos = async () => {
      try {
        const res = await fetch('/api/admin/products');
        if (res.ok) {
          const allProducts = await res.json();
          
          const soloRepuestos = allProducts.filter((p: any) => {
            const categoria = (p.category || '').toLowerCase().trim();
            // Excluye explícitamente los lubricantes o aceites
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

  // Extraer marcas únicas
  const availableBrands = useMemo(() => {
    const brands = new Set<string>();
    repuestos.forEach((r) => {
      if (r.brand && r.brand.trim()) brands.add(r.brand.trim());
    });
    return Array.from(brands).sort();
  }, [repuestos]);

  // Filtrar por texto y marca
  const filteredRepuestos = useMemo(() => {
    return repuestos.filter((item) => {
      const matchesSearch = 
        !searchQuery ||
        (item.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.sku || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.category || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesBrand = selectedBrand === 'ALL' || item.brand === selectedBrand;

      return matchesSearch && matchesBrand;
    });
  }, [repuestos, searchQuery, selectedBrand]);

  return (
    <div className="min-h-screen bg-slate-50/50 text-gray-900 pt-28 sm:pt-32 pb-24 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Encabezado Principal */}
        <div className="border-b border-slate-200/80 pb-8 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-100 text-[#b3131b] text-[10px] font-mono font-bold uppercase tracking-wider mb-3">
              <Wrench className="w-3.5 h-3.5" />
              <span>SUSPENSIÓN, FRENOS Y TREN MOTRIZ · COMPONENTES OEM</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-gray-900">
              Catálogo de Repuestos
            </h1>
            <p className="text-sm text-slate-500 mt-2 max-w-xl font-medium">
              Repuestos de alta gama y componentes de equipo original homologados para Porsche, BMW, Audi, Mercedes-Benz y Land Rover.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-600 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs">
              {filteredRepuestos.length} {filteredRepuestos.length === 1 ? 'componente' : 'componentes'}
            </span>
            <Link 
              href="/cotizacion" 
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#b3131b] hover:bg-[#8f0f15] px-4 py-2 rounded-xl shadow-xs transition-colors uppercase tracking-wider"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Cotizar con VIN
            </Link>
          </div>
        </div>

        {/* Barra de Filtros y Búsqueda */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 mb-8 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input 
              type="text"
              placeholder="Buscar por nombre, SKU o categoría..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50/80 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#b3131b] focus:bg-white transition-all"
            />
          </div>

          {availableBrands.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto no-scrollbar py-1">
              <span className="text-[11px] font-mono uppercase text-slate-400 font-bold flex items-center gap-1 pl-1">
                <Filter className="w-3 h-3" /> Marca:
              </span>
              <button
                onClick={() => setSelectedBrand('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  selectedBrand === 'ALL'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Todas
              </button>
              {availableBrands.map((b) => (
                <button
                  key={b}
                  onClick={() => setSelectedBrand(b)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                    selectedBrand === b
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* CONTENIDO PRINCIPAL */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="rounded-3xl border border-slate-200/80 bg-white p-6 animate-pulse space-y-4">
                <div className="aspect-[4/3] bg-slate-100 rounded-2xl w-full" />
                <div className="h-4 bg-slate-100 rounded w-1/3" />
                <div className="h-5 bg-slate-100 rounded w-4/5" />
                <div className="h-8 bg-slate-100 rounded w-full mt-4" />
              </div>
            ))}
          </div>
        ) : filteredRepuestos.length === 0 ? (
          <div className="max-w-md mx-auto my-16 bg-white rounded-3xl border border-slate-200/80 p-10 text-center shadow-sm">
            <div className="w-12 h-12 bg-red-50 text-[#b3131b] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Wrench className="w-6 h-6" />
            </div>
            <p className="text-base font-bold text-gray-900 mb-2">No se encontraron repuestos</p>
            <p className="text-sm text-slate-500 mb-6 font-medium">
              {searchQuery || selectedBrand !== 'ALL'
                ? 'Prueba modificando tus términos de búsqueda o filtros.'
                : 'Pronto agregaremos nuevos componentes a este catálogo.'}
            </p>
            {(searchQuery || selectedBrand !== 'ALL') ? (
              <button 
                onClick={() => { setSearchQuery(''); setSelectedBrand('ALL'); }}
                className="bg-slate-900 hover:bg-black text-white font-bold px-6 py-2.5 rounded-xl uppercase text-xs tracking-wider transition-colors inline-block"
              >
                Limpiar filtros
              </button>
            ) : (
              <Link 
                href="/cotizacion" 
                className="bg-[#b3131b] hover:bg-[#8f0f15] text-white font-bold px-6 py-3 rounded-xl uppercase text-xs tracking-wider transition-colors inline-block shadow-sm"
              >
                Cotizar con VIN
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredRepuestos.map((item: any) => (
              <Link 
                key={item.id} 
                href={`/productos/${item.id}`}
                className="group rounded-3xl border border-slate-200/80 bg-white hover:border-slate-300 gpu-shadow-hover hover:-translate-y-1.5 transition-transform duration-300 flex flex-col justify-between overflow-hidden relative"
              >
                <div>
                  {/* Badge superior */}
                  <div className="absolute top-4 right-4 z-10 flex gap-2">
                    <span className="bg-[#b3131b] text-white text-[10px] font-mono font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                      Venta Online
                    </span>
                  </div>

                  {/* Imagen del repuesto */}
                  <div className="relative aspect-[4/3] bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-6 border-b border-slate-100/80 overflow-hidden">
                    <Image 
                      src={item.image || '/images/logo-rd.png'} 
                      alt={item.name} 
                      fill 
                      className="object-contain p-6 group-hover:scale-105 transition duration-500"
                    />
                  </div>

                  {/* Información del repuesto */}
                  <div className="p-6 pb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#b3131b] font-bold bg-red-50 px-2 py-0.5 rounded-md">
                        {item.brand || 'OEM'}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                        {item.category || 'Repuestos'}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-2 group-hover:text-[#b3131b] transition-colors mb-2">
                      {item.name}
                    </h3>
                  </div>
                </div>
                
                {/* Pie de tarjeta */}
                <div className="p-6 pt-4 border-t border-slate-100 flex items-end justify-between bg-slate-50/30">
                  <div>
                    <span className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-0.5">Precio</span>
                    <span className="text-xl font-black text-gray-900">
                      {STORE_CONFIG.CURRENCY_FORMAT.format(item.price || 0)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-400 bg-white px-2 py-1 rounded-md border border-slate-200">
                      {item.sku || 'REF'}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-[#b3131b] group-hover:text-white flex items-center justify-center text-slate-600 transition-colors shadow-2xs">
                      <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Banner Reassurance inferior */}
        <div className="mt-16 bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#b3131b] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900">Garantía Certificada</h4>
              <p className="text-xs text-slate-500">1 año de garantía contra defectos de fábrica.</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#b3131b] flex items-center justify-center shrink-0">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900">Compatibilidad por VIN</h4>
              <p className="text-xs text-slate-500">Verificamos el número de chasis antes del despacho.</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#b3131b] flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900">Importación Directa</h4>
              <p className="text-xs text-slate-500">Piezas originales traídas directamente desde la UE.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}