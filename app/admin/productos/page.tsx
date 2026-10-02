"use client";

import { useEffect, useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link"; 
import { useSearchParams } from "next/navigation";
import Swal from 'sweetalert2';
import { Plus, Edit2, Trash2, Package, Filter, X } from 'lucide-react';

function ProductosTableContent() {
  const [productos, setProductos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const categoryFilter = searchParams.get('categoria');

  useEffect(() => {
    const cargarProductos = async () => {
      try {
        const res = await fetch("/api/admin/products");
        
        if (!res.ok) {
          const textoError = await res.text();
          console.error("Respuesta fallida del servidor:", textoError);
          setProductos([]);
          setLoading(false);
          return;
        }

        const data = await res.json();

        if (Array.isArray(data)) {
          setProductos(data);
        } else {
          console.error("Esperaba un arreglo, pero llegó:", data);
          setProductos([]);
        }
      } catch (error) {
        console.error("Error al ejecutar el fetch:", error);
        setProductos([]);
      } finally {
        setLoading(false);
      }
    };

    cargarProductos();
  }, []);

  const handleEliminar = (id: string) => {
    Swal.fire({
      title: '¿Eliminar repuesto?',
      text: 'Esta acción borrará el repuesto de la base de datos permanentemente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#b3131b',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'rounded-2xl border border-neutral-200/80 shadow-2xl backdrop-blur-xl',
        title: 'text-lg font-bold text-neutral-900 tracking-tight',
        htmlContainer: 'text-sm text-neutral-600',
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
              text: 'El producto ha sido borrado.',
              icon: 'success',
              confirmButtonColor: '#b3131b',
              customClass: {
                popup: 'rounded-2xl border border-neutral-200/80 shadow-2xl backdrop-blur-xl',
                confirmButton: 'rounded-xl font-bold uppercase text-xs tracking-wider px-5 py-3',
              },
            });
            setProductos((prevProductos) => prevProductos.filter(p => p.id !== id));
          } else {
            Swal.fire({
              title: 'Error',
              text: 'No se pudo eliminar el producto.',
              icon: 'error',
              confirmButtonColor: '#b3131b',
              customClass: {
                popup: 'rounded-2xl border border-neutral-200/80 shadow-2xl backdrop-blur-xl',
                confirmButton: 'rounded-xl font-bold uppercase text-xs tracking-wider px-5 py-3',
              },
            });
          }
        } catch (error) {
          Swal.fire({
            title: 'Error',
            text: 'Problema de conexión.',
            icon: 'error',
            confirmButtonColor: '#b3131b',
            customClass: {
              popup: 'rounded-2xl border border-neutral-200/80 shadow-2xl backdrop-blur-xl',
              confirmButton: 'rounded-xl font-bold uppercase text-xs tracking-wider px-5 py-3',
            },
          });
        }
      }
    });
  };

  const displayedProductos = categoryFilter
    ? productos.filter(p => p.category?.toLowerCase() === categoryFilter.toLowerCase())
    : productos;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold uppercase tracking-tight text-neutral-900">
              Catálogo de Productos & Repuestos
            </h2>
            {categoryFilter && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#b3131b]/10 text-[#b3131b] border border-[#b3131b]/30">
                <Filter className="w-3 h-3" />
                {categoryFilter}
                <Link href="/admin/productos" className="ml-1 hover:opacity-75" title="Quitar filtro">
                  <X className="w-3 h-3" />
                </Link>
              </span>
            )}
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">Gestión de inventario de amortiguadores, aceites ROWE y accesorios</p>
        </div>
        
        <Link 
          href="/admin/productos/nuevo"
          className="btn-shine inline-flex items-center gap-2 bg-[#b3131b] hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider py-3 px-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Producto</span>
        </Link>
      </div>

      <div className="bg-white shadow-xs rounded-2xl overflow-hidden border border-black/[0.06]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-600">
            <thead className="bg-neutral-50/80 text-neutral-900 uppercase text-[10px] font-mono font-bold tracking-wider border-b border-neutral-200/80">
              <tr>
                <th className="px-6 py-4">Imagen</th>
                <th className="px-6 py-4">Nombre</th>
                <th className="px-6 py-4">Marca / Categoría</th>
                <th className="px-6 py-4">Precio</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-5 h-5 border-2 border-[var(--brand-crimson)] border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs uppercase tracking-widest text-slate-400 font-bold">Cargando catálogo...</span>
                    </div>
                  </td>
                </tr>
              ) : displayedProductos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 font-medium">
                    {categoryFilter 
                      ? `No se encontraron productos en la categoría "${categoryFilter}".`
                      : "No hay productos en la base de datos actualmente."}
                  </td>
                </tr>
              ) : (
                displayedProductos.map((producto) => (
                  <tr key={producto.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-3.5">
                      <div className="relative w-12 h-12 rounded-xl bg-slate-50 border border-slate-200/70 overflow-hidden flex items-center justify-center">
                        {producto.image ? (
                          <Image src={producto.image} alt={producto.name} fill className="object-cover" />
                        ) : (
                          <Package className="w-5 h-5 text-slate-300" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <p className="font-bold text-slate-900 text-sm">{producto.name}</p>
                      {producto.sku && <p className="text-[10px] font-mono text-slate-400">{producto.sku}</p>}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="font-bold text-slate-800">{producto.brand}</span>
                      <br/>
                      <span className="text-[11px] text-slate-400">{producto.category}</span>
                    </td>
                    <td className="px-6 py-3.5 font-bold text-slate-900">
                      {producto.price ? `$${producto.price.toLocaleString('es-CL')}` : <span className="text-slate-400 font-normal">Cotizar</span>}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className={`inline-block px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full ${
                        producto.type === 'venta_online' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' 
                          : 'bg-slate-100 text-slate-700 border border-slate-200/60'
                      }`}>
                        {producto.type}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <div className="inline-flex items-center gap-2">
                        <Link 
                          href={`/admin/productos/editar/${producto.id}`} 
                          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Editar producto"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        
                        <button 
                          onClick={() => handleEliminar(producto.id)} 
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Eliminar producto"
                        >
                          <Trash2 className="w-4 h-4" />
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
    </div>
  );
}

export default function AdminProductosPage() {
  return (
    <Suspense fallback={
      <div className="flex h-64 items-center justify-center">
        <div className="w-6 h-6 border-2 border-[var(--brand-crimson)] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ProductosTableContent />
    </Suspense>
  );
}