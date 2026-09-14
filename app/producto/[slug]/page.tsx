'use client';

import { use, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import productsData from '@/data/products.json';
import { Product } from '@/types';
import { STORE_CONFIG } from '@/config/constants';
import { useCartStore } from '@/lib/store';
import QuoteModal from '@/components/QuoteModal';
import ProductReviews from '@/components/ProductoReviews';

const TABS = [
  { id: 'descripcion', label: 'Descripción' },
  { id: 'ficha', label: 'Ficha Técnica' },
  { id: 'compatibilidad', label: 'Compatibilidad' },
  { id: 'resenas', label: 'Reseñas' },
  { id: 'garantia', label: 'Garantía' }
];

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const product = (productsData as any[]).find((p) => p.slug === slug);

  if (!product) notFound();

  const defaultFormat = product.formats?.some((f: any) => f.size === '5 Litros') 
    ? '5 Litros' 
    : product.formats?.[0]?.size || '';
  
  const [formato, setFormato] = useState(defaultFormat);
  const [quantity, setQuantity] = useState(1);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('descripcion');
  
  const addItem = useCartStore((state) => state.addItem);

  // 1. Obtenemos los datos del formato seleccionado
  const currentFormatData = product.formats?.find((f: any) => f.size === formato);
  const currentPrice = currentFormatData ? currentFormatData.price : product.price;
  const currentSku = currentFormatData ? currentFormatData.sku : product.sku;

  // 2. Lógica Dinámica de la Imagen (Cambia según el SKU)
  const expectedImage = `/images/rowe/${currentSku}.png`;
  const [imgSrc, setImgSrc] = useState(expectedImage);

  useEffect(() => {
    setImgSrc(`/images/rowe/${currentSku}.png`);
  }, [currentSku]);

  // 3. Agregar al Carro (SIN LÍMITES DE STOCK)
  const handleAddToCart = () => {
    const productToAdd: Product = {
      ...product, 
      id: currentSku, 
      sku: currentSku,
      name: `${product.name} (${formato})`, 
      price: currentPrice,
      stock: 999, // Enviamos un stock infinito al carrito para evitar bloqueos
      image: imgSrc,
    };

    addItem(productToAdd, quantity);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 pt-28 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HEADER DEL PRODUCTO */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* FOTO DEL PRODUCTO */}
          <div className="lg:col-span-7 bg-gray-50 rounded-lg aspect-square relative flex items-center justify-center overflow-hidden border border-white/5">
            <Image 
              src={imgSrc} 
              alt={product.name} 
              fill 
              className="object-contain p-8 transition-opacity duration-300" 
              priority 
              onError={() => setImgSrc('/images/logo-rd.png')}
            />
          </div>

          {/* DETALLES Y COMPRA */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div>
              <p className="text-xs uppercase  tracking-widest text-gray-500 mb-2">{product.brand}</p>
              <h1 className="text-3xl font-bold uppercase tracking-tight mb-4 leading-tight">{product.name}</h1>
              <p className="text-xs text-gray-600  mb-6">SKU: <span className="text-gray-900">{currentSku}</span></p>
              
              <div className="text-4xl font-bold text-[#b3131b]  mb-8">
                {STORE_CONFIG.CURRENCY_FORMAT.format(currentPrice)}
              </div>

              {/* BOTONES DE FORMATO */}
              {product.formats && product.formats.length > 0 && (
                <div className="mb-8">
                  <p className="text-[11px] uppercase tracking-widest text-gray-600 mb-3 ">Seleccionar Formato</p>
                  <div className="grid grid-cols-3 gap-3">
                    {product.formats.map((f: any) => (
                      <button
                        key={f.size}
                        onClick={() => setFormato(f.size)}
                        className={`py-3 text-xs  uppercase transition-all ${
                          formato === f.size 
                            ? 'bg-white text-black font-bold' 
                            : 'bg-gray-50 text-gray-600 hover:bg-white/10 border border-gray-200'
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
                  <p className="text-[11px] uppercase tracking-widest text-gray-600 mb-2 ">Cantidad</p>
                  <div className="flex items-center bg-gray-50 border border-gray-200">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-3 text-gray-600 hover:text-gray-900 transition">-</button>
                    <span className="flex-1 text-center text-sm ">{quantity}</span>
                    {/* Botón liberado: Ya no se bloquea por el stock */}
                    <button onClick={() => setQuantity(quantity + 1)} className="px-4 py-3 text-gray-600 hover:text-gray-900 transition">+</button>
                  </div>
                </div>
                <div className="w-2/3 flex items-end">
                  {/* Botón siempre activo */}
                  <button 
                    onClick={handleAddToCart}
                    className="w-full bg-[#b3131b] text-black font-bold py-3 px-6 uppercase tracking-wider text-xs hover:bg-[#b3131b] transition"
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
                className={`px-8 py-4 text-xs  uppercase tracking-widest whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id 
                    ? 'border-[#b3131b] text-gray-900 bg-black/5' 
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
                <p>
                  {product.description || 'Lubricante de motor de alto rendimiento diseñado para cumplir con las exigencias más estrictas de los fabricantes automotrices actuales. Formulado con bases sintéticas premium y aditivos de última generación.'}
                </p>
                <div className="bg-gray-50 p-6 border border-white/5 mt-8">
                  <h4 className="text-[#b3131b]  text-xs uppercase tracking-widest mb-4">Números de Referencia (OE / MFG)</h4>
                  <div className="grid grid-cols-2 gap-4 text-xs  text-gray-600">
                    <div>
                      <span className="block text-gray-900 mb-1">SKU Base:</span>
                      {product.sku}
                    </div>
                    <div>
                      <span className="block text-gray-900 mb-1">Calidad:</span>
                      Aftermarket / OEM
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ficha' && (
              <div className="max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4  text-xs">
                {product.specs ? Object.entries(product.specs).map(([key, val]) => (
                  <div key={key} className="flex justify-between border-b border-gray-200 pb-2">
                    <span className="uppercase text-gray-600">{key}</span>
                    <span className="font-bold text-gray-900 text-right">{val as string}</span>
                  </div>
                )) : (
                  <p className="text-gray-500">Especificaciones detalladas no disponibles para este producto.</p>
                )}
              </div>
            )}

            {activeTab === 'compatibilidad' && (
              <div className="max-w-4xl space-y-6 ">
                {product.compatibility ? (
                  <div className="flex flex-wrap gap-3">
                    {product.compatibility.map((gen: string) => (
                      <span key={gen} className="bg-gray-50 border border-gray-300 rounded text-gray-900 px-4 py-2 text-xs">{gen}</span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-xs">Información de compatibilidad genérica. Sirve para múltiples plataformas.</p>
                )}
                <div className="mt-8 p-4 border-l-2 border-[#b3131b] bg-[#b3131b]/5 text-xs text-gray-700 leading-relaxed">
                  <strong>Aviso de Compatibilidad:</strong> ¿No está seguro si ajusta en su vehículo? Contáctenos en Soporte indicando su número de chasis (VIN) y verificaremos el ajuste exacto antes de facturar.
                </div>
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
                <p>Garantía Limitada
                    Todos nuestros productos cuentan con una garantía de un año contra defectos de fabricación. Esta garantía entra en vigor a partir de la fecha de recepción del producto.</p>
                <p><strong>Devoluciones:</strong> Los productos de venta online pueden cambiarse o devolverse bajo las condiciones detalladas en nuestra página de Garantía, Cambios y Devoluciones, incluyendo plazos, estado requerido del producto y proceso de validación.</p>
              </div>
            )}
          </div>
        </div>

      </div>
      <QuoteModal product={product} isOpen={isQuoteModalOpen} onClose={() => setIsQuoteModalOpen(false)} />
    </div>
  );
}