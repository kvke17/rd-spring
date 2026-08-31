'use client';

import { useState } from 'react';

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
  const [adminKey, setAdminKey] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [savingOrder, setSavingOrder] = useState<string | null>(null);

  const loadOrders = async (key: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/orders', { headers: { 'x-admin-key': key } });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'No se pudo autenticar.');
        setUnlocked(false);
        return;
      }
      setOrders(data.orders);
      setUnlocked(true);
    } catch {
      setError('Error de conexión.');
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    loadOrders(adminKey);
  };

  const handleStatusChange = async (buyOrder: string, newStatus: string) => {
    setSavingOrder(buyOrder);
    try {
      const res = await fetch(`/api/admin/orders/${buyOrder}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
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

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center pt-20">
        <form onSubmit={handleUnlock} className="border border-white/10 bg-[#121212] p-8 w-full max-w-sm">
          <p className="text-xs uppercase tracking-[0.25em] text-[#E88A5C] font-mono mb-2">ADMIN</p>
          <h1 className="text-xl font-bold uppercase tracking-tight mb-6">Panel de pedidos</h1>
          <label className="block text-[11px] uppercase tracking-widest text-gray-400 mb-2 font-mono">Clave de administrador</label>
          <input
            type="password"
            required
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            className="w-full bg-[#0a0a0a] border border-white/10 p-3 text-sm focus:border-[#E88A5C] focus:outline-none text-white font-mono mb-4"
          />
          {error && <p className="text-xs text-red-500 font-mono mb-4">{error}</p>}
          <button type="submit" disabled={loading} className="w-full bg-[#E88A5C] text-black font-bold py-3 uppercase tracking-wider text-xs disabled:opacity-50">
            {loading ? 'VERIFICANDO...' : 'ENTRAR'}
          </button>
        </form>
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
