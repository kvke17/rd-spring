'use client';

import { useState, useEffect } from 'react';
import { STORE_CONFIG } from '@/config/constants';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { DollarSign, ShoppingBag, TrendingUp, ArrowUpRight } from 'lucide-react';

interface StatsData {
  totalSales: number;
  ordersCount: number;
  averageTicket: number;
  chartData: { name: string, total: number }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<StatsData>({
    totalSales: 0,
    ordersCount: 0,
    averageTicket: 0,
    chartData: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Error cargando estadísticas", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-72 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-[#b3131b] border-t-transparent rounded-full animate-spin" />
          <div className="text-xs uppercase tracking-widest text-[#b3131b] font-bold">
            Sincronizando métricas en vivo...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      
      {/* 3 Metric Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Ventas Totales */}
        <div className="bg-white border border-slate-200/80 p-7 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
              Ventas Totales
            </span>
            <div className="w-8 h-8 rounded-xl bg-red-50 text-[#b3131b] flex items-center justify-center border border-red-100">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {STORE_CONFIG.CURRENCY_FORMAT.format(stats.totalSales)}
          </p>
          <p className="text-[11px] text-slate-400 mt-2 font-medium">Facturación acumulada neta</p>
          {/* Subtle decorative glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#b3131b] opacity-[0.03] rounded-full blur-3xl -mr-10 -mt-10 transition-opacity group-hover:opacity-[0.07] pointer-events-none" />
        </div>

        {/* Card 2: Pedidos Pagados */}
        <div className="bg-white border border-slate-200/80 p-7 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
              Pedidos Pagados
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {stats.ordersCount}
          </p>
          <p className="text-[11px] text-slate-400 mt-2 font-medium">Transacciones procesadas</p>
        </div>

        {/* Card 3: Ticket Promedio */}
        <div className="bg-white border border-slate-200/80 p-7 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
              Ticket Promedio
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {STORE_CONFIG.CURRENCY_FORMAT.format(stats.averageTicket)}
          </p>
          <p className="text-[11px] text-slate-400 mt-2 font-medium">Por orden confirmada</p>
        </div>

      </div>

      {/* Modernized Recharts Section */}
      <div className="bg-white border border-slate-200/80 p-7 sm:p-8 rounded-2xl shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-8 pb-5 border-b border-slate-100">
          <div>
            <h3 className="text-xs uppercase tracking-widest text-slate-900 font-black">
              Flujo de Ingresos & Facturación
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Comportamiento cronológico de ventas confirmadas</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#b3131b]" />
            <span className="text-[11px] font-mono font-medium text-slate-600">Ingresos CLP</span>
          </div>
        </div>
        
        <div className="h-[380px] w-full">
          {stats.chartData.length === 0 ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-sm text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              <p className="font-bold text-slate-600">Sin datos registrados</p>
              <p className="text-xs mt-1">Aún no hay ventas suficientes para graficar el periodo.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotalCrimson" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#b3131b" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#b3131b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                
                {/* Cuadrícula sutil */}
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
                  tickFormatter={(value) => `$${value.toLocaleString('es-CL')}`}
                  dx={-10}
                />
                
                {/* Luxury Tooltip */}
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderColor: '#1e293b', 
                    borderRadius: '14px',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
                    padding: '12px 16px',
                    color: '#ffffff'
                  }}
                  itemStyle={{ color: '#f87171', fontWeight: 'bold' }}
                  formatter={(value: any) => [`$${Number(value).toLocaleString('es-CL')}`, 'Ingresos']}
                />
                
                <Area 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#b3131b" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#colorTotalCrimson)" 
                  activeDot={{ r: 5, fill: '#b3131b', stroke: '#ffffff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

    </div>
  );
}