import { NextResponse } from 'next/server';
import { WebpayPlus, Options, IntegrationApiKeys, Environment, IntegrationCommerceCodes } from 'transbank-sdk';
import prisma from '@/lib/prisma';
import { Resend } from 'resend';
import ReceiptEmail from '@/components/emails/ReceiptEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

// Inicializamos Transbank (Forzado a Integración para pruebas)
const tx = new WebpayPlus.Transaction(
  new Options(
    IntegrationCommerceCodes.WEBPAY_PLUS,
    IntegrationApiKeys.WEBPAY,
    Environment.Integration
  )
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token_ws = searchParams.get('token_ws');
    const tbk_token = searchParams.get('TBK_TOKEN');

    // Si el cliente canceló el pago
    if (tbk_token && !token_ws) {
      return NextResponse.redirect(new URL('/carro?error=cancelado', request.url));
    }

    if (!token_ws) {
      return NextResponse.redirect(new URL('/carro?error=invalido', request.url));
    }

    // Confirmamos la transacción (COMMIT)
    const response = await tx.commit(token_ws);

    if (response.status === 'AUTHORIZED') {
      // 🚨 1. ACTUALIZAMOS EL ESTADO A PAGADO (¡Para que aparezca en el admin!)
      const order = await prisma.order.update({
        where: { token: token_ws }, 
        data: { 
          status: 'PAGADO', 
          shippingStatus: 'CONFIRMADO'
        }, 
      });

      // 🚨 2. DESCONTAMOS EL STOCK EN TURSO
      const items = JSON.parse(order.items);
      for (const item of items) {
        await prisma.product.update({
          where: { sku: item.product.sku },
          data: { stock: { decrement: item.quantity } }
        });
      }

      // Extraemos los datos del cliente
      const customer = JSON.parse(order.customer);

      // 3. Disparamos el correo de Resend
      await resend.emails.send({
        from: 'RD Spring <onboarding@resend.dev>', 
        to: ['jorg.arayab@duocuc.cl'], 
        subject: `Confirmación de pedido #${order.buyOrder} - RD Spring`,
        react: ReceiptEmail({
          customerName: customer.fullName || 'Cliente', 
          buyOrder: order.buyOrder,
          amount: order.amount,
          itemsSummary: 'Revisa tu perfil para ver el detalle de los productos', 
        }),
      });

      // 4. Redirigimos a la pantalla de éxito
      return NextResponse.redirect(new URL(`/checkout/success?buyOrder=${order.buyOrder}&amount=${order.amount}`, request.url));
      
    } else {
      // Tarjeta rechazada, actualizamos a RECHAZADO
      await prisma.order.update({
         where: { token: token_ws },
         data: { status: 'RECHAZADO' }
      });
      return NextResponse.redirect(new URL('/carro?error=rechazado', request.url));
    }
    
  } catch (error) {
    console.error('Error al confirmar transacción:', error);
    return NextResponse.redirect(new URL('/carro?error=sistema', request.url));
  }
}