'use client';

import { useState, useEffect } from 'react';

const SHIPPING_STAGES = [
  { value: 'CONFIRMADO', label: 'Pedido confirmado' },
  { value: 'PREPARANDO', label: 'En preparación' },
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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingOrder, setSavingOrder] = useState<string | null>(null);

  // Cargamos los pedidos automáticamente apenas el Administrador entra a la página
  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    setError('');
    try {
      // Ya no enviamos el header secreto 'x-admin-key'. 
      // NextAuth envía las cookies de sesión automáticamente por debajo.
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center pt-20">
        <p className="text-xs uppercase tracking-widest font-mono text-[#E88A5C] animate-pulse">
          Cargando pedidos...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center pt-20">
        <p className="text-xs uppercase tracking-widest font-mono text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-28 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold uppercase tracking-tight mb-8">Pedidos pagados</h1>

        {orders.length === 0 ? (
          <p className="text-gray-400 font-mono text-sm">No hay pedidos pagados todavía.</p>
        ) : (
          <div className="border border-white/10 divide-y divide-white/10">
            {orders.map((o) => (
              <div key={o.buyOrder} className="p-6 grid grid-cols-1 md:grid-cols-5 gap-4 items-center bg-[#121212]">
                <div>
                  <p className="text-xs font-mono text-gray-500">{new Date(o.createdAt).toLocaleDateString('es-CL')}</p>
                  <p className="text-sm font-bold text-white font-mono">{o.buyOrder}</p>
                </div>
                <div>
                  <p className="text-sm text-white">{o.customerName}</p>
                  <p className="text-xs text-gray-500 font-mono">{o.customerEmail}</p>
                </div>
                <div className="md:col-span-1">
                  <p className="text-xs text-gray-400 font-mono line-clamp-2">{o.itemsSummary}</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-[#E88A5C] font-mono">
                    {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(o.amount)}
                  </p>
                </div>
                <div>
                  <select
                    value={o.shippingStatus}
                    disabled={savingOrder === o.buyOrder}
                    onChange={(e) => handleStatusChange(o.buyOrder, e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-white/10 p-2 text-xs focus:border-[#E88A5C] focus:outline-none text-white font-mono disabled:opacity-50"
                  >
                    {SHIPPING_STAGES.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}