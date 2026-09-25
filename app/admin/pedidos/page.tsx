'use client';

import { useState, useEffect } from 'react';
import { STORE_CONFIG } from '@/config/constants';

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
  rut?: string;
  phone?: string;
  itemsSummary: string;
  documentType?: string;
  items?: Array<{
    id: string;
    name?: string;
    productId: string;
    quantity: number;
    price: number;
  }>;
  customer?: any;
  shippingInfo?: any;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'CONFIRMADO':
      return <span className="px-2.5 py-1 bg-yellow-100 text-yellow-800 border border-yellow-200 rounded-full text-[10px] uppercase font-bold tracking-wider">Confirmado</span>;
    case 'PREPARANDO':
      return <span className="px-2.5 py-1 bg-orange-100 text-orange-800 border border-orange-200 rounded-full text-[10px] uppercase font-bold tracking-wider">Preparando</span>;
    case 'LISTO_PARA_RETIRO':
      return <span className="px-2.5 py-1 bg-cyan-100 text-cyan-800 border border-cyan-200 rounded-full text-[10px] uppercase font-bold tracking-wider animate-pulse shadow-sm">Listo para Retiro</span>;
    case 'EN_CAMINO':
      return <span className="px-2.5 py-1 bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-full text-[10px] uppercase font-bold tracking-wider">En camino</span>;
    case 'ENTREGADO':
      return <span className="px-2.5 py-1 bg-green-100 text-green-800 border border-green-200 rounded-full text-[10px] uppercase font-bold tracking-wider">Entregado</span>;
    default:
      return <span className="px-2.5 py-1 bg-gray-100 text-gray-800 border border-gray-200 rounded-full text-[10px] uppercase font-bold tracking-wider">{status}</span>;
  }
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingOrder, setSavingOrder] = useState<string | null>(null);
  const [expandedOrders, setExpandedOrders] = useState<string[]>([]);

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

  const toggleExpand = (buyOrder: string) => {
    setExpandedOrders(prev => 
      prev.includes(buyOrder) ? prev.filter(id => id !== buyOrder) : [...prev, buyOrder]
    );
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
    <div className="min-h-screen bg-white text-gray-900 pt-28 pb-20 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold uppercase tracking-tight mb-8">Panel de Pedidos</h1>

        {orders.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-500 text-sm">No hay pedidos pagados todavía.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((o) => {
              const isFactura = o.documentType === 'FACTURA';
              const isExpanded = expandedOrders.includes(o.buyOrder);

              let cust = o.customer || {};
              let shipping = {};
              try {
                shipping = typeof o.shippingInfo === 'string' ? JSON.parse(o.shippingInfo) : (o.shippingInfo || {});
              } catch {
                shipping = {};
              }

              const clientRut = o.rut || cust.rut || 'No registrado';
              const clientPhone = o.phone || cust.phone || 'No registrado';
              const clientAddress = cust.address || 'No registrada';
              const clientComuna = cust.comuna || '';
              const clientRegion = cust.region || '';

              return (
                <div key={o.buyOrder} className="border border-gray-200 bg-white rounded-lg shadow-sm overflow-hidden p-6 hover:border-gray-300 transition-colors">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                    <div>
                      <p className="text-[11px] uppercase tracking-widest text-gray-500 mb-1">
                        {new Date(o.createdAt).toLocaleDateString('es-CL')} - {new Date(o.createdAt).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-sm font-black text-gray-900">Orden #{o.buyOrder}</p>
                      <div className="mt-2">
                        <span className={`inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${isFactura ? 'bg-red-100 text-[#b3131b] border border-red-200' : 'bg-gray-100 text-gray-800'}`}>
                          {o.documentType || 'BOLETA'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Comprador</p>
                      <p className="text-sm font-bold text-gray-900">{o.customerName}</p>
                      <p className="text-xs text-gray-500">{o.customerEmail}</p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Total Pagado</p>
                      <p className="text-base font-black text-[#b3131b]">
                        {STORE_CONFIG.CURRENCY_FORMAT.format(o.amount)}
                      </p>
                    </div>

                    <div className="flex flex-col gap-3 items-start md:items-end">
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
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                    <button
                      onClick={() => toggleExpand(o.buyOrder)}
                      className="text-xs font-bold uppercase tracking-widest bg-gray-100 hover:bg-gray-200 text-gray-900 px-4 py-2 rounded transition flex items-center gap-2 cursor-pointer"
                    >
                      {isExpanded ? 'Ocultar Detalle ▲' : 'Ver Detalle Completo ▼'}
                    </button>
                    <span className="text-xs text-gray-500">RUT: <strong className="text-gray-800">{clientRut}</strong></span>
                  </div>

                  {isExpanded && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 pt-6 bg-gray-50 p-6 rounded-md border border-gray-200 animate-in fade-in duration-200">
                      <div>
                        <h3 className="text-xs uppercase tracking-widest font-bold text-gray-500 mb-3">Productos Adquiridos</h3>
                        {o.items && o.items.length > 0 ? (
                          <div className="space-y-2 bg-white p-4 border border-gray-200 rounded">
                            {o.items.map((item, idx) => (
                              <div key={item.id || `${o.buyOrder}-${item.productId}-${idx}`} className="flex justify-between items-center text-xs pb-2 border-b border-gray-100 last:border-0 last:pb-0">
                                <div>
                                  <p className="font-bold text-gray-900">{item.name || item.productId}</p>
                                  <p className="text-gray-500">Cantidad: {item.quantity}</p>
                                </div>
                                <span className="font-bold text-gray-900">
                                  {STORE_CONFIG.CURRENCY_FORMAT.format(item.price * item.quantity)}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-600 bg-white p-3 border border-gray-200 rounded">{o.itemsSummary}</p>
                        )}
                      </div>

                      <div>
                        <h3 className="text-xs uppercase tracking-widest font-bold text-gray-500 mb-3">Información de Contacto y Entrega</h3>
                        <div className="bg-white p-4 border border-gray-200 rounded text-xs space-y-2">
                          <p><strong>RUT Cliente:</strong> {clientRut}</p>
                          <p><strong>Teléfono:</strong> {clientPhone}</p>
                          <p><strong>Método de Entrega:</strong> {(shipping as any).label || (shipping as any).sucursalOficina || 'Despacho a domicilio'}</p>
                          <p><strong>Dirección:</strong> {clientAddress}</p>
                          <p><strong>Comuna / Región:</strong> {clientComuna ? `${clientComuna}, ${clientRegion}` : 'N/A'}</p>
                          
                          {isFactura && (
                            <div className="mt-3 pt-3 border-t border-red-100 bg-red-50/50 p-2.5 rounded text-gray-800">
                              <p className="font-bold text-[#b3131b] uppercase mb-1">Datos Factura (SII):</p>
                              <p><strong>RUT Empresa:</strong> {cust.rutFactura || 'No especificado'}</p>
                              <p><strong>Razón Social:</strong> {cust.razonSocial || 'No especificado'}</p>
                              <p><strong>Giro:</strong> {cust.giro || 'No especificado'}</p>
                              <p><strong>Dirección Tributaria:</strong> {cust.direccionFactura || 'No especificado'} ({cust.comunaFactura || ''}, {cust.regionFactura || ''})</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}