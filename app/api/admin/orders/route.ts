import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      // Quitamos el include porque items se guarda como un string JSON en la tabla
    });

    const formattedOrders = orders.map((order: any) => {
      let customerData: any = {};
      try {
        customerData = typeof order.customer === 'string' ? JSON.parse(order.customer) : (order.customer || {});
      } catch {
        customerData = {};
      }

      let shippingData: any = {};
      try {
        shippingData = typeof order.shippingInfo === 'string' ? JSON.parse(order.shippingInfo) : (order.shippingInfo || {});
      } catch {
        shippingData = {};
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
        documentType: order.documentType,
        items: itemsData,
        itemsSummary: itemsData.map((i: any) => `${i.quantity}x ${i.product?.name || i.name || i.productId}`).join(', '),
        customerName: customerData.fullName || 'Sin nombre',
        customerEmail: customerData.email || 'Sin email',
        rut: customerData.rut || 'No registrado',
        phone: customerData.phone || 'No registrado',
        customer: customerData,
        shippingInfo: shippingData,
      };
    });

    return NextResponse.json({ orders: formattedOrders }, { status: 200 });
  } catch (error) {
    console.error('Error al cargar órdenes:', error);
    return NextResponse.json({ error: 'Error al obtener los pedidos' }, { status: 500 });
  }
}