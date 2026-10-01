import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic'; // Evita que Next.js congele los datos

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;

    if (!session || userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // 1. Buscar todas las órdenes pagadas exitosamente ('PAID' o 'PAGADO')
    const paidOrders = await prisma.order.findMany({
      where: { status: { in: ['PAID', 'PAGADO'] } },
      orderBy: { createdAt: 'desc' },
    });

    const ordersCount = paidOrders.length;
    const totalSales = paidOrders.reduce((acc, order) => acc + order.amount, 0);
    const averageTicket = ordersCount > 0 ? Math.round(totalSales / ordersCount) : 0;

    // 2. Conteo de pedidos pendientes de entrega física (CONFIRMADO, PREPARANDO)
    const pendingShippingCount = paidOrders.filter((o) =>
      ['CONFIRMADO', 'PREPARANDO', 'LISTO_PARA_RETIRO'].includes(o.shippingStatus)
    ).length;

    // 3. Conteo total de productos en catálogo
    const totalProducts = await prisma.product.count();

    // 4. Últimos pedidos para el resumen rápido del dashboard
    const recentOrders = paidOrders.slice(0, 5).map((order) => {
      let customerData: any = {};
      try {
        customerData = typeof order.customer === 'string' ? JSON.parse(order.customer) : (order.customer || {});
      } catch {
        customerData = {};
      }

      let itemsData: any[] = [];
      try {
        itemsData = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []);
      } catch {
        itemsData = [];
      }

      return {
        id: order.id,
        buyOrder: order.buyOrder,
        amount: order.amount,
        shippingStatus: order.shippingStatus,
        createdAt: order.createdAt,
        customerName: customerData.fullName || 'Cliente sin nombre',
        customerEmail: customerData.email || 'Sin email',
        itemsCount: itemsData.reduce((sum, item) => sum + (item.quantity || 1), 0),
        itemsSummary: itemsData.map((i: any) => `${i.quantity}x ${i.product?.name || i.name || i.productId}`).join(', '),
      };
    });

    // 5. Agrupar ventas por fecha cronológica para el gráfico de área (Recharts)
    const chronologicalOrders = [...paidOrders].reverse();
    const salesByDate: { [key: string]: number } = {};
    
    chronologicalOrders.forEach((order) => {
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
      pendingShippingCount,
      totalProducts,
      recentOrders,
      chartData,
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}