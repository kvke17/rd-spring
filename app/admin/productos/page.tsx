"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import Image from "next/image";
import Link from "next/link"; 
import { useSearchParams, useRouter } from "next/navigation";
import Swal from 'sweetalert2';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Package, 
  Search, 
  LayoutGrid, 
  List, 
  Wrench, 
  Droplet,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  X
} from 'lucide-react';
import { isOilOrLubricant, isSparePart } from '@/lib/product-classification';

function ProductosContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'aceites' ? 'aceites' : 'repuestos';
  
  const [productos, setProductos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'repuestos' | 'aceites'>(initialTab);
  const [viewMode, setViewMode] = useState<'gallery' | 'table'>('gallery');
  const [searchQuery, setSearchQuery] = useState('');

  // Sincronizar tab si cambia el search param
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'aceites') {
      setActiveTab('aceites');
    } else if (tabParam === 'repuestos') {
      setActiveTab('repuestos');
    }
  }, [searchParams]);

  useEffect(() => {
    const cargarProductos = async () => {
      try {
        const res = await fetch("/api/admin/products");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setProductos(data);
          }
        }
      } catch (error) {
        console.error("Error al cargar productos:", error);
      } finally {
        setLoading(false);
      }
    };
    cargarProductos();
  }, []);

  const handleEliminar = (id: string, nombre: string) => {
    Swal.fire({
      title: '¿Eliminar producto?',
      text: `Se eliminará "${nombre}" permanentemente del catálogo.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#b3131b',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'rounded-2xl border border-neutral-200/80 shadow-2xl backdrop-blur-xl',
        confirmButton: 'rounded-xl font-bold uppercase text-xs tracking-wider px-5 py-3 shadow-sm',
        cancelButton: 'rounded-xl font-bold uppercase text-xs tracking-wider px-5 py-3',
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`/api/admin/products/${id}`, {
            method: 'DELETE',
          });

          if (res.ok) {
            Swal.fire({
              title: '¡Eliminado!',
              text: 'El producto ha sido eliminado.',
              icon: 'success',
              confirmButtonColor: '#b3131b',
            });
            setProductos((prev) => prev.filter(p => p.id !== id));
          } else {
            Swal.fire('Error', 'No se pudo eliminar el producto.', 'error');
          }
        } catch {
          Swal.fire('Error', 'Problema de conexión con la base de datos.', 'error');
        }
      }
    });
  };

  // Separación estricta sin ningún traslape
  const repuestosList = useMemo(() => {
    return productos.filter((p) => isSparePart(p));
  }, [productos]);

  const aceitesList = useMemo(() => {
    return productos.filter((p) => isOilOrLubricant(p));
  }, [productos]);

  // Lista según la pestaña activa
  const currentTabList = activeTab === 'repuestos' ? repuestosList : aceitesList;

  // Filtrado por buscador
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return currentTabList;
    const q = searchQuery.toLowerCase().trim();
    return currentTabList.filter((p) =>
      p.name.toLowerCase().includes(q) ||
      (p.sku || '').toLowerCase().includes(q) ||
      (p.brand || '').toLowerCase().includes(q) ||
      (p.category || '').toLowerCase().includes(q)
    );
  }, [currentTabList, searchQuery]);

  const formatCLP = (val: number) => {
    return '$' + Math.round(val).toLocaleString('es-CL');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-neutral-200/90 rounded-2xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#b3131b] text-white text-[10px] font-mono font-bold uppercase tracking-wider">
              Catálogo Oficial
            </span>
            <span className="text-xs text-neutral-500 font-mono">
              {productos.length} referencias totales
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
            Gestión de Catálogo
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Inventario físico de repuestos de alta gama y fluidos ROWE bajo pedido
          </p>
        </div>
        
        <Link 
          href="/admin/productos/nuevo"
          className="inline-flex items-center gap-2 bg-[#b3131b] hover:bg-[#8f0f15] text-white font-bold text-xs uppercase tracking-wider py-3 px-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Nuevo Producto</span>
        </Link>
      </div>

      {/* Barra de Controles: Selector de Sección (Repuestos / Aceites) + Vistas (Galería / Tabla) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Pestañas Segmentadas: Repuestos vs Aceites */}
        <div className="flex items-center bg-white p-1 rounded-2xl border border-neutral-200/90 shadow-sm text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setActiveTab('repuestos');
              router.replace('/admin/productos?tab=repuestos');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'repuestos'
                ? 'bg-[#b3131b] text-white shadow-xs font-bold'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Repuestos ({repuestosList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('aceites');
              router.replace('/admin/productos?tab=aceites');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'aceites'
                ? 'bg-[#b3131b] text-white shadow-xs font-bold'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
            }`}
          >
            <Droplet className="w-4 h-4" />
            <span>Aceites ROWE ({aceitesList.length})</span>
          </button>
        </div>

        {/* Buscador y Toggle de Vista (Galería / Tabla) */}
        <div className="flex items-center gap-3">
          {/* Buscador */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={`Buscar en ${activeTab === 'repuestos' ? 'repuestos' : 'aceites'}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-white border border-neutral-200/90 rounded-xl text-xs font-medium text-neutral-900 outline-none focus:border-[#b3131b] shadow-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Toggle Galería / Tabla */}
          <div className="flex items-center bg-white p-1 rounded-xl border border-neutral-200/90 shadow-xs">
            <button
              type="button"
              onClick={() => setViewMode('gallery')}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'gallery'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
              title="Vista Galería"
              aria-label="Vista Galería"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
              title="Vista Tabla"
              aria-label="Vista Tabla"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* Nota Operativa de la Sección */}
      <div className="p-3.5 rounded-xl bg-neutral-100/70 border border-neutral-200/80 flex items-center justify-between text-xs text-neutral-600">
        <div className="flex items-center gap-2">
          {activeTab === 'repuestos' ? (
            <>
              <Wrench className="w-4 h-4 text-[#b3131b]" />
              <span>
                Mostrando <strong className="text-neutral-900">Repuestos físicos</strong> con control de stock propio en inventario.
              </span>
            </>
          ) : (
            <>
              <Droplet className="w-4 h-4 text-blue-600" />
              <span>
                Mostrando <strong className="text-neutral-900">Aceites y Lubricantes ROWE</strong> gestionados bajo pedido (sin stock físico propio).
              </span>
            </>
          )}
        </div>
        <span className="font-mono text-[11px] text-neutral-500">
          {filteredProducts.length} items
        </span>
      </div>

      {/* VISTA 1: ESTILO GALERÍA (GALLERY CARDS) */}
      {viewMode === 'gallery' && (
        <>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white border border-neutral-200 rounded-2xl p-4 space-y-3 animate-pulse">
                  <div className="w-full aspect-square bg-neutral-100 rounded-xl" />
                  <div className="h-4 bg-neutral-100 rounded w-3/4" />
                  <div className="h-3 bg-neutral-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-neutral-200/90 p-12 text-center text-xs text-neutral-500 space-y-2">
              <Package className="w-10 h-10 text-neutral-400 mx-auto" />
              <p className="font-bold text-neutral-800 text-sm">
                No se encontraron {activeTab === 'repuestos' ? 'repuestos' : 'aceites'} con los filtros aplicados
              </p>
              <p className="text-neutral-400">Intenta buscar con otro término o SKU.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {filteredProducts.map((p) => {
                const isOutOfStock = (p.stock || 0) === 0;
                const isLowStock = (p.stock || 0) <= 2 && (p.stock || 0) > 0;

                return (
                  <div
                    key={p.id}
                    className="bg-white border border-neutral-200/90 rounded-2xl p-4 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
                  >
                    <div>
                      {/* Imagen Estilo Galería */}
                      <div className="w-full aspect-square rounded-xl bg-neutral-50 border border-neutral-100 p-4 flex items-center justify-center relative overflow-hidden">
                        <Image
                          src={p.image || '/images/logo-rd.png'}
                          alt={p.name}
                          fill
                          sizes="(max-width: 768px) 100vw, 300px"
                          className="object-contain p-3 group-hover:scale-105 transition-transform duration-200"
                          onError={(e: any) => { e.currentTarget.src = '/images/logo-rd.png'; }}
                        />

                        {/* Badge de Marca */}
                        <div className="absolute top-2.5 left-2.5">
                          <span className="font-mono text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-neutral-900/90 text-white shadow-2xs backdrop-blur-xs">
                            {p.brand || 'OEM'}
                          </span>
                        </div>

                        {/* Badge de Stock (para Repuestos) o Compra bajo pedido (para Aceites) */}
                        <div className="absolute top-2.5 right-2.5">
                          {activeTab === 'repuestos' ? (
                            isOutOfStock ? (
                              <span className="font-mono text-[9px] font-bold uppercase px-2 py-0.5 rounded-md bg-red-600 text-white shadow-2xs">
                                Agotado
                              </span>
                            ) : isLowStock ? (
                              <span className="font-mono text-[9px] font-bold uppercase px-2 py-0.5 rounded-md bg-amber-500 text-white shadow-2xs">
                                Crítico: {p.stock} un.
                              </span>
                            ) : (
                              <span className="font-mono text-[9px] font-bold uppercase px-2 py-0.5 rounded-md bg-emerald-600 text-white shadow-2xs">
                                Stock: {p.stock} un.
                              </span>
                            )
                          ) : (
                            <span className="font-mono text-[9px] font-bold uppercase px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-200 shadow-2xs">
                              Bajo Pedido
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Detalles del Producto */}
                      <div className="mt-3.5 space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-neutral-500 font-mono">
                          <span className="truncate">{p.category || 'General'}</span>
                          <span className="font-bold">SKU: {p.sku || 'S/SKU'}</span>
                        </div>

                        <h3 className="font-bold text-xs sm:text-sm text-neutral-900 line-clamp-2 leading-snug group-hover:text-[#b3131b] transition-colors">
                          {p.name}
                        </h3>
                      </div>
                    </div>

                    {/* Precio y Acciones Inferiores */}
                    <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
                      <div>
                        <span className="block text-[9px] uppercase font-bold text-neutral-400">Precio</span>
                        <span className="text-sm sm:text-base font-black font-mono text-neutral-900">
                          {formatCLP(p.price || 0)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/admin/productos/editar/${p.id}`}
                          className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors"
                          title="Editar producto"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleEliminar(p.id, p.name)}
                          className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors cursor-pointer"
                          title="Eliminar producto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* VISTA 2: VISTA TABLA */}
      {viewMode === 'table' && (
        <div className="bg-white shadow-xs rounded-2xl overflow-hidden border border-neutral-200/90">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-600">
              <thead className="bg-neutral-50 text-neutral-900 uppercase text-[10px] font-mono font-bold tracking-wider border-b border-neutral-200/80">
                <tr>
                  <th className="px-6 py-4">Foto</th>
                  <th className="px-6 py-4">Nombre</th>
                  <th className="px-6 py-4">SKU / Marca</th>
                  <th className="px-6 py-4">Categoría</th>
                  <th className="px-6 py-4 text-center">Stock</th>
                  <th className="px-6 py-4 text-right">Precio</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-neutral-400 font-bold">
                      Cargando catálogo...
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-neutral-400 font-medium">
                      No se encontraron resultados en esta categoría.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-neutral-50/80 transition-colors">
                      <td className="px-6 py-3.5">
                        <div className="relative w-12 h-12 rounded-xl bg-neutral-50 border border-neutral-200/80 overflow-hidden flex items-center justify-center p-1">
                          <Image
                            src={p.image || '/images/logo-rd.png'}
                            alt={p.name}
                            fill
                            className="object-contain p-1"
                            onError={(e: any) => { e.currentTarget.src = '/images/logo-rd.png'; }}
                          />
                        </div>
                      </td>

                      <td className="px-6 py-3.5 font-bold text-neutral-900 max-w-xs truncate">
                        {p.name}
                      </td>

                      <td className="px-6 py-3.5 font-mono text-neutral-600">
                        <span>{p.sku || 'S/SKU'}</span>
                        <span className="block text-[10px] text-neutral-400 uppercase">{p.brand || 'OEM'}</span>
                      </td>

                      <td className="px-6 py-3.5 text-neutral-600">
                        {p.category || 'General'}
                      </td>

                      <td className="px-6 py-3.5 text-center font-mono font-bold">
                        {activeTab === 'repuestos' ? (
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            (p.stock || 0) === 0
                              ? 'bg-red-100 text-red-700'
                              : (p.stock || 0) <= 2
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-neutral-100 text-neutral-800'
                          }`}>
                            {p.stock ?? 0} un.
                          </span>
                        ) : (
                          <span className="text-[10px] text-neutral-500 uppercase font-semibold">
                            Bajo pedido
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-3.5 text-right font-mono font-bold text-neutral-900">
                        {formatCLP(p.price || 0)}
                      </td>

                      <td className="px-6 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/productos/editar/${p.id}`}
                            className="p-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleEliminar(p.id, p.name)}
                            className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}

export default function AdminProductosPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-neutral-500 font-bold">Cargando catálogo...</div>}>
      <ProductosContent />
    </Suspense>
  );
}
