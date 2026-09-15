import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
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

    const updatedOrder = await prisma.order.update({
      where: { buyOrder },
      data: { shippingStatus }
    });

    const customer = JSON.parse(updatedOrder.customer as string);
    
    // Verificamos si la orden es para retiro
    // Verificamos si la orden es para retiro de forma segura evitando el error de TypeScript
    const orderData = updatedOrder as any;
    const isPickup = orderData.shippingInfo 
      ? String(orderData.shippingInfo).toUpperCase().includes('RETIRO') 
      : false;

    const subjectLine = shippingStatus === 'LISTO_PARA_RETIRO' 
      ? `📍 ¡Tu pedido #${buyOrder} está listo para retiro!` 
      : `Actualización de envío - Pedido #${buyOrder}`;

    try {
      await resend.emails.send({
        from: 'RD Spring <contacto@rdspring.cl>', 
        // SOLUCIONADO: Ya solo se le envía al cliente, NO a la tienda.
        to: [customer.email], 
        subject: subjectLine,
        react: OrderStatusEmail({
          customerName: customer.fullName || 'Cliente',
          buyOrder: buyOrder,
          shippingStatus: shippingStatus,
          isPickup: isPickup // Le pasamos el dato al correo
        }),
      });
    } catch (emailError: any) {
      console.error('ERROR CRÍTICO AL ENVIAR CORREO:', JSON.stringify(emailError, null, 2));
    }

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error('Error al actualizar el estado:', error);
    return NextResponse.json({ error: "Error al actualizar el estado" }, { status: 500 });
  }
}