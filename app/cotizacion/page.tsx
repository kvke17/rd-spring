'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { formatRut, validateRut } from '@/lib/rut';
import { STORE_CONFIG } from '@/config/constants';
import { 
  Sparkles, 
  Send, 
  Mail, 
  Instagram, 
  ShieldCheck, 
  Clock, 
  FileCheck, 
  CheckCircle2, 
  AlertCircle,
  Car
} from 'lucide-react';

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
    if (!formData.name.trim() || !formData.marca.trim() || !formData.vin.trim() || !formData.partNeeded.trim()) {
      setFormError('Por favor completa tu nombre, marca, patente o VIN y el repuesto que necesitas.');
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
      setFormError('Para cotizar por email necesitamos también tu correo y teléfono de contacto.');
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
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-sm">
      
      {/* Grid de Formulario */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
        
        {/* Nombre */}
        <div>
          <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-700 mb-2 font-bold">
            Nombre Completo *
          </label>
          <input
            type="text"
            placeholder="Ej: Juan Pérez"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-slate-50/60 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[#b3131b] focus:bg-white focus:ring-2 focus:ring-red-100 outline-none transition-all text-slate-900"
          />
        </div>

        {/* RUT */}
        <div>
          <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-700 mb-2 font-bold">
            RUT (Opcional)
          </label>
          <input
            type="text"
            placeholder="Ej: 12.345.678-9"
            value={formData.rut}
            onChange={handleRutChange}
            className={`w-full bg-slate-50/60 border rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 outline-none transition-all text-slate-900 ${
              rutError ? 'border-red-500 focus:ring-red-100' : 'border-slate-200 focus:border-[#b3131b] focus:ring-red-100'
            }`}
          />
          {rutError && <p className="text-xs text-red-500 mt-1 font-medium">{rutError}</p>}
        </div>

        {/* Marca */}
        <div>
          <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-700 mb-2 font-bold">
            Marca del Vehículo *
          </label>
          <select
            value={formData.marca}
            onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
            className="w-full bg-slate-50/60 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[#b3131b] focus:bg-white focus:ring-2 focus:ring-red-100 outline-none transition-all text-slate-900 cursor-pointer"
          >
            <option value="">Selecciona una marca...</option>
            <option value="Porsche">Porsche</option>
            <option value="BMW">BMW</option>
            <option value="Audi">Audi</option>
            <option value="Mercedes-Benz">Mercedes-Benz</option>
            <option value="Land Rover">Land Rover</option>
            <option value="Volkswagen">Volkswagen</option>
            <option value="Otra">Otra marca europea / americana</option>
          </select>
        </div>

        {/* Patente o VIN */}
        <div>
          <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-700 mb-2 font-bold flex items-center justify-between">
            <span>Patente o VIN (Chasis) *</span>
            <span className="text-[10px] text-slate-400 font-normal lowercase">17 caracteres</span>
          </label>
          <input
            type="text"
            placeholder="Ej: WP0ZZZ99ZKS123456"
            value={formData.vin}
            onChange={(e) => setFormData({ ...formData, vin: e.target.value.toUpperCase() })}
            className="w-full bg-slate-50/60 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[#b3131b] focus:bg-white focus:ring-2 focus:ring-red-100 outline-none transition-all text-slate-900 font-mono"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-700 mb-2 font-bold">
            Correo Electrónico *
          </label>
          <input
            type="email"
            placeholder="tu@correo.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full bg-slate-50/60 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[#b3131b] focus:bg-white focus:ring-2 focus:ring-red-100 outline-none transition-all text-slate-900"
          />
        </div>

        {/* Teléfono */}
        <div>
          <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-700 mb-2 font-bold">
            Teléfono Móvil *
          </label>
          <input
            type="tel"
            placeholder="+56 9 1234 5678"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full bg-slate-50/60 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[#b3131b] focus:bg-white focus:ring-2 focus:ring-red-100 outline-none transition-all text-slate-900"
          />
        </div>
      </div>

      {/* Repuestos Solicitados */}
      <div className="mb-6">
        <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-700 mb-2 font-bold">
          ¿Qué repuesto necesitas cotizar? *
        </label>
        <textarea
          rows={4}
          placeholder="Ej: Amortiguadores delanteros bilstein, bandejas de suspensión, discos de freno delanteros, etc. Indica lado (izquierdo/derecho) o detalles si los tienes."
          value={formData.partNeeded}
          onChange={(e) => setFormData({ ...formData, partNeeded: e.target.value })}
          className="w-full bg-slate-50/60 border border-slate-200 rounded-xl p-4 text-sm focus:border-[#b3131b] focus:bg-white focus:ring-2 focus:ring-red-100 outline-none transition-all text-slate-900 resize-none leading-relaxed"
        />
      </div>

      {formError && (
        <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 p-3 rounded-xl mb-6">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {/* Selector de Canal */}
      <div className="pt-4 border-t border-slate-100">
        <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-4 font-bold">
          Selecciona cómo deseas recibir la cotización
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* WhatsApp */}
          <button
            type="button"
            onClick={handleWhatsApp}
            className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebe57] text-white font-bold py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-all shadow-sm active:scale-[0.98]"
          >
            <Send className="w-4 h-4" />
            <span>Por WhatsApp</span>
          </button>

          {/* Email */}
          <button
            type="button"
            onClick={handleEmail}
            disabled={emailLoading}
            className="flex items-center justify-center gap-2 bg-[#b3131b] hover:bg-[#8f0f15] text-white font-bold py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-all shadow-sm disabled:opacity-50 active:scale-[0.98]"
          >
            <Mail className="w-4 h-4" />
            <span>{emailLoading ? 'Enviando...' : 'Por Correo'}</span>
          </button>

          {/* Instagram */}
          <button
            type="button"
            onClick={handleInstagram}
            className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white font-bold py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-all shadow-sm active:scale-[0.98]"
          >
            <Instagram className="w-4 h-4" />
            <span>Por Instagram</span>
          </button>
        </div>
      </div>

      {/* Estados de Envío */}
      {emailStatus === 'success' && (
        <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 p-4 rounded-xl mt-6">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>✓ Cotización enviada por email a <strong>{STORE_CONFIG.CONTACT_EMAIL}</strong>. Te responderemos a la brevedad con la disponibilidad y precio exacto.</span>
        </div>
      )}
      {emailStatus === 'error' && (
        <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 p-4 rounded-xl mt-6">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Ocurrió un inconveniente al enviar el correo. Por favor intenta de nuevo o escríbenos directamente por WhatsApp.</span>
        </div>
      )}
      {igCopied && (
        <div className="flex items-center gap-2 text-xs text-slate-800 bg-slate-100 border border-slate-300 p-4 rounded-xl mt-6">
          <CheckCircle2 className="w-4 h-4 text-slate-900 shrink-0" />
          <span>✓ Mensaje copiado en el portapapeles. Pégalo en el chat de Instagram que se acaba de abrir en tu navegador (<strong>{STORE_CONFIG.INSTAGRAM_USERNAME}</strong>).</span>
        </div>
      )}
    </div>
  );
}

export default function CotizacionPage() {
  return (
    <div className="min-h-screen bg-slate-50/50 text-gray-900 pt-28 sm:pt-32 pb-24 font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Encabezado */}
        <div className="text-center sm:text-left mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-100 text-[#b3131b] text-[10px] font-mono font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>REPUESTOS OEM BAJO PEDIDO · IMPORTACIÓN DIRECTA</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-gray-900">
            Cotiza tu repuesto
          </h1>
          <p className="text-sm text-slate-500 mt-3 max-w-2xl font-medium leading-relaxed">
            Trabajamos con marcas líderes de equipo original como <strong className="text-slate-800">Bilstein, Sachs, TRW, Meyle y Lemförder</strong>, importadas directamente desde Europa para Porsche, BMW, Audi, Mercedes-Benz y Land Rover.
          </p>
        </div>

        {/* Formulario */}
        <Suspense fallback={
          <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center text-slate-400 font-mono text-xs">
            Cargando configurador de cotización...
          </div>
        }>
          <CotizacionForm />
        </Suspense>

        {/* Pilares de confianza */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-[#b3131b] flex items-center justify-center shrink-0">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide">Validación por Chasis</h4>
              <p className="text-xs text-slate-500 mt-1">Garantizamos 100% de compatibilidad con el VIN oficial del fabricante.</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-[#b3131b] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide">Calidad OEM Certificada</h4>
              <p className="text-xs text-slate-500 mt-1">Mismos proveedores y especificaciones de armado de fábrica.</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-[#b3131b] flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide">Respuesta Rápida</h4>
              <p className="text-xs text-slate-500 mt-1">Cotización formal en menos de 2 horas hábiles a tu canal preferido.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}