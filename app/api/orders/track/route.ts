import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente de pago',
  PAID: 'Pagado',
  REJECTED: 'Pago rechazado',
};

// Orden de las etapas de envío. El índice se usa para dibujar la barra de progreso.
export const SHIPPING_STAGES = [
  { value: 'CONFIRMADO', label: 'Pedido confirmado' },
  { value: 'PREPARANDO', label: 'En preparación' },
  { value: 'EN_CAMINO', label: 'En camino' },
  { value: 'ENTREGADO', label: 'Entregado' },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const buyOrder = searchParams.get('buyOrder')?.trim();
  const email = searchParams.get('email')?.trim().toLowerCase();

  if (!buyOrder || !email) {
    return NextResponse.json({ error: 'Debes indicar el número de orden y el email.' }, { status: 400 });
  }

  try {
    const order = await prisma.order.findUnique({ where: { buyOrder } });

    if (!order) {
      return NextResponse.json({ error: 'No encontramos un pedido con ese número de orden.' }, { status: 404 });
    }

    const customer = JSON.parse(order.customer);

    // Verificación simple: el email debe coincidir con el usado en la compra.
    if (!customer.email || customer.email.trim().toLowerCase() !== email) {
      return NextResponse.json({ error: 'El email no coincide con los datos de esa orden.' }, { status: 403 });
    }

    const items = JSON.parse(order.items) as { product: { name: string; sku: string }; quantity: number }[];
    const shippingStepIndex = SHIPPING_STAGES.findIndex((s) => s.value === order.shippingStatus);

    return NextResponse.json({
      buyOrder: order.buyOrder,
      paymentStatus: order.status,
      paymentStatusLabel: PAYMENT_STATUS_LABELS[order.status] || order.status,
      shippingStatus: order.shippingStatus,
      shippingStepIndex: shippingStepIndex === -1 ? 0 : shippingStepIndex,
      shippingStages: SHIPPING_STAGES,
      amount: order.amount,
      createdAt: order.createdAt,
      items: items.map((i) => ({ name: i.product.name, sku: i.product.sku, quantity: i.quantity })),
    });
  } catch (error) {
    console.error('Error buscando la orden:', error);
    return NextResponse.json({ error: 'Error interno al buscar el pedido.' }, { status: 500 });
  }
}
