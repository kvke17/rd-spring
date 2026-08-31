import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const adminKey = request.headers.get('x-admin-key');

  if (!process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'ADMIN_SECRET no configurado en el servidor.' }, { status: 500 });
  }

  if (adminKey !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Clave de administrador incorrecta.' }, { status: 401 });
  }

  try {
    const orders = await prisma.order.findMany({
      where: { status: 'PAID' },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const parsed = orders.map((o) => {
      const customer = JSON.parse(o.customer);
      const items = JSON.parse(o.items) as { product: { name: string }; quantity: number }[];
      return {
        buyOrder: o.buyOrder,
        amount: o.amount,
        shippingStatus: o.shippingStatus,
        createdAt: o.createdAt,
        customerName: customer.fullName || '—',
        customerEmail: customer.email || '—',
        itemsSummary: items.map((i) => `${i.product.name} ×${i.quantity}`).join(', '),
      };
    });

    return NextResponse.json({ orders: parsed });
  } catch (error) {
    console.error('Error listando pedidos:', error);
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 });
  }
}
