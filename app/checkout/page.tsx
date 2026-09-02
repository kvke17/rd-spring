'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCartStore, SHIPPING_OPTIONS } from '@/lib/store';
import { formatRut, validateRut } from '@/lib/rut';
import { STORE_CONFIG } from '@/config/constants';

export default function CheckoutPage() {
  const [mounted, setMounted] = useState(false);
  const { items, selectedShippingId, setShippingOption, getCartSubtotal, getShippingCost, getCartTotal } = useCartStore();

  // Agregamos razonSocial y giro al estado inicial
  const [formData, setFormData] = useState({ fullName: '', email: '', phone: '', rut: '', vehicle: '', address: '', comuna: '', region: '', razonSocial: '', giro: '' });
  const [rutError, setRutError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Nuevo estado para el tipo de documento
  const [docType, setDocType] = useState('BOLETA');

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6">
        <h1 className="text-2xl font-bold uppercase mb-4 tracking-wider">Tu carro está vacío</h1>
        <Link href="/catalogo" className="bg-[#E88A5C] text-black font-bold px-6 py-3 uppercase tracking-wide hover:bg-opacity-90">Explorar Catálogo</Link>
      </div>
    );
  }

  const requiresAddress = selectedShippingId !== 'pickup';

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateRut(formData.rut)) {
      setRutError('RUT inválido');
      return;
    }
    setLoading(true);

    try {
      const buyOrder = `ORD-${Date.now().toString().slice(-6)}`;
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: getCartTotal(),
          buyOrder,
          sessionId: `SESS-${Math.floor(Math.random() * 100000)}`,
          returnUrl: `${window.location.origin}/api/checkout/confirm`,
          customer: formData,
          items,
          documentType: docType // Enviamos el tipo de documento a la base de datos
        }),
      });

      const data = await res.json();
      if (data.url && data.token) {
        const form = document.createElement('form');
        form.action = data.url;
        form.method = 'POST';
        const tokenInput = document.createElement('input');
        tokenInput.type = 'hidden';
        tokenInput.name = 'token_ws';
        tokenInput.value = data.token;
        form.appendChild(tokenInput);
        document.body.appendChild(form);
        form.submit();
      } else {
        alert('Error al conectar con la pasarela de pago');
        setLoading(false);
      }
    } catch (err) {
      alert('Error procesando la transacción');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-16 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold uppercase tracking-tight mb-12">Finalizar compra</h1>
        <form onSubmit={handlePayment} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          <div className="lg:col-span-7 space-y-10">
            
            {/* SECCIÓN DOCUMENTO TRIBUTARIO */}
            <div className="border border-white/10 bg-[#121212] p-6 sm:p-8">
              <h2 className="text-xs uppercase tracking-widest text-[#E88A5C] mb-6 font-bold">01 · TIPO DE DOCUMENTO</h2>
              <div className="flex gap-4 mb-6">
                <button type="button" onClick={() => setDocType('BOLETA')} className={`flex-1 py-3 text-xs font-bold font-mono tracking-widest border transition-all ${docType === 'BOLETA' ? 'bg-[#E88A5C] text-black border-[#E88A5C]' : 'bg-transparent text-gray-400 border-white/20 hover:border-white/50'}`}>
                  BOLETA
                </button>
                <button type="button" onClick={() => setDocType('FACTURA')} className={`flex-1 py-3 text-xs font-bold font-mono tracking-widest border transition-all ${docType === 'FACTURA' ? 'bg-[#E88A5C] text-black border-[#E88A5C]' : 'bg-transparent text-gray-400 border-white/20 hover:border-white/50'}`}>
                  FACTURA
                </button>
              </div>

              {/* CAMPOS DE FACTURA CON RENDERIZADO CONDICIONAL */}
              {docType === 'FACTURA' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                  <div>
                    <label className="block text-[11px] uppercase tracking-widest text-[#E88A5C] mb-2 font-mono">Razón Social</label>
                    <input type="text" required={docType === 'FACTURA'} value={formData.razonSocial} onChange={(e) => setFormData({ ...formData, razonSocial: e.target.value })} className="w-full bg-[#0a0a0a] border border-white/10 p-3 text-sm focus:border-[#E88A5C] focus:outline-none text-white font-mono" />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase tracking-widest text-[#E88A5C] mb-2 font-mono">Giro Comercial</label>
                    <input type="text" required={docType === 'FACTURA'} value={formData.giro} onChange={(e) => setFormData({ ...formData, giro: e.target.value })} className="w-full bg-[#0a0a0a] border border-white/10 p-3 text-sm focus:border-[#E88A5C] focus:outline-none text-white font-mono" />
                  </div>
                </div>
              )}
            </div>

            <div className="border border-white/10 bg-[#121212] p-6 sm:p-8">
              <h2 className="text-xs uppercase tracking-widest text-[#E88A5C] mb-6 font-bold">02 · DATOS DEL CLIENTE</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] uppercase tracking-widest text-gray-400 mb-2 font-mono">NOMBRE COMPLETO</label>
                  <input type="text" required value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} className="w-full bg-[#0a0a0a] border border-white/10 p-3 text-sm focus:border-[#E88A5C] focus:outline-none text-white font-mono" />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-widest text-gray-400 mb-2 font-mono">EMAIL</label>
                  <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full bg-[#0a0a0a] border border-white/10 p-3 text-sm focus:border-[#E88A5C] focus:outline-none text-white font-mono" />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-widest text-gray-400 mb-2 font-mono">TELÉFONO</label>
                  <input type="tel" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-[#0a0a0a] border border-white/10 p-3 text-sm focus:border-[#E88A5C] focus:outline-none text-white font-mono" />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-widest text-gray-400 mb-2 font-mono">RUT</label>
                  <input
                    type="text"
                    required
                    value={formData.rut}
                    onChange={(e) => {
                      const formatted = formatRut(e.target.value);
                      setFormData({ ...formData, rut: formatted });
                      if (formatted.length > 3 && !validateRut(formatted)) setRutError('RUT inválido');
                      else setRutError('');
                    }}
                    placeholder="12.345.678-9"
                    className={`w-full bg-[#0a0a0a] border p-3 text-sm focus:outline-none font-mono text-white ${rutError ? 'border-red-500' : 'border-white/10 focus:border-[#E88A5C]'}`}
                  />
                  {rutError && <p className="text-xs text-red-500 mt-1">{rutError}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] uppercase tracking-widest text-gray-400 mb-2 font-mono">VEHÍCULO</label>
                  <input type="text" placeholder="Ej: Porsche 911 991.2 · 2018" value={formData.vehicle} onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })} className="w-full bg-[#0a0a0a] border border-white/10 p-3 text-sm focus:border-[#E88A5C] focus:outline-none text-white font-mono" />
                </div>
              </div>
            </div>

            <div className="border border-white/10 bg-[#121212] p-6 sm:p-8">
              <h2 className="text-xs uppercase tracking-widest text-[#E88A5C] mb-6 font-bold">03 · ENTREGA</h2>
              <div className="space-y-3">
                {SHIPPING_OPTIONS.map((option) => (
                  <label key={option.id} onClick={() => setShippingOption(option.id)} className={`flex items-center justify-between p-4 cursor-pointer border transition-all ${selectedShippingId === option.id ? 'border-[#E88A5C] bg-[#E88A5C]/5 text-white' : 'border-white/10 bg-[#0a0a0a] text-gray-300 hover:border-white/20'}`}>
                    <span className="text-sm font-mono">{option.label}</span>
                    <span className="text-sm font-mono font-bold">{option.cost === 0 ? 'Sin costo' : STORE_CONFIG.CURRENCY_FORMAT.format(option.cost)}</span>
                  </label>
                ))}
              </div>
              {requiresAddress && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/10">
                  <div className="sm:col-span-3">
                    <label className="block text-[11px] uppercase tracking-widest text-gray-400 mb-2 font-mono">DIRECCIÓN</label>
                    <input type="text" required={requiresAddress} value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full bg-[#0a0a0a] border border-white/10 p-3 text-sm text-white font-mono" placeholder="Calle y número, Depto / Oficina" />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase tracking-widest text-gray-400 mb-2 font-mono">COMUNA / CIUDAD</label>
                    <input type="text" required={requiresAddress} value={formData.comuna} onChange={(e) => setFormData({ ...formData, comuna: e.target.value })} className="w-full bg-[#0a0a0a] border border-white/10 p-3 text-sm text-white font-mono" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] uppercase tracking-widest text-gray-400 mb-2 font-mono">REGIÓN</label>
                    <input type="text" required={requiresAddress} value={formData.region} onChange={(e) => setFormData({ ...formData, region: e.target.value })} className="w-full bg-[#0a0a0a] border border-white/10 p-3 text-sm text-white font-mono" />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="border border-white/10 bg-[#121212] p-6 sm:p-8 sticky top-28">
              <h2 className="text-xs uppercase tracking-widest text-[#E88A5C] mb-6 font-bold">RESUMEN DEL PEDIDO</h2>
              <div className="divide-y divide-white/10 mb-6">
                {items.map(({ product, quantity }) => (
                  <div key={product.id} className="py-4 flex gap-4 items-center">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white leading-snug">{product.name}</p>
                      <p className="text-xs text-gray-500 font-mono mt-1">× {quantity}</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-white">{STORE_CONFIG.CURRENCY_FORMAT.format(product.price * quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-3 pt-4 border-t border-white/10 font-mono text-xs">
                <div className="flex justify-between text-gray-400"><span>Subtotal</span><span className="text-white">{STORE_CONFIG.CURRENCY_FORMAT.format(getCartSubtotal())}</span></div>
                <div className="flex justify-between text-gray-400"><span>Despacho</span><span className="text-white">{getShippingCost() === 0 ? 'Sin costo' : STORE_CONFIG.CURRENCY_FORMAT.format(getShippingCost())}</span></div>
                <div className="flex justify-between text-base font-bold text-white pt-4 border-t border-white/10"><span className="font-sans uppercase tracking-wider">Total</span><span className="text-[#E88A5C]">{STORE_CONFIG.CURRENCY_FORMAT.format(getCartTotal())}</span></div>
              </div>
              <button type="submit" disabled={loading} className="w-full mt-8 bg-[#E88A5C] text-black font-bold py-4 uppercase tracking-wider hover:bg-opacity-90 transition text-sm disabled:opacity-50">
                {loading ? 'PROCESANDO CON WEBPAY...' : 'CONFIRMAR PEDIDO'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}