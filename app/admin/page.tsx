'use client';
import { useState, useEffect } from 'react';
import { STORE_CONFIG } from '@/config/constants';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

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
        console.error("Error cargando estadísticas");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="text-xs font-mono text-[#FF0000] animate-pulse">Cargando métricas...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Grid de Tarjetas de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="bg-[#121212] border border-white/10 p-6 rounded-lg relative overflow-hidden group hover:border-white/20 transition-colors">
          <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-2">Ventas Totales</p>
          <p className="text-3xl font-bold text-white mb-2">
            {STORE_CONFIG.CURRENCY_FORMAT.format(stats.totalSales)}
          </p>
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#FF0000] opacity-5 rounded-full blur-2xl -mr-10 -mt-10 transition-opacity" />
        </div>

        <div className="bg-[#121212] border border-white/10 p-6 rounded-lg hover:border-white/20 transition-colors">
          <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-2">Pedidos Pagados</p>
          <p className="text-3xl font-bold text-white mb-2">{stats.ordersCount}</p>
        </div>

        <div className="bg-[#121212] border border-white/10 p-6 rounded-lg hover:border-white/20 transition-colors">
          <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-2">Ticket Promedio</p>
          <p className="text-3xl font-bold text-white mb-2">
            {STORE_CONFIG.CURRENCY_FORMAT.format(stats.averageTicket)}
          </p>
        </div>
      </div>

      {/* Sección del Gráfico */}
      <div className="bg-[#121212] border border-white/10 p-6 rounded-lg">
        <h3 className="text-xs font-mono uppercase tracking-widest text-gray-400 mb-6">
          Flujo de Ingresos
        </h3>
        <div className="h-80 w-full">
          {stats.chartData.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center text-xs font-mono text-gray-600">
              Aún no hay ventas para graficar.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF0000" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#FF0000" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#666" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#666" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(value) => `$${value.toLocaleString('es-CL')}`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#121212', borderColor: '#333', borderRadius: '8px' }}
                  itemStyle={{ color: '#FF0000' }}
                  formatter={(value: any) => [`$${Number(value).toLocaleString('es-CL')}`, 'Ventas']}
                />
                <Area 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#FF0000" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorTotal)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}