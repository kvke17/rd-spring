'use client';

import { useState } from 'react';
import { 
  HelpCircle, 
  PackageSearch, 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  Truck, 
  Clock, 
  ShieldCheck, 
  Calendar, 
  FileText 
} from 'lucide-react';
import { STORE_CONFIG } from '@/config/constants';

const MOTIVOS = [
  { value: 'general', label: 'Consulta general' },
  { value: 'compatibilidad', label: 'Compatibilidad de repuesto (VIN)' },
  { value: 'cotizacion', label: 'Cotización especial' },
  { value: 'garantia', label: 'Garantía o cambio' },
  { value: 'otro', label: 'Otro asunto' },
];

interface TrackedOrder {
  buyOrder: string;
  paymentStatus: string;
  paymentStatusLabel: string;
  shippingStatus: string;
  shippingStepIndex: number;
  shippingStages: { value: string; label: string }[];
  amount: number;
  createdAt: string;
  items: { name: string; sku: string; quantity: number }[];
}

export default function SupportPage() {
  const [tab, setTab] = useState<'consultas' | 'seguimiento'>('consultas');

  return (
    <div className="min-h-screen bg-slate-50/50 text-gray-900 pt-28 sm:pt-32 pb-24 font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Encabezado Principal */}
        <div className="mb-8 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-100 text-[#b3131b] text-[10px] font-mono font-bold uppercase tracking-wider mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>CENTRO DE AYUDA Y ATENCIÓN TÉCNICA</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-gray-900">
            Soporte & Pedidos
          </h1>
          <p className="text-sm text-slate-500 mt-2 max-w-xl font-medium">
            Envíanos tus dudas sobre compatibilidad o consulta el estado de despacho de tu compra en tiempo real.
          </p>
        </div>

        {/* Tab Switcher Moderno */}
        <div className="flex bg-slate-200/60 p-1.5 rounded-2xl mb-8 max-w-md">
          <button
            onClick={() => setTab('consultas')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              tab === 'consultas'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-slate-600 hover:text-gray-900'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Consultas</span>
          </button>
          <button
            onClick={() => setTab('seguimiento')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              tab === 'seguimiento'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-slate-600 hover:text-gray-900'
            }`}
          >
            <PackageSearch className="w-4 h-4" />
            <span>Seguimiento</span>
          </button>
        </div>

        {tab === 'consultas' ? <ConsultaForm /> : <SeguimientoForm />}
      </div>
    </div>
  );
}

function ConsultaForm() {
  const [formData, setFormData] = useState({ name: '', email: '', motivo: 'general', vehicle: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus('idle');
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('fail');
      setStatus('success');
      setFormData({ name: '', email: '', motivo: 'general', vehicle: '', message: '' });
    } catch {
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-sm">
      <p className="text-sm text-slate-600 mb-8 leading-relaxed font-medium">
        Escríbenos por cualquier motivo: dudas técnicas, confirmación de números de parte OEM, cotizaciones especiales o consultas sobre envíos.
      </p>

      {status === 'success' ? (
        <div className="text-center py-12 bg-slate-50/50 rounded-2xl border border-slate-100 p-8">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-100">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">¡Consulta Recibida con Éxito!</h3>
          <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
            Hemos registrado tu requerimiento. Uno de nuestros especialistas te responderá a la brevedad a tu correo electrónico.
          </p>
          <button 
            onClick={() => setStatus('idle')} 
            className="bg-slate-900 hover:bg-black text-white font-bold px-6 py-3 rounded-xl uppercase tracking-wider text-xs transition-colors"
          >
            Enviar otra consulta
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-700 mb-2 font-bold">
                Nombre Completo *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-50/60 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[#b3131b] focus:bg-white focus:ring-2 focus:ring-red-100 outline-none transition-all text-slate-900"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-700 mb-2 font-bold">
                Correo Electrónico *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-50/60 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[#b3131b] focus:bg-white focus:ring-2 focus:ring-red-100 outline-none transition-all text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-700 mb-2 font-bold">
              Motivo de la consulta
            </label>
            <select
              value={formData.motivo}
              onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
              className="w-full bg-slate-50/60 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[#b3131b] focus:bg-white focus:ring-2 focus:ring-red-100 outline-none transition-all text-slate-900 cursor-pointer"
            >
              {MOTIVOS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          {formData.motivo === 'compatibilidad' && (
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-700 mb-2 font-bold">
                Número de Chasis (VIN) o Modelo de tu Vehículo
              </label>
              <input
                type="text"
                placeholder="Ej: WP0ZZZ99ZKS123456 o BMW 330i 2020"
                value={formData.vehicle}
                onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
                className="w-full bg-slate-50/60 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[#b3131b] focus:bg-white focus:ring-2 focus:ring-red-100 outline-none transition-all text-slate-900 font-mono"
              />
            </div>
          )}

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-700 mb-2 font-bold">
              Mensaje o Detalles *
            </label>
            <textarea
              rows={5}
              required
              placeholder="Explícanos con detalle tu requerimiento..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full bg-slate-50/60 border border-slate-200 rounded-xl p-4 text-sm focus:border-[#b3131b] focus:bg-white focus:ring-2 focus:ring-red-100 outline-none transition-all text-slate-900 resize-none leading-relaxed"
            />
          </div>

          {status === 'error' && (
            <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 p-3 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Ocurrió un error al enviar tu consulta. Por favor intenta de nuevo o escríbenos a {STORE_CONFIG.CONTACT_EMAIL}.</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-[#b3131b] hover:bg-[#8f0f15] text-white font-bold px-8 py-3.5 rounded-xl uppercase tracking-wider text-xs transition-colors shadow-sm disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{loading ? 'ENVIANDO...' : 'ENVIAR CONSULTA'}</span>
          </button>
        </form>
      )}
    </div>
  );
}

function SeguimientoForm() {
  const [buyOrder, setBuyOrder] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState<TrackedOrder | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setOrder(null);
    try {
      const res = await fetch(`/api/orders/track?buyOrder=${encodeURIComponent(buyOrder)}&email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'No pudimos encontrar tu pedido. Verifica la orden y correo.');
        return;
      }
      setOrder(data);
    } catch {
      setError('Error de conexión con el servidor. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-sm">
      <p className="text-sm text-slate-600 mb-8 leading-relaxed font-medium">
        Ingresa tu código de orden (ej. <code className="font-mono text-[#b3131b] font-bold">ORD-123456</code>) y el email que utilizaste en el pago para consultar el estado en vivo.
      </p>

      <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
        <div>
          <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-700 mb-2 font-bold">
            Número de Orden *
          </label>
          <input
            type="text"
            required
            placeholder="ORD-123456"
            value={buyOrder}
            onChange={(e) => setBuyOrder(e.target.value.toUpperCase())}
            className="w-full bg-slate-50/60 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[#b3131b] focus:bg-white focus:ring-2 focus:ring-red-100 outline-none transition-all text-slate-900 font-mono"
          />
        </div>
        <div>
          <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-700 mb-2 font-bold">
            Email de la Compra *
          </label>
          <input
            type="email"
            required
            placeholder="tu@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-slate-50/60 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[#b3131b] focus:bg-white focus:ring-2 focus:ring-red-100 outline-none transition-all text-slate-900"
          />
        </div>
        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-[#b3131b] hover:bg-[#8f0f15] text-white font-bold px-8 py-3.5 rounded-xl uppercase tracking-wider text-xs transition-colors shadow-sm disabled:opacity-50"
          >
            <PackageSearch className="w-4 h-4" />
            <span>{loading ? 'BUSCANDO PEDIDO...' : 'CONSULTAR ESTADO'}</span>
          </button>
        </div>
      </form>

      {error && (
        <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 p-4 rounded-xl mb-6">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {order && (
        <div className="border-t border-slate-100 pt-8 mt-6">
          
          {/* Ficha Resumen de Orden */}
          <div className="bg-slate-50/80 rounded-2xl p-6 border border-slate-200/80 mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">Orden de Compra</span>
              <span className="text-base font-black text-gray-900 font-mono">{order.buyOrder}</span>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">Fecha de Emisión</span>
              <span className="text-sm font-bold text-gray-900">
                {new Date(order.createdAt).toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' })}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">Monto Pagado</span>
              <span className="text-base font-black text-[#b3131b]">
                {STORE_CONFIG.CURRENCY_FORMAT.format(order.amount)}
              </span>
            </div>
          </div>

          {/* Línea de Tiempo del Envío */}
          {order.paymentStatus === 'PAID' || order.paymentStatus === 'PAGADO' ? (
            <div className="mb-8 bg-white rounded-2xl border border-slate-200/80 p-6">
              <div className="flex items-center gap-2 mb-6">
                <Truck className="w-4 h-4 text-[#b3131b]" />
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-900">
                  Etapa de Despacho
                </h4>
              </div>

              <div className="flex items-center">
                {order.shippingStages.map((stage, idx) => {
                  const isDone = idx <= order.shippingStepIndex;
                  const isLast = idx === order.shippingStages.length - 1;
                  return (
                    <div key={stage.value} className="flex items-center flex-1 last:flex-none">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                            isDone 
                              ? 'bg-[#b3131b] text-white shadow-xs ring-4 ring-red-100' 
                              : 'bg-slate-100 border border-slate-300 text-slate-400'
                          }`}
                        >
                          {isDone ? '✓' : idx + 1}
                        </div>
                        <span
                          className={`mt-2.5 text-[10px] uppercase font-bold tracking-wider text-center max-w-[90px] leading-tight ${
                            isDone ? 'text-gray-900' : 'text-slate-400 font-medium'
                          }`}
                        >
                          {stage.label}
                        </span>
                      </div>
                      {!isLast && (
                        <div className={`flex-1 h-[2px] mx-2 mb-6 transition-colors ${
                          idx < order.shippingStepIndex ? 'bg-[#b3131b]' : 'bg-slate-200'
                        }`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="mb-6 p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Estado del Pago:</span>
              <span
                className={`inline-block px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold ${
                  order.paymentStatus === 'REJECTED'
                    ? 'bg-red-100 text-red-700 border border-red-200'
                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                }`}
              >
                {order.paymentStatusLabel}
              </span>
            </div>
          )}

          {/* Desglose de Productos */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold mb-3">
              PRODUCTOS INCLUIDOS EN LA ORDEN
            </h4>
            <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-2xl overflow-hidden bg-slate-50/30">
              {order.items.map((item) => (
                <div key={item.sku} className="p-4 flex justify-between items-center bg-white">
                  <div>
                    <span className="text-sm font-bold text-gray-900 block">{item.name}</span>
                    <span className="text-xs text-slate-500 font-medium">Cantidad: {item.quantity}</span>
                  </div>
                  <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                    {item.sku}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}