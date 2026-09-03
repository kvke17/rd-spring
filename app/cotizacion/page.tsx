'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { formatRut, validateRut } from '@/lib/rut';
import { STORE_CONFIG } from '@/config/constants';

function buildMessage(data: { name: string; vehicle: string; partNeeded: string }) {
  const lines = [
    'Hola RD Spring, quiero cotizar un repuesto.',
    data.name ? `Nombre: ${data.name}` : null,
    data.vehicle ? `Vehículo: ${data.vehicle}` : null,
    data.partNeeded ? `Repuesto que necesito: ${data.partNeeded}` : null,
  ].filter(Boolean);
  return lines.join('\n');
}

function CotizacionForm() {
  const searchParams = useSearchParams();
  const marcaPrefill = searchParams.get('marca') || '';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    rut: '',
    vehicle: marcaPrefill,
    partNeeded: '',
  });
  const [rutError, setRutError] = useState('');
  const [formError, setFormError] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailStatus, setEmailStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [igCopied, setIgCopied] = useState(false);

  const handleRutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatRut(e.target.value);
    setFormData({ ...formData, rut: formatted });
    if (formatted.length > 3 && !validateRut(formatted)) setRutError('RUT inválido');
    else setRutError('');
  };

  const validateBasics = () => {
    if (!formData.name.trim() || !formData.partNeeded.trim()) {
      setFormError('Completa al menos tu nombre y qué repuesto necesitas.');
      return false;
    }
    setFormError('');
    return true;
  };

  const handleWhatsApp = () => {
    if (!validateBasics()) return;
    const text = buildMessage(formData);
    const url = `https://wa.me/${STORE_CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleInstagram = async () => {
    if (!validateBasics()) return;
    const text = buildMessage(formData);
    try {
      await navigator.clipboard.writeText(text);
      setIgCopied(true);
    } catch {
      setIgCopied(false);
    }
    window.open(STORE_CONFIG.INSTAGRAM_DM_URL, '_blank');
  };

  const handleEmail = async () => {
    if (!validateBasics()) return;
    if (!formData.email.trim() || !formData.phone.trim()) {
      setFormError('Para cotizar por email necesitamos también tu correo y teléfono.');
      return;
    }
    setEmailLoading(true);
    setEmailStatus('idle');
    try {
      const res = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('fail');
      setEmailStatus('success');
    } catch {
      setEmailStatus('error');
    } finally {
      setEmailLoading(false);
    }
  };

  return (
    <div className="border border-white/10 bg-[#121212] p-6 sm:p-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-[11px] uppercase tracking-widest text-gray-400 mb-2 font-mono">Nombre completo *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-[#0a0a0a] border border-white/10 p-3 text-sm focus:border-[#FF0000] focus:outline-none text-white font-mono"
          />
        </div>
        <div>
          <label className="block text-[11px] uppercase tracking-widest text-gray-400 mb-2 font-mono">Vehículo (marca, modelo, año)</label>
          <input
            type="text"
            placeholder="Ej: Porsche 911 991.2 · 2018"
            value={formData.vehicle}
            onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
            className="w-full bg-[#0a0a0a] border border-white/10 p-3 text-sm focus:border-[#FF0000] focus:outline-none text-white font-mono"
          />
        </div>
        <div>
          <label className="block text-[11px] uppercase tracking-widest text-gray-400 mb-2 font-mono">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full bg-[#0a0a0a] border border-white/10 p-3 text-sm focus:border-[#FF0000] focus:outline-none text-white font-mono"
          />
        </div>
        <div>
          <label className="block text-[11px] uppercase tracking-widest text-gray-400 mb-2 font-mono">Teléfono</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full bg-[#0a0a0a] border border-white/10 p-3 text-sm focus:border-[#FF0000] focus:outline-none text-white font-mono"
          />
        </div>
        <div>
          <label className="block text-[11px] uppercase tracking-widest text-gray-400 mb-2 font-mono">RUT (opcional)</label>
          <input
            type="text"
            placeholder="12.345.678-9"
            value={formData.rut}
            onChange={handleRutChange}
            className={`w-full bg-[#0a0a0a] border p-3 text-sm focus:outline-none text-white font-mono ${
              rutError ? 'border-red-500' : 'border-white/10 focus:border-[#FF0000]'
            }`}
          />
          {rutError && <p className="text-xs text-red-500 mt-1">{rutError}</p>}
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-[11px] uppercase tracking-widest text-gray-400 mb-2 font-mono">¿Qué repuesto necesitas? *</label>
        <textarea
          rows={4}
          placeholder="Ej: Amortiguador trasero derecho, o kit de coilovers para uso en pista..."
          value={formData.partNeeded}
          onChange={(e) => setFormData({ ...formData, partNeeded: e.target.value })}
          className="w-full bg-[#0a0a0a] border border-white/10 p-3 text-sm focus:border-[#FF0000] focus:outline-none text-white font-mono"
        />
      </div>

      {formError && <p className="text-xs text-red-500 font-mono mb-4">{formError}</p>}

      <p className="text-[11px] uppercase tracking-widest text-gray-500 font-mono mb-3">Enviar solicitud por</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          type="button"
          onClick={handleWhatsApp}
          className="bg-[#FF0000] text-black font-bold py-4 text-xs uppercase tracking-widest hover:bg-opacity-90 transition"
        >
          WhatsApp
        </button>
        <button
          type="button"
          onClick={handleEmail}
          disabled={emailLoading}
          className="border border-white/20 text-white font-bold py-4 text-xs uppercase tracking-widest hover:bg-white/10 transition disabled:opacity-50"
        >
          {emailLoading ? 'Enviando...' : 'Email'}
        </button>
        <button
          type="button"
          onClick={handleInstagram}
          className="border border-white/20 text-white font-bold py-4 text-xs uppercase tracking-widest hover:bg-white/10 transition"
        >
          Instagram
        </button>
      </div>

      {emailStatus === 'success' && (
        <p className="text-xs text-[#FF0000] font-mono mt-4">
          ✓ Cotización enviada por email a {STORE_CONFIG.CONTACT_EMAIL}. Te responderemos a la brevedad.
        </p>
      )}
      {emailStatus === 'error' && (
        <p className="text-xs text-red-500 font-mono mt-4">Ocurrió un error enviando el correo. Intenta de nuevo o usa WhatsApp.</p>
      )}
      {igCopied && (
        <p className="text-xs text-[#FF0000] font-mono mt-4">
          ✓ Mensaje copiado. Pégalo en el chat que se abrió en Instagram ({STORE_CONFIG.INSTAGRAM_USERNAME}).
        </p>
      )}
    </div>
  );
}

export default function CotizacionPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-28 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-xs uppercase tracking-[0.25em] text-[#FF0000] font-mono mb-2">REPUESTOS BAJO PEDIDO</p>
        <h1 className="text-4xl font-bold uppercase tracking-tight mb-4">Cotiza tu repuesto</h1>
        <p className="text-sm text-gray-400 font-mono leading-relaxed mb-10 max-w-2xl">
          Trabajamos con marcas OEM como Bilstein, Sachs, TRW y Lemförder, importadas directamente desde la Unión Europea, para Porsche, BMW, Audi y Land Rover.
          Cuéntanos qué necesitas y te cotizamos por el canal que prefieras.
        </p>

        <Suspense fallback={null}>
          <CotizacionForm />
        </Suspense>
      </div>
    </div>
  );
}
