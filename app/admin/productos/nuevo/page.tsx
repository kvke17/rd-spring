'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  UploadCloud, 
  Check, 
  Trash2, 
  Sparkles, 
  Tag, 
  DollarSign, 
  Layers, 
  Car, 
  FileText, 
  Wrench, 
  AlertCircle,
  ShoppingBag,
  ExternalLink,
  RefreshCw,
  Info
} from 'lucide-react';
import HoldToSaveButton from '@/components/admin/HoldToSaveButton';
import { showProductCreatedAlert } from '@/lib/cart-alerts';
import Swal from 'sweetalert2';

interface FormDataState {
  name: string;
  slug: string;
  sku: string;
  brand: string;
  category: string;
  description: string;
  price: string;
  stock: string;
  image: string;
  images: string[];
  type: string;
  specs: string;
  compatibility: string;
}

const INITIAL_FORM_STATE: FormDataState = {
  name: '',
  slug: '',
  sku: '',
  brand: 'Porsche',
  category: 'Suspensión',
  description: '',
  price: '',
  stock: '',
  image: '',
  images: [],
  type: 'venta_online',
  specs: '',
  compatibility: '',
};

export default function NuevoProductoPage() {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const [formData, setFormData] = useState<FormDataState>(INITIAL_FORM_STATE);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [validationError, setValidationError] = useState<string>('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState('');

  // Auto-slug generation from product name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setValidationError('');
    
    if (!isSlugManuallyEdited) {
      const generatedSlug = newName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');

      setFormData((prev) => ({
        ...prev,
        name: newName,
        slug: generatedSlug,
      }));
    } else {
      setFormData((prev) => ({ ...prev, name: newName }));
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setValidationError('');
    const { name, value } = e.target;
    if (name === 'slug') {
      setIsSlugManuallyEdited(true);
    }
    if (name === 'category') {
      setIsCustomCategory(value === 'Otro');
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const uploadFilesToCloudinary = async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((file) => file.type.startsWith('image/'));

    if (fileArray.length === 0) {
      Swal.fire({
        title: 'Archivos no válidos',
        text: 'Por favor selecciona archivos de imagen (PNG, JPG, WEBP).',
        icon: 'warning',
        confirmButtonColor: '#b3131b',
        confirmButtonText: 'Entendido',
      });
      return;
    }

    setSubiendoImagen(true);
    setValidationError('');

    const newUrls: string[] = [];

    for (const file of fileArray) {
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
        console.error('Error subiendo foto:', err);
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
      Swal.fire({
        title: 'Error de subida',
        text: 'No se pudieron subir las fotografías a Cloudinary. Intenta nuevamente.',
        icon: 'error',
        confirmButtonColor: '#b3131b',
      });
    }

    setSubiendoImagen(false);
  };

  const handleImageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      uploadFilesToCloudinary(files);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFilesToCloudinary(e.dataTransfer.files);
    }
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

  // Validation logic
  const isFormValid = Boolean(
    formData.name.trim() &&
    formData.sku.trim() &&
    (formData.images.length > 0 || formData.image) &&
    !subiendoImagen &&
    (!formData.price || !isNaN(Number(formData.price)))
  );

  const isSuspensionPart = (cat: string) => {
    const c = (cat || '').toLowerCase().trim();
    return c === 'repuesto' || c.includes('suspensi') || c.includes('freno') || (c !== 'lubricantes' && c !== 'aceites' && c !== 'aceite');
  };

  const getDisabledReason = () => {
    if (subiendoImagen) return 'Subiendo fotografías a la nube...';
    if (!formData.name.trim()) return 'Falta ingresar el nombre del producto';
    if (!formData.sku.trim()) return 'Falta ingresar el código SKU';
    if (formData.category === 'Otro' && !customCategoryName.trim()) {
      return 'Falta ingresar el nombre de la nueva categoría personalizada';
    }
    const resolvedCat = formData.category === 'Otro' ? customCategoryName.trim() : formData.category;
    if (isSuspensionPart(resolvedCat)) {
      if (formData.stock.trim() === '' || isNaN(parseInt(formData.stock, 10)) || parseInt(formData.stock, 10) < 0) {
        return 'Falta ingresar el stock disponible en bodega';
      }
    }
    if (formData.images.length === 0 && !formData.image) return 'Falta subir al menos una foto del producto';
    return '';
  };

  const executeSave = async () => {
    if (!formData.name.trim() || !formData.sku.trim()) {
      setValidationError('Por favor completa el nombre y el SKU antes de guardar.');
      return;
    }

    if (formData.category === 'Otro' && !customCategoryName.trim()) {
      setValidationError('Por favor ingresa el nombre de la nueva categoría personalizada.');
      return;
    }

    const resolvedCategory = formData.category === 'Otro' ? customCategoryName.trim() : formData.category;

    if (isSuspensionPart(resolvedCategory)) {
      if (formData.stock.trim() === '' || isNaN(parseInt(formData.stock, 10)) || parseInt(formData.stock, 10) < 0) {
        setValidationError('Para repuestos de suspensión es obligatorio especificar el stock disponible en bodega.');
        return;
      }
    }

    const finalImages = formData.images.length > 0 ? formData.images : (formData.image ? [formData.image] : []);

    if (finalImages.length === 0) {
      setValidationError('Es obligatorio subir al menos una foto del producto.');
      return;
    }

    setCargando(true);

    try {
      const sanitizedSlug = (formData.slug.trim() || formData.sku.trim())
        .toLowerCase()
        .replace(/\s+/g, '-');

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          category: resolvedCategory,
          images: finalImages,
          image: finalImages[0] || '',
          slug: sanitizedSlug,
          price: formData.price ? Number(formData.price) : 0,
          stock: isSuspensionPart(resolvedCategory) ? Math.max(0, parseInt(formData.stock, 10) || 0) : 0,
        }),
      });

      if (res.ok) {
        const newProduct = await res.json();

        // Alerta premium estilo SweetAlert2 compartida con el carro
        showProductCreatedAlert({
          product: {
            name: newProduct.name || formData.name,
            sku: newProduct.sku || formData.sku,
            brand: newProduct.brand || formData.brand,
            category: newProduct.category || formData.category,
            price: newProduct.price ?? formData.price,
            image: newProduct.image || formData.image,
            type: newProduct.type || formData.type,
          },
          onViewProducts: () => {
            router.push('/admin/productos');
            router.refresh();
          },
          onCreateAnother: () => {
            setFormData(INITIAL_FORM_STATE);
            setIsSlugManuallyEdited(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          },
        });
      } else {
        const errorData = await res.json();
        Swal.fire({
          title: 'Error al registrar',
          text: errorData.error || 'Ocurrió un error inesperado al guardar el producto.',
          icon: 'error',
          confirmButtonColor: '#b3131b',
        });
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: 'Error de conexión',
        text: 'No se pudo comunicar con el servidor.',
        icon: 'error',
        confirmButtonColor: '#b3131b',
      });
    } finally {
      setCargando(false);
    }
  };

  const formattedPricePreview = formData.price && !isNaN(Number(formData.price))
    ? new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(Number(formData.price))
    : null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#b3131b] font-bold">
              CHASSIS PRESTIGE · INVENTARIO Y CATÁLOGO
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#b3131b] animate-pulse" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-neutral-900">
            Crear Nuevo Producto
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Registra un nuevo repuesto OEM o lubricante de alto rendimiento en la plataforma.
          </p>
        </div>

        <Link
          href="/admin/productos"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 hover:text-[#b3131b] text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-xs hover:shadow-sm active:scale-95 self-start sm:self-auto cursor-pointer group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Volver al Catálogo</span>
        </Link>
      </div>

      {/* Main Form Body */}
      <form onSubmit={(e) => { e.preventDefault(); executeSave(); }} className="space-y-6">
        
        {/* CARD 1: Identificación y Enlace */}
        <div className="bg-white rounded-3xl border border-neutral-200/90 p-6 sm:p-8 shadow-xs hover:border-neutral-300 transition-colors">
          <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-neutral-100">
            <div className="w-8 h-8 rounded-xl bg-red-50 text-[#b3131b] flex items-center justify-center">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-neutral-900">
                1. Identificación Principal
              </h2>
              <p className="text-[11px] text-neutral-400">
                Nombre público, código interno de almacén y enlace web permanente.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Nombre */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">
                Nombre del Repuesto o Aceite <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleNameChange}
                placeholder="Ej: Amortiguador Neumático Delantero PASM Porsche Cayenne"
                className="w-full px-4 py-3.5 rounded-xl bg-neutral-50/60 border border-neutral-200 text-sm text-neutral-900 placeholder-neutral-400 focus:bg-white focus:border-[#b3131b] focus:ring-4 focus:ring-[#b3131b]/10 outline-none transition-all"
              />
            </div>

            {/* SKU */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">
                SKU / Código OEM <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="sku"
                required
                value={formData.sku}
                onChange={handleChange}
                placeholder="Ej: 958-358-039-00"
                className="w-full px-4 py-3.5 rounded-xl bg-neutral-50/60 border border-neutral-200 text-sm font-mono text-neutral-900 placeholder-neutral-400 focus:bg-white focus:border-[#b3131b] focus:ring-4 focus:ring-[#b3131b]/10 outline-none transition-all"
              />
            </div>

            {/* Slug URL */}
            <div className="md:col-span-3">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                  Enlace Permanente (Slug URL)
                </label>
                <span className="text-[10px] text-neutral-400 font-mono">
                  Generado automáticamente
                </span>
              </div>
              <div className="flex items-center rounded-xl bg-neutral-50/60 border border-neutral-200 overflow-hidden focus-within:bg-white focus-within:border-[#b3131b] focus-within:ring-4 focus-within:ring-[#b3131b]/10 transition-all">
                <span className="px-3.5 py-3.5 text-xs font-mono text-neutral-400 bg-neutral-100/60 border-r border-neutral-200 select-none">
                  rdspring.cl/productos/
                </span>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  placeholder="amortiguador-neumatico-delantero-porsche"
                  className="w-full px-4 py-3.5 bg-transparent text-sm font-mono text-neutral-900 placeholder-neutral-400 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2: Clasificación y Canal de Venta */}
        <div className="bg-white rounded-3xl border border-neutral-200/90 p-6 sm:p-8 shadow-xs hover:border-neutral-300 transition-colors">
          <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-neutral-100">
            <div className="w-8 h-8 rounded-xl bg-red-50 text-[#b3131b] flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-neutral-900">
                2. Clasificación & Canal de Venta
              </h2>
              <p className="text-[11px] text-neutral-400">
                Segmentación por fabricante, sistema automotriz y modelo comercial.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Marca */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                  Marca del Repuesto <span className="text-red-500">*</span>
                </label>
                <span className="text-[10px] text-neutral-400 font-mono">Escribe o elige</span>
              </div>
              <input
                type="text"
                list="brand-suggestions"
                name="brand"
                required
                value={formData.brand}
                onChange={handleChange}
                placeholder="Ej: Porsche, Behr, Mahle, Brembo, Bilstein, ROWE..."
                className="w-full px-4 py-3.5 rounded-xl bg-neutral-50/60 border border-neutral-200 text-sm font-semibold text-neutral-900 focus:bg-white focus:border-[#b3131b] focus:ring-4 focus:ring-[#b3131b]/10 outline-none transition-all"
              />
              <datalist id="brand-suggestions">
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

            {/* Categoría */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">
                Sistema / Categoría
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3.5 rounded-xl bg-neutral-50/60 border border-neutral-200 text-sm font-semibold text-neutral-900 focus:bg-white focus:border-[#b3131b] focus:ring-4 focus:ring-[#b3131b]/10 outline-none transition-all cursor-pointer"
              >
                <option value="Suspensión">Suspensión Neumática & Coilovers</option>
                <option value="repuesto">Repuesto de Suspensión (OEM)</option>
                <option value="Frenos">Frenos de Alto Rendimiento</option>
                <option value="Lubricantes">Aceites y Lubricantes</option>
                <option value="Motor & Transmisión">Motor & Transmisión</option>
                <option value="Accesorios">Accesorios Deportivos</option>
                <option value="Otro">Otro (Personalizado)</option>
              </select>

              {isCustomCategory && (
                <div className="mt-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#b3131b] mb-1.5">
                    Especifique el nombre de la nueva categoría *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Sistema Eléctrico, Carrocería, Enfriamiento..."
                    value={customCategoryName}
                    onChange={(e) => {
                      setCustomCategoryName(e.target.value);
                      setValidationError('');
                    }}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-[#b3131b] text-sm font-semibold text-neutral-900 focus:ring-4 focus:ring-[#b3131b]/10 outline-none transition-all shadow-xs"
                  />
                </div>
              )}
            </div>

            {/* Tipo de Venta */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">
                Modalidad Comercial
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-3.5 rounded-xl bg-neutral-50/60 border border-neutral-200 text-sm font-semibold text-neutral-900 focus:bg-white focus:border-[#b3131b] focus:ring-4 focus:ring-[#b3131b]/10 outline-none transition-all cursor-pointer"
              >
                <option value="venta_online">Venta Online Directa (Con Carrito)</option>
                <option value="cotizacion">Solo Cotización (Con VIN)</option>
              </select>
            </div>
          </div>

          {/* Stock en Bodega (Solo para repuestos de suspensión) */}
          {isSuspensionPart(formData.category) && (
            <div className="mt-5 pt-5 border-t border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-neutral-50/80 border border-neutral-200/80">
              <div className="space-y-0.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800">
                  Stock en Bodega (Unidades Físicas) <span className="text-red-500">*</span>
                </label>
                <p className="text-[11px] text-neutral-500">
                  Las piezas con stock &gt; 0 permiten despacho inmediato; en 0 se ofrecerán a pedido / cotización VIN.
                </p>
              </div>
              <div className="w-full sm:w-48">
                <input
                  type="number"
                  name="stock"
                  min="0"
                  value={formData.stock}
                  onChange={handleChange}
                  placeholder="Ej: 5"
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-neutral-200 text-sm font-mono font-bold text-neutral-900 focus:border-[#b3131b] focus:ring-4 focus:ring-[#b3131b]/10 outline-none transition-all"
                  required
                />
              </div>
            </div>
          )}
        </div>

        {/* CARD 3: Descripción, Especificaciones y Compatibilidad */}
        <div className="bg-white rounded-3xl border border-neutral-200/90 p-6 sm:p-8 shadow-xs hover:border-neutral-300 transition-colors">
          <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-neutral-100">
            <div className="w-8 h-8 rounded-xl bg-red-50 text-[#b3131b] flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-neutral-900">
                3. Ficha Técnica & Compatibilidad
              </h2>
              <p className="text-[11px] text-neutral-400">
                Información técnica detallada y modelos vehiculares homologados.
              </p>
            </div>
          </div>

          <div className="space-y-5">
            {/* Descripción */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">
                Descripción Comercial del Producto
              </label>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                placeholder="Ej: Amortiguador neumático original de alto rendimiento con calibración deportiva activa para chasis con sistema PASM..."
                className="w-full px-4 py-3.5 rounded-xl bg-neutral-50/60 border border-neutral-200 text-sm text-neutral-900 placeholder-neutral-400 focus:bg-white focus:border-[#b3131b] focus:ring-4 focus:ring-[#b3131b]/10 outline-none transition-all resize-y"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              {/* Especificaciones */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                    Especificaciones Técnicas
                  </label>
                  <span className="text-[10px] text-neutral-400 font-mono">Clave: Valor</span>
                </div>
                <textarea
                  name="specs"
                  rows={4}
                  value={formData.specs}
                  onChange={handleChange}
                  placeholder={`Base: Sintética HC\nViscosidad: 5W-30\nNormas OEM: Porsche C30 / VW 504 00\nPresión: 16 Bar`}
                  className="w-full px-4 py-3.5 rounded-xl bg-neutral-50/60 border border-neutral-200 text-xs font-mono text-neutral-900 placeholder-neutral-400 focus:bg-white focus:border-[#b3131b] focus:ring-4 focus:ring-[#b3131b]/10 outline-none transition-all resize-y"
                />
              </div>

              {/* Compatibilidad */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                    Compatibilidad de Chasis
                  </label>
                  <span className="text-[10px] text-neutral-400 font-mono">Separadas por comas</span>
                </div>
                <textarea
                  name="compatibility"
                  rows={4}
                  value={formData.compatibility}
                  onChange={handleChange}
                  placeholder="Porsche Cayenne (2015-2023), Audi Q7 (4M), VW Touareg III (CR7), BMW X5 M (F85)"
                  className="w-full px-4 py-3.5 rounded-xl bg-neutral-50/60 border border-neutral-200 text-xs font-mono text-neutral-900 placeholder-neutral-400 focus:bg-white focus:border-[#b3131b] focus:ring-4 focus:ring-[#b3131b]/10 outline-none transition-all resize-y"
                />
              </div>
            </div>
          </div>
        </div>

        {/* CARD 4: Precio y Fotografía */}
        <div className="bg-white rounded-3xl border border-neutral-200/90 p-6 sm:p-8 shadow-xs hover:border-neutral-300 transition-colors">
          <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-neutral-100">
            <div className="w-8 h-8 rounded-xl bg-red-50 text-[#b3131b] flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-neutral-900">
                4. Valorización & Fotografía Oficial
              </h2>
              <p className="text-[11px] text-neutral-400">
                Precio de venta en CLP y fotografía del componente con fondo limpio.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Precio CLP */}
            <div className="md:col-span-5 space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                Precio del Producto (CLP) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono font-bold text-neutral-400 text-sm">
                  $
                </span>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="Ej: 850000"
                  className="w-full pl-8 pr-4 py-3.5 rounded-xl bg-neutral-50/60 border border-neutral-200 text-base font-mono font-bold text-neutral-900 placeholder-neutral-400 focus:bg-white focus:border-[#b3131b] focus:ring-4 focus:ring-[#b3131b]/10 outline-none transition-all"
                />
              </div>

              {/* Live formatted CLP preview */}
              {formattedPricePreview && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 border border-neutral-200/80 text-xs"
                >
                  <span className="text-neutral-500 font-medium">Visualización en tienda:</span>
                  <span className="font-mono font-black text-[#b3131b] text-sm">
                    {formattedPricePreview}
                  </span>
                </motion.div>
              )}
            </div>

            {/* Fotografías (Carrusel) Dropzone & Previews */}
            <div className="md:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                  Fotografías del Repuesto <span className="text-red-500">*</span>
                </label>
                <span className="text-[10px] text-neutral-400 font-mono">
                  {formData.images.length} {formData.images.length === 1 ? 'foto cargada' : 'fotos (Carrusel activo)'}
                </span>
              </div>

              {/* Grid de imágenes cargadas */}
              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {formData.images.map((imgUrl, index) => {
                    const isPrimary = index === 0;
                    return (
                      <div
                        key={`${imgUrl}-${index}`}
                        className={`relative rounded-2xl border p-2 bg-neutral-50 flex flex-col items-center justify-between group overflow-hidden transition-all shadow-2xs ${
                          isPrimary
                            ? 'border-[#b3131b] ring-2 ring-[#b3131b]/15 bg-red-50/20'
                            : 'border-neutral-200 hover:border-neutral-300'
                        }`}
                      >
                        {/* Badge Principal */}
                        <div className="absolute top-2 left-2 z-10">
                          {isPrimary ? (
                            <span className="bg-[#b3131b] text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                              Principal
                            </span>
                          ) : (
                            <span className="bg-neutral-800/70 backdrop-blur-xs text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full">
                              #{index + 1}
                            </span>
                          )}
                        </div>

                        {/* Botón Eliminar */}
                        <button
                          type="button"
                          onClick={() => handleRemoveSpecificImage(index)}
                          className="absolute top-2 right-2 z-10 p-1.5 rounded-lg bg-white/90 text-neutral-500 hover:text-red-600 hover:bg-red-50 shadow-xs transition-colors cursor-pointer"
                          title="Eliminar esta foto"
                          aria-label={`Eliminar foto ${index + 1}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Contenedor Imagen */}
                        <div className="w-full aspect-square relative rounded-xl overflow-hidden bg-white border border-neutral-100 flex items-center justify-center p-2 mt-4 mb-2">
                          <Image
                            src={imgUrl}
                            alt={`Foto ${index + 1}`}
                            fill
                            className="object-contain p-2"
                          />
                        </div>

                        {/* Botón Hacer Portada si no es la primera */}
                        {!isPrimary && (
                          <button
                            type="button"
                            onClick={() => handleSetPrimaryImage(index)}
                            className="w-full text-center text-[10px] font-bold text-neutral-600 hover:text-[#b3131b] py-1 bg-white hover:bg-neutral-100 border border-neutral-200 rounded-lg transition-colors cursor-pointer"
                          >
                            Hacer Portada
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Dropzone para agregar fotos */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative rounded-2xl border-2 border-dashed p-6 text-center transition-all ${
                  dragActive
                    ? 'border-[#b3131b] bg-red-50/40'
                    : 'border-neutral-300 hover:border-neutral-400 bg-neutral-50/40 hover:bg-neutral-50/80'
                }`}
              >
                <input
                  type="file"
                  id="file-upload"
                  accept="image/*"
                  multiple
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  onChange={handleImageInput}
                  disabled={subiendoImagen}
                />

                <div className="flex flex-col items-center justify-center gap-2 pointer-events-none">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-neutral-200 flex items-center justify-center text-neutral-500 shadow-xs">
                    {subiendoImagen ? (
                      <RefreshCw className="w-6 h-6 text-[#b3131b] animate-spin" />
                    ) : (
                      <UploadCloud className="w-6 h-6 text-neutral-600" />
                    )}
                  </div>
                  <div className="text-xs text-neutral-600">
                    <span className="font-bold text-[#b3131b]">
                      {subiendoImagen ? 'Subiendo fotos a la nube...' : 'Haz clic para subir fotos'}
                    </span>{' '}
                    {!subiendoImagen && 'o arrastra y suelta aquí'}
                  </div>
                  <span className="text-[10px] text-neutral-400 font-mono">
                    Puedes seleccionar una o más imágenes (PNG, JPG, WEBP) para crear el carrusel
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Validation Error Message */}
        <AnimatePresence>
          {validationError && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-3 shadow-xs"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{validationError}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CARD 5: Bottom Hold-to-Save Action Dock */}
        <div className="bg-white rounded-3xl border border-neutral-200/90 p-6 sm:p-8 shadow-md">
          <HoldToSaveButton
            onConfirm={executeSave}
            isSubmitting={cargando}
            disabled={!isFormValid || cargando || subiendoImagen}
            disabledReason={getDisabledReason()}
            label="GUARDAR PRODUCTO"
            holdDuration={1200}
          />
        </div>
      </form>
    </div>
  );
}