'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { STORE_CONFIG } from '@/config/constants';
import {
  Wrench,
  Droplet,
  ShieldCheck,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Search,
  X,
  SlidersHorizontal,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  normalizeAutomotiveQuery,
  createProductSearchEngine,
} from '@/lib/search-utils';
import { isSparePart } from '@/lib/product-classification';

// Facet definitions
const CATEGORY_FACETS = [
  { id: 'amortiguadores', label: 'Amortiguadores' },
  { id: 'fuelles', label: 'Fuelles Neumáticos' },
  { id: 'compresores', label: 'Compresores' },
  { id: 'brazos', label: 'Brazos de Suspensión' },
  { id: 'bieletas', label: 'Bieletas' },
];

const BRAND_FACETS = [
  { id: 'Porsche', label: 'Porsche' },
  { id: 'BMW', label: 'BMW' },
  { id: 'Mercedes-Benz', label: 'Mercedes-Benz' },
  { id: 'Audi', label: 'Audi' },
  { id: 'Land Rover', label: 'Land Rover' },
  { id: 'VW', label: 'Volkswagen (VW)' },
];

const AVAILABILITY_FACETS = [
  { id: 'in_stock', label: 'En Stock' },
  { id: 'on_demand', label: 'A Pedido' },
];

type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';

function RepuestosContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlQ = searchParams.get('q') || '';

  const [repuestos, setRepuestos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [searchInput, setSearchInput] = useState(urlQ);
  const [debouncedSearch, setDebouncedSearch] = useState(urlQ);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('featured');

  // Mobile drawer state
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Sync if URL query param changes
  useEffect(() => {
    if (urlQ) {
      setSearchInput(urlQ);
      setDebouncedSearch(urlQ);
    }
  }, [urlQ]);

  // Sync debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, 200);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileDrawerOpen]);

  // Fetch products
  useEffect(() => {
    const fetchRepuestos = async () => {
      try {
        const res = await fetch('/api/admin/products');
        if (res.ok) {
          const allProducts = await res.json();
          // Exclusión estricta de aceites/lubricantes (solo repuestos físicos)
          const soloRepuestos = allProducts.filter((p: any) => isSparePart(p));
          setRepuestos(soloRepuestos);
        }
      } catch (error) {
        console.error('Error al cargar repuestos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRepuestos();
  }, []);

  // Helper matching functions
  const matchesCategory = (item: any, catId: string) => {
    const text = (
      (item.name || '') +
      ' ' +
      (item.category || '') +
      ' ' +
      (item.description || '')
    ).toLowerCase();

    switch (catId) {
      case 'amortiguadores':
        return text.includes('amortiguador') || text.includes('coilover') || text.includes('strut');
      case 'fuelles':
        return text.includes('fuelle') || text.includes('balon') || text.includes('balón') || text.includes('neumátic') || text.includes('air spring');
      case 'compresores':
        return text.includes('compresor') || text.includes('compressor');
      case 'brazos':
        return text.includes('brazo') || text.includes('control arm') || text.includes('parrilla');
      case 'bieletas':
        return text.includes('bieleta') || text.includes('estabilizadora') || text.includes('sway bar');
      default:
        return false;
    }
  };

  const matchesBrand = (item: any, brandId: string) => {
    const brandLower = brandId.toLowerCase();
    const itemBrand = (item.brand || '').toLowerCase();
    const fullText = (
      (item.name || '') +
      ' ' +
      (item.compatibility || '') +
      ' ' +
      (item.description || '')
    ).toLowerCase();

    if (brandLower === 'vw') {
      return itemBrand.includes('vw') || itemBrand.includes('volkswagen') || fullText.includes('vw') || fullText.includes('volkswagen');
    }
    return itemBrand.includes(brandLower) || fullText.includes(brandLower);
  };

  // Toggle handlers
  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const toggleBrand = (id: string) => {
    setSelectedBrands((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );
  };

  const toggleAvailability = (id: string) => {
    setSelectedAvailability((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const resetAllFilters = () => {
    setSearchInput('');
    setDebouncedSearch('');
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSelectedAvailability([]);
    setSortBy('featured');
    if (searchParams.get('q')) {
      router.replace('/repuestos', { scroll: false });
    }
  };

  const totalActiveFilters =
    (debouncedSearch ? 1 : 0) +
    selectedCategories.length +
    selectedBrands.length +
    selectedAvailability.length;

  const fuseEngine = useMemo(() => {
    return createProductSearchEngine(repuestos, [
      'name',
      'sku',
      'brand',
      'category',
      'description',
      'compatibility',
    ]);
  }, [repuestos]);

  // Filtered & sorted results with Intelligent Tolerant Matching
  const { filteredRepuestos, fuzzyFeedback } = useMemo(() => {
    let result = [...repuestos];
    let feedback: { original: string; normalized: string } | null = null;

    // 1. Search Query
    if (debouncedSearch) {
      const cleanQuery = normalizeAutomotiveQuery(debouncedSearch);
      const isQueryNormalized = cleanQuery !== debouncedSearch.toLowerCase().trim();

      // Intento 1: Coincidencia exacta de subcadena
      const rawNormalized = debouncedSearch.toLowerCase().replace(/[-\s]/g, '');
      const exactMatches = result.filter((item) => {
        const fullSearch = (
          (item.name || '') +
          ' ' +
          (item.sku || '') +
          ' ' +
          (item.category || '') +
          ' ' +
          (item.brand || '') +
          ' ' +
          (item.description || '') +
          ' ' +
          (item.compatibility || '')
        )
          .toLowerCase()
          .replace(/[-\s]/g, '');
        return fullSearch.includes(rawNormalized);
      });

      if (exactMatches.length > 0 && !isQueryNormalized) {
        result = exactMatches;
      } else {
        // Intento 2: Búsqueda difusa y normalización inteligente
        const fuseResults = fuseEngine.search(cleanQuery);
        if (fuseResults.length > 0) {
          result = fuseResults.map((r) => r.item);
          feedback = {
            original: debouncedSearch,
            normalized: cleanQuery,
          };
        } else {
          result = [];
          if (isQueryNormalized) {
            feedback = {
              original: debouncedSearch,
              normalized: cleanQuery,
            };
          }
        }
      }
    }

    // 2. Categories
    if (selectedCategories.length > 0) {
      result = result.filter((item) => {
        return selectedCategories.some((catId) => matchesCategory(item, catId));
      });
    }

    // 3. Brands
    if (selectedBrands.length > 0) {
      result = result.filter((item) => {
        return selectedBrands.some((brandId) => matchesBrand(item, brandId));
      });
    }

    // 4. Availability
    if (selectedAvailability.length > 0) {
      result = result.filter((item) => {
        const inStock = typeof item.stock === 'number' ? item.stock > 0 : false;
        const matchesInStock = selectedAvailability.includes('in_stock') && inStock;
        const matchesOnDemand = selectedAvailability.includes('on_demand') && !inStock;
        return matchesInStock || matchesOnDemand;
      });
    }

    // Sorting
    result.sort((a, b) => {
      const priceA = a.price || 0;
      const priceB = b.price || 0;
      const nameA = (a.name || '').toLowerCase();
      const nameB = (b.name || '').toLowerCase();

      switch (sortBy) {
        case 'price-asc':
          return priceA - priceB;
        case 'price-desc':
          return priceB - priceA;
        case 'name-asc':
          return nameA.localeCompare(nameB);
        case 'name-desc':
          return nameB.localeCompare(nameA);
        case 'featured':
        default:
          return 0;
      }
    });

    return { filteredRepuestos: result, fuzzyFeedback: feedback };
  }, [
    repuestos,
    debouncedSearch,
    selectedCategories,
    selectedBrands,
    selectedAvailability,
    sortBy,
    fuseEngine,
  ]);

  // Counts for facets
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    CATEGORY_FACETS.forEach((c) => {
      counts[c.id] = repuestos.filter((item) => matchesCategory(item, c.id)).length;
    });
    return counts;
  }, [repuestos]);

  const brandCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    BRAND_FACETS.forEach((b) => {
      counts[b.id] = repuestos.filter((item) => matchesBrand(item, b.id)).length;
    });
    return counts;
  }, [repuestos]);

  const availabilityCounts = useMemo(() => {
    const inStockCount = repuestos.filter(
      (item) => typeof item.stock === 'number' && item.stock > 0
    ).length;
    return {
      in_stock: inStockCount,
      on_demand: repuestos.length - inStockCount,
    };
  }, [repuestos]);

  // Reusable Sidebar Component
  const renderSidebarContent = () => (
    <div className="space-y-6">
      {/* Header con botón de reinicio */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-neutral-500" />
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-900">
            Filtros
          </span>
          {totalActiveFilters > 0 && (
            <span className="w-5 h-5 rounded-full bg-[#b3131b] text-white text-[10px] font-bold flex items-center justify-center">
              {totalActiveFilters}
            </span>
          )}
        </div>
        {totalActiveFilters > 0 && (
          <button
            type="button"
            onClick={resetAllFilters}
            className="text-[11px] font-semibold text-[#b3131b] hover:text-[#8f0f15] transition-colors flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Limpiar</span>
          </button>
        )}
      </div>

      {/* 1. Categoría */}
      <div className="space-y-3">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
          Categoría
        </h4>
        <div className="space-y-1.5">
          {CATEGORY_FACETS.map((facet) => {
            const isChecked = selectedCategories.includes(facet.id);
            const count = categoryCounts[facet.id] || 0;
            return (
              <label
                key={facet.id}
                className="flex items-center justify-between py-1 px-1.5 rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer group text-xs select-none"
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleCategory(facet.id)}
                    className="w-4 h-4 rounded border-neutral-300 text-[#b3131b] focus:ring-[#b3131b] focus:ring-offset-0 cursor-pointer accent-[#b3131b]"
                  />
                  <span
                    className={`font-medium transition-colors ${
                      isChecked
                        ? 'text-neutral-900 font-semibold'
                        : 'text-neutral-600 group-hover:text-neutral-900'
                    }`}
                  >
                    {facet.label}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-neutral-400">
                  ({count})
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* 2. Marca / Vehículo */}
      <div className="space-y-3 pt-3 border-t border-neutral-100">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
          Marca / Vehículo
        </h4>
        <div className="space-y-1.5">
          {BRAND_FACETS.map((facet) => {
            const isChecked = selectedBrands.includes(facet.id);
            const count = brandCounts[facet.id] || 0;
            return (
              <label
                key={facet.id}
                className="flex items-center justify-between py-1 px-1.5 rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer group text-xs select-none"
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleBrand(facet.id)}
                    className="w-4 h-4 rounded border-neutral-300 text-[#b3131b] focus:ring-[#b3131b] focus:ring-offset-0 cursor-pointer accent-[#b3131b]"
                  />
                  <span
                    className={`font-medium transition-colors ${
                      isChecked
                        ? 'text-neutral-900 font-semibold'
                        : 'text-neutral-600 group-hover:text-neutral-900'
                    }`}
                  >
                    {facet.label}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-neutral-400">
                  ({count})
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* 3. Disponibilidad */}
      <div className="space-y-3 pt-3 border-t border-neutral-100">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
          Disponibilidad
        </h4>
        <div className="space-y-1.5">
          {AVAILABILITY_FACETS.map((facet) => {
            const isChecked = selectedAvailability.includes(facet.id);
            const count =
              facet.id === 'in_stock'
                ? availabilityCounts.in_stock
                : availabilityCounts.on_demand;
            return (
              <label
                key={facet.id}
                className="flex items-center justify-between py-1 px-1.5 rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer group text-xs select-none"
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleAvailability(facet.id)}
                    className="w-4 h-4 rounded border-neutral-300 text-[#b3131b] focus:ring-[#b3131b] focus:ring-offset-0 cursor-pointer accent-[#b3131b]"
                  />
                  <span
                    className={`font-medium transition-colors ${
                      isChecked
                        ? 'text-neutral-900 font-semibold'
                        : 'text-neutral-600 group-hover:text-neutral-900'
                    }`}
                  >
                    {facet.label}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-neutral-400">
                  ({count})
                </span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 text-gray-900 pt-28 sm:pt-32 pb-24 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ========================================================
            ENCABEZADO EDITORIAL DEL CATÁLOGO (ALINEADO A ACEITES)
           ======================================================== */}
        <div className="border-b border-neutral-200/80 pb-8 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-100 text-[#b3131b] text-[10px] font-mono font-bold uppercase tracking-wider mb-3">
              <Wrench className="w-3.5 h-3.5" />
              <span>SUSPENSIÓN, FRENOS Y TREN MOTRIZ · COMPONENTES OEM</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-neutral-900">
              Catálogo de Repuestos
            </h1>
            <p className="text-sm text-neutral-500 mt-2 max-w-xl font-medium">
              Repuestos de alta gama y componentes de equipo original homologados para Porsche, BMW, Audi, Mercedes-Benz y Land Rover.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Botón Filtros Mobile (< 1024px) */}
            <button
              type="button"
              onClick={() => setIsMobileDrawerOpen(true)}
              className="lg:hidden inline-flex items-center gap-2 bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-900 font-bold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-2xs active:scale-95 cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#b3131b]" />
              <span>Filtros</span>
              {totalActiveFilters > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#b3131b] text-white text-[11px] font-bold flex items-center justify-center">
                  {totalActiveFilters}
                </span>
              )}
            </button>

            <Link
              href="/cotizacion"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#b3131b] hover:bg-[#8f0f15] px-4 py-2.5 rounded-xl shadow-xs transition-colors uppercase tracking-wider"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Cotizar con VIN
            </Link>
          </div>
        </div>

        {/* ========================================================
            LAYOUT PRINCIPAL: SIDEBAR IZQUIERDA + GRILLA DERECHA
           ======================================================== */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* ========================================================
              COLUMNA IZQUIERDA: SIDEBAR DESKTOP (>= 1024px)
             ======================================================== */}
          <aside className="hidden lg:block w-64 shrink-0 bg-white border border-neutral-200/80 rounded-2xl p-5 shadow-sm sticky top-28 self-start">
            {renderSidebarContent()}
          </aside>

          {/* ========================================================
              COLUMNA DERECHA: BARRA DE BÚSQUEDA, ORDENACIÓN Y GRILLA
             ======================================================== */}
          <main className="flex-1 min-w-0 w-full space-y-6">
            
            {/* 1. Top Search & Controls Bar */}
            <div className="bg-white border border-neutral-200/80 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-sm">
              {/* Buscador en tiempo real */}
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Buscar por nombre, marca o especificación OEM..."
                  className="bg-neutral-50/70 border border-neutral-200 text-neutral-900 rounded-xl pl-10 pr-9 py-2.5 w-full text-sm outline-none focus:ring-1 focus:ring-neutral-900 placeholder:text-neutral-400 transition-all"
                  aria-label="Buscar repuestos de suspensión"
                />
                {searchInput.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput('');
                      setDebouncedSearch('');
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-900 transition-colors cursor-pointer"
                    title="Limpiar búsqueda"
                    aria-label="Limpiar búsqueda"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Selector de Ordenamiento */}
              <div className="relative w-full sm:w-auto shrink-0">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="w-full sm:w-auto appearance-none bg-white border border-neutral-200/90 hover:border-neutral-300 text-neutral-800 text-sm font-medium rounded-xl pl-3.5 pr-8 py-2.5 focus:outline-none focus:ring-1 focus:ring-neutral-900 shadow-2xs transition-all cursor-pointer"
                  aria-label="Ordenar repuestos por"
                >
                  <option value="featured">Destacados / Recomendados</option>
                  <option value="price-asc">Precio: Menor a Mayor</option>
                  <option value="price-desc">Precio: Mayor a Menor</option>
                  <option value="name-asc">Nombre: A – Z</option>
                  <option value="name-desc">Nombre: Z – A</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
              </div>
            </div>

            {/* 2. Barra de Estado de Filtros Activos y Conteo */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              {/* Contador */}
              <p className="text-xs text-neutral-500 font-medium">
                Mostrando <span className="font-bold text-neutral-900">{filteredRepuestos.length}</span> de{' '}
                <span className="font-bold text-neutral-900">{repuestos.length}</span> repuestos
              </p>

              {/* Pastillas de Filtros Activos */}
              {totalActiveFilters > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  {debouncedSearch && (
                    <span className="bg-neutral-100 text-neutral-800 border border-neutral-200 text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 font-medium shadow-2xs">
                      <span>Búsqueda: &ldquo;{debouncedSearch}&rdquo;</span>
                      <button
                        type="button"
                        onClick={() => {
                          setSearchInput('');
                          setDebouncedSearch('');
                        }}
                        className="text-neutral-400 hover:text-neutral-900 cursor-pointer"
                        aria-label="Quitar filtro de búsqueda"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {selectedCategories.map((catId) => {
                    const facet = CATEGORY_FACETS.find((c) => c.id === catId);
                    return (
                      <span
                        key={catId}
                        className="bg-neutral-100 text-neutral-800 border border-neutral-200 text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 font-medium shadow-2xs"
                      >
                        <span>{facet?.label || catId}</span>
                        <button
                          type="button"
                          onClick={() => toggleCategory(catId)}
                          className="text-neutral-400 hover:text-neutral-900 cursor-pointer"
                          aria-label={`Quitar categoría ${facet?.label}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    );
                  })}

                  {selectedBrands.map((brandId) => {
                    const facet = BRAND_FACETS.find((b) => b.id === brandId);
                    return (
                      <span
                        key={brandId}
                        className="bg-neutral-100 text-neutral-800 border border-neutral-200 text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 font-medium shadow-2xs"
                      >
                        <span>{facet?.label || brandId}</span>
                        <button
                          type="button"
                          onClick={() => toggleBrand(brandId)}
                          className="text-neutral-400 hover:text-neutral-900 cursor-pointer"
                          aria-label={`Quitar marca ${facet?.label}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    );
                  })}

                  {selectedAvailability.map((availId) => {
                    const facet = AVAILABILITY_FACETS.find((a) => a.id === availId);
                    return (
                      <span
                        key={availId}
                        className="bg-neutral-100 text-neutral-800 border border-neutral-200 text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 font-medium shadow-2xs"
                      >
                        <span>{facet?.label || availId}</span>
                        <button
                          type="button"
                          onClick={() => toggleAvailability(availId)}
                          className="text-neutral-400 hover:text-neutral-900 cursor-pointer"
                          aria-label={`Quitar filtro ${facet?.label}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    );
                  })}

                  <button
                    type="button"
                    onClick={resetAllFilters}
                    className="text-xs text-[#b3131b] hover:underline font-semibold ml-1 cursor-pointer"
                  >
                    Limpiar todo
                  </button>
                </div>
              )}
            </div>

            {/* Aviso de Corrección Tolerante / Búsqueda Difusa */}
            {fuzzyFeedback && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-amber-50/90 border border-amber-200/90 text-amber-900 rounded-xl px-4 py-3 text-xs flex items-center justify-between gap-3 shadow-2xs"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    Mostrando resultados para <strong>&ldquo;{fuzzyFeedback.normalized}&rdquo;</strong> (búsqueda: <em>&ldquo;{fuzzyFeedback.original}&rdquo;</em>)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput('');
                    setDebouncedSearch('');
                    if (searchParams.get('q')) {
                      router.replace('/repuestos', { scroll: false });
                    }
                  }}
                  className="text-amber-800 hover:text-amber-950 font-bold text-[11px] underline cursor-pointer shrink-0"
                >
                  Restablecer
                </button>
              </motion.div>
            )}

            {/* 3. Contenido: Cargando, Grilla de Productos o Empty State */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="rounded-3xl border border-neutral-200/80 bg-white p-6 animate-pulse space-y-4"
                  >
                    <div className="aspect-[4/3] bg-neutral-100 rounded-2xl w-full" />
                    <div className="h-4 bg-neutral-100 rounded w-1/3" />
                    <div className="h-5 bg-neutral-100 rounded w-4/5" />
                    <div className="h-8 bg-neutral-100 rounded w-full mt-4" />
                  </div>
                ))}
              </div>
            ) : filteredRepuestos.length === 0 ? (
              /* ========================================================
                  GRACEFUL EMPTY STATE (CERO REPUESTOS)
                 ======================================================== */
              <div className="rounded-3xl border border-neutral-200/80 bg-white p-12 sm:p-16 text-center shadow-xs flex flex-col items-center justify-center my-4">
                <div className="text-[#b3131b] bg-red-50 p-4 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-4">
                  <Wrench className="w-7 h-7" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-neutral-900 mb-2">
                  No se encontraron repuestos
                </h3>
                <p className="text-sm text-neutral-500 max-w-md mx-auto mb-6 font-medium">
                  {totalActiveFilters > 0
                    ? 'No hay componentes que coincidan con los filtros aplicados. Prueba modificando tus términos de búsqueda o limpiando los filtros.'
                    : 'Pronto agregaremos nuevos componentes a este catálogo.'}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <Link
                    href="/cotizacion"
                    className="bg-[#b3131b] hover:bg-[#900f15] text-white font-medium rounded-xl px-6 py-2.5 text-sm transition-colors shadow-xs inline-flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>COTIZAR CON VIN</span>
                  </Link>
                  {totalActiveFilters > 0 && (
                    <button
                      type="button"
                      onClick={resetAllFilters}
                      className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-medium rounded-xl px-5 py-2.5 text-sm transition-colors cursor-pointer"
                    >
                      Limpiar filtros
                    </button>
                  )}
                  {(debouncedSearch || searchInput) && (
                    <Link
                      href={`/catalogo?q=${encodeURIComponent(debouncedSearch || searchInput)}`}
                      className="bg-neutral-900 hover:bg-black text-white font-medium rounded-xl px-5 py-2.5 text-sm transition-colors shadow-xs inline-flex items-center gap-2 cursor-pointer"
                    >
                      <Droplet className="w-4 h-4 text-[#b3131b]" />
                      <span>Buscar en Aceites ROWE</span>
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              /* ========================================================
                  GRILLA DE PRODUCTOS
                 ======================================================== */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRepuestos.map((item: any) => {
                  const inStock = typeof item.stock === 'number' ? item.stock > 0 : false;
                  const stockQty = typeof item.stock === 'number' ? item.stock : 0;

                  return (
                    <Link
                      key={item.id}
                      href={
                        inStock
                          ? `/productos/${item.id}`
                          : `/cotizacion?repuesto=${encodeURIComponent(item.name || '')}`
                      }
                      className="group rounded-3xl border border-neutral-200/80 bg-white hover:border-neutral-300 hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden relative cursor-pointer"
                    >
                      <div>
                        {/* Badge superior: Estado de Stock Condicional */}
                        <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-1.5">
                          {inStock ? (
                            <div className="flex items-center gap-1.5">
                              <span className="bg-emerald-50 border border-emerald-200/90 text-emerald-700 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-2xs flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                En stock ({stockQty} disp.)
                              </span>
                              <span className="bg-[#b3131b] text-white text-[10px] font-mono font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-sm">
                                Venta Online
                              </span>
                            </div>
                          ) : (
                            <span className="bg-neutral-100 border border-neutral-200/90 text-neutral-600 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-2xs flex items-center gap-1">
                              <AlertCircle className="w-3 h-3 text-neutral-400" />
                              Sin stock / A pedido
                            </span>
                          )}
                        </div>

                        {/* Imagen del repuesto */}
                        <div className="relative aspect-[4/3] bg-gradient-to-b from-neutral-50 to-white flex items-center justify-center p-6 border-b border-neutral-100 overflow-hidden">
                          <Image
                            src={item.image || '/images/logo-rd.png'}
                            alt={item.name}
                            fill
                            className="object-contain p-6 group-hover:scale-105 transition duration-500"
                          />
                        </div>

                        {/* Información del repuesto */}
                        <div className="p-5 pb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] font-mono uppercase tracking-widest text-[#b3131b] font-bold bg-red-50 px-2 py-0.5 rounded-md">
                              {item.brand || 'OEM'}
                            </span>
                            <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-medium">
                              {item.category || 'Repuestos'}
                            </span>
                          </div>
                          <h3 className="font-bold text-neutral-900 text-sm sm:text-base leading-snug line-clamp-2 group-hover:text-[#b3131b] transition-colors mb-2">
                            {item.name}
                          </h3>
                        </div>
                      </div>

                      {/* Pie de tarjeta con gestión de Stock Condicional */}
                      <div className="p-5 pt-3 border-t border-neutral-100 flex items-end justify-between bg-neutral-50/40">
                        <div>
                          <span className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-0.5">
                            Precio
                          </span>
                          <span className="text-lg sm:text-xl font-black text-neutral-900">
                            {STORE_CONFIG.CURRENCY_FORMAT.format(item.price || 0)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-neutral-400 bg-white px-2 py-1 rounded-md border border-neutral-200">
                            {item.sku || 'REF'}
                          </span>
                          {inStock ? (
                            <div className="w-8 h-8 rounded-full bg-neutral-100 group-hover:bg-[#b3131b] group-hover:text-white flex items-center justify-center text-neutral-600 transition-colors shadow-2xs">
                              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#b3131b] bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-xl transition-colors shadow-2xs">
                              <Sparkles className="w-3 h-3" />
                              Cotizar VIN
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </main>
        </div>

        {/* ========================================================
            DRAWER / SHEET DE FILTROS EN DISPOSITIVOS MÓVILES (< 1024px)
           ======================================================== */}
        {isMobileDrawerOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
              onClick={() => setIsMobileDrawerOpen(false)}
            />

            {/* Panel lateral deslizante */}
            <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-white shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
              <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#b3131b]" />
                  <span className="text-sm font-bold uppercase tracking-wider text-neutral-900">
                    Filtros de Repuestos
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
                  aria-label="Cerrar panel de filtros"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 overflow-y-auto flex-1">
                {renderSidebarContent()}
              </div>

              <div className="p-4 border-t border-neutral-100 bg-neutral-50 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="w-full bg-[#b3131b] hover:bg-[#8f0f15] text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider shadow-sm transition-colors text-center"
                >
                  Ver {filteredRepuestos.length} repuestos
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            BANNER REASSURANCE INFERIOR
           ======================================================== */}
        <div className="mt-16 bg-white rounded-3xl border border-neutral-200/80 p-8 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#b3131b] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-neutral-900">Garantía Certificada</h4>
              <p className="text-xs text-neutral-500">1 año de garantía contra defectos de fábrica.</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#b3131b] flex items-center justify-center shrink-0">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-neutral-900">Compatibilidad por VIN</h4>
              <p className="text-xs text-neutral-500">Verificamos el número de chasis antes del despacho.</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#b3131b] flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-neutral-900">Importación Directa</h4>
              <p className="text-xs text-neutral-500">Piezas originales traídas directamente desde la UE.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function RepuestosPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-neutral-50/50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto animate-pulse space-y-6">
            <div className="h-10 bg-neutral-200/70 rounded-xl w-1/3" />
            <div className="h-6 bg-neutral-200/50 rounded-lg w-1/2" />
            <div className="h-64 bg-neutral-200/40 rounded-3xl" />
          </div>
        </div>
      }
    >
      <RepuestosContent />
    </Suspense>
  );
}