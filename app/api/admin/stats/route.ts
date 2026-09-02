import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "ACCESO DENEGADO" }, { status: 401 });
  }

  try {
    // Traemos todos los pedidos
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'asc' }
    });

    // Calculamos las métricas reales
    const totalSales = orders.reduce((sum, order) => sum + order.amount, 0);
    const ordersCount = orders.length;
    const averageTicket = ordersCount > 0 ? totalSales / ordersCount : 0;

    // Agrupamos las ventas por día para el gráfico
    const salesByDate: Record<string, number> = {};
    orders.forEach(order => {
      // Formateamos la fecha a algo corto como "1 Sep"
      const date = new Date(order.createdAt).toLocaleDateString('es-CL', { month: 'short', day: 'numeric' });
      salesByDate[date] = (salesByDate[date] || 0) + order.amount;
    });

    // Convertimos el objeto en el arreglo que Recharts necesita
    const chartData = Object.keys(salesByDate).length > 0 
      ? Object.entries(salesByDate).map(([date, total]) => ({ name: date, total }))
      : []; // Si no hay ventas, enviamos un arreglo vacío

    return NextResponse.json({
      totalSales,
      ordersCount,
      averageTicket,
      chartData
    });
  } catch (error) {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}