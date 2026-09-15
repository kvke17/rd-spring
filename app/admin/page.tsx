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
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-xs uppercase tracking-widest text-[#FF0000] font-bold animate-pulse">
          Cargando métricas...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      
      {/* Grid de Tarjetas de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Tarjeta 1: Ventas Totales */}
        <div className="bg-white border border-gray-100 p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-2 font-bold">Ventas Totales</p>
          <p className="text-3xl sm:text-4xl font-black text-gray-900 mb-2 tracking-tight">
            {STORE_CONFIG.CURRENCY_FORMAT.format(stats.totalSales)}
          </p>
          {/* Brillo sutil de fondo */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF0000] opacity-[0.03] rounded-full blur-3xl -mr-10 -mt-10 transition-opacity group-hover:opacity-[0.06]" />
        </div>

        {/* Tarjeta 2: Pedidos Pagados */}
        <div className="bg-white border border-gray-100 p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-2 font-bold">Pedidos Pagados</p>
          <p className="text-3xl sm:text-4xl font-black text-gray-900 mb-2 tracking-tight">
            {stats.ordersCount}
          </p>
        </div>

        {/* Tarjeta 3: Ticket Promedio */}
        <div className="bg-white border border-gray-100 p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-2 font-bold">Ticket Promedio</p>
          <p className="text-3xl sm:text-4xl font-black text-gray-900 mb-2 tracking-tight">
            {STORE_CONFIG.CURRENCY_FORMAT.format(stats.averageTicket)}
          </p>
        </div>

      </div>

      {/* Sección del Gráfico */}
      <div className="bg-white border border-gray-100 p-8 rounded-xl shadow-sm">
        <h3 className="text-xs uppercase tracking-widest text-black mb-8 font-bold border-b border-gray-100 pb-4">
          Flujo de Ingresos
        </h3>
        
        <div className="h-[400px] w-full">
          {stats.chartData.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center text-sm text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
              Aún no hay ventas suficientes para graficar.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF0000" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#FF0000" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                
                {/* Cuadrícula limpia y sutil */}
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                
                <XAxis 
                  dataKey="name" 
                  stroke="#9ca3af" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false}
                  dy={10}
                />
                
                <YAxis 
                  stroke="#9ca3af" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(value) => `$${value.toLocaleString('es-CL')}`}
                  dx={-10}
                />
                
                {/* Tooltip claro y moderno */}
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    borderColor: '#f3f4f6', 
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    padding: '12px'
                  }}
                  itemStyle={{ color: '#FF0000', fontWeight: 'bold' }}
                  labelStyle={{ color: '#4b5563', marginBottom: '4px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                  formatter={(value: any) => [`$${Number(value).toLocaleString('es-CL')}`, 'Ingresos']}
                />
                
                <Area 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#FF0000" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorTotal)" 
                  activeDot={{ r: 6, fill: '#FF0000', stroke: '#ffffff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}