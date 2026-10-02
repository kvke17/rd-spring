'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  Truck, 
  Lock,
  RotateCcw
} from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { STORE_CONFIG } from '@/config/constants';
import { 
  showClearCartConfirmAlert, 
  showRemoveItemConfirmAlert, 
  showItemRemovedToast 
} from '@/lib/cart-alerts';

export default function CartPage() {
  const [mounted, setMounted] = useState(false);
  const { items, updateQuantity, removeItem, clearCart, getCartSubtotal, getCartCount } = useCartStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const totalCount = getCartCount();
  const subtotal = getCartSubtotal();

  const handleClearCart = () => {
    showClearCartConfirmAlert({
      onConfirm: () => {
        clearCart();
      },
    });
  };

  const handleRemoveProduct = (productId: string, productName: string) => {
    showRemoveItemConfirmAlert({
      productName,
      onConfirm: () => {
        removeItem(productId);
        showItemRemovedToast();
      },
    });
  };

  const handleDecreaseQuantity = (productId: string, productName: string, currentQty: number) => {
    if (currentQty <= 1) {
      handleRemoveProduct(productId, productName);
    } else {
      updateQuantity(productId, currentQty - 1);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 text-gray-900 pt-28 sm:pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-8">
          <Link 
            href="/catalogo" 
            className="inline-flex items-center gap-2 text-xs font-mono tracking-wider uppercase text-slate-500 hover:text-[#b3131b] transition-colors group cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            <span>Continuar Comprando</span>
          </Link>
        </div>

        {/* Page Title & Count */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 pb-6 border-b border-slate-200/80">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#b3131b] font-bold block mb-1">
              CHASSIS PRESTIGE · SANTIAGO
            </span>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-gray-900">
                Tu Carro de Compras
              </h1>
              {items.length > 0 && (
                <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-slate-200/70 text-slate-800 text-xs font-mono font-bold">
                  {totalCount} {totalCount === 1 ? 'unidad' : 'unidades'}
                </span>
              )}
            </div>
          </div>

          {items.length > 0 && (
            <button
              onClick={handleClearCart}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-600 transition-colors font-medium self-start sm:self-auto cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Vaciar carro</span>
            </button>
          )}
        </div>

        {items.length === 0 ? (
          /* Empty State */
          <div className="max-w-xl mx-auto my-12 bg-white rounded-3xl border border-slate-200/80 p-10 sm:p-14 text-center shadow-sm">
            <div className="w-20 h-20 rounded-full bg-red-50 text-[#b3131b] mx-auto flex items-center justify-center mb-6">
              <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-3">
              Tu carro está vacío
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed max-w-sm mx-auto mb-8 font-normal">
              Aún no has agregado aceites ROWE ni componentes de suspensión deportiva de alta gama a tu orden.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link 
                href="/catalogo" 
                className="btn-shine w-full sm:w-auto bg-[#b3131b] hover:bg-[#8f0f15] text-white font-bold px-7 py-3.5 rounded-xl uppercase text-xs tracking-wider transition-all duration-200 shadow-lg shadow-red-950/20 active:scale-95 cursor-pointer text-center"
              >
                VER ACEITES ROWE
              </Link>
              <Link 
                href="/repuestos" 
                className="btn-shine w-full sm:w-auto bg-white border border-slate-300 hover:bg-slate-50 text-gray-900 font-bold px-7 py-3.5 rounded-xl uppercase text-xs tracking-wider transition-all duration-200 active:scale-95 cursor-pointer text-center"
              >
                VER REPUESTOS
              </Link>
            </div>
          </div>
        ) : (
          /* Cart Grid */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            
            {/* Products List (8 cols) */}
            <div className="lg:col-span-8">
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden divide-y divide-slate-100">
                {items.map(({ product, quantity }) => (
                  <div 
                    key={product.id} 
                    className="p-5 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 sm:gap-6 hover:bg-slate-50/50 transition-colors"
                  >
                    {/* Product Image & Info */}
                    <div className="flex items-center gap-4 sm:gap-5 flex-1 w-full sm:w-auto">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center p-2 flex-shrink-0 relative overflow-hidden group">
                        <Image 
                          src={product.image || '/images/logo-rd.png'} 
                          alt={product.name} 
                          width={80} 
                          height={80} 
                          className="object-contain group-hover:scale-105 transition-transform duration-300" 
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-mono font-bold tracking-widest text-[#b3131b] uppercase">
                            {product.brand || 'ROWE'}
                          </span>
                          {product.category && (
                            <span className="text-[10px] font-mono text-slate-400 uppercase">
                              · {product.category}
                            </span>
                          )}
                        </div>

                        <Link 
                          href={product.slug ? `/productos/${product.slug}` : `/catalogo`}
                          className="text-sm sm:text-base font-bold text-gray-900 hover:text-[#b3131b] transition-colors line-clamp-2 leading-snug cursor-pointer block"
                        >
                          {product.name}
                        </Link>

                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                          {product.sku && (
                            <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                              SKU: {product.sku}
                            </span>
                          )}
                          <span className="text-xs text-slate-500 font-medium">
                            {STORE_CONFIG.CURRENCY_FORMAT.format(product.price)} c/u
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quantity & Actions & Line Price */}
                    <div className="flex items-center justify-between sm:justify-end gap-5 sm:gap-8 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      {/* Quantity Controller */}
                      <div className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50/80 p-1 shadow-inner">
                        <button 
                          onClick={() => handleDecreaseQuantity(product.id, product.name, quantity)} 
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-xs transition-all active:scale-95 cursor-pointer"
                          aria-label="Disminuir cantidad"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 sm:w-9 text-center font-bold text-xs sm:text-sm text-slate-900 font-mono">
                          {quantity}
                        </span>
                        <button 
                          onClick={() => updateQuantity(product.id, quantity + 1)} 
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-xs transition-all active:scale-95 cursor-pointer"
                          aria-label="Aumentar cantidad"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Line Subtotal */}
                      <div className="text-right min-w-[90px] sm:min-w-[110px]">
                        <span className="text-[10px] text-slate-400 uppercase font-mono block">Subtotal</span>
                        <p className="font-black text-base sm:text-lg text-gray-900 font-mono tracking-tight">
                          {STORE_CONFIG.CURRENCY_FORMAT.format(product.price * quantity)}
                        </p>
                      </div>

                      {/* Remove Button */}
                      <button 
                        onClick={() => handleRemoveProduct(product.id, product.name)} 
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all active:scale-90 cursor-pointer"
                        title="Eliminar producto"
                        aria-label="Eliminar producto del carro"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar Summary (4 cols) */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm sticky top-28">
                <span className="text-[11px] uppercase tracking-[0.2em] text-[#b3131b] font-bold block mb-1 font-mono">
                  RESUMEN DE ORDEN
                </span>
                <h2 className="text-xl font-black text-gray-900 tracking-tight mb-6">
                  Total de Compra
                </h2>

                <div className="space-y-4 text-sm text-slate-600 mb-6">
                  <div className="flex justify-between items-center">
                    <span>Subtotal ({totalCount} {totalCount === 1 ? 'artículo' : 'artículos'})</span>
                    <span className="font-bold text-gray-900 font-mono">
                      {STORE_CONFIG.CURRENCY_FORMAT.format(subtotal)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span>Impuestos (IVA 19%)</span>
                    <span className="text-xs text-slate-500 font-medium">
                      Incluido en precio
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span>Despacho a Domicilio</span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                      Calculado en Checkout
                    </span>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-200/80 mb-6">
                  <div className="flex justify-between items-baseline">
                    <div>
                      <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Total Estimado</span>
                      <span className="text-[10px] text-slate-400">En pesos chilenos (CLP)</span>
                    </div>
                    <span className="text-2xl sm:text-3xl font-black text-gray-900 font-mono tracking-tight">
                      {STORE_CONFIG.CURRENCY_FORMAT.format(subtotal)}
                    </span>
                  </div>
                </div>

                <Link 
                  href="/checkout" 
                  className="btn-shine w-full bg-[#b3131b] hover:bg-[#8f0f15] text-white font-bold py-4 px-6 rounded-xl uppercase tracking-widest text-xs transition-all duration-300 shadow-xl shadow-red-950/20 active:scale-95 flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <span>PROCEDER AL CHECKOUT</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <p className="text-[11px] text-slate-400 text-center mt-4 font-normal">
                  Starken, Chilexpress y Blue Express disponibles en el paso siguiente.
                </p>

                {/* Trust Badges */}
                <div className="mt-8 pt-6 border-t border-slate-100 space-y-3">
                  <div className="flex items-center gap-3 text-xs text-slate-600">
                    <ShieldCheck className="w-4 h-4 text-[#b3131b] flex-shrink-0" />
                    <span>Garantía oficial y fluidos 100% sellados de origen.</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-600">
                    <Truck className="w-4 h-4 text-[#b3131b] flex-shrink-0" />
                    <span>Despacho exprés a Santiago y todas las regiones.</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-600">
                    <Lock className="w-4 h-4 text-[#b3131b] flex-shrink-0" />
                    <span>Pago seguro y encriptado vía Webpay Plus.</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
