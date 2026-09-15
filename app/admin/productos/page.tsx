"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link"; 
import Swal from 'sweetalert2';

export default function AdminProductosPage() {
  const [productos, setProductos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
      title: '¿Estás seguro?',
      text: "Esta acción borrará el repuesto de la base de datos.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#b3131b',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`/api/admin/products/${id}`, {
            method: 'DELETE',
          });

          if (res.ok) {
            Swal.fire('¡Eliminado!', 'El producto ha sido borrado.', 'success');
            // Actualizamos el estado para que el producto desaparezca de la tabla inmediatamente
            setProductos((prevProductos) => prevProductos.filter(p => p.id !== id));
          } else {
            Swal.fire('Error', 'No se pudo eliminar el producto.', 'error');
          }
        } catch (error) {
          Swal.fire('Error', 'Problema de conexión.', 'error');
        }
      }
    });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Productos</h1>
          <p className="text-gray-500 text-sm mt-1">Administra el catálogo de repuestos y aceites.</p>
        </div>
        
        <Link 
          href="/admin/productos/nuevo"
          className="bg-[#b3131b] hover:bg-red-800 text-white font-bold py-2 px-4 rounded shadow transition inline-block"
        >
          + Nuevo Producto
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-gray-900 uppercase text-xs font-bold border-b border-gray-200">
            <tr>
              <th className="px-6 py-4">Imagen</th>
              <th className="px-6 py-4">Nombre</th>
              <th className="px-6 py-4">Marca / Categoría</th>
              <th className="px-6 py-4">Precio</th>
              <th className="px-6 py-4">Tipo</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-10">Cargando productos...</td></tr>
            ) : productos.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-10 text-gray-500">No hay productos en la base de datos.</td></tr>
            ) : (
              productos.map((producto) => (
                <tr key={producto.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="relative w-12 h-12 rounded bg-gray-100 border overflow-hidden">
                      {producto.image && (
                        <Image src={producto.image} alt={producto.name} fill className="object-cover" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900">{producto.name}</td>
                  <td className="px-6 py-4">{producto.brand} <br/><span className="text-xs text-gray-400">{producto.category}</span></td>
                  <td className="px-6 py-4 text-gray-900 font-medium">
                    {producto.price ? `$${producto.price.toLocaleString('es-CL')}` : 'Cotizar'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded ${producto.type === 'venta_online' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {producto.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {/* Botón EDITAR conectado a la futura página de edición */}
                    <Link 
                      href={`/admin/productos/editar/${producto.id}`} 
                      className="text-blue-600 font-bold text-xs uppercase hover:underline mr-3"
                    >
                      Editar
                    </Link>
                    
                    {/* Botón ELIMINAR conectado a la función handleEliminar */}
                    <button 
                      onClick={() => handleEliminar(producto.id)} 
                      className="text-red-600 font-bold text-xs uppercase hover:underline"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}