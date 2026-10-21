'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X, SlidersHorizontal, ArrowUpDown, ChevronDown, Droplets, AlertCircle, Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { CatalogOilProduct, FilterState, SortOption } from './types';
import CatalogProductCard from './CatalogProductCard';
import CatalogSidebarFilters, { KNOWN_APPROVALS, FORMAT_OPTIONS } from './CatalogSidebarFilters';
import {
  normalizeAutomotiveQuery,
  extractViscosityFromQuery,
  createProductSearchEngine,
} from '@/lib/search-utils';

interface OilCatalogClientProps {
  initialProducts: CatalogOilProduct[];
  initialCategory?: string;
  initialQuery?: string;
}

export default function OilCatalogClient({
  initialProducts,
  initialCategory,
  initialQuery,
}: OilCatalogClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlQ = searchParams.get('q') || initialQuery || '';

  // Search input state (instant typing) + debounced query (for filtering)
  const [searchInput, setSearchInput] = useState(urlQ);
  const [debouncedSearch, setDebouncedSearch] = useState(urlQ);

  // Filter state
  const [filterState, setFilterState] = useState<FilterState>(() => {
    // If an initial category or query was passed via URL (e.g., /catalogo?categoria=5w-30 or ?categoria=bmw or ?q=5w-30)
    const initialViscosities: string[] = [];
    const initialApprovals: string[] = [];
    let initialSearch = urlQ;

    if (initialCategory) {
      const catLower = initialCategory.toLowerCase().trim();
      if (['5w-30', '5w-40', '10w-40', '0w-20', '0w-30'].includes(catLower)) {
        initialViscosities.push(catLower.toUpperCase());
      } else if (['porsche', 'bmw', 'mb', 'vw', 'ford', 'gm', 'racing'].includes(catLower)) {
        initialApprovals.push(catLower);
      } else if (!initialSearch) {
        initialSearch = initialCategory;
      }
    }

    return {
      searchQuery: initialSearch,
      viscosities: initialViscosities,
      formats: [],
      approvals: initialApprovals,
      sort: 'featured',
    };
  });

  // Mobile drawer open state
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Sync debounced search with 200ms delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setFilterState((prev) => ({ ...prev, searchQuery: searchInput.trim() }));
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

  // Extract all unique viscosities dynamically from the dataset
  const availableViscosities = useMemo(() => {
    const set = new Set<string>();
    initialProducts.forEach((p) => {
      if (p.viscosity) set.add(p.viscosity);
    });
    // Sort logically by SAE number
    return Array.from(set).sort((a, b) => {
      const getNum = (s: string) => {
        const parts = s.split('W-');
        return (parseInt(parts[0], 10) || 0) * 100 + (parseInt(parts[1], 10) || 0);
      };
      return getNum(a) - getNum(b);
    });
  }, [initialProducts]);

  // Toggle handlers
  const handleToggleViscosity = (visc: string) => {
    setFilterState((prev) => {
      const exists = prev.viscosities.includes(visc);
      return {
        ...prev,
        viscosities: exists
          ? prev.viscosities.filter((v) => v !== visc)
          : [...prev.viscosities, visc],
      };
    });
  };

  const handleToggleFormat = (fmt: string) => {
    setFilterState((prev) => {
      const exists = prev.formats.includes(fmt);
      return {
        ...prev,
        formats: exists
          ? prev.formats.filter((f) => f !== fmt)
          : [...prev.formats, fmt],
      };
    });
  };

  const handleToggleApproval = (apprId: string) => {
    setFilterState((prev) => {
      const exists = prev.approvals.includes(apprId);
      return {
        ...prev,
        approvals: exists
          ? prev.approvals.filter((a) => a !== apprId)
          : [...prev.approvals, apprId],
      };
    });
  };

  const fuseEngine = useMemo(() => {
    return createProductSearchEngine(initialProducts, [
      'name',
      'slug',
      'viscosity',
      'brand',
      'approvals',
      'description',
      'sku',
      'category',
    ]);
  }, [initialProducts]);

  const handleResetFilters = () => {
    setSearchInput('');
    setDebouncedSearch('');
    setFilterState({
      searchQuery: '',
      viscosities: [],
      formats: [],
      approvals: [],
      sort: 'featured',
    });
    // Remove query params from URL without reload
    if (searchParams.get('categoria') || searchParams.get('q')) {
      router.replace('/catalogo', { scroll: false });
    }
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterState((prev) => ({
      ...prev,
      sort: e.target.value as SortOption,
    }));
  };

  // Filtered & Sorted products pipeline with Intelligent Fuzzy Matching
  const { filteredProducts, fuzzyFeedback } = useMemo(() => {
    let result = [...initialProducts];
    let feedback: { original: string; normalized: string; viscosity?: string | null } | null = null;

    // 1. Text search filter
    if (debouncedSearch) {
      const extractedVisc = extractViscosityFromQuery(debouncedSearch);
      const cleanQuery = normalizeAutomotiveQuery(debouncedSearch);
      const isCasualViscosity = !!extractedVisc && debouncedSearch.toUpperCase().replace(/\s+/g, '') !== extractedVisc;

      if (isCasualViscosity) {
        // La consulta es una búsqueda casual de viscosidad (ej. "0 20", "5 30", "acete 5 30", "row 5w40")
        let matchedItems = result.filter(
          (p) => (p.viscosity || '').toUpperCase() === extractedVisc
        );

        // Si además incluye otros términos (ej: "row" -> "rowe")
        const remainingQuery = cleanQuery.replace(extractedVisc.toLowerCase(), '').trim();
        if (remainingQuery.length > 0) {
          const fuseResults = fuseEngine.search(cleanQuery);
          if (fuseResults.length > 0) {
            matchedItems = fuseResults.map((r) => r.item);
          }
        }

        result = matchedItems;
        feedback = {
          original: debouncedSearch,
          normalized: remainingQuery.length > 0 ? cleanQuery : extractedVisc,
          viscosity: extractedVisc,
        };
      } else {
        // Intento 1: Coincidencia exacta de subcadena
        const rawNormalized = debouncedSearch.toLowerCase().replace(/[-\s]/g, '');
        const exactMatches = result.filter((p) => {
          const normName = p.name.toLowerCase().replace(/[-\s]/g, '');
          const normVisc = (p.viscosity || '').toLowerCase().replace(/[-\s]/g, '');
          const normDesc = (p.description || '').toLowerCase().replace(/[-\s]/g, '');
          const normBrand = (p.brand || '').toLowerCase().replace(/[-\s]/g, '');
          const normSpecs = JSON.stringify(p.specs || '').toLowerCase().replace(/[-\s]/g, '');
          const normCompat = (p.compatibility || []).join(' ').toLowerCase().replace(/[-\s]/g, '');

          return (
            normName.includes(rawNormalized) ||
            normVisc.includes(rawNormalized) ||
            normDesc.includes(rawNormalized) ||
            normBrand.includes(rawNormalized) ||
            normSpecs.includes(rawNormalized) ||
            normCompat.includes(rawNormalized)
          );
        });

        if (exactMatches.length > 0) {
          result = exactMatches;
        } else {
          // Intento 2: Búsqueda difusa y normalización inteligente con Fuse.js
          const fuseResults = fuseEngine.search(cleanQuery);
          if (fuseResults.length > 0) {
            result = fuseResults.map((r) => r.item);
            feedback = {
              original: debouncedSearch,
              normalized: cleanQuery,
            };
          } else {
            result = [];
            if (cleanQuery !== debouncedSearch.toLowerCase().trim()) {
              feedback = {
                original: debouncedSearch,
                normalized: cleanQuery,
              };
            }
          }
        }
      }
    }

    // 2. Viscosity filter
    if (filterState.viscosities.length > 0) {
      result = result.filter((p) => filterState.viscosities.includes(p.viscosity));
    }

    // 3. Format / Capacity filter
    if (filterState.formats.length > 0) {
      result = result.filter((p) =>
        p.formats?.some((f) => filterState.formats.includes(f.size))
      );
    }

    // 4. Approvals / Brands filter
    if (filterState.approvals.length > 0) {
      result = result.filter((p) =>
        filterState.approvals.some((appr) => p.approvals?.includes(appr))
      );
    }

    // 5. Sorting
    result.sort((a, b) => {
      switch (filterState.sort) {
        case 'price-asc':
          return a.lowestPrice - b.lowestPrice;
        case 'price-desc':
          return b.lowestPrice - a.lowestPrice;
        case 'name-asc':
          return a.name.localeCompare(b.name, 'es');
        case 'name-desc':
          return b.name.localeCompare(a.name, 'es');
        case 'featured':
        default:
          // Featured products first, then preserving catalog sequence
          if (a.isFeatured && !b.isFeatured) return -1;
          if (!a.isFeatured && b.isFeatured) return 1;
          return 0;
      }
    });

    return { filteredProducts: result, fuzzyFeedback: feedback };
  }, [initialProducts, debouncedSearch, filterState, fuseEngine]);

  // Active filter count (excluding default sort)
  const totalActiveFilters =
    (debouncedSearch ? 1 : 0) +
    filterState.viscosities.length +
    filterState.formats.length +
    filterState.approvals.length;

  return (
    <div className="min-h-screen bg-slate-50/50 text-neutral-900 pt-28 sm:pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Encabezado Editorial Principal */}
        <div className="border-b border-neutral-200/80 pb-8 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-100 text-[#b3131b] text-[10px] font-mono font-bold uppercase tracking-wider mb-3 shadow-2xs">
              <Droplets className="w-3 h-3" />
              <span>CATÁLOGO OFICIAL · LUBRICANTES ALEMANES ROWE</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-neutral-900">
              Aceites y Fluidos
            </h1>
            <p className="text-sm text-neutral-500 mt-2 max-w-xl">
              Fluidos de motor 100% sintéticos y tecnología HC-Synthese con homologación oficial de los principales fabricantes europeos.
            </p>
          </div>

          {/* Botón de Apertura de Filtros en Móvil y Tablet */}
          <div className="flex items-center gap-3 lg:hidden">
            <button
              type="button"
              onClick={() => setIsMobileDrawerOpen(true)}
              className="inline-flex items-center gap-2 bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-900 font-bold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-2xs active:scale-95 cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#b3131b]" />
              <span>Filtros y Búsqueda</span>
              {totalActiveFilters > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#b3131b] text-white text-[11px] font-bold flex items-center justify-center">
                  {totalActiveFilters}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Layout Principal: Sidebar Sticky Izquierdo + Columna Derecha con Controles y Grilla */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* ========================================================
              COLUMNA IZQUIERDA: SIDEBAR DESKTOP (>= 1024px)
             ======================================================== */}
          <aside className="hidden lg:block w-64 shrink-0 bg-white border border-neutral-200/80 rounded-2xl p-5 shadow-xs sticky top-28 self-start">
            <CatalogSidebarFilters
              products={initialProducts}
              filterState={filterState}
              onToggleViscosity={handleToggleViscosity}
              onToggleFormat={handleToggleFormat}
              onToggleApproval={handleToggleApproval}
              onResetFilters={handleResetFilters}
              availableViscosities={availableViscosities}
            />
          </aside>

          {/* ========================================================
              COLUMNA DERECHA: BARRA DE BÚSQUEDA, ORDENACIÓN Y GRILLA
             ======================================================== */}
          <main className="flex-1 min-w-0 w-full space-y-6">
            
            {/* 1. Top Search & Controls Bar */}
            <div className="bg-white border border-neutral-200/80 rounded-2xl p-3 sm:p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Buscador en tiempo real */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Buscar por nombre, viscosidad (ej. 5W-30) u homologación..."
                  className="w-full bg-neutral-50 border border-neutral-200 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 text-neutral-900 placeholder:text-neutral-400 rounded-xl pl-10 pr-9 py-2.5 text-sm transition-all outline-none"
                  aria-label="Buscar aceites y fluidos"
                />
                {searchInput.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput('');
                      setDebouncedSearch('');
                      setFilterState((prev) => ({ ...prev, searchQuery: '' }));
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
              <div className="flex items-center gap-2 shrink-0">
                <div className="relative w-full sm:w-auto">
                  <select
                    value={filterState.sort}
                    onChange={handleSortChange}
                    className="w-full sm:w-auto appearance-none bg-white border border-neutral-200/90 hover:border-neutral-300 text-neutral-800 text-sm font-medium rounded-xl pl-3.5 pr-8 py-2.5 focus:outline-none focus:ring-1 focus:ring-neutral-900 shadow-2xs transition-all cursor-pointer"
                    aria-label="Ordenar productos por"
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
            </div>

            {/* 2. Barra de Estado de Filtros Activos y Conteo */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              {/* Contador */}
              <p className="text-xs text-neutral-500 font-medium">
                Mostrando <span className="font-bold text-neutral-900">{filteredProducts.length}</span> de{' '}
                <span className="font-bold text-neutral-900">{initialProducts.length}</span> aceites
              </p>

              {/* Pastillas de Filtros Activos */}
              {totalActiveFilters > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  {/* Búsqueda */}
                  {debouncedSearch && (
                    <span className="bg-neutral-100 text-neutral-800 border border-neutral-200 text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 font-medium shadow-2xs">
                      <span>Búsqueda: &ldquo;{debouncedSearch}&rdquo;</span>
                      <button
                        type="button"
                        onClick={() => {
                          setSearchInput('');
                          setDebouncedSearch('');
                          setFilterState((prev) => ({ ...prev, searchQuery: '' }));
                        }}
                        className="text-neutral-400 hover:text-neutral-900 cursor-pointer"
                        aria-label="Quitar filtro de búsqueda"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {/* Viscosidades */}
                  {filterState.viscosities.map((v) => (
                    <span
                      key={v}
                      className="bg-neutral-100 text-neutral-800 border border-neutral-200 text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 font-mono font-bold shadow-2xs"
                    >
                      <span>{v}</span>
                      <button
                        type="button"
                        onClick={() => handleToggleViscosity(v)}
                        className="text-neutral-400 hover:text-neutral-900 cursor-pointer"
                        aria-label={`Quitar filtro ${v}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}

                  {/* Formatos */}
                  {filterState.formats.map((f) => (
                    <span
                      key={f}
                      className="bg-neutral-100 text-neutral-800 border border-neutral-200 text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 font-medium shadow-2xs"
                    >
                      <span>{f}</span>
                      <button
                        type="button"
                        onClick={() => handleToggleFormat(f)}
                        className="text-neutral-400 hover:text-neutral-900 cursor-pointer"
                        aria-label={`Quitar filtro ${f}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}

                  {/* Homologaciones */}
                  {filterState.approvals.map((a) => {
                    const match = KNOWN_APPROVALS.find((k) => k.id === a);
                    return (
                      <span
                        key={a}
                        className="bg-neutral-100 text-neutral-800 border border-neutral-200 text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 font-medium shadow-2xs"
                      >
                        <span>{match?.label || a}</span>
                        <button
                          type="button"
                          onClick={() => handleToggleApproval(a)}
                          className="text-neutral-400 hover:text-neutral-900 cursor-pointer"
                          aria-label={`Quitar filtro ${match?.label || a}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    );
                  })}

                  {/* Botón Reset Todos */}
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="text-[#b3131b] hover:underline text-xs font-semibold pl-1.5 cursor-pointer"
                  >
                    Limpiar filtros
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
                  }}
                  className="text-amber-800 hover:text-amber-950 font-bold text-[11px] underline cursor-pointer shrink-0"
                >
                  Restablecer
                </button>
              </motion.div>
            )}

            {/* 3. Grilla de Productos con Animación Framer Motion */}
            {filteredProducts.length === 0 ? (
              /* Empty State */
              <div className="max-w-md mx-auto my-14 bg-white rounded-3xl border border-neutral-200/90 p-8 sm:p-10 text-center shadow-xs">
                <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto mb-4 border border-neutral-200/70">
                  <AlertCircle className="w-6 h-6 stroke-[1.8]" />
                </div>
                <h3 className="text-base font-bold text-neutral-900 mb-2">
                  No encontramos aceites que coincidan con tu búsqueda
                </h3>
                <p className="text-sm text-neutral-500 mb-6 max-w-sm mx-auto">
                  Prueba ajustando los términos de búsqueda o eliminando algunos filtros aplicados.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="bg-[#b3131b] hover:bg-[#8f0f15] text-white font-bold px-6 py-3 rounded-xl uppercase text-xs tracking-wider transition-all inline-block shadow-xs cursor-pointer active:scale-95"
                >
                  Limpiar filtros y ver todos
                </button>
              </div>
            ) : (
              <motion.div
                layout
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                <AnimatePresence mode="popLayout">
                  {filteredProducts.map((p) => (
                    <CatalogProductCard key={p.id} product={p} />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </main>
        </div>
      </div>

      {/* ========================================================
          OFF-CANVAS DRAWER MÓVIL / TABLET (< 1024px)
         ======================================================== */}
      <AnimatePresence>
        {isMobileDrawerOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
            {/* Backdrop con Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMobileDrawerOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs cursor-pointer"
            />

            {/* Panel Deslizable Bottom Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: '0%' }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative w-full bg-white rounded-t-3xl max-h-[85vh] flex flex-col shadow-2xl z-10"
            >
              {/* Handle visual de arrastre */}
              <div className="w-12 h-1.5 bg-neutral-200 rounded-full mx-auto mt-3 mb-1" />

              {/* Encabezado del Drawer */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#b3131b]" />
                  <h3 className="text-base font-bold text-neutral-900">
                    Filtros y Búsqueda
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  {totalActiveFilters > 0 && (
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="text-xs font-semibold text-[#b3131b] hover:underline"
                    >
                      Limpiar todo
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsMobileDrawerOpen(false)}
                    className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 transition-colors"
                    aria-label="Cerrar filtros"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Contenido Scrolleable de Filtros */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1">
                <CatalogSidebarFilters
                  products={initialProducts}
                  filterState={filterState}
                  onToggleViscosity={handleToggleViscosity}
                  onToggleFormat={handleToggleFormat}
                  onToggleApproval={handleToggleApproval}
                  onResetFilters={handleResetFilters}
                  availableViscosities={availableViscosities}
                />
              </div>

              {/* Footer con Botón Aplicar */}
              <div className="p-4 border-t border-neutral-100 bg-neutral-50/80">
                <button
                  type="button"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="w-full bg-[#b3131b] hover:bg-[#8f0f15] text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-sm active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Ver {filteredProducts.length} aceites</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
