'use client';

import { useState } from 'react';

const MOTIVOS = [
  { value: 'general', label: 'Consulta general' },
  { value: 'compatibilidad', label: 'Compatibilidad de repuesto' },
  { value: 'cotizacion', label: 'Cotización' },
  { value: 'garantia', label: 'Garantía' },
  { value: 'otro', label: 'Otro' },
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
    <div className="min-h-screen bg-white text-gray-900 pt-28 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-xs uppercase tracking-[0.25em] text-[#b3131b]  mb-2">ASISTENCIA</p>
        <h1 className="text-4xl font-bold uppercase tracking-tight mb-8">Soporte</h1>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-8">
          <button
            onClick={() => setTab('consultas')}
            className={`px-6 py-3 text-xs  uppercase tracking-widest border-b-2 transition ${
              tab === 'consultas' ? 'border-[#b3131b] text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Consultas
          </button>
          <button
            onClick={() => setTab('seguimiento')}
            className={`px-6 py-3 text-xs  uppercase tracking-widest border-b-2 transition ${
              tab === 'seguimiento' ? 'border-[#b3131b] text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Seguimiento de pedido
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
    <div className="border border-gray-200 bg-gray-50 p-8">
      <p className="text-sm text-gray-600 mb-8  leading-relaxed">
        Escríbenos por cualquier motivo: dudas generales, compatibilidad de un repuesto, cotizaciones, garantía o lo que necesites.
      </p>

      {status === 'success' ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-[#b3131b]/20 text-[#b3131b] rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">✓</div>
          <h3 className="text-lg font-bold mb-2">¡Consulta enviada!</h3>
          <p className="text-sm text-gray-600 mb-6">Te responderemos a la brevedad a tu correo.</p>
          <button onClick={() => setStatus('idle')} className="bg-[#b3131b] text-black font-bold px-6 py-2 uppercase tracking-wide hover:bg-opacity-90 text-sm">
            Enviar otra consulta
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[11px] uppercase tracking-widest text-gray-600 mb-2 ">Nombre</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-white border border-gray-200 p-3 text-sm focus:border-[#b3131b] focus:outline-none text-gray-900 "
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-widest text-gray-600 mb-2 ">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-white border border-gray-200 p-3 text-sm focus:border-[#b3131b] focus:outline-none text-gray-900 "
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-widest text-gray-600 mb-2 ">Motivo de la consulta</label>
            <select
              value={formData.motivo}
              onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
              className="w-full bg-white border border-gray-200 p-3 text-sm focus:border-[#b3131b] focus:outline-none text-gray-900 "
            >
              {MOTIVOS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          {formData.motivo === 'compatibilidad' && (
            <div>
              <label className="block text-[11px] uppercase tracking-widest text-gray-600 mb-2 ">
                Número de Chasis (VIN) / Vehículo
              </label>
              <input
                type="text"
                placeholder="Ej: WP0ZZZ99ZKS123456"
                value={formData.vehicle}
                onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
                className="w-full bg-white border border-gray-200 p-3 text-sm focus:border-[#b3131b] focus:outline-none text-gray-900 "
              />
            </div>
          )}

          <div>
            <label className="block text-[11px] uppercase tracking-widest text-gray-600 mb-2 ">Mensaje</label>
            <textarea
              rows={5}
              required
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full bg-white border border-gray-200 p-3 text-sm focus:border-[#b3131b] focus:outline-none text-gray-900 "
            />
          </div>

          {status === 'error' && (
            <p className="text-xs text-red-500 ">Ocurrió un error enviando tu consulta. Intenta de nuevo.</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-[#b3131b] text-black font-bold px-8 py-3 uppercase tracking-wider hover:bg-opacity-90 text-xs disabled:opacity-50"
          >
            {loading ? 'ENVIANDO...' : 'ENVIAR CONSULTA'}
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
        setError(data.error || 'No pudimos encontrar tu pedido.');
        return;
      }
      setOrder(data);
    } catch {
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-gray-200 bg-gray-50 p-8">
      <p className="text-sm text-gray-600 mb-8  leading-relaxed">
        Ingresa tu número de orden (ej. ORD-123456) y el email con el que compraste para ver el estado de tu pedido.
      </p>

      <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <div>
          <label className="block text-[11px] uppercase tracking-widest text-gray-600 mb-2 ">Número de orden</label>
          <input
            type="text"
            required
            placeholder="ORD-123456"
            value={buyOrder}
            onChange={(e) => setBuyOrder(e.target.value)}
            className="w-full bg-white border border-gray-200 p-3 text-sm focus:border-[#b3131b] focus:outline-none text-gray-900 "
          />
        </div>
        <div>
          <label className="block text-[11px] uppercase tracking-widest text-gray-600 mb-2 ">Email de la compra</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white border border-gray-200 p-3 text-sm focus:border-[#b3131b] focus:outline-none text-gray-900 "
          />
        </div>
        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-[#b3131b] text-black font-bold px-8 py-3 uppercase tracking-wider hover:bg-opacity-90 text-xs disabled:opacity-50"
          >
            {loading ? 'BUSCANDO...' : 'BUSCAR PEDIDO'}
          </button>
        </div>
      </form>

      {error && <p className="text-xs text-red-500  mb-4">{error}</p>}

      {order && (
        <div className="border-t border-gray-200 pt-6  text-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-600">Orden</span>
            <span className="text-gray-900 font-bold">{order.buyOrder}</span>
          </div>
          <div className="flex items-center justify-between mb-6">
            <span className="text-gray-600">Fecha</span>
            <span className="text-gray-900">{new Date(order.createdAt).toLocaleDateString('es-CL')}</span>
          </div>

          {/* 🚨 AQUÍ EL ARREGLO: Permite "PAID" o "PAGADO" para mostrar la línea de tiempo */}
          {order.paymentStatus === 'PAID' || order.paymentStatus === 'PAGADO' ? (
            <div className="mb-8">
              <span className="text-gray-600 block mb-4">Estado del envío</span>
              <div className="flex items-center">
                {order.shippingStages.map((stage, idx) => {
                  const isDone = idx <= order.shippingStepIndex;
                  const isLast = idx === order.shippingStages.length - 1;
                  return (
                    <div key={stage.value} className="flex items-center flex-1 last:flex-none">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border ${
                            isDone ? 'bg-[#b3131b] border-[#b3131b] text-black' : 'bg-transparent border-gray-300 text-gray-500'
                          }`}
                        >
                          {isDone ? '✓' : idx + 1}
                        </div>
                        <span
                          className={`mt-2 text-[9px] uppercase tracking-widest text-center max-w-[80px] leading-tight ${
                            isDone ? 'text-gray-900' : 'text-gray-500'
                          }`}
                        >
                          {stage.label}
                        </span>
                      </div>
                      {!isLast && (
                        <div className={`flex-1 h-[2px] mx-2 mb-6 ${idx < order.shippingStepIndex ? 'bg-[#b3131b]' : 'bg-white/10'}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="mb-6">
              <span className="text-gray-600">Estado del pago</span>
              <div className="mt-2">
                <span
                  className={`inline-block px-3 py-1 text-[10px] uppercase tracking-widest font-bold ${
                    order.paymentStatus === 'REJECTED'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                      : 'bg-white/10 text-gray-700 border border-gray-300'
                  }`}
                >
                  {order.paymentStatusLabel}
                </span>
              </div>
            </div>
          )}

          <div className="border-t border-gray-200 pt-4 space-y-3">
            {order.items.map((item) => (
              <div key={item.sku} className="flex justify-between text-xs">
                <span className="text-gray-700">{item.name} × {item.quantity}</span>
                <span className="text-gray-500">{item.sku}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}