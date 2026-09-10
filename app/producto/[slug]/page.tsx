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
  const stockDisponible = currentFormatData ? currentFormatData.stock : product.stock;

  // 2. Lógica Dinámica de la Imagen (Cambia según el SKU)
  const expectedImage = `/images/rowe/${currentSku}.png`;
  const [imgSrc, setImgSrc] = useState(expectedImage);

  useEffect(() => {
    // Cada vez que currentSku cambia, actualizamos la imagen mostrada
    setImgSrc(`/images/rowe/${currentSku}.png`);
  }, [currentSku]);

  // 3. Agregar al Carro (Corrección aplicada)
  const handleAddToCart = () => {
    if (stockDisponible <= 0) return;
    
    const productToAdd: Product = {
      ...product, 
      id: currentSku, 
      sku: currentSku,
      name: `${product.name} (${formato})`, 
      price: currentPrice,
      stock: stockDisponible,
      image: imgSrc,
    };

    addItem(productToAdd, quantity);
    alert('Producto agregado al carro');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-28 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HEADER DEL PRODUCTO */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* FOTO DEL PRODUCTO */}
          <div className="lg:col-span-7 bg-[#121212] rounded-lg aspect-square relative flex items-center justify-center overflow-hidden border border-white/5">
            <Image 
              src={imgSrc} 
              alt={product.name} 
              fill 
              className="object-contain p-8 transition-opacity duration-300" 
              priority 
              onError={() => setImgSrc('/images/logo-rd.png')} // Salvavidas si la foto no existe
            />
          </div>

          {/* DETALLES Y COMPRA */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div>
              <p className="text-xs uppercase font-mono tracking-widest text-gray-500 mb-2">{product.brand}</p>
              <h1 className="text-3xl font-bold uppercase tracking-tight mb-4 leading-tight">{product.name}</h1>
              <p className="text-xs text-gray-400 font-mono mb-6">SKU: <span className="text-white">{currentSku}</span></p>
              
              <div className="text-4xl font-bold text-[#FF0000] font-mono mb-8">
                {STORE_CONFIG.CURRENCY_FORMAT.format(currentPrice)}
              </div>

              {/* BOTONES DE FORMATO (Aquí ocurre la magia) */}
              {product.formats && product.formats.length > 0 && (
                <div className="mb-8">
                  <p className="text-[11px] uppercase tracking-widest text-gray-400 mb-3 font-mono">Seleccionar Formato</p>
                  <div className="grid grid-cols-3 gap-3">
                    {product.formats.map((f: any) => (
                      <button
                        key={f.size}
                        onClick={() => setFormato(f.size)}
                        className={`py-3 text-xs font-mono uppercase transition-all ${
                          formato === f.size 
                            ? 'bg-white text-black font-bold' 
                            : 'bg-[#121212] text-gray-400 hover:bg-white/10 border border-white/10'
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
                  <p className="text-[11px] uppercase tracking-widest text-gray-400 mb-2 font-mono">Cantidad</p>
                  <div className="flex items-center bg-[#121212] border border-white/10">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-3 text-gray-400 hover:text-white transition">-</button>
                    <span className="flex-1 text-center text-sm font-mono">{quantity}</span>
                    <button onClick={() => setQuantity(Math.min(stockDisponible, quantity + 1))} className="px-4 py-3 text-gray-400 hover:text-white transition">+</button>
                  </div>
                </div>
                <div className="w-2/3 flex items-end">
                  <button 
                    onClick={handleAddToCart}
                    disabled={stockDisponible <= 0}
                    className="w-full bg-[#FF0000] text-black font-bold py-3 px-6 uppercase tracking-wider text-xs hover:bg-[#CC0000] transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {stockDisponible > 0 ? 'Añadir al carro' : 'Sin stock'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PESTAÑAS ESTILO FCP EURO */}
        <div className="mt-20">
          <div className="flex overflow-x-auto no-scrollbar border-b border-white/10">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-8 py-4 text-xs font-mono uppercase tracking-widest whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id 
                    ? 'border-[#FF0000] text-white bg-white/5' 
                    : 'border-transparent text-gray-500 hover:text-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="py-12 min-h-[400px]">
            {activeTab === 'descripcion' && (
              <div className="max-w-4xl text-sm text-gray-300 leading-relaxed space-y-6">
                <p>
                  {product.description || 'Lubricante de motor de alto rendimiento diseñado para cumplir con las exigencias más estrictas de los fabricantes automotrices actuales. Formulado con bases sintéticas premium y aditivos de última generación.'}
                </p>
                <div className="bg-[#121212] p-6 border border-white/5 mt-8">
                  <h4 className="text-[#FF0000] font-mono text-xs uppercase tracking-widest mb-4">Números de Referencia (OE / MFG)</h4>
                  <div className="grid grid-cols-2 gap-4 text-xs font-mono text-gray-400">
                    <div>
                      <span className="block text-white mb-1">SKU Base:</span>
                      {product.sku}
                    </div>
                    <div>
                      <span className="block text-white mb-1">Calidad:</span>
                      Aftermarket / OEM
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ficha' && (
              <div className="max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 font-mono text-xs">
                {product.specs ? Object.entries(product.specs).map(([key, val]) => (
                  <div key={key} className="flex justify-between border-b border-white/10 pb-2">
                    <span className="uppercase text-gray-400">{key}</span>
                    <span className="font-bold text-white text-right">{val as string}</span>
                  </div>
                )) : (
                  <p className="text-gray-500">Especificaciones detalladas no disponibles para este producto.</p>
                )}
              </div>
            )}

            {activeTab === 'compatibilidad' && (
              <div className="max-w-4xl space-y-6 font-mono">
                {product.compatibility ? (
                  <div className="flex flex-wrap gap-3">
                    {product.compatibility.map((gen: string) => (
                      <span key={gen} className="bg-[#121212] border border-white/20 rounded text-white px-4 py-2 text-xs">{gen}</span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-xs">Información de compatibilidad genérica. Sirve para múltiples plataformas.</p>
                )}
                <div className="mt-8 p-4 border-l-2 border-[#FF0000] bg-[#FF0000]/5 text-xs text-gray-300 leading-relaxed">
                  <strong>Aviso de Compatibilidad:</strong> ¿No está seguro si ajusta en su vehículo? Contáctenos en Soporte indicando su número de chasis (VIN) y verificaremos el ajuste exacto antes de facturar.
                </div>
              </div>
            )}

            {activeTab === 'resenas' && (
              <div className="max-w-4xl space-y-12">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/10 pb-6 gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-white uppercase tracking-tight">Valoraciones de Clientes</h3>
                    <div className="flex items-center mt-2">
                      <span className="text-[#FF0000] text-lg tracking-widest">★★★★★</span>
                      <span className="text-xs font-mono text-gray-400 ml-3">Basado en 1 reseña verificada</span>
                    </div>
                  </div>
                  <button className="bg-white text-black font-bold px-6 py-3 uppercase tracking-wide text-xs hover:bg-gray-200 transition">
                    Escribir Reseña
                  </button>
                </div>
                <div className="space-y-6">
                  <div className="bg-[#121212] p-6 border border-white/5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#FF0000]/10 text-[#FF0000] rounded-full flex items-center justify-center text-xs font-bold font-mono">JM</div>
                        <div>
                          <p className="text-sm font-bold text-white">Juan Morales</p>
                          <p className="text-xs text-[#FF0000] tracking-widest mt-1">★★★★★ <span className="text-green-500 font-mono text-[10px] ml-2 tracking-normal uppercase">✓ Comprador Verificado</span></p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-gray-500">hace 2 semanas</span>
                    </div>
                    <p className="text-sm text-gray-300 mb-6 leading-relaxed">
                      Excelente aceite, llegó en el tiempo acordado y el envase en perfectas condiciones. Lo usé para mi vehículo y el motor anda impecable. Dejo una foto de cómo llegó el paquete protegido.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'garantia' && (
              <div className="max-w-4xl text-sm text-gray-300 leading-relaxed space-y-4">
                <h3 className="text-lg font-bold text-white mb-4">Garantía RD Spring</h3>
                <p>Todos nuestros productos están respaldados por una garantía legal de 6 meses contra defectos de fabricación. Si el producto presenta fallas prematuras que no correspondan al desgaste natural por uso, procederemos con el reemplazo o reembolso.</p>
                <p><strong>Devoluciones:</strong> Aceptamos devoluciones dentro de los primeros 10 días desde la recepción del producto, siempre y cuando este se encuentre sellado, sin uso y en su empaque original.</p>
              </div>
            )}
          </div>
        </div>

      </div>
      <QuoteModal product={product} isOpen={isQuoteModalOpen} onClose={() => setIsQuoteModalOpen(false)} />
    </div>
  );
}