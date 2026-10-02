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
  image: string;
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
  image: '',
  type: 'venta_online',
  specs: '',
  compatibility: '',
};

export default function NuevoProductoPage() {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const [formData, setFormData] = useState<FormDataState>(INITIAL_FORM_STATE);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [validationError, setValidationError] = useState<string>('');

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
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const uploadFileToCloudinary = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      Swal.fire({
        title: 'Archivo no válido',
        text: 'Por favor selecciona un archivo de imagen (PNG, JPG, WEBP).',
        icon: 'warning',
        confirmButtonColor: '#b3131b',
        confirmButtonText: 'Entendido',
      });
      return;
    }

    // Local instant preview
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
    setSubiendoImagen(true);
    setValidationError('');

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
        setFormData((prev) => ({ ...prev, image: data.secure_url }));
        setPreviewUrl(data.secure_url);
      } else {
        Swal.fire({
          title: 'Error de subida',
          text: 'No se pudo subir la foto a Cloudinary. Intenta nuevamente.',
          icon: 'error',
          confirmButtonColor: '#b3131b',
        });
        setPreviewUrl('');
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: 'Error de red',
        text: 'Hubo un error de conexión al subir la imagen.',
        icon: 'error',
        confirmButtonColor: '#b3131b',
      });
      setPreviewUrl('');
    } finally {
      setSubiendoImagen(false);
    }
  };

  const handleImageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFileToCloudinary(file);
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

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFileToCloudinary(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, image: '' }));
    setPreviewUrl('');
  };

  // Validation logic
  const isFormValid = Boolean(
    formData.name.trim() &&
    formData.sku.trim() &&
    formData.image &&
    !subiendoImagen &&
    (!formData.price || !isNaN(Number(formData.price)))
  );

  const getDisabledReason = () => {
    if (subiendoImagen) return 'Subiendo fotografía a la nube...';
    if (!formData.name.trim()) return 'Falta ingresar el nombre del producto';
    if (!formData.sku.trim()) return 'Falta ingresar el código SKU';
    if (!formData.image) return 'Falta subir la fotografía del producto';
    return '';
  };

  const executeSave = async () => {
    if (!formData.name.trim() || !formData.sku.trim()) {
      setValidationError('Por favor completa el nombre y el SKU antes de guardar.');
      return;
    }

    if (!formData.image) {
      setValidationError('Es obligatorio subir una foto del producto.');
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
          slug: sanitizedSlug,
          price: formData.price ? Number(formData.price) : 0,
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
            setPreviewUrl('');
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
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">
                Fabricante / Marca
              </label>
              <select
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className="w-full px-4 py-3.5 rounded-xl bg-neutral-50/60 border border-neutral-200 text-sm font-semibold text-neutral-900 focus:bg-white focus:border-[#b3131b] focus:ring-4 focus:ring-[#b3131b]/10 outline-none transition-all cursor-pointer"
              >
                <option value="Porsche">Porsche</option>
                <option value="BMW">BMW</option>
                <option value="Audi">Audi</option>
                <option value="Land Rover">Land Rover</option>
                <option value="Mercedes-Benz">Mercedes-Benz</option>
                <option value="ROWE">ROWE (Aceites Alemanes)</option>
              </select>
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
                <option value="Frenos">Frenos de Alto Rendimiento</option>
                <option value="Lubricantes">Aceites y Lubricantes</option>
                <option value="Motor & Transmisión">Motor & Transmisión</option>
                <option value="Accesorios">Accesorios Deportivos</option>
              </select>
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

            {/* Fotografía Dropzone & Live Preview */}
            <div className="md:col-span-7 space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                Fotografía del Repuesto <span className="text-red-500">*</span>
              </label>

              {previewUrl || formData.image ? (
                /* Previsualización de Imagen cargada */
                <div className="relative rounded-2xl border border-neutral-200 bg-neutral-50 p-4 flex items-center gap-4">
                  <div className="w-24 h-24 rounded-xl bg-white border border-neutral-200/80 p-2 flex items-center justify-center flex-shrink-0 relative overflow-hidden shadow-xs">
                    <Image
                      src={previewUrl || formData.image}
                      alt="Vista previa"
                      width={96}
                      height={96}
                      className="object-contain w-full h-full"
                    />
                    {subiendoImagen && (
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center">
                        <RefreshCw className="w-5 h-5 text-white animate-spin" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 mb-1">
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>{subiendoImagen ? 'Subiendo a CDN...' : 'Fotografía vinculada'}</span>
                    </div>
                    <p className="text-[11px] text-neutral-400 font-mono truncate">
                      {formData.image || 'Procesando archivo local...'}
                    </p>

                    <div className="flex items-center gap-2 mt-3">
                      <label className="cursor-pointer inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-neutral-700 hover:text-[#b3131b] bg-white border border-neutral-200 px-3 py-1.5 rounded-lg shadow-xs hover:bg-neutral-50 active:scale-95 transition-all">
                        <span>Cambiar</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageInput}
                          disabled={subiendoImagen}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-neutral-500 hover:text-red-600 px-2 py-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Quitar</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Dropzone cuando no hay imagen */
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
                      <span className="font-bold text-[#b3131b]">Haz clic para subir</span> o arrastra y suelta tu archivo aquí
                    </div>
                    <span className="text-[10px] text-neutral-400 font-mono">
                      Formatos recomendados: PNG o WEBP con fondo transparente o blanco
                    </span>
                  </div>
                </div>
              )}
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