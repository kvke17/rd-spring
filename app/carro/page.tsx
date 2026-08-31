'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/lib/store';
import { STORE_CONFIG } from '@/config/constants';
import { useEffect, useState } from 'react';

export default function CartPage() {
  const [mounted, setMounted] = useState(false);
  const { items, updateQuantity, removeItem, getCartSubtotal } = useCartStore();

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold uppercase tracking-tight mb-12">Tu Carro</h1>
        {items.length === 0 ? (
          <div className="border border-white/10 bg-[#121212] p-12 text-center">
            <p className="text-gray-400 font-mono text-sm mb-6">No tienes componentes en tu carro.</p>
            <Link href="/catalogo" className="bg-[#E88A5C] text-black font-bold px-8 py-3 uppercase tracking-wider hover:bg-opacity-90 inline-block text-xs">IR AL CATÁLOGO</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8">
              <div className="border border-white/10 bg-[#121212]">
                {items.map(({ product, quantity }) => (
                  <div key={product.id} className="flex flex-col sm:flex-row gap-6 p-6 border-b border-white/10 last:border-0">
                    <div className="w-24 h-24 bg-[#0a0a0a] border border-white/10 flex items-center justify-center p-2 flex-shrink-0">
                      <Image src={product.image} alt={product.name} width={80} height={80} className="object-contain" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-white mb-2">{product.name}</h3>
                        <p className="text-xs font-mono text-gray-500">SKU: {product.sku}</p>
                      </div>
                      <div className="flex items-center gap-6 mt-4">
                        <div className="flex items-center border border-white/20 bg-[#0a0a0a]">
                          <button onClick={() => updateQuantity(product.id, quantity - 1)} className="px-3 py-1 text-gray-400 hover:text-white font-mono">-</button>
                          <span className="px-3 font-mono text-xs">{quantity}</span>
                          <button onClick={() => updateQuantity(product.id, quantity + 1)} className="px-3 py-1 text-gray-400 hover:text-white font-mono">+</button>
                        </div>
                        <button onClick={() => removeItem(product.id)} className="text-[10px] uppercase tracking-widest text-gray-500 hover:text-red-500 font-mono underline underline-offset-4">Remover</button>
                      </div>
                    </div>
                    <div className="text-right flex flex-col justify-between">
                      <p className="font-mono font-bold text-sm text-white">{STORE_CONFIG.CURRENCY_FORMAT.format(product.price * quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-4">
              <div className="border border-white/10 bg-[#121212] p-8 sticky top-28">
                <h2 className="text-xs uppercase tracking-widest text-[#E88A5C] mb-6 font-bold">RESUMEN</h2>
                <div className="flex justify-between font-mono text-sm text-gray-400 mb-6 border-b border-white/10 pb-6">
                  <span>Subtotal</span><span className="text-white">{STORE_CONFIG.CURRENCY_FORMAT.format(getCartSubtotal())}</span>
                </div>
                <Link href="/checkout" className="w-full bg-[#E88A5C] text-black font-bold py-4 uppercase tracking-wider hover:bg-opacity-90 block text-center text-sm">PROCEDER AL PAGO</Link>
                <p className="text-[10px] text-gray-500 font-mono text-center mt-4 uppercase tracking-widest">Impuestos incluidos. Despacho calculado en el checkout.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
