'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, RefreshCw, UploadCloud } from 'lucide-react';
import Swal from 'sweetalert2';

export default function EditarProductoPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string; // Obtenemos el ID desde la URL

  const [cargando, setCargando] = useState(false);
  const [cargandoDatos, setCargandoDatos] = useState(true);
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState('');
  
  const isSuspensionPart = (cat: string) => {
    const c = (cat || '').toLowerCase().trim();
    return c === 'repuesto' || c.includes('suspensi') || c.includes('freno') || (c !== 'lubricantes' && c !== 'aceites' && c !== 'aceite');
  };

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    sku: '',
    brand: '',
    category: '',
    description: '',
    price: '',
    image: '',
    images: [] as string[],
    type: 'venta_online',
    specs: '',
    compatibility: '',
    stock: '0',
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

          const initialImages: string[] = Array.isArray(data.images) && data.images.length > 0
            ? data.images.filter(Boolean)
            : (data.image ? [data.image] : []);

          const STANDARD_CATS = ['Suspensión', 'repuesto', 'Frenos', 'Lubricantes', 'Motor & Transmisión', 'Accesorios'];
          const catFromDb = data.category || 'Lubricantes';
          const isCustom = !STANDARD_CATS.includes(catFromDb);

          if (isCustom) {
            setIsCustomCategory(true);
            setCustomCategoryName(catFromDb);
          }

          setFormData({
            name: data.name || '',
            slug: data.slug || '',
            sku: data.sku || '',
            brand: data.brand || '',
            category: isCustom ? 'Otro' : catFromDb,
            description: data.description || '',
            price: data.price ? data.price.toString() : '',
            image: initialImages[0] || data.image || '',
            images: initialImages,
            type: data.type || 'venta_online',
            specs: specsText,
            compatibility: compatText,
            stock: data.stock !== undefined && data.stock !== null ? data.stock.toString() : '0',
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
    if (e.target.name === 'category') {
      setIsCustomCategory(e.target.value === 'Otro');
    }
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setSubiendoImagen(true);
    const newUrls: string[] = [];

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue;
      const imageFormData = new FormData();
      imageFormData.append('file', file);
      imageFormData.append('upload_preset', 'rd_spring_productos');

      try {
        const res = await fetch('https://api.cloudinary.com/v1_1/ce1oyy5d/image/upload', {
          method: 'POST',
          body: imageFormData,
        });
        const data = await res.json();
        if (data.secure_url) {
          newUrls.push(data.secure_url);
        }
      } catch (err) {
        console.error('Error subiendo imagen:', err);
      }
    }

    if (newUrls.length > 0) {
      setFormData((prev) => {
        const updatedImages = [...prev.images, ...newUrls];
        return {
          ...prev,
          images: updatedImages,
          image: updatedImages[0] || '',
        };
      });
    } else {
      Swal.fire('Error', 'No se pudieron subir las imágenes a Cloudinary', 'error');
    }
    setSubiendoImagen(false);
  };

  const handleSetPrimaryImage = (indexToPrimary: number) => {
    setFormData((prev) => {
      const copy = [...prev.images];
      const [chosen] = copy.splice(indexToPrimary, 1);
      const reordered = [chosen, ...copy];
      return {
        ...prev,
        images: reordered,
        image: reordered[0] || '',
      };
    });
  };

  const handleRemoveSpecificImage = (indexToRemove: number) => {
    setFormData((prev) => {
      const reordered = prev.images.filter((_, idx) => idx !== indexToRemove);
      return {
        ...prev,
        images: reordered,
        image: reordered[0] || '',
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);

    if (formData.category === 'Otro' && !customCategoryName.trim()) {
      Swal.fire({
        title: 'Categoría requerida',
        text: 'Por favor ingresa el nombre de la nueva categoría personalizada.',
        icon: 'warning',
        confirmButtonColor: '#b3131b',
      });
      setCargando(false);
      return;
    }

    const resolvedCategory = formData.category === 'Otro' ? customCategoryName.trim() : formData.category;

    if (isSuspensionPart(resolvedCategory) && (formData.stock === '' || isNaN(Number(formData.stock)))) {
      Swal.fire({
        title: 'Stock requerido',
        text: 'Debes ingresar las unidades disponibles en bodega para este repuesto de suspensión.',
        icon: 'warning',
        confirmButtonColor: '#b3131b',
        customClass: {
          popup: 'rounded-2xl border border-neutral-200/80 shadow-2xl backdrop-blur-xl',
          confirmButton: 'rounded-xl font-bold uppercase text-xs tracking-wider px-5 py-3',
        },
      });
      setCargando(false);
      return;
    }

    const finalImages = formData.images.length > 0 ? formData.images : (formData.image ? [formData.image] : []);

    try {
      // Usamos el método PUT apuntando al ID específico
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          category: resolvedCategory,
          images: finalImages,
          image: finalImages[0] || '',
          slug: formData.slug.toLowerCase().replace(/\s+/g, '-'),
          stock: isSuspensionPart(resolvedCategory) ? Math.max(0, parseInt(formData.stock, 10) || 0) : 0,
        }),
      });

      if (res.ok) {
        Swal.fire({
          title: '¡Actualizado!',
          text: 'Los cambios se guardaron correctamente en la base de datos.',
          icon: 'success',
          confirmButtonColor: '#b3131b',
          customClass: {
            popup: 'rounded-2xl border border-neutral-200/80 shadow-2xl backdrop-blur-xl',
            title: 'text-lg font-bold text-neutral-900 tracking-tight',
            htmlContainer: 'text-sm text-neutral-600',
            confirmButton: 'rounded-xl font-bold uppercase text-xs tracking-wider px-5 py-3 shadow-sm',
          },
        }).then(() => {
          router.push('/admin/productos'); 
          router.refresh(); 
        });
      } else {
        const errorData = await res.json();
        Swal.fire({
          title: 'Error',
          text: errorData.error || 'No se pudo actualizar',
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
    } finally {
      setCargando(false);
    }
  };

  if (cargandoDatos) {
    return <div className="p-8 text-center text-neutral-500 font-bold mt-10">Cargando datos del producto...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white border border-black/[0.06] shadow-xs rounded-2xl mt-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Editar Producto</h1>
        <Link href="/admin/productos" className="text-neutral-500 hover:text-[#b3131b] text-sm font-semibold transition-colors cursor-pointer">
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
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-gray-700 uppercase">
                Marca del Repuesto <span className="text-red-500">*</span>
              </label>
              <span className="text-[10px] text-neutral-400 font-mono">Escribe o elige</span>
            </div>
            <input
              type="text"
              list="brand-suggestions-edit"
              name="brand"
              required
              onChange={handleChange}
              value={formData.brand}
              placeholder="Ej: Porsche, Behr, Mahle, Brembo, Bilstein, ROWE..."
              className="w-full p-3 border border-gray-300 rounded text-sm focus:border-[#b3131b] outline-none font-semibold text-neutral-900"
            />
            <datalist id="brand-suggestions-edit">
              <option value="Porsche" />
              <option value="Porsche OEM" />
              <option value="BMW" />
              <option value="Mercedes-Benz" />
              <option value="Audi" />
              <option value="Land Rover" />
              <option value="Volkswagen (VW)" />
              <option value="ROWE" />
              <option value="Mahle" />
              <option value="Behr" />
              <option value="Brembo" />
              <option value="Bilstein" />
              <option value="Sachs" />
              <option value="Bosch" />
              <option value="Nissens" />
              <option value="Valeo" />
              <option value="Lemförder" />
              <option value="OEM" />
            </datalist>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Categoría</label>
            <select name="category" onChange={handleChange} value={formData.category} className="w-full p-3 border border-gray-300 rounded text-sm outline-none">
              <option value="Suspensión">Suspensión Neumática & Coilovers</option>
              <option value="repuesto">Repuesto de Suspensión (OEM)</option>
              <option value="Frenos">Frenos</option>
              <option value="Lubricantes">Lubricantes / Aceites</option>
              <option value="Motor & Transmisión">Motor & Transmisión</option>
              <option value="Accesorios">Accesorios Deportivos</option>
              <option value="Otro">Otro (Personalizado)</option>
            </select>
            {isCustomCategory && (
              <div className="mt-2.5">
                <label className="block text-[11px] font-bold text-[#b3131b] uppercase mb-1">
                  Nombre de categoría personalizada *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Sistema Eléctrico, Climatización..."
                  value={customCategoryName}
                  onChange={(e) => setCustomCategoryName(e.target.value)}
                  className="w-full p-2.5 bg-white border border-[#b3131b] rounded text-sm font-semibold text-neutral-900 outline-none"
                />
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Tipo de Venta</label>
            <select name="type" onChange={handleChange} value={formData.type} className="w-full p-3 border border-gray-300 rounded text-sm outline-none">
              <option value="venta_online">Venta Online (Con precio)</option>
              <option value="cotizacion">Solo Cotización</option>
            </select>
          </div>
        </div>

        {/* Stock en Bodega condicional para repuestos */}
        {isSuspensionPart(formData.category) && (
          <div className="bg-neutral-50 p-4 border border-neutral-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-800 uppercase mb-1">
                Stock en Bodega (Unidades Físicas) <span className="text-red-500">*</span>
              </label>
              <p className="text-[11px] text-gray-500">
                Unidades físicas en almacén. Si el stock es 0, en la tienda aparecerá como &ldquo;Sin stock / A pedido (Cotizar con VIN)&rdquo;.
              </p>
            </div>
            <div className="w-full sm:w-40">
              <input
                type="number"
                name="stock"
                min="0"
                required
                onChange={handleChange}
                value={formData.stock}
                placeholder="0"
                className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-sm font-mono font-bold focus:border-[#b3131b] outline-none"
              />
            </div>
          </div>
        )}

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

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Precio (CLP)</label>
          <input type="number" name="price" onChange={handleChange} value={formData.price}
            className="w-full p-3 border border-gray-300 rounded text-sm outline-none" />
        </div>

        {/* Galería y Carrusel de Fotos */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-gray-700 uppercase">
              Fotografías del Producto (Carrusel) <span className="text-red-500">*</span>
            </label>
            <span className="text-xs text-neutral-500 font-mono">
              {formData.images.length} {formData.images.length === 1 ? 'foto' : 'fotos cargadas'}
            </span>
          </div>

          {/* Grid de imágenes */}
          {formData.images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
              {formData.images.map((imgUrl, index) => {
                const isPrimary = index === 0;
                return (
                  <div
                    key={`${imgUrl}-${index}`}
                    className={`relative rounded-xl border p-2 bg-neutral-50 flex flex-col items-center justify-between overflow-hidden shadow-2xs ${
                      isPrimary ? 'border-[#b3131b] ring-2 ring-[#b3131b]/15 bg-red-50/20' : 'border-neutral-200'
                    }`}
                  >
                    <div className="absolute top-2 left-2 z-10">
                      {isPrimary ? (
                        <span className="bg-[#b3131b] text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase">
                          Principal
                        </span>
                      ) : (
                        <span className="bg-neutral-800/70 text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full">
                          #{index + 1}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveSpecificImage(index)}
                      className="absolute top-2 right-2 z-10 p-1.5 rounded-lg bg-white/90 text-neutral-500 hover:text-red-600 hover:bg-red-50 shadow-xs transition-colors cursor-pointer"
                      title="Eliminar esta foto"
                      aria-label={`Eliminar foto ${index + 1}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="w-full aspect-square relative rounded-lg overflow-hidden bg-white border border-neutral-100 flex items-center justify-center p-2 mt-4 mb-2">
                      <Image
                        src={imgUrl}
                        alt={`Foto ${index + 1}`}
                        fill
                        className="object-contain p-2"
                      />
                    </div>

                    {!isPrimary && (
                      <button
                        type="button"
                        onClick={() => handleSetPrimaryImage(index)}
                        className="w-full text-center text-[10px] font-bold text-neutral-600 hover:text-[#b3131b] py-1 bg-white hover:bg-neutral-100 border border-neutral-200 rounded transition-colors cursor-pointer"
                      >
                        Hacer Portada
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Botón para subir más fotos */}
          <div className="flex items-center gap-3">
            <label className={`cursor-pointer border border-neutral-300 bg-neutral-50 hover:bg-neutral-100 text-neutral-800 text-xs font-bold uppercase tracking-wider py-3 px-5 rounded-xl transition flex items-center gap-2 shadow-xs ${subiendoImagen ? 'opacity-50 pointer-events-none' : ''}`}>
              {subiendoImagen ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#b3131b]" />
                  <span>Subiendo imágenes...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4 text-[#b3131b]" />
                  <span>Subir más fotos</span>
                </>
              )}
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} disabled={subiendoImagen} />
            </label>
            <span className="text-[11px] text-neutral-400">
              Puedes seleccionar varias fotos a la vez para el carrusel
            </span>
          </div>
        </div>

        <button type="submit" disabled={cargando || subiendoImagen}
          className="w-full bg-[#b3131b] hover:bg-red-800 text-white font-bold py-4 rounded uppercase text-sm tracking-widest transition shadow-md disabled:bg-gray-400 cursor-pointer">
          {cargando ? 'Guardando cambios...' : 'Actualizar Producto'}
        </button>
      </form>
    </div>
  );
}
