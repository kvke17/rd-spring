export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma'; // 🚨 LA CONEXIÓN A TURSO

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "ACCESO DENEGADO" }, { status: 401 });
  }

  try {
    // Traemos todos los pedidos PAGADOS de Turso
    const orders = await prisma.order.findMany({
      where: { status: 'PAGADO' }, // Solo contamos los exitosos
      orderBy: { createdAt: 'asc' }
    });

    const totalSales = orders.reduce((sum, order) => sum + order.amount, 0);
    const ordersCount = orders.length;
    const averageTicket = ordersCount > 0 ? totalSales / ordersCount : 0;

    const salesByDate: Record<string, number> = {};
    orders.forEach(order => {
      const date = new Date(order.createdAt).toLocaleDateString('es-CL', { month: 'short', day: 'numeric' });
      salesByDate[date] = (salesByDate[date] || 0) + order.amount;
    });

    const chartData = Object.keys(salesByDate).length > 0 
      ? Object.entries(salesByDate).map(([date, total]) => ({ name: date, total }))
      : [];

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