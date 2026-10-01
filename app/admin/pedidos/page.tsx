'use client';

import { useState, useEffect } from 'react';
import { STORE_CONFIG } from '@/config/constants';
import { ChevronDown, ChevronUp, Package, Truck, UserCheck, Clock, CheckCircle } from 'lucide-react';

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
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200/70 rounded-full text-[10px] uppercase font-bold tracking-wider">
          <Clock className="w-3 h-3 text-amber-600" />
          Confirmado
        </span>
      );
    case 'PREPARANDO':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-orange-800 border border-orange-200/70 rounded-full text-[10px] uppercase font-bold tracking-wider">
          <Package className="w-3 h-3 text-orange-600" />
          Preparando
        </span>
      );
    case 'LISTO_PARA_RETIRO':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-50 text-sky-800 border border-sky-200/70 rounded-full text-[10px] uppercase font-bold tracking-wider shadow-sm">
          <UserCheck className="w-3 h-3 text-sky-600" />
          Listo para Retiro
        </span>
      );
    case 'EN_CAMINO':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-800 border border-indigo-200/70 rounded-full text-[10px] uppercase font-bold tracking-wider">
          <Truck className="w-3 h-3 text-indigo-600" />
          En camino
        </span>
      );
    case 'ENTREGADO':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200/70 rounded-full text-[10px] uppercase font-bold tracking-wider">
          <CheckCircle className="w-3 h-3 text-emerald-600" />
          Entregado
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-800 border border-slate-200 rounded-full text-[10px] uppercase font-bold tracking-wider">
          {status}
        </span>
      );
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
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-[var(--brand-crimson)] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs uppercase tracking-widest text-[var(--brand-crimson)] font-bold">
            Cargando historial de pedidos...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-red-50 border border-red-200 rounded-2xl text-center">
        <p className="text-xs uppercase tracking-widest text-red-600 font-bold">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold uppercase tracking-tight text-slate-900">
            Historial de Órdenes & Despachos
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Control logístico y seguimiento de pedidos por cliente</p>
        </div>
        <span className="text-xs font-mono font-bold text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-sm">
          {orders.length} pedidos
        </span>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center shadow-sm">
          <p className="text-slate-500 text-sm font-medium">No hay pedidos pagados todavía.</p>
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
              <div 
                key={o.buyOrder} 
                className="border border-slate-200/80 bg-white rounded-2xl shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 overflow-hidden p-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                  <div>
                    <p className="text-[10px] uppercase font-mono tracking-wider text-slate-400 mb-1">
                      {new Date(o.createdAt).toLocaleDateString('es-CL')} · {new Date(o.createdAt).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-base font-black text-slate-900 tracking-tight">Orden #{o.buyOrder}</p>
                    <div className="mt-2">
                      <span className={`inline-block px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-md ${
                        isFactura ? 'bg-red-50 text-[var(--brand-crimson)] border border-red-200' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {o.documentType || 'BOLETA'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Comprador</p>
                    <p className="text-sm font-bold text-slate-900">{o.customerName}</p>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">{o.customerEmail}</p>
                  </div>

                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Total Pagado</p>
                    <p className="text-lg font-black text-[var(--brand-crimson)]">
                      {STORE_CONFIG.CURRENCY_FORMAT.format(o.amount)}
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 items-start md:items-end">
                    {getStatusBadge(o.shippingStatus)}
                    <select
                      value={o.shippingStatus}
                      disabled={savingOrder === o.buyOrder}
                      onChange={(e) => handleStatusChange(o.buyOrder, e.target.value)}
                      className="w-full md:w-auto bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:border-[var(--brand-crimson)] focus:ring-1 focus:ring-[var(--brand-crimson)] outline-none transition-all disabled:opacity-50 cursor-pointer shadow-sm"
                    >
                      {SHIPPING_STAGES.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap justify-between items-center gap-2">
                  <button
                    onClick={() => toggleExpand(o.buyOrder)}
                    className="text-xs font-bold uppercase tracking-wider bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 cursor-pointer active:scale-95"
                  >
                    {isExpanded ? (
                      <>
                        <span>Ocultar Detalle</span>
                        <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                      </>
                    ) : (
                      <>
                        <span>Ver Detalle Completo</span>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                      </>
                    )}
                  </button>
                  <span className="text-xs text-slate-500 font-mono">
                    RUT: <strong className="text-slate-800 font-sans">{clientRut}</strong>
                  </span>
                </div>

                {isExpanded && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 pt-5 bg-slate-50/80 p-5 sm:p-6 rounded-2xl border border-slate-200/80 animate-in fade-in duration-200">
                    <div>
                      <h3 className="text-xs uppercase tracking-widest font-bold text-slate-500 mb-3 flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5 text-[var(--brand-crimson)]" />
                        Productos Adquiridos
                      </h3>
                      {o.items && o.items.length > 0 ? (
                        <div className="space-y-2 bg-white p-4 border border-slate-200/80 rounded-xl shadow-sm">
                          {o.items.map((item, idx) => (
                            <div key={item.id || `${o.buyOrder}-${item.productId}-${idx}`} className="flex justify-between items-center text-xs pb-2 border-b border-slate-100 last:border-0 last:pb-0">
                              <div>
                                <p className="font-bold text-slate-900">{item.name || item.productId}</p>
                                <p className="text-slate-500 text-[11px]">Cantidad: {item.quantity}</p>
                              </div>
                              <span className="font-bold text-slate-900">
                                {STORE_CONFIG.CURRENCY_FORMAT.format(item.price * item.quantity)}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-600 bg-white p-3 border border-slate-200/80 rounded-xl shadow-sm">{o.itemsSummary}</p>
                      )}
                    </div>

                    <div>
                      <h3 className="text-xs uppercase tracking-widest font-bold text-slate-500 mb-3 flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-[var(--brand-crimson)]" />
                        Información de Contacto y Entrega
                      </h3>
                      <div className="bg-white p-4 border border-slate-200/80 rounded-xl shadow-sm text-xs space-y-2 text-slate-700">
                        <p><strong className="text-slate-900">RUT Cliente:</strong> {clientRut}</p>
                        <p><strong className="text-slate-900">Teléfono:</strong> {clientPhone}</p>
                        <p><strong className="text-slate-900">Método de Entrega:</strong> {(shipping as any).label || (shipping as any).sucursalOficina || 'Despacho a domicilio'}</p>
                        <p><strong className="text-slate-900">Dirección:</strong> {clientAddress}</p>
                        <p><strong className="text-slate-900">Comuna / Región:</strong> {clientComuna ? `${clientComuna}, ${clientRegion}` : 'N/A'}</p>
                        
                        {isFactura && (
                          <div className="mt-3 pt-3 border-t border-red-100 bg-red-50/60 p-3 rounded-lg text-slate-800">
                            <p className="font-bold text-[var(--brand-crimson)] uppercase text-[10px] tracking-wider mb-1.5">Datos Factura (SII):</p>
                            <p className="text-[11px]"><strong className="text-slate-900">RUT Empresa:</strong> {cust.rutFactura || 'No especificado'}</p>
                            <p className="text-[11px]"><strong className="text-slate-900">Razón Social:</strong> {cust.razonSocial || 'No especificado'}</p>
                            <p className="text-[11px]"><strong className="text-slate-900">Giro:</strong> {cust.giro || 'No especificado'}</p>
                            <p className="text-[11px]"><strong className="text-slate-900">Dirección Tributaria:</strong> {cust.direccionFactura || 'No especificado'} ({cust.comunaFactura || ''}, {cust.regionFactura || ''})</p>
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
  );
}