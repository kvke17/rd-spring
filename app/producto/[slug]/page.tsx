'use client';
import { use, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import productsData from '@/data/products.json';
import { Product } from '@/types';
import { STORE_CONFIG } from '@/config/constants';
import { useCartStore } from '@/lib/store';
import QuoteModal from '@/components/QuoteModal';

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const product = (productsData as Product[]).find((p) => p.slug === slug);

  if (!product) notFound();

  const [quantity, setQuantity] = useState(1);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [formato, setFormato] = useState('5 Litros'); 
  
  const addItem = useCartStore((state) => state.addItem);

  const currentPrice = product.prices ? product.prices[formato] : product.price;
  // NUEVO: Calculamos la imagen dinámica
  const currentImage = product.formatImages ? product.formatImages[formato] : product.image;

  const handleWhatsApp = () => {
    const text = `Hola, me interesa cotizar el producto: ${product.name} (SKU: ${product.sku}). Enlace: ${window.location.href}`;
    const url = `https://wa.me/${STORE_CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleAddToCart = () => {
    const isAceite = product.category === 'Aceite de Motor';
    const finalProduct = isAceite 
      ? { ...product, name: `${product.name} (${formato})`, id: `${product.id}-${formato.replace(' ', '')}`, price: currentPrice, image: currentImage }
      : product;
      
    addItem(finalProduct, quantity);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/catalogo" className="text-xs font-mono uppercase tracking-widest text-gray-400 hover:text-[#E88A5C] mb-8 inline-block">← CATÁLOGO</Link>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 border-b border-white/10 pb-16">
          
          {/* CONTENEDOR DE IMAGEN (Sin bordes blancos) */}
          <div className="lg:col-span-7 bg-[#121212] rounded-lg aspect-square relative flex items-center justify-center overflow-hidden">
            <Image src={currentImage} alt={product.name} fill className="object-contain p-2" priority />
          </div>

          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <p className="text-xs uppercase font-mono tracking-[0.2em] text-[#E88A5C]">{product.brand} · {product.category}</p>
              <h1 className="text-3xl font-bold tracking-tight text-white leading-tight">{product.name}</h1>
              <p className="text-xs font-mono text-gray-500 uppercase tracking-widest">SKU {product.sku}</p>
              <p className="text-sm text-gray-400 font-mono leading-relaxed pt-2">{product.description}</p>
              
              <div className="pt-6 border-t border-white/10">
                <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-1">{product.type === 'cotizacion' ? 'PRECIO REFERENCIAL' : 'PRECIO UNITARIO'}</p>
                <p className="text-3xl font-bold font-mono text-white">
                  {STORE_CONFIG.CURRENCY_FORMAT.format(currentPrice)}
                </p>
                <p className="text-xs font-mono text-gray-400 mt-1">{product.type === 'cotizacion' ? 'Sujeto a cotización · IVA incluido' : `IVA incluido · Stock: ${product.stock ?? 0} unidades`}</p>
              </div>
              
              <div className="pt-4">
                {product.type === 'cotizacion' ? (
                  <div className="space-y-3">
                    <button onClick={handleWhatsApp} className="w-full bg-[#E88A5C] text-black font-bold py-4 text-xs uppercase tracking-widest hover:bg-opacity-90 flex items-center justify-center gap-2">COTIZAR POR WHATSAPP</button>
                    <button onClick={() => setIsQuoteModalOpen(true)} className="w-full border border-white/20 text-white font-bold py-4 text-xs uppercase tracking-widest hover:bg-white/10 flex items-center justify-center gap-2">COTIZAR POR EMAIL</button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {product.category === 'Aceite de Motor' && (
                      <div>
                        <h3 className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-3">
                          SELECCIONA EL FORMATO
                        </h3>
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => setFormato('1 Litro')}
                            className={`flex-1 py-3 border rounded font-mono text-xs uppercase tracking-widest transition-all duration-300 ${
                              formato === '1 Litro'
                                ? 'bg-[#E88A5C] text-black border-[#E88A5C] font-bold shadow-[0_0_15px_rgba(232,138,92,0.15)]'
                                : 'bg-[#121212] text-gray-400 border-white/20 hover:border-white/50'
                            }`}
                          >
                            1 Litro
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormato('5 Litros')}
                            className={`flex-1 py-3 border rounded font-mono text-xs uppercase tracking-widest transition-all duration-300 ${
                              formato === '5 Litros'
                                ? 'bg-[#E88A5C] text-black border-[#E88A5C] font-bold shadow-[0_0_15px_rgba(232,138,92,0.15)]'
                                : 'bg-[#121212] text-gray-400 border-white/20 hover:border-white/50'
                            }`}
                          >
                            5 Litros
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <div className="flex items-center border border-white/20 bg-[#0a0a0a] rounded">
                        <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-3 text-gray-400 hover:text-white font-mono">-</button>
                        <span className="px-4 font-mono font-bold text-sm">{quantity}</span>
                        <button onClick={() => setQuantity(quantity + 1)} className="px-4 py-3 text-gray-400 hover:text-white font-mono">+</button>
                      </div>
                      <button onClick={handleAddToCart} className="flex-1 bg-[#E88A5C] text-black font-bold py-4 rounded text-xs uppercase tracking-widest hover:bg-opacity-90 transition-all">AGREGAR AL CARRO</button>
                    </div>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 pt-6 text-xs font-mono text-gray-400">
                <div>Garantía 12 meses</div>
                <div>Despacho nacional</div>
              </div>
            </div>
          </div>
        </div>
        <div className="py-12 border-b border-white/10 grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-4"><p className="text-xs uppercase font-mono tracking-[0.2em] text-[#E88A5C] mb-1">BLUEPRINT · ESPECIFICACIONES</p></div>
          <div className="md:col-span-8 space-y-4 font-mono text-xs">
            {product.specs && Object.entries(product.specs).map(([key, val]) => (
              <div key={key} className="flex justify-between border-b border-white/10 pb-2"><span className="uppercase text-gray-400">{key}</span><span className="font-bold text-white">{val}</span></div>
            ))}
          </div>
        </div>
        <div className="py-12 grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-4"><p className="text-xs uppercase font-mono tracking-[0.2em] text-[#E88A5C] mb-1">COMPATIBILIDAD VERIFICADA</p></div>
          <div className="md:col-span-8 space-y-6 font-mono">
            <div className="flex flex-wrap gap-3">
              {product.compatibility?.map((gen) => (
                <span key={gen} className="bg-[#121212] border border-white/20 rounded text-white px-4 py-2 text-xs">{gen}</span>
              ))}
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              ¿No ve su generación? Envíe el número de chasis en Soporte y confirmamos el ajuste antes de facturar.
            </p>
          </div>
        </div>
      </div>
      <QuoteModal product={product} isOpen={isQuoteModalOpen} onClose={() => setIsQuoteModalOpen(false)} />
    </div>
  );
}