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
    <div className="min-h-screen bg-white text-gray-900 pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold uppercase tracking-tight mb-12">Tu Carro</h1>
        {items.length === 0 ? (
          <div className="border border-gray-200 bg-gray-50 p-12 text-center">
            <p className="text-gray-600  text-sm mb-6">No tienes componentes en tu carro.</p>
            <Link href="/catalogo" className="bg-[#b3131b] text-black font-bold px-8 py-3 uppercase tracking-wider hover:bg-opacity-90 inline-block text-xs">IR AL CATÁLOGO</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8">
              <div className="border border-gray-200 bg-gray-50">
                {items.map(({ product, quantity }) => (
                  <div key={product.id} className="flex flex-col sm:flex-row gap-6 p-6 border-b border-gray-200 last:border-0">
                    <div className="w-24 h-24 bg-white border border-gray-200 flex items-center justify-center p-2 flex-shrink-0">
                      <Image src={product.image} alt={product.name} width={80} height={80} className="object-contain" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-gray-900 mb-2">{product.name}</h3>
                        <p className="text-xs  text-gray-500">SKU: {product.sku}</p>
                      </div>
                      <div className="flex items-center gap-6 mt-4">
                        <div className="flex items-center border border-gray-300 bg-white">
                          <button onClick={() => updateQuantity(product.id, quantity - 1)} className="px-3 py-1 text-gray-600 hover:text-gray-900 ">-</button>
                          <span className="px-3  text-xs">{quantity}</span>
                          <button onClick={() => updateQuantity(product.id, quantity + 1)} className="px-3 py-1 text-gray-600 hover:text-gray-900 ">+</button>
                        </div>
                        <button onClick={() => removeItem(product.id)} className="text-[10px] uppercase tracking-widest text-gray-500 hover:text-red-500  underline underline-offset-4">Remover</button>
                      </div>
                    </div>
                    <div className="text-right flex flex-col justify-between">
                      <p className=" font-bold text-sm text-gray-900">{STORE_CONFIG.CURRENCY_FORMAT.format(product.price * quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-4">
              <div className="border border-gray-200 bg-gray-50 p-8 sticky top-28">
                <h2 className="text-xs uppercase tracking-widest text-[#b3131b] mb-6 font-bold">RESUMEN</h2>
                <div className="flex justify-between  text-sm text-gray-600 mb-6 border-b border-gray-200 pb-6">
                  <span>Subtotal</span><span className="text-gray-900">{STORE_CONFIG.CURRENCY_FORMAT.format(getCartSubtotal())}</span>
                </div>
                <Link href="/checkout" className="w-full bg-[#b3131b] text-white font-bold py-4 uppercase tracking-wider hover:bg-opacity-90 block text-center text-sm">PROCEDER AL PAGO</Link>
                <p className="text-[10px] text-gray-500  text-center mt-4 uppercase tracking-widest">Impuestos incluidos. Despacho calculado en el checkout.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
