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

    // 1. Actualizamos el estado del pedido
    const updatedOrder = await prisma.order.update({
      where: { buyOrder },
      data: { shippingStatus }
    });

    // 2. Extraemos los datos del cliente
    const customer = JSON.parse(updatedOrder.customer as string);

    // 3. Generamos un asunto dinámico para el correo
    const subjectLine = shippingStatus === 'LISTO_PARA_RETIRO' 
      ? `📍 ¡Tu pedido #${buyOrder} está listo para retiro!` 
      : `Actualización de envío - Pedido #${buyOrder}`;

    // 4. Envío de correo con Resend
    try {
      const emailResponse = await resend.emails.send({
        from: 'RD Spring <contacto@rdspring.cl>', 
        to: [customer.email, 'contacto@rdspring.cl'], 
        subject: subjectLine,
        react: OrderStatusEmail({
          customerName: customer.fullName || 'Cliente',
          buyOrder: buyOrder,
          shippingStatus: shippingStatus
        }),
      });

      console.log('RESPUESTA EXITOSA DE RESEND:', emailResponse);

    } catch (emailError: any) {
      console.error('ERROR CRÍTICO AL ENVIAR CORREO:', JSON.stringify(emailError, null, 2));
    }

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error('Error al actualizar el estado:', error);
    return NextResponse.json({ error: "Error al actualizar el estado" }, { status: 500 });
  }
}