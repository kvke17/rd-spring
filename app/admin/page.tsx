'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { STORE_CONFIG } from '@/config/constants';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  DollarSign, 
  ShoppingBag, 
  TrendingUp, 
  Package, 
  Clock, 
  CheckCircle2, 
  ArrowUpRight, 
  Plus, 
  Truck,
  Layers,
  ChevronRight,
  AlertCircle
} from 'lucide-react';

interface RecentOrder {
  id: string;
  buyOrder: string;
  amount: number;
  shippingStatus: string;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  itemsCount: number;
  itemsSummary: string;
}

interface DashboardStats {
  totalSales: number;
  ordersCount: number;
  averageTicket: number;
  pendingShippingCount: number;
  totalProducts: number;
  recentOrders: RecentOrder[];
  chartData: { name: string; total: number }[];
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalSales: 0,
    ordersCount: 0,
    averageTicket: 0,
    pendingShippingCount: 0,
    totalProducts: 0,
    recentOrders: [],
    chartData: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/admin/stats');
        if (!res.ok) {
          throw new Error('No se pudieron obtener las estadísticas de la base de datos');
        }
        const data = await res.json();
        setStats(data);
      } catch (err: any) {
        console.error('Error cargando métricas del dashboard:', err);
        setError(err.message || 'Error al conectar con la base de datos');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const getShippingBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMADO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200/80">
            <Clock className="w-3 h-3 text-amber-600" />
            Confirmado
          </span>
        );
      case 'PREPARANDO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-orange-50 text-orange-800 border border-orange-200/80">
            <Package className="w-3 h-3 text-orange-600" />
            Preparando
          </span>
        );
      case 'LISTO_PARA_RETIRO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-50 text-sky-800 border border-sky-200/80">
            <Truck className="w-3 h-3 text-sky-600" />
            Retiro
          </span>
        );
      case 'EN_CAMINO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-800 border border-blue-200/80">
            <Truck className="w-3 h-3 text-blue-600" />
            En Camino
          </span>
        );
      case 'ENTREGADO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200/80">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Entregado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[380px] gap-3">
        <div className="w-7 h-7 border-2 border-[var(--brand-crimson)] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs uppercase font-mono tracking-widest text-slate-500 font-bold">
          Cargando métricas operativas...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-800 max-w-xl mx-auto my-12 flex items-start gap-4">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold text-sm">Error al cargar métricas del servidor</h3>
          <p className="text-xs text-red-700 mt-1">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-3 px-3 py-1.5 bg-red-800 text-white rounded-lg text-xs font-semibold hover:bg-red-900 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      
      {/* 1. Header del Dashboard & Acciones Rápidas */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[var(--brand-crimson)] shadow-[0_0_6px_var(--brand-crimson)]" />
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--brand-crimson)] font-bold">
              ESTADO DEL SISTEMA EN VIVO
            </p>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-slate-900">
            Resumen Operativo
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Métricas de ventas, pedidos y catálogo en la base de datos de RD Spring
          </p>
        </div>

        {/* Acciones Rápidas */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/admin/productos/nuevo"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--brand-crimson)] hover:brightness-110 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-sm hover:shadow transition-all duration-150 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Producto</span>
          </Link>
          <Link
            href="/admin/pedidos"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-xs font-bold uppercase tracking-wider rounded-xl shadow-sm hover:shadow transition-all duration-150 active:scale-95"
          >
            <ShoppingBag className="w-4 h-4 text-slate-500" />
            <span>Ver Pedidos</span>
          </Link>
        </div>
      </div>

      {/* 2. Grid de 4 Métricas Clave */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Métrica 1: Facturación Total */}
        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 font-mono">
              Ventas Totales
            </span>
            <div className="w-8 h-8 rounded-xl bg-red-50 text-[var(--brand-crimson)] flex items-center justify-center border border-red-100">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {STORE_CONFIG.CURRENCY_FORMAT.format(stats.totalSales)}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-400 font-medium">
            <span>Ticket prom.: {STORE_CONFIG.CURRENCY_FORMAT.format(stats.averageTicket)}</span>
          </div>
        </div>

        {/* Métrica 2: Pedidos Pagados */}
        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 font-mono">
              Pedidos Pagados
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {stats.ordersCount}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-400 font-medium">
            <span>Transacciones Webpay</span>
          </div>
        </div>

        {/* Métrica 3: Pendientes de Despacho (con estado vacío claro) */}
        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 font-mono">
              Por Despachar
            </span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${
              stats.pendingShippingCount > 0 
                ? 'bg-amber-50 text-amber-700 border-amber-200' 
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {stats.pendingShippingCount}
          </p>
          <div className="mt-2">
            {stats.pendingShippingCount === 0 ? (
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Todos los pedidos al día
              </span>
            ) : (
              <span className="text-[11px] text-amber-700 font-semibold">
                Requieren preparación o despacho
              </span>
            )}
          </div>
        </div>

        {/* Métrica 4: Catálogo de Productos */}
        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 font-mono">
              Catálogo Activo
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {stats.totalProducts}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-400 font-medium">
            <span>Lubricantes & Repuestos</span>
          </div>
        </div>

      </div>

      {/* 3. Gráfico de Evolución de Ingresos */}
      <div className="bg-white border border-slate-200/80 p-6 sm:p-7 rounded-2xl shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-xs uppercase tracking-widest text-slate-900 font-black font-mono">
              Flujo Cronológico de Facturación
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Registro acumulado de transacciones pagadas (CLP)
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--brand-crimson)]" />
            <span>Ingresos confirmados</span>
          </div>
        </div>
        
        <div className="h-[280px] w-full">
          {stats.chartData.length === 0 ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-sm text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
              <p className="font-bold text-slate-600">Sin datos de facturación</p>
              <p className="text-xs mt-1">Los ingresos aparecerán automáticamente al confirmar compras.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="dashboardAreaCrimson" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#b3131b" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#b3131b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#94a3b8" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false}
                  dy={10}
                />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(val) => `$${Number(val).toLocaleString('es-CL')}`}
                  dx={-10}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderColor: '#1e293b', 
                    borderRadius: '12px',
                    padding: '10px 14px',
                    color: '#ffffff'
                  }}
                  itemStyle={{ color: '#f87171', fontWeight: 'bold' }}
                  formatter={(val: any) => [`$${Number(val).toLocaleString('es-CL')}`, 'Ingresos']}
                />
                <Area 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#b3131b" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#dashboardAreaCrimson)" 
                  activeDot={{ r: 5, fill: '#b3131b', stroke: '#ffffff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 4. Split Operacional: Pedidos Recientes (2/3) + Catálogo & Accesos Rápidos (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Columna Izquierda: Pedidos Recientes */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-xs uppercase font-mono font-bold tracking-widest text-slate-900">
                Últimos Pedidos Confirmados
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Órdenes recibidas y pagadas en la tienda</p>
            </div>
            <Link 
              href="/admin/pedidos"
              className="text-xs font-bold text-[var(--brand-crimson)] hover:underline inline-flex items-center gap-1"
            >
              <span>Ver todos</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex-1 overflow-x-auto">
            {stats.recentOrders.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="font-semibold text-slate-600 text-sm">No hay pedidos registrados</p>
                <p className="text-xs mt-1">Los pedidos pagados aparecerán aquí en tiempo real.</p>
              </div>
            ) : (
              <>
                {/* Vista Móvil: Tarjetas compactas sin desborde (< sm) */}
                <div className="block sm:hidden divide-y divide-slate-100">
                  {stats.recentOrders.map((order) => (
                    <div key={order.id} className="p-4 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-xs text-slate-900">
                          {order.buyOrder}
                        </span>
                        {getShippingBadge(order.shippingStatus)}
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <div className="min-w-0 pr-2">
                          <p className="font-semibold text-slate-900 truncate">{order.customerName}</p>
                          <p className="text-[11px] text-slate-400 font-mono">
                            {new Date(order.createdAt).toLocaleDateString('es-CL', {
                              day: '2-digit',
                              month: 'short',
                            })}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-mono font-bold text-slate-900">
                            {STORE_CONFIG.CURRENCY_FORMAT.format(order.amount)}
                          </p>
                          <Link
                            href="/admin/pedidos"
                            className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-[var(--brand-crimson)] hover:underline mt-1"
                          >
                            <span>Detalle</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Vista Desktop / Tablet: Tabla estructurada (>= sm) */}
                <table className="hidden sm:table w-full text-left text-xs">
                  <thead className="bg-slate-50/80 text-slate-500 uppercase text-[10px] font-mono font-bold tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="px-5 py-3">Orden</th>
                      <th className="px-5 py-3">Cliente</th>
                      <th className="px-5 py-3">Monto</th>
                      <th className="px-5 py-3">Estado</th>
                      <th className="px-5 py-3 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {stats.recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-3.5 font-mono font-bold text-slate-900">
                          {order.buyOrder}
                          <div className="text-[10px] font-sans text-slate-400 font-normal">
                            {new Date(order.createdAt).toLocaleDateString('es-CL', {
                              day: '2-digit',
                              month: 'short',
                            })}
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="font-semibold text-slate-900 truncate max-w-[150px]">
                            {order.customerName}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate max-w-[150px]">
                            {order.customerEmail}
                          </div>
                        </td>
                        <td className="px-5 py-3.5 font-mono font-bold text-slate-900 whitespace-nowrap">
                          {STORE_CONFIG.CURRENCY_FORMAT.format(order.amount)}
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          {getShippingBadge(order.shippingStatus)}
                        </td>
                        <td className="px-5 py-3.5 text-right whitespace-nowrap">
                          <Link
                            href="/admin/pedidos"
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                          >
                            <span>Detalle</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        </div>

        {/* Columna Derecha: Catálogo & Accesos Directos */}
        <div className="space-y-6">
          {/* Bloque de Catálogo */}
          <div className="bg-white border border-slate-200/80 p-5 sm:p-6 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[var(--brand-crimson)]" />
                <h3 className="text-xs uppercase font-mono font-bold tracking-widest text-slate-900">
                  Inventario Activo
                </h3>
              </div>
              <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                {stats.totalProducts} total
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <p className="text-xs font-bold text-slate-900">Lubricantes</p>
                  <p className="text-[11px] text-slate-400">Aceites sintéticos y fluidos de motor</p>
                </div>
                <span className="text-xs font-mono font-bold text-slate-700">
                  32 ítems
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100">
              <Link
                href="/admin/productos"
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <span>Administrar Productos</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Acciones del Administrador */}
          <div className="bg-white border border-slate-200/80 p-5 sm:p-6 rounded-2xl shadow-sm">
            <h3 className="text-xs uppercase font-mono font-bold tracking-widest text-slate-900 mb-3">
              Accesos Rápidos
            </h3>
            
            <div className="space-y-2">
              <Link
                href="/admin/productos/nuevo"
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors text-xs font-semibold text-slate-800 group"
              >
                <span className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-red-50 text-[var(--brand-crimson)] flex items-center justify-center">
                    <Plus className="w-3.5 h-3.5" />
                  </div>
                  Crear Nuevo Producto
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700" />
              </Link>

              <Link
                href="/admin/pedidos"
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors text-xs font-semibold text-slate-800 group"
              >
                <span className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                    <Truck className="w-3.5 h-3.5" />
                  </div>
                  Actualizar Estados de Envío
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700" />
              </Link>

              <Link
                href="/"
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors text-xs font-semibold text-slate-800 group"
              >
                <span className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                  Ir a la Tienda Pública
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700" />
              </Link>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}