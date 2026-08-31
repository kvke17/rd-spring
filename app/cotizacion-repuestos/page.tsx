'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { STORE_CONFIG } from '@/config/constants';

function CotizacionForm() {
  const searchParams = useSearchParams();
  const marcaSugerida = searchParams.get('marca') || searchParams.get('categoria') || '';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    vehicle: marcaSugerida ? marcaSugerida : '',
    vin: '',
    partNeeded: '',
  });
  const [touched, setTouched] = useState(false);
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const isValid = formData.name.trim() && formData.vehicle.trim() && formData.partNeeded.trim();

  const buildMessage = () => {
    return [
      `Hola, quiero cotizar un repuesto.`,
      `Nombre: ${formData.name}`,
      `Vehículo: ${formData.vehicle}`,
      formData.vin ? `N° de Chasis (VIN): ${formData.vin}` : null,
      `Repuesto que necesito: ${formData.partNeeded}`,
    ]
      .filter(Boolean)
      .join('\n');
  };

  const handleWhatsApp = () => {
    setTouched(true);
    if (!isValid) return;
    const text = buildMessage();
    window.open(`https://wa.me/${STORE_CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleInstagram = () => {
    setTouched(true);
    if (!isValid) return;
    window.open(STORE_CONFIG.INSTAGRAM_URL, '_blank');
  };

  const handleEmail = async () => {
    setTouched(true);
    if (!isValid || !formData.email.trim() || !formData.phone.trim()) return;
    setEmailStatus('sending');
    try {
      const res = await fetch('/api/parts-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('fail');
      setEmailStatus('success');
    } catch {
      setEmailStatus('error');
    }
  };

  return (
    <div className="border border-white/10 bg-[#121212] p-6 sm:p-8">
      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[11px] uppercase tracking-widest text-gray-400 mb-2 font-mono">Nombre completo</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-[#0a0a0a] border border-white/10 p-3 text-sm focus:border-[#E88A5C] focus:outline-none text-white font-mono"
            />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-widest text-gray-400 mb-2 font-mono">
              Vehículo (marca, modelo, año)
            </label>
            <input
              type="text"
              placeholder="Ej: BMW Serie 3 (F30) 2016"
              value={formData.vehicle}
              onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
              className="w-full bg-[#0a0a0a] border border-white/10 p-3 text-sm focus:border-[#E88A5C] focus:outline-none text-white font-mono"
            />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-widest text-gray-400 mb-2 font-mono">Email</label>
            <input
              type="email"
              placeholder="Requerido solo para cotizar por email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-[#0a0a0a] border border-white/10 p-3 text-sm focus:border-[#E88A5C] focus:outline-none text-white font-mono"
            />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-widest text-gray-400 mb-2 font-mono">Teléfono</label>
            <input
              type="tel"
              placeholder="Requerido solo para cotizar por email"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-[#0a0a0a] border border-white/10 p-3 text-sm focus:border-[#E88A5C] focus:outline-none text-white font-mono"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-[11px] uppercase tracking-widest text-gray-400 mb-2 font-mono">
              Número de Chasis / VIN (opcional, ayuda a confirmar compatibilidad más rápido)
            </label>
            <input
              type="text"
              placeholder="Ej: WP0ZZZ99ZKS123456"
              value={formData.vin}
              onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
              className="w-full bg-[#0a0a0a] border border-white/10 p-3 text-sm focus:border-[#E88A5C] focus:outline-none text-white font-mono"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-[11px] uppercase tracking-widest text-gray-400 mb-2 font-mono">
              ¿Qué repuesto necesitas?
            </label>
            <textarea
              rows={4}
              placeholder="Ej: Amortiguador trasero derecho, o el eje de suspensión completo delantero"
              value={formData.partNeeded}
              onChange={(e) => setFormData({ ...formData, partNeeded: e.target.value })}
              className="w-full bg-[#0a0a0a] border border-white/10 p-3 text-sm focus:border-[#E88A5C] focus:outline-none text-white font-mono"
            />
          </div>
        </div>

        {touched && !isValid && (
          <p className="text-xs text-red-500 font-mono">
            Completa al menos tu nombre, el vehículo y el repuesto que necesitas antes de enviar.
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <button
            type="button"
            onClick={handleWhatsApp}
            className="bg-[#E88A5C] text-black font-bold py-4 text-xs uppercase tracking-widest hover:bg-opacity-90 transition"
          >
            Cotizar por WhatsApp
          </button>
          <button
            type="button"
            onClick={handleInstagram}
            className="border border-white/20 text-white font-bold py-4 text-xs uppercase tracking-widest hover:bg-white/10 transition"
          >
            Cotizar por Instagram
          </button>
          <button
            type="button"
            onClick={handleEmail}
            disabled={emailStatus === 'sending'}
            className="border border-white/20 text-white font-bold py-4 text-xs uppercase tracking-widest hover:bg-white/10 transition disabled:opacity-50"
          >
            {emailStatus === 'sending' ? 'Enviando...' : 'Cotizar por Email'}
          </button>
        </div>

        <p className="text-[10px] text-gray-500 font-mono leading-relaxed">
          Instagram abre nuestro perfil (@{STORE_CONFIG.INSTAGRAM_USERNAME}) para que nos escribas por DM — no es posible pre-llenar el mensaje ahí. WhatsApp sí abre el chat con tu solicitud ya escrita. Email requiere que completes también tu correo y teléfono arriba.
        </p>

        {emailStatus === 'success' && (
          <p className="text-xs text-[#E88A5C] font-mono">¡Listo! Tu solicitud fue enviada por correo, te responderemos a la brevedad.</p>
        )}
        {emailStatus === 'error' && (
          <p className="text-xs text-red-500 font-mono">Ocurrió un error enviando tu solicitud por correo. Prueba por WhatsApp o Instagram.</p>
        )}
      </form>
    </div>
  );
}

export default function CotizacionRepuestosPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-28 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-xs uppercase tracking-[0.25em] text-[#E88A5C] font-mono mb-2">REPUESTOS BAJO PEDIDO</p>
        <h1 className="text-4xl font-bold uppercase tracking-tight mb-6">Cotización de Repuestos</h1>
        <p className="text-sm text-gray-400 font-mono leading-relaxed mb-10 max-w-2xl">
          Trabajamos con repuestos OEM de marcas como Bilstein, TRW, Sachs y Lemförder, importados directamente desde la Unión Europea, para Porsche, BMW, Audi y Land Rover. Cuéntanos qué necesitas y te cotizamos por el canal que prefieras.
        </p>

        <Suspense fallback={null}>
          <CotizacionForm />
        </Suspense>
      </div>
    </div>
  );
}
