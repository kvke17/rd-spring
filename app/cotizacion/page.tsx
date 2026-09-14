'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { formatRut, validateRut } from '@/lib/rut';
import { STORE_CONFIG } from '@/config/constants';

// 1. Actualizamos la función para que incluya todos los datos nuevos en el mensaje
function buildMessage(data: { name: string; marca: string; vin: string; email: string; phone: string; rut: string; partNeeded: string }) {
  const lines = [
    'Hola RD Spring, quiero cotizar un repuesto.',
    data.name ? `Nombre: ${data.name}` : null,
    data.rut ? `RUT: ${data.rut}` : null,
    data.marca ? `Marca: ${data.marca}` : null,
    data.vin ? `Patente/VIN: ${data.vin}` : null,
    data.email ? `Email: ${data.email}` : null,
    data.phone ? `Teléfono: ${data.phone}` : null,
    data.partNeeded ? `Repuesto que necesito: ${data.partNeeded}` : null,
  ].filter(Boolean);
  return lines.join('\n');
}

function CotizacionForm() {
  const searchParams = useSearchParams();
  const marcaPrefill = searchParams.get('marca') || '';

  // 2. Actualizamos el estado para tener los campos exactos que pidió tu cliente
  const [formData, setFormData] = useState({
    name: '',
    marca: marcaPrefill,
    vin: '',
    email: '',
    phone: '',
    rut: '',
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
    // Exigimos los datos mínimos vitales para poder cotizar
    if (!formData.name.trim() || !formData.marca.trim() || !formData.vin.trim() || !formData.partNeeded.trim()) {
      setFormError('Por favor completa tu nombre, marca, patente/VIN y el repuesto que necesitas.');
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
    <div className="border border-gray-200 bg-gray-50 p-6 sm:p-8">
      
      {/* 3. Reorganizamos en Grid de 2 columnas exactas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        
        {/* Fila 1 */}
        <div>
          <label className="block text-[11px] uppercase tracking-widest text-gray-600 mb-2 font-bold">Nombre completo *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-white border border-gray-200 p-3 text-sm focus:border-[#b3131b] focus:outline-none text-gray-900"
          />
        </div>
        <div>
          <label className="block text-[11px] uppercase tracking-widest text-gray-600 mb-2 font-bold">RUT (opcional)</label>
          <input
            type="text"
            placeholder="Ej: 12.345.678-9"
            value={formData.rut}
            onChange={handleRutChange}
            className={`w-full bg-white border p-3 text-sm focus:outline-none text-gray-900 ${
              rutError ? 'border-red-500' : 'border-gray-200 focus:border-[#b3131b]'
            }`}
          />
          {rutError && <p className="text-xs text-red-500 mt-1">{rutError}</p>}
        </div>

        {/* Fila 2 */}
        <div>
          <label className="block text-[11px] uppercase tracking-widest text-gray-600 mb-2 font-bold">Marca *</label>
          <select
            value={formData.marca}
            onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
            className="w-full bg-white border border-gray-200 p-3 text-sm focus:border-[#b3131b] focus:outline-none text-gray-900"
          >
            <option value="">Selecciona una marca...</option>
            <option value="Porsche">Porsche</option>
            <option value="BMW">BMW</option>
            <option value="Audi">Audi</option>
            <option value="Land Rover">Land Rover</option>
            <option value="Otra">Otra</option>
          </select>
        </div>
        <div>
          <label className="block text-[11px] uppercase tracking-widest text-gray-600 mb-2 font-bold">Patente o VIN *</label>
          <input
            type="text"
            placeholder="Fundamental para exactitud"
            value={formData.vin}
            onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
            className="w-full bg-white border border-gray-200 p-3 text-sm focus:border-[#b3131b] focus:outline-none text-gray-900"
          />
        </div>

        {/* Fila 3 */}
        <div>
          <label className="block text-[11px] uppercase tracking-widest text-gray-600 mb-2 font-bold">Email *</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full bg-white border border-gray-200 p-3 text-sm focus:border-[#b3131b] focus:outline-none text-gray-900"
          />
        </div>
        <div>
          <label className="block text-[11px] uppercase tracking-widest text-gray-600 mb-2 font-bold">Teléfono *</label>
          <input
            type="tel"
            placeholder="+56 9 "
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full bg-white border border-gray-200 p-3 text-sm focus:border-[#b3131b] focus:outline-none text-gray-900"
          />
        </div>
      </div>

      {/* Repuestos */}
      <div className="mb-6">
        <label className="block text-[11px] uppercase tracking-widest text-gray-600 mb-2 font-bold">¿Qué repuestos necesitas? *</label>
        <textarea
          rows={4}
          placeholder="Describe el repuesto, lado (izquierdo/derecho), delantero o trasero..."
          value={formData.partNeeded}
          onChange={(e) => setFormData({ ...formData, partNeeded: e.target.value })}
          className="w-full bg-white border border-gray-200 p-3 text-sm focus:border-[#b3131b] focus:outline-none text-gray-900 resize-none"
        />
      </div>

      {formError && <p className="text-xs text-red-500 mb-4">{formError}</p>}

      <p className="text-[11px] uppercase tracking-widest text-gray-500 mb-3 font-bold">Enviar solicitud por</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          type="button"
          onClick={handleWhatsApp}
          className="bg-[#25D366] text-white font-bold py-4 text-xs uppercase tracking-widest hover:bg-[#1ebe57] transition shadow-sm"
        >
          WhatsApp
        </button>
        <button
          type="button"
          onClick={handleEmail}
          disabled={emailLoading}
          className="bg-[#b3131b] text-white font-bold py-4 text-xs uppercase tracking-widest hover:bg-red-800 transition shadow-sm disabled:opacity-50"
        >
          {emailLoading ? 'Enviando...' : 'Email'}
        </button>
        <button
          type="button"
          onClick={handleInstagram}
          className="border border-gray-300 bg-white text-gray-900 font-bold py-4 text-xs uppercase tracking-widest hover:bg-gray-50 transition shadow-sm"
        >
          Instagram
        </button>
      </div>

      {emailStatus === 'success' && (
        <p className="text-xs text-[#b3131b] mt-4 font-bold">
          ✓ Cotización enviada por email a {STORE_CONFIG.CONTACT_EMAIL}. Te responderemos a la brevedad.
        </p>
      )}
      {emailStatus === 'error' && (
        <p className="text-xs text-red-500 mt-4 font-bold">Ocurrió un error enviando el correo. Intenta de nuevo o usa WhatsApp.</p>
      )}
      {igCopied && (
        <p className="text-xs text-[#b3131b] mt-4 font-bold">
          ✓ Mensaje copiado. Pégalo en el chat que se abrió en Instagram ({STORE_CONFIG.INSTAGRAM_USERNAME}).
        </p>
      )}
    </div>
  );
}

export default function CotizacionPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 pt-28 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-xs uppercase tracking-[0.25em] text-[#b3131b] mb-2 font-bold">REPUESTOS BAJO PEDIDO</p>
        <h1 className="text-4xl font-bold uppercase tracking-tight mb-4">Cotiza tu repuesto</h1>
        <p className="text-sm text-gray-600 leading-relaxed mb-10 max-w-2xl font-medium">
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