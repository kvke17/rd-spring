import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Resend } from 'resend';
import OrderStatusEmail from '@/components/emails/OrderStatusEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ buyOrder: string }> }
) {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "ACCESO DENEGADO" }, { status: 401 });
  }

  try {
    const { buyOrder } = await params;
    const body = await request.json();
    const { shippingStatus } = body;

    // 1. Actualizamos el estado del pedido en la base de datos
    const updatedOrder = await prisma.order.update({
      where: { buyOrder },
      data: { shippingStatus }
    });

    // 2. Extraemos los datos del cliente
    const customer = JSON.parse(updatedOrder.customer as string);

    // 3. Envío de correo con Resend
    try {
      await resend.emails.send({
        from: 'RD Spring <onboarding@resend.dev>', 
        to: ['jorg.arayab@duocuc.cl'], 
        subject: `Actualización de envío - Pedido #${buyOrder}`,
        react: OrderStatusEmail({
          customerName: customer.fullName || 'Cliente',
          buyOrder: buyOrder,
          shippingStatus: shippingStatus
        }),
      });
    } catch (emailError) {
      console.error('El pedido se actualizó, pero falló el envío del correo:', emailError);
    }

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error('Error al actualizar el estado:', error);
    return NextResponse.json({ error: "Error al actualizar el estado" }, { status: 500 });
  }
}