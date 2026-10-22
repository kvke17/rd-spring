'use client';

import { use, useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { STORE_CONFIG } from '@/config/constants';
import { useCartStore } from '@/lib/store';
import QuoteModal from '@/components/QuoteModal';
import ProductReviews from '@/components/ProductoReviews';
import productsData from '@/data/products.json';
import { 
  ShoppingCart, 
  Check, 
  ShieldCheck, 
  Truck, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft,
  FileText, 
  Sliders, 
  Car, 
  Star, 
  Shield, 
  Plus, 
  Minus,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Globe2
} from 'lucide-react';


const TABS = [
  { id: 'descripcion', label: 'Descripción', icon: FileText },
  { id: 'ficha', label: 'Ficha Técnica', icon: Sliders },
  { id: 'compatibilidad', label: 'Compatibilidad', icon: Car },
  { id: 'resenas', label: 'Reseñas', icon: Star },
  { id: 'garantia', label: 'Garantía', icon: ShieldCheck }
];

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [formato, setFormato] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('descripcion');
  const [addedJustNow, setAddedJustNow] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/admin/products`, { cache: 'no-store' });
        if (res.ok) {
          const allProducts = await res.json();
          
          const found = allProducts.find((p: any) => 
            p.id === slug || 
            p.slug === slug || 
            p.slug?.toLowerCase() === slug.toLowerCase() ||
            p.sku?.toLowerCase() === slug.toLowerCase() ||
            p.sku?.toLowerCase().includes(slug.toLowerCase())
          );
          console.log('[DEBUG] found product images:', found?.images);

          if (found) {
            const skuBase = found.sku ? found.sku.split('-')[0] : found.id;
            const relatedFormats = allProducts.filter((p: any) => p.sku?.startsWith(skuBase));

            const formats = relatedFormats.map((rf: any) => {
              let size = '1LT';
              if (rf.sku?.includes('-0040-') || rf.name.includes('4L')) size = '4LT';
              if (rf.sku?.includes('-0050-') || rf.name.includes('5L')) size = '5LT';
              return {
                size,
                sku: rf.sku,
                price: rf.price || 0,
                image: rf.image || '',
                stock: 10
              };
            });

            formats.sort((a: any, b: any) => (a.size === '1LT' ? -1 : 1));

            const finalFormats = formats.length > 0 ? formats : [{ size: 'Único', sku: found.sku, price: found.price, image: found.image, stock: 10 }];

            const jsonOriginalMatch = (productsData as any[]).find(item => 
              item.formats?.some((f: any) => f.sku?.startsWith(skuBase)) || 
              item.id?.includes(skuBase) ||
              item.name?.toLowerCase().includes(found.name?.toLowerCase())
            );

            let realDescription = found.description || '';
            let adminSpecs = {};
            let adminCompatibility = [];
            let adminImages: string[] = [];

            try {
              const parsedDesc = JSON.parse(found.description);
              if (parsedDesc && typeof parsedDesc === 'object') {
                realDescription = parsedDesc.text || '';
                
                if (parsedDesc.specs) {
                  adminSpecs = parsedDesc.specs.split('\n').reduce((acc: any, line: string) => {
                    const [k, v] = line.split(':');
                    if (k && v) acc[k.trim()] = v.trim();
                    return acc;
                  }, {});
                }

                if (parsedDesc.compatibility) {
                  adminCompatibility = parsedDesc.compatibility.split(',').map((s: string) => s.trim());
                }

                if (Array.isArray(parsedDesc.images) && parsedDesc.images.length > 0) {
                  adminImages = parsedDesc.images.filter(Boolean);
                }
              }
            } catch {
              // fallback
            }

            if (adminImages.length === 0) {
              if (Array.isArray(found.images) && found.images.length > 0) {
                adminImages = found.images.filter(Boolean);
              } else if (found.image) {
                adminImages = [found.image];
              }
            }

            const finalSpecs = Object.keys(adminSpecs).length > 0 ? adminSpecs : (jsonOriginalMatch?.specs || {});
            const finalCompatibility = adminCompatibility.length > 0 ? adminCompatibility : (jsonOriginalMatch?.compatibility || []);

            setProduct({
              ...found,
              name: found.name.replace(/(-?\d{5}-\d{4}-\d{2})/g, '').trim() || found.name,
              description: realDescription || jsonOriginalMatch?.description || 'Componente de alta calidad para vehículos de alta gama.',
              specs: finalSpecs,
              compatibility: finalCompatibility,
              formats: finalFormats,
              images: adminImages
            });
          }
        }
      } catch (error) {
        console.error("Error cargando detalle del producto:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  useEffect(() => {
    if (product) {
      const defSize = product.formats?.some((f: any) => f.size === '5LT') ? '5LT' : product.formats?.[0]?.size || '';
      setFormato(defSize);
    }
  }, [product]);

  const currentFormatData = product?.formats?.find((f: any) => f.size === formato) || product?.formats?.[0];
  const currentPrice = currentFormatData ? currentFormatData.price : (product?.price || 0);
  const currentSku = currentFormatData ? currentFormatData.sku : (product?.sku || '');
  const currentImage = currentFormatData?.image || product?.image || '/images/logo-rd.png';

  const allImages: string[] = useMemo(() => {
    if (product?.images && product.images.length > 1) {
      return product.images;
    }
    if (currentFormatData?.image && currentFormatData.image !== product?.image) {
      const formatImg = currentFormatData.image;
      const otherImgs = (product?.images || []).filter((img: string) => img !== formatImg);
      return [formatImg, ...otherImgs];
    }
    return (product?.images && product.images.length > 0)
      ? product.images
      : [product?.image || '/images/logo-rd.png'];
  }, [product, currentFormatData]);

  useEffect(() => {
    setActiveImageIndex(0);
  }, [formato]);

  const addItem = useCartStore((state) => state.addItem);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 text-gray-900 pt-28 sm:pt-32 pb-24 font-sans">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb Skeleton */}
          <div className="mb-6 flex items-center gap-2">
            <div className="h-4 w-16 bg-slate-200 rounded-md animate-pulse" />
            <div className="h-4 w-4 bg-slate-200 rounded-md animate-pulse" />
            <div className="h-4 w-20 bg-slate-200 rounded-md animate-pulse" />
            <div className="h-4 w-4 bg-slate-200 rounded-md animate-pulse" />
            <div className="h-4 w-36 bg-slate-200 rounded-md animate-pulse" />
          </div>

          {/* Header Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Image Placeholder */}
            <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200/80 aspect-square p-8 sm:p-12 flex items-center justify-center shadow-sm">
              <div className="w-3/5 h-3/5 bg-slate-100 rounded-2xl animate-pulse" />
            </div>

            {/* Info Placeholder */}
            <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-sm space-y-6 overflow-hidden">
              <div className="flex gap-2">
                <div className="h-5 w-20 bg-slate-100 rounded-full animate-pulse" />
                <div className="h-5 w-28 bg-slate-100 rounded-md animate-pulse" />
              </div>
              <div className="space-y-2.5">
                <div className="h-8 w-4/5 bg-slate-200 rounded-lg animate-pulse" />
                <div className="h-8 w-3/5 bg-slate-200 rounded-lg animate-pulse" />
              </div>
              <div className="h-16 w-full bg-slate-100 rounded-2xl animate-pulse" />
              <div className="space-y-2">
                <div className="h-3 w-32 bg-slate-100 rounded animate-pulse" />
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="h-14 bg-slate-100 rounded-xl animate-pulse" />
                  <div className="h-14 bg-slate-100 rounded-xl animate-pulse" />
                  <div className="h-14 bg-slate-100 rounded-xl animate-pulse" />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <div className="w-24 sm:w-32 h-12 bg-slate-100 rounded-2xl animate-pulse shrink-0" />
                <div className="flex-1 h-12 bg-slate-200 rounded-2xl animate-pulse" />
              </div>
            </div>
          </div>

          {/* Tabs Skeleton */}
          <div className="mt-14 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm overflow-hidden">
            <div className="flex overflow-x-auto no-scrollbar gap-3 border-b border-slate-100 pb-4">
              <div className="h-10 w-24 sm:w-28 bg-slate-100 rounded-xl animate-pulse shrink-0" />
              <div className="h-10 w-24 sm:w-28 bg-slate-100 rounded-xl animate-pulse shrink-0" />
              <div className="h-10 w-28 sm:w-32 bg-slate-100 rounded-xl animate-pulse shrink-0" />
            </div>
            <div className="py-8 space-y-4">
              <div className="h-4 w-full bg-slate-100 rounded animate-pulse" />
              <div className="h-4 w-5/6 bg-slate-100 rounded animate-pulse" />
              <div className="h-4 w-4/6 bg-slate-100 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center text-center px-4 pt-28 pb-16 font-sans">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-10 shadow-lg shadow-slate-100 flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-[#b3131b] mb-5">
            <AlertCircle className="w-7 h-7" />
          </div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#b3131b] font-bold mb-1">
            CATÁLOGO AUTOMOTRIZ
          </span>
          <h1 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">
            Producto no encontrado
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm leading-relaxed mb-8">
            El componente o lubricante solicitado no está disponible, fue reasignado de código o descatalogado temporalmente.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Link 
              href="/catalogo" 
              className="flex-1 inline-flex items-center justify-center gap-2 bg-[#b3131b] hover:bg-[#8f0f15] text-white px-6 py-3.5 rounded-xl text-xs uppercase font-bold tracking-wider transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver al Catálogo</span>
            </Link>
            <Link 
              href="/cotizacion" 
              className="inline-flex items-center justify-center px-5 py-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs uppercase font-bold tracking-wider transition-all active:scale-95 cursor-pointer"
            >
              Cotizar con VIN
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const activeImage = allImages[activeImageIndex] || allImages[0] || '/images/logo-rd.png';

  const nextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const handleAddToCart = () => {
    const productToAdd = {
      ...product, 
      id: currentSku, 
      sku: currentSku,
      type: 'venta_online',
      name: product.formats?.length > 1 ? `${product.name} (${formato})` : product.name, 
      price: currentPrice,
      stock: 999,
      image: activeImage || currentImage,
    };

    addItem(productToAdd as any, quantity);
    setAddedJustNow(true);
    setTimeout(() => setAddedJustNow(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-gray-900 pt-28 sm:pt-32 pb-24 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb de navegación */}
        <div className="mb-6 flex items-center gap-2 text-xs text-slate-400 font-medium">
          <Link href="/catalogo" className="hover:text-gray-900 transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Catálogo</span>
          </Link>
          <span>/</span>
          <span className="text-slate-600 truncate max-w-xs">{product.brand}</span>
          <span>/</span>
          <span className="text-gray-900 truncate max-w-sm font-bold">{product.name}</span>
        </div>

        {/* HEADER DEL PRODUCTO */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Galería / Carrusel de Imágenes */}
          <div className="lg:col-span-6 space-y-3">
            <div className="bg-white rounded-3xl border border-slate-200/80 aspect-square relative flex items-center justify-center overflow-hidden shadow-sm p-6 sm:p-10 group select-none">
              
              {/* Badge de Marca / Fabricante */}
              <div className="absolute top-4 left-4 z-10 pointer-events-none">
                <span className="bg-red-50 text-[#b3131b] border border-red-100 text-[10px] font-mono font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-2xs">
                  {product.brand || 'OEM'}
                </span>
              </div>

              {/* Contador de fotos (1 / N) si hay múltiples fotos */}
              {allImages.length > 1 && (
                <div className="absolute top-4 right-4 z-10 pointer-events-none">
                  <span className="bg-slate-900/70 backdrop-blur-md text-white text-[10px] font-mono font-bold px-2.5 py-1 rounded-full shadow-2xs flex items-center gap-1">
                    <span>{activeImageIndex + 1}</span>
                    <span className="opacity-60">/</span>
                    <span>{allImages.length}</span>
                  </span>
                </div>
              )}

              {/* Imagen Principal */}
              <div className="relative w-full h-full">
                <Image 
                  key={activeImage}
                  src={activeImage} 
                  alt={`${product.name} - Imagen ${activeImageIndex + 1}`} 
                  fill 
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-contain p-4 sm:p-8 transition-transform duration-500 hover:scale-105" 
                  priority 
                  onError={(e: any) => { e.currentTarget.src = '/images/logo-rd.png'; }}
                />
              </div>

              {/* Botones de navegación del carrusel */}
              {allImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); prevImage(); }}
                    aria-label="Imagen anterior"
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-slate-800 border border-slate-200/80 shadow-md flex items-center justify-center transition-all duration-150 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 active:scale-90 cursor-pointer z-20"
                  >
                    <ChevronLeft className="w-5 h-5 text-slate-700" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); nextImage(); }}
                    aria-label="Siguiente imagen"
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-slate-800 border border-slate-200/80 shadow-md flex items-center justify-center transition-all duration-150 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 active:scale-90 cursor-pointer z-20"
                  >
                    <ChevronRight className="w-5 h-5 text-slate-700" />
                  </button>
                </>
              )}
            </div>

            {/* Fila de Miniaturas (Thumbnails) */}
            {allImages.length > 1 && (
              <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1 px-1">
                {allImages.map((img, idx) => {
                  const isActive = idx === activeImageIndex;
                  return (
                    <button
                      key={`${img}-${idx}`}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white border-2 p-1.5 flex-shrink-0 transition-all duration-200 cursor-pointer overflow-hidden shadow-2xs ${
                        isActive
                          ? 'border-[#b3131b] ring-2 ring-[#b3131b]/20 scale-102'
                          : 'border-slate-200/90 opacity-70 hover:opacity-100 hover:border-slate-300'
                      }`}
                      aria-label={`Ver imagen ${idx + 1}`}
                    >
                      <Image
                        src={img}
                        alt={`Miniatura ${idx + 1}`}
                        fill
                        sizes="80px"
                        className="object-contain p-1"
                        onError={(e: any) => { e.currentTarget.src = '/images/logo-rd.png'; }}
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Información y Compra */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6 bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-10 shadow-sm">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">
                  {product.category || 'Componente'}
                </span>
                {product.brand && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span className="text-[10px] font-mono uppercase font-bold text-[#b3131b] bg-red-50 px-2 py-0.5 rounded-md border border-red-100">
                      Marca: {product.brand}
                    </span>
                  </>
                )}
                <span className="text-slate-300">•</span>
                <span className="text-[10px] font-mono uppercase text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                  SKU: {currentSku}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-gray-900 mb-4 leading-snug">
                {product.name}
              </h1>

              {/* Precio */}
              <div className="mb-6 p-4 rounded-2xl bg-slate-50/70 border border-slate-100 flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-black text-[#b3131b] tracking-tight">
                  {STORE_CONFIG.CURRENCY_FORMAT.format(currentPrice)}
                </span>
                <span className="text-xs text-slate-400 font-medium">IVA Incluido</span>
              </div>

              {/* Selector de Formato (si hay variantes) */}
              {product.formats && product.formats.length > 1 && (
                <div className="mb-6">
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-600 mb-2.5 font-bold">
                    Seleccionar Presentación / Envase:
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {product.formats.map((f: any) => {
                      const isSelected = formato === f.size;
                      return (
                        <button
                          key={f.size}
                          onClick={() => setFormato(f.size)}
                          className={`py-3 px-3 rounded-xl text-xs font-bold transition-all text-center border ${
                            isSelected 
                              ? 'bg-slate-900 text-white border-slate-900 shadow-sm' 
                              : 'bg-slate-50/80 text-slate-700 hover:bg-slate-100 border-slate-200'
                          }`}
                        >
                          <span className="block text-sm uppercase">{f.size}</span>
                          <span className={`text-[10px] font-mono ${isSelected ? 'text-red-200' : 'text-slate-400'}`}>
                            {STORE_CONFIG.CURRENCY_FORMAT.format(f.price)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Controles de Cantidad y Agregar al Carro */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex gap-3">
                
                {/* Contador */}
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl p-1">
                  <button 
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                    disabled={quantity <= 1}
                    className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-600 hover:bg-white hover:text-gray-900 hover:shadow-2xs active:scale-90 active:bg-slate-200 disabled:opacity-40 disabled:pointer-events-none transition-all duration-150 cursor-pointer"
                    aria-label="Disminuir cantidad"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center font-bold text-sm text-gray-900 font-mono select-none">
                    {quantity}
                  </span>
                  <button 
                    type="button"
                    onClick={() => setQuantity(quantity + 1)} 
                    className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-600 hover:bg-white hover:text-gray-900 hover:shadow-2xs active:scale-90 active:bg-slate-200 transition-all duration-150 cursor-pointer"
                    aria-label="Aumentar cantidad"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Botón CTA con microinteracción táctil y estado dinámico */}
                <button 
                  type="button"
                  onClick={handleAddToCart}
                  className={`flex-1 flex items-center justify-center gap-2 font-bold py-3.5 px-6 rounded-2xl uppercase tracking-wider text-xs transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer ${
                    addedJustNow
                      ? 'bg-emerald-600 text-white scale-[1.01]'
                      : 'bg-[#b3131b] hover:bg-[#8f0f15] text-white'
                  }`}
                  aria-live="polite"
                >
                  {addedJustNow ? (
                    <>
                      <Check className="w-4 h-4 animate-in zoom-in-75 duration-200" />
                      <span>¡Añadido al Carro!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      <span>Añadir al Carro</span>
                    </>
                  )}
                </button>
              </div>

              {/* Micro-garantías */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                  <Truck className="w-4 h-4 text-[#b3131b] shrink-0" />
                  <span>Despacho a todo Chile</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                  <ShieldCheck className="w-4 h-4 text-[#b3131b] shrink-0" />
                  <span>1 Año de Garantía</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* PESTAÑAS DETALLE */}
        <div className="mt-14 bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-8 shadow-sm overflow-hidden">
          
          {/* Navegación de Pestañas */}
          <div className="flex overflow-x-auto no-scrollbar gap-2 border-b border-slate-100 pb-4">
            {TABS.map((tab) => {
              const TabIcon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs uppercase font-bold tracking-wider transition-all whitespace-nowrap ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'text-slate-500 hover:text-gray-900 hover:bg-slate-100'
                  }`}
                >
                  <TabIcon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Contenido de la Pestaña Activa */}
          <div className="py-8 min-h-[300px]">
            {activeTab === 'descripcion' && (
              <div className="max-w-4xl text-sm text-slate-600 leading-relaxed space-y-6">
                <p className="font-normal text-base text-gray-800 leading-relaxed">{product.description}</p>
                <div className="bg-slate-50/70 p-6 rounded-2xl border border-slate-200/80 mt-6">
                  <h4 className="text-[#b3131b] text-xs font-mono uppercase tracking-wider font-bold mb-4">
                    Números de Referencia y Calidad
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600">
                    <div>
                      <span className="block text-gray-900 font-bold mb-1">SKU Oficial:</span>
                      <span className="font-mono">{currentSku}</span>
                    </div>
                    {product.brand && (
                      <div>
                        <span className="block text-gray-900 font-bold mb-1">Marca del Repuesto:</span>
                        <span className="font-semibold text-gray-900">{product.brand}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ficha' && (
              <div className="max-w-4xl space-y-6">
                <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#b3131b] font-bold block mb-1">
                      ESTÁNDAR OEM & HOMOLOGACIÓN
                    </span>
                    <h3 className="text-lg font-bold text-gray-900">
                      Ficha Técnica y Aprobaciones del Fabricante
                    </h3>
                  </div>
                  {product.specs?.['Origen'] && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-mono font-medium self-start sm:self-auto">
                      <Globe2 className="w-3.5 h-3.5 text-slate-500" />
                      <span>{product.specs['Origen']}</span>
                    </span>
                  )}
                </div>

                {product.specs && Object.keys(product.specs).length > 0 ? (
                  <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                    <table className="w-full text-left text-xs">
                      <tbody className="divide-y divide-slate-100">
                        {Object.entries(product.specs).map(([key, rawVal]) => {
                          const valStr = String(rawVal || '').trim();
                          const isApprovalsOrSpecs = /aprobaciones|especificaciones|recomendaciones/i.test(key);
                          const lines = valStr.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

                          return (
                            <tr key={key} className="hover:bg-slate-50/50 transition-colors">
                              <th className="py-4 px-5 font-mono uppercase text-slate-500 text-[11px] font-semibold w-1/3 sm:w-2/5 align-top tracking-wider bg-slate-50/40 border-r border-slate-100">
                                {key}
                              </th>
                              <td className="py-4 px-5 text-gray-900 align-top">
                                {isApprovalsOrSpecs ? (
                                  <div className="flex flex-wrap gap-1.5">
                                    {lines.flatMap(line => line.split(/\s*\|\s*/)).map((item, itemIdx) => (
                                      <span
                                        key={itemIdx}
                                        className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200/90 text-slate-800 text-xs font-mono font-medium shadow-2xs"
                                      >
                                        {item.trim()}
                                      </span>
                                    ))}
                                  </div>
                                ) : lines.length > 1 ? (
                                  <ul className="space-y-1.5">
                                    {lines.map((line, lIdx) => (
                                      <li key={lIdx} className="leading-relaxed font-normal text-slate-700">
                                        {line}
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <span className="font-medium text-slate-800 leading-relaxed">
                                    {valStr}
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 text-center bg-slate-50/60 rounded-2xl border border-slate-200">
                    <p className="text-slate-400 text-xs font-medium">
                      Especificaciones detalladas no disponibles para este código. Consulta con tu VIN en el formulario de cotización.
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'compatibilidad' && (
              <div className="max-w-4xl space-y-4">
                <p className="text-xs text-slate-500 font-medium">Vehículos y plataformas homologadas para este componente:</p>
                {product.compatibility && product.compatibility.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {product.compatibility.map((gen: string) => (
                      <span key={gen} className="bg-slate-50 border border-slate-200 rounded-xl text-gray-900 px-3.5 py-2 text-xs font-medium flex items-center gap-1.5 shadow-2xs">
                        <Car className="w-3.5 h-3.5 text-[#b3131b]" />
                        <span>{gen}</span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-xs">Información de compatibilidad universal o sujeta a validación por chasis (VIN).</p>
                )}
              </div>
            )}

            {activeTab === 'resenas' && (
              <div className="max-w-4xl">
                <ProductReviews productId={currentSku} />
              </div>
            )}

            {activeTab === 'garantia' && (
              <div className="max-w-4xl text-sm text-slate-600 leading-relaxed space-y-4">
                <h3 className="text-base font-bold text-gray-900">Garantía RD Spring</h3>
                <p>
                  Todos nuestros repuestos y fluidos cuentan con respaldo y garantía de especificaciones de fabricante original por 1 año calendario desde la fecha de recepción.
                </p>
                <div className="pt-2">
                  <Link href="/garantia" className="text-xs text-[#b3131b] font-bold hover:underline inline-flex items-center gap-1">
                    <span>Revisar políticas detalladas de garantía</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
      <QuoteModal product={product} isOpen={isQuoteModalOpen} onClose={() => setIsQuoteModalOpen(false)} />
    </div>
  );
}