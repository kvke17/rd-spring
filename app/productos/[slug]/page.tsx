'use client';

import { use, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { STORE_CONFIG } from '@/config/constants';
import { useCartStore } from '@/lib/store';
import QuoteModal from '@/components/QuoteModal';
import ProductReviews from '@/components/ProductoReviews';
import productsData from '@/data/products.json';

const TABS = [
  { id: 'descripcion', label: 'Descripción' },
  { id: 'ficha', label: 'Ficha Técnica' },
  { id: 'compatibilidad', label: 'Compatibilidad' },
  { id: 'resenas', label: 'Reseñas' },
  { id: 'garantia', label: 'Garantía' }
];

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/admin/products`);
        if (res.ok) {
          const allProducts = await res.json();
          
          // Búsqueda flexible y robusta para atrapar aceites y repuestos por igual
          const found = allProducts.find((p: any) => 
            p.id === slug || 
            p.slug === slug || 
            p.slug?.toLowerCase() === slug.toLowerCase() ||
            p.sku?.toLowerCase() === slug.toLowerCase() ||
            p.sku?.toLowerCase().includes(slug.toLowerCase())
          );

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

            // Si es un repuesto o producto sin formato múltiple, definimos un formato único predeterminado
            const finalFormats = formats.length > 0 ? formats : [{ size: 'Único', sku: found.sku, price: found.price, image: found.image, stock: 10 }];

            // 1. Buscamos el respaldo en el JSON original por si la BD no tiene datos complementarios
            const jsonOriginalMatch = (productsData as any[]).find(item => 
              item.formats?.some((f: any) => f.sku?.startsWith(skuBase)) || 
              item.id?.includes(skuBase) ||
              item.name?.toLowerCase().includes(found.name?.toLowerCase())
            );

            // 2. EXTRAEMOS DE FORMA INTELIGENTE DESDE LA DESCRIPCIÓN O EL JSON
            let realDescription = found.description || '';
            let adminSpecs = {};
            let adminCompatibility = [];

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
              }
            } catch {
              // Si no está en formato JSON, se mantiene como texto plano
            }

            const finalSpecs = Object.keys(adminSpecs).length > 0 ? adminSpecs : (jsonOriginalMatch?.specs || {});
            const finalCompatibility = adminCompatibility.length > 0 ? adminCompatibility : (jsonOriginalMatch?.compatibility || []);

            setProduct({
              ...found,
              name: found.name.replace(/(-?\d{5}-\d{4}-\d{2})/g, '').trim() || found.name,
              description: realDescription || jsonOriginalMatch?.description || 'Componente de alta calidad para vehículos de alta gama.',
              specs: finalSpecs,
              compatibility: finalCompatibility,
              formats: finalFormats
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

  const [formato, setFormato] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('descripcion');

  useEffect(() => {
    if (product) {
      const defSize = product.formats?.some((f: any) => f.size === '5LT') ? '5LT' : product.formats?.[0]?.size || '';
      setFormato(defSize);
    }
  }, [product]);

  const addItem = useCartStore((state) => state.addItem);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500 font-bold">Cargando producto...</div>;
  }

  // Si ya terminó de cargar pero no encontró nada, recién mostramos el 404
  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-4xl font-bold mb-2">Producto no encontrado</h1>
        <p className="text-gray-500 text-sm mb-6">El producto que buscas no está disponible o fue eliminado.</p>
        <Link href="/repuestos" className="bg-black text-white px-6 py-3 text-xs uppercase font-bold tracking-wider hover:bg-gray-800 transition">
          Volver a Repuestos
        </Link>
      </div>
    );
  }

  const currentFormatData = product.formats?.find((f: any) => f.size === formato) || product.formats?.[0];
  const currentPrice = currentFormatData ? currentFormatData.price : product.price;
  const currentSku = currentFormatData ? currentFormatData.sku : product.sku;
  const currentImage = currentFormatData?.image || product.image || '/images/logo-rd.png';

  const handleAddToCart = () => {
    const productToAdd = {
      ...product, 
      id: currentSku, 
      sku: currentSku,
      name: product.formats?.length > 1 ? `${product.name} (${formato})` : product.name, 
      price: currentPrice,
      stock: 999,
      image: currentImage,
    };

    addItem(productToAdd, quantity);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 pt-28 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HEADER DEL PRODUCTO */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          <div className="lg:col-span-7 bg-gray-50 rounded-lg aspect-square relative flex items-center justify-center overflow-hidden border border-white/5">
            <Image 
              src={currentImage} 
              alt={product.name} 
              fill 
              className="object-contain p-8 transition-opacity duration-300" 
              priority 
              onError={(e: any) => { e.currentTarget.src = '/images/logo-rd.png'; }}
            />
          </div>

          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">{product.brand}</p>
              <h1 className="text-3xl font-bold uppercase tracking-tight mb-4 leading-tight">{product.name}</h1>
              <p className="text-xs text-gray-600 mb-6">SKU: <span className="text-gray-900">{currentSku}</span></p>
              
              <div className="text-4xl font-bold text-[#b3131b] mb-8">
                {STORE_CONFIG.CURRENCY_FORMAT.format(currentPrice)}
              </div>

              {/* Selector de formato condicional (solo si hay más de una variante, ej: 1LT y 5LT) */}
              {product.formats && product.formats.length > 1 && (
                <div className="mb-8">
                  <p className="text-[11px] uppercase tracking-widest text-gray-600 mb-3">Seleccionar Formato</p>
                  <div className="grid grid-cols-3 gap-3">
                    {product.formats.map((f: any) => (
                      <button
                        key={f.size}
                        onClick={() => setFormato(f.size)}
                        className={`py-3 text-xs uppercase transition-all ${
                          formato === f.size 
                            ? 'bg-white text-black font-bold border-2 border-black' 
                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                        }`}
                      >
                        {f.size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-1/3">
                  <p className="text-[11px] uppercase tracking-widest text-gray-600 mb-2">Cantidad</p>
                  <div className="flex items-center bg-gray-50 border border-gray-200">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-3 text-gray-600 hover:text-gray-900 transition">-</button>
                    <span className="flex-1 text-center text-sm">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="px-4 py-3 text-gray-600 hover:text-gray-900 transition">+</button>
                  </div>
                </div>
                <div className="w-2/3 flex items-end">
                  <button 
                    onClick={handleAddToCart}
                    className="w-full bg-[#b3131b] text-white font-bold py-3 px-6 uppercase tracking-wider text-xs hover:bg-red-800 transition"
                  >
                    Añadir al carro
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PESTAÑAS */}
        <div className="mt-20">
          <div className="flex overflow-x-auto no-scrollbar border-b border-gray-200">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-8 py-4 text-xs uppercase tracking-widest whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id 
                    ? 'border-[#b3131b] text-gray-900 bg-black/5 font-bold' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="py-12 min-h-[400px]">
            {activeTab === 'descripcion' && (
              <div className="max-w-4xl text-sm text-gray-700 leading-relaxed space-y-6">
                <p>{product.description}</p>
                <div className="bg-gray-50 p-6 border border-gray-200 mt-8">
                  <h4 className="text-[#b3131b] text-xs uppercase tracking-widest mb-4">Números de Referencia (OE / MFG)</h4>
                  <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                    <div>
                      <span className="block text-gray-900 mb-1">SKU Seleccionado:</span>
                      {currentSku}
                    </div>
                    <div>
                      <span className="block text-gray-900 mb-1">Calidad:</span>
                      German Synthetic / OEM
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ficha' && (
              <div className="max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 text-xs">
                {product.specs && Object.keys(product.specs).length > 0 ? (
                  Object.entries(product.specs).map(([key, val]) => (
                    <div key={key} className="flex justify-between border-b border-gray-200 pb-2">
                      <span className="uppercase text-gray-600">{key}</span>
                      <span className="font-bold text-gray-900 text-right">{val as string}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">Especificaciones detalladas no disponibles para este producto.</p>
                )}
              </div>
            )}

            {activeTab === 'compatibilidad' && (
              <div className="max-w-4xl space-y-6">
                {product.compatibility && product.compatibility.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {product.compatibility.map((gen: string) => (
                      <span key={gen} className="bg-gray-50 border border-gray-300 rounded text-gray-900 px-4 py-2 text-xs">{gen}</span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-xs">Información de compatibilidad genérica.</p>
                )}
              </div>
            )}

            {activeTab === 'resenas' && (
              <div className="max-w-4xl space-y-12">
                <ProductReviews productId={currentSku} />
              </div>
            )}

            {activeTab === 'garantia' && (
              <div className="max-w-4xl text-sm text-gray-700 leading-relaxed space-y-4">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Garantía RD Spring</h3>
                <p>Todos nuestros productos cuentan con garantía oficial de calidad y especificaciones de fábrica.</p>
              </div>
            )}
          </div>
        </div>

      </div>
      <QuoteModal product={product} isOpen={isQuoteModalOpen} onClose={() => setIsQuoteModalOpen(false)} />
    </div>
  );
}