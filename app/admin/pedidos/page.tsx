'use client';

import { useState, useEffect } from 'react';

// Agregamos el nuevo estado a la lista
const SHIPPING_STAGES = [
  { value: 'CONFIRMADO', label: 'Pedido confirmado' },
  { value: 'PREPARANDO', label: 'En preparación' },
  { value: 'LISTO_PARA_RETIRO', label: 'Listo para retiro' },
  { value: 'EN_CAMINO', label: 'En camino' },
  { value: 'ENTREGADO', label: 'Entregado' },
];

interface AdminOrder {
  buyOrder: string;
  amount: number;
  shippingStatus: string;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  itemsSummary: string;
}

// Función para renderizar el "globito" de color según el estado
const getStatusBadge = (status: string) => {
  switch (status) {
    case 'CONFIRMADO':
      return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 border border-yellow-200 rounded-full text-[10px] uppercase font-bold tracking-wider">Confirmado</span>;
    case 'PREPARANDO':
      return <span className="px-2 py-1 bg-orange-100 text-orange-800 border border-orange-200 rounded-full text-[10px] uppercase font-bold tracking-wider">Preparando</span>;
    case 'LISTO_PARA_RETIRO':
      return <span className="px-2 py-1 bg-cyan-100 text-cyan-800 border border-cyan-200 rounded-full text-[10px] uppercase font-bold tracking-wider animate-pulse shadow-sm">Listo para Retiro</span>;
    case 'EN_CAMINO':
      return <span className="px-2 py-1 bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-full text-[10px] uppercase font-bold tracking-wider">En camino</span>;
    case 'ENTREGADO':
      return <span className="px-2 py-1 bg-green-100 text-green-800 border border-green-200 rounded-full text-[10px] uppercase font-bold tracking-wider">Entregado</span>;
    default:
      return <span className="px-2 py-1 bg-gray-100 text-gray-800 border border-gray-200 rounded-full text-[10px] uppercase font-bold tracking-wider">{status}</span>;
  }
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingOrder, setSavingOrder] = useState<string | null>(null);
  const [emittingBoleta, setEmittingBoleta] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/orders');
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Error al obtener los pedidos.');
        return;
      }
      setOrders(data.orders);
    } catch {
      setError('Error de conexión.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (buyOrder: string, newStatus: string) => {
    setSavingOrder(buyOrder);
    try {
      const res = await fetch(`/api/admin/orders/${buyOrder}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shippingStatus: newStatus }),
      });
      if (!res.ok) throw new Error('fail');
      setOrders((prev) => prev.map((o) => (o.buyOrder === buyOrder ? { ...o, shippingStatus: newStatus } : o)));
    } catch {
      alert('No se pudo actualizar el estado. Intenta de nuevo.');
    } finally {
      setSavingOrder(null);
    }
  };

  const emitirBoletaManual = async (buyOrder: string) => {
    if (!confirm(`¿Deseas emitir la boleta electrónica para la orden #${buyOrder}?`)) return;

    setEmittingBoleta(buyOrder);
    try {
      const res = await fetch(`/api/admin/orders/${buyOrder}/boleta`, {
        method: 'POST',
      });
      const data = await res.json();

      if (res.ok) {
        alert(`✅ ${data.message}\n${data.pdf ? `PDF: ${data.pdf}` : ''}`);
      } else {
        alert(`❌ Error al emitir boleta: ${data.error}`);
      }
    } catch {
      alert('❌ Error de conexión al intentar emitir la boleta.');
    } finally {
      setEmittingBoleta(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-gray-900 flex items-center justify-center pt-20">
        <p className="text-xs uppercase tracking-widest text-[#b3131b] font-bold animate-pulse">
          Cargando pedidos...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white text-gray-900 flex items-center justify-center pt-20">
        <p className="text-xs uppercase tracking-widest text-red-500 font-bold">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 pt-28 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold uppercase tracking-tight mb-8">Pedidos pagados</h1>

        {orders.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-500 text-sm">No hay pedidos pagados todavía.</p>
          </div>
        ) : (
          <div className="border border-gray-200 divide-y divide-gray-200 rounded-lg overflow-hidden shadow-sm">
            {orders.map((o) => (
              <div key={o.buyOrder} className="p-6 grid grid-cols-1 md:grid-cols-5 gap-6 items-center bg-white hover:bg-gray-50 transition-colors">
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-gray-500 mb-1">
                    {new Date(o.createdAt).toLocaleDateString('es-CL')}
                  </p>
                  <p className="text-sm font-black text-gray-900">{o.buyOrder}</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{o.customerName}</p>
                  <p className="text-xs text-gray-500 mt-1">{o.customerEmail}</p>
                </div>
                <div className="md:col-span-1">
                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{o.itemsSummary}</p>
                </div>
                <div>
                  <p className="text-base font-black text-[#b3131b]">
                    {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(o.amount)}
                  </p>
                </div>
                <div className="flex flex-col gap-3 items-start md:items-end">
                  {/* Aquí se renderiza la etiqueta de color */}
                  {getStatusBadge(o.shippingStatus)}
                  
                  <select
                    value={o.shippingStatus}
                    disabled={savingOrder === o.buyOrder}
                    onChange={(e) => handleStatusChange(o.buyOrder, e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-md p-2 text-xs font-bold text-gray-900 focus:border-black focus:ring-1 focus:ring-black outline-none transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {SHIPPING_STAGES.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>

                  {/* Botón para emitir la boleta electrónica manualmente */}
                  <button
                    onClick={() => emitirBoletaManual(o.buyOrder)}
                    disabled={emittingBoleta === o.buyOrder}
                    className="w-full bg-[#b3131b] hover:bg-[#900f15] text-white rounded-md py-2 px-3 text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    {emittingBoleta === o.buyOrder ? (
                      'Emitiendo...'
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Emitir Boleta
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}