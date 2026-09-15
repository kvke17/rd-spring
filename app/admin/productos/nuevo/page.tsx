'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Swal from 'sweetalert2';

export default function NuevoProductoPage() {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    sku: '', // <-- SKU agregado al estado inicial
    brand: 'Porsche',
    category: 'Suspensión',
    description: '',
    price: '',
    image: '',
    type: 'venta_online',
    specs: '',         // <--- Añadido aquí
  compatibility: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSubiendoImagen(true);
    const imageFormData = new FormData();
    imageFormData.append('file', file);
    
    // 👇 REEMPLAZA 'TU_UPLOAD_PRESET' por el nombre que creaste en Cloudinary
    imageFormData.append('upload_preset', 'rd_spring_productos'); 

    try {
      // 👇 REEMPLAZA 'TU_CLOUD_NAME' por tu Cloud Name
      const res = await fetch('https://api.cloudinary.com/v1_1/ce1oyy5d/image/upload', {
        method: 'POST',
        body: imageFormData,
      });
      
      const data = await res.json();
      
      if (data.secure_url) {
        setFormData({ ...formData, image: data.secure_url });
      } else {
        alert('Error al subir la imagen a Cloudinary');
      }
    } catch (error) {
      console.error(error);
      alert('Error de conexión al subir la imagen.');
    } finally {
      setSubiendoImagen(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image) {
      alert('Por favor, sube una imagen antes de guardar.');
      return;
    }
    
    setCargando(true);

    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          slug: formData.slug.toLowerCase().replace(/\s+/g, '-'),
        }),
      });

      if (res.ok) {
    // Alerta bonita de éxito
    Swal.fire({
      title: '¡Producto Creado!',
      text: 'El repuesto se ha guardado en la base de datos.',
      icon: 'success',
      confirmButtonColor: '#b3131b',
      confirmButtonText: 'Genial'
    }).then(() => {
      // Esto espera a que presiones "Genial" para recién cambiar de página
      router.push('/admin/productos'); 
      router.refresh(); 
    });
  } else {
        const errorData = await res.json();
        alert(`Hubo un error: ${errorData.error || 'Desconocido'}`);
      }
    } catch (error) {
      console.error(error);
      alert('Error de conexión.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white border border-gray-200 shadow-sm rounded-lg mt-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Crear Nuevo Producto</h1>
        <Link href="/admin/productos" className="text-gray-500 hover:text-[#b3131b] text-sm font-medium transition">
          ← Volver
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Fila superior modificada para 3 columnas incluyendo el SKU */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Nombre del Repuesto/Aceite</label>
            <input type="text" name="name" required onChange={handleChange} value={formData.name}
              className="w-full p-3 border border-gray-300 rounded text-sm focus:border-[#b3131b] outline-none" 
              placeholder="Ej: Amortiguador Neumático" />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">SKU (Código)</label>
            <input type="text" name="sku" required onChange={handleChange} value={formData.sku}
              className="w-full p-3 border border-gray-300 rounded text-sm focus:border-[#b3131b] outline-none" 
              placeholder="Ej: TEST-001" />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Enlace (Slug)</label>
            <input type="text" name="slug" required onChange={handleChange} value={formData.slug}
              className="w-full p-3 border border-gray-300 rounded text-sm focus:border-[#b3131b] outline-none" 
              placeholder="Ej: amortiguador-neumatico" />
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
            className="w-full p-3 border border-gray-300 rounded text-sm focus:border-[#b3131b] outline-none resize-y" 
            placeholder="Ej: Compatible con Porsche Cayenne (2015-2018)..." />
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
              className="w-full p-3 border border-gray-300 rounded text-sm outline-none" 
              placeholder="Ej: 850000" />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Foto del Producto</label>
            <div className="flex items-center gap-4">
              <label className={`cursor-pointer border border-gray-300 bg-gray-50 text-gray-700 text-sm py-3 px-4 rounded hover:bg-gray-100 transition ${subiendoImagen ? 'opacity-50 pointer-events-none' : ''}`}>
                {subiendoImagen ? 'Subiendo...' : 'Seleccionar archivo'}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={subiendoImagen} />
              </label>
              
              {formData.image && (
                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded border border-green-200">
                  ✓ Foto lista
                </span>
              )}
            </div>
          </div>
        </div>

        <button type="submit" disabled={cargando || subiendoImagen || !formData.image}
          className="w-full bg-[#b3131b] hover:bg-red-800 text-white font-bold py-4 rounded uppercase text-sm tracking-widest transition shadow-md disabled:bg-gray-400">
          {cargando ? 'Guardando...' : 'Guardar Producto'}
        </button>
      </form>
    </div>
  );
}