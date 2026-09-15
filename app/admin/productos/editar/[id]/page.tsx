'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Swal from 'sweetalert2';

export default function EditarProductoPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string; // Obtenemos el ID desde la URL

  const [cargando, setCargando] = useState(false);
  const [cargandoDatos, setCargandoDatos] = useState(true);
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    sku: '',
    brand: '',
    category: '',
    description: '',
    price: '',
    image: '',
    type: 'venta_online',
    specs: '',         // <--- Añadir aquí
  compatibility: ''
  });

  // 1. BUSCAR LOS DATOS EN LA BASE DE DATOS AL ABRIR LA PÁGINA
  useEffect(() => {
    const cargarProducto = async () => {
      try {
        const res = await fetch(`/api/admin/products/${id}`);
        if (res.ok) {
          const data = await res.json();
          
          // Convertimos specs y compatibility a texto plano si vienen como objetos/arreglos
          const specsText = typeof data.specs === 'object' && data.specs !== null 
            ? Object.entries(data.specs).map(([k, v]) => `${k}: ${v}`).join('\n')
            : (data.specs || '');

          const compatText = Array.isArray(data.compatibility)
            ? data.compatibility.join(', ')
            : (data.compatibility || '');

          setFormData({
            name: data.name || '',
            slug: data.slug || '',
            sku: data.sku || '',
            brand: data.brand || 'ROWE',
            category: data.category || 'Lubricantes',
            description: data.description || '',
            price: data.price ? data.price.toString() : '',
            image: data.image || '',
            type: data.type || 'venta_online',
            specs: specsText,          // <--- Añadido aquí
            compatibility: compatText  // <--- Añadido aquí
          });
        } else {
          Swal.fire('Error', 'No se encontró el producto', 'error');
          router.push('/admin/productos');
        }
      } catch (error) {
        console.error("Error cargando producto:", error);
      } finally {
        setCargandoDatos(false);
      }
    };

    cargarProducto();
  }, [id, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSubiendoImagen(true);
    const imageFormData = new FormData();
    imageFormData.append('file', file);
    imageFormData.append('upload_preset', 'rd_spring_productos'); // TU UPLOAD PRESET DE CLOUDINARY

    try {
      const res = await fetch('https://api.cloudinary.com/v1_1/ce1oyy5d/image/upload', { // TU CLOUD NAME
        method: 'POST',
        body: imageFormData,
      });
      const data = await res.json();
      if (data.secure_url) {
        setFormData({ ...formData, image: data.secure_url });
      } else {
        Swal.fire('Error', 'No se pudo subir la imagen a Cloudinary', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Problema de conexión al subir la imagen', 'error');
    } finally {
      setSubiendoImagen(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);

    try {
      // Usamos el método PUT apuntando al ID específico
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          slug: formData.slug.toLowerCase().replace(/\s+/g, '-'),
        }),
      });

      if (res.ok) {
        Swal.fire({
          title: '¡Actualizado!',
          text: 'Los cambios se guardaron correctamente en la base de datos.',
          icon: 'success',
          confirmButtonColor: '#b3131b'
        }).then(() => {
          router.push('/admin/productos'); 
          router.refresh(); 
        });
      } else {
        const errorData = await res.json();
        Swal.fire('Error', errorData.error || 'No se pudo actualizar', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Problema de conexión.', 'error');
    } finally {
      setCargando(false);
    }
  };

  if (cargandoDatos) {
    return <div className="p-8 text-center text-gray-500 font-bold mt-10">Cargando datos del producto...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white border border-gray-200 shadow-sm rounded-lg mt-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Editar Producto</h1>
        <Link href="/admin/productos" className="text-gray-500 hover:text-[#b3131b] text-sm font-medium transition">
          ← Cancelar
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Nombre del Repuesto/Aceite</label>
            <input type="text" name="name" required onChange={handleChange} value={formData.name}
              className="w-full p-3 border border-gray-300 rounded text-sm focus:border-[#b3131b] outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">SKU (Código)</label>
            <input type="text" name="sku" required onChange={handleChange} value={formData.sku}
              className="w-full p-3 border border-gray-300 rounded text-sm focus:border-[#b3131b] outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Enlace (Slug)</label>
            <input type="text" name="slug" required onChange={handleChange} value={formData.slug}
              className="w-full p-3 border border-gray-300 rounded text-sm focus:border-[#b3131b] outline-none" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Marca</label>
            <select name="brand" onChange={handleChange} value={formData.brand} className="w-full p-3 border border-gray-300 rounded text-sm outline-none">
              <option value="Porsche">Porsche</option>
              <option value="BMW">BMW</option>
              <option value="Audi">Audi</option>
              <option value="Land Rover">Land Rover</option>
              <option value="ROWE">ROWE (Aceites)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Categoría</label>
            <select name="category" onChange={handleChange} value={formData.category} className="w-full p-3 border border-gray-300 rounded text-sm outline-none">
              <option value="Suspensión">Suspensión</option>
              <option value="Frenos">Frenos</option>
              <option value="Lubricantes">Lubricantes</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Tipo de Venta</label>
            <select name="type" onChange={handleChange} value={formData.type} className="w-full p-3 border border-gray-300 rounded text-sm outline-none">
              <option value="venta_online">Venta Online (Con precio)</option>
              <option value="cotizacion">Solo Cotización</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Descripción y Compatibilidad</label>
          <textarea name="description" rows={4} onChange={handleChange} value={formData.description}
            className="w-full p-3 border border-gray-300 rounded text-sm focus:border-[#b3131b] outline-none resize-y" />
        </div>
        {/* NUEVOS CAMPOS TÉCNICOS OPCIONALES */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 border border-gray-200 rounded">
  <div>
    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Especificaciones (Ej: Base, Normas)</label>
    <textarea name="specs" rows={4} onChange={handleChange} value={formData.specs || ''}
      placeholder="Ej: Base: Sintética HC / Viscosidad: 5W-30 / Normas: ACEA C3"
      className="w-full p-3 bg-white border border-gray-300 rounded text-sm focus:border-[#b3131b] outline-none resize-y" />
  </div>
  <div>
    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Compatibilidad (Separada por comas)</label>
    <textarea name="compatibility" rows={4} onChange={handleChange} value={formData.compatibility || ''}
      placeholder="Ej: BMW Longlife-04, MB 229.51, Porsche C30"
      className="w-full p-3 bg-white border border-gray-300 rounded text-sm focus:border-[#b3131b] outline-none resize-y" />
  </div>
</div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Precio (CLP)</label>
            <input type="number" name="price" onChange={handleChange} value={formData.price}
              className="w-full p-3 border border-gray-300 rounded text-sm outline-none" />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Foto del Producto</label>
            <div className="flex items-center gap-4">
              <label className={`cursor-pointer border border-gray-300 bg-gray-50 text-gray-700 text-sm py-3 px-4 rounded hover:bg-gray-100 transition ${subiendoImagen ? 'opacity-50 pointer-events-none' : ''}`}>
                {subiendoImagen ? 'Subiendo...' : 'Cambiar archivo'}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={subiendoImagen} />
              </label>
              
              {formData.image && (
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-200">
                  ✓ Imagen actual cargada
                </span>
              )}
            </div>
          </div>
        </div>

        <button type="submit" disabled={cargando || subiendoImagen}
          className="w-full bg-[#b3131b] hover:bg-red-800 text-white font-bold py-4 rounded uppercase text-sm tracking-widest transition shadow-md disabled:bg-gray-400">
          {cargando ? 'Guardando cambios...' : 'Actualizar Producto'}
        </button>
      </form>
    </div>
  );
}