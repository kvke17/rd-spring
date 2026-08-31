import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const VALID_STAGES = ['CONFIRMADO', 'PREPARANDO', 'EN_CAMINO', 'ENTREGADO'];

export async function PATCH(request: Request, { params }: { params: Promise<{ buyOrder: string }> }) {
  const { buyOrder } = await params;
  const adminKey = request.headers.get('x-admin-key');

  if (!process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'ADMIN_SECRET no configurado en el servidor.' }, { status: 500 });
  }

  if (adminKey !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Clave de administrador incorrecta.' }, { status: 401 });
  }

  try {
    const { shippingStatus } = await request.json();

    if (!VALID_STAGES.includes(shippingStatus)) {
      return NextResponse.json({ error: 'Estado de envío inválido.' }, { status: 400 });
    }

    const order = await prisma.order.update({
      where: { buyOrder },
      data: { shippingStatus },
    });

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('Error actualizando estado de envío:', error);
    return NextResponse.json({ error: 'No se pudo actualizar el pedido.' }, { status: 500 });
  }
}
