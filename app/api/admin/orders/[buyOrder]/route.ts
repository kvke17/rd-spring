import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // 🚨 IMPORTANTE: Usamos el Singleton de Turso, no un new PrismaClient()
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Resend } from 'resend';
import OrderStatusEmail from '@/components/emails/OrderStatusEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ buyOrder: string }> }
) {
  // Verificación de seguridad: Solo ADMIN puede modificar estados
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

    // 2. Extraemos los datos del cliente para saber a qué correo enviarlo
    const customer = JSON.parse(updatedOrder.customer as string);

    // 3. Envío de correo protegido por un try/catch independiente
    try {
      await resend.emails.send({
        from: 'Envíos RD Spring <ventas@rdspring.cl>', // Asegúrate de usar el correo/dominio verificado en Resend
        to: customer.email,
        subject: `Actualización de envío - Pedido ${buyOrder}`,
        react: OrderStatusEmail({
          customerName: customer.fullName || 'Cliente',
          buyOrder: buyOrder,
          shippingStatus: shippingStatus
        }),
      });
    } catch (emailError) {
      // Si el correo falla, no rompemos la respuesta al panel de administración
      console.error('El pedido se actualizó en la BD, pero falló el envío del correo:', emailError);
    }

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error('Error fatal al actualizar el estado:', error);
    return NextResponse.json({ error: "Error al actualizar el estado" }, { status: 500 });
  }
}