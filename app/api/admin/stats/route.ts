import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;

    if (!session || userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Buscar solo las órdenes que ya fueron pagadas exitosamente
    const paidOrders = await prisma.order.findMany({
      where: { status: 'PAGADO' },
      orderBy: { createdAt: 'asc' },
    });

    const ordersCount = paidOrders.length;
    const totalSales = paidOrders.reduce((acc, order) => acc + order.amount, 0);
    const averageTicket = ordersCount > 0 ? Math.round(totalSales / ordersCount) : 0;

    // Agrupar ventas por fecha para el gráfico de área (Recharts)
    const salesByDate: { [key: string]: number } = {};
    
    paidOrders.forEach((order) => {
      const dateStr = new Date(order.createdAt).toLocaleDateString('es-CL', {
        day: '2-digit',
        month: 'short',
      });
      salesByDate[dateStr] = (salesByDate[dateStr] || 0) + order.amount;
    });

    const chartData = Object.keys(salesByDate).map((date) => ({
      name: date,
      total: salesByDate[date],
    }));

    return NextResponse.json({
      totalSales,
      ordersCount,
      averageTicket,
      chartData,
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}