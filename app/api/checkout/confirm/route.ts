import { NextResponse } from 'next/server';
import { WebpayPlus, Options, IntegrationApiKeys, Environment, IntegrationCommerceCodes } from 'transbank-sdk';
import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';
import ReceiptEmail from '@/components/emails/ReceiptEmail';

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

// Inicializamos Transbank
const tx = new WebpayPlus.Transaction(
  new Options(
    process.env.TBK_COMMERCE_CODE || IntegrationCommerceCodes.WEBPAY_PLUS,
    process.env.TBK_API_KEY || IntegrationApiKeys.WEBPAY,
    process.env.TBK_COMMERCE_CODE ? Environment.Production : Environment.Integration
  )
);

export async function GET(request: Request) {
  try {
    // 1. Extraemos los datos de la URL de retorno
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

    // 2. Confirmamos la transacción (COMMIT)
    const response = await tx.commit(token_ws);

    if (response.status === 'AUTHORIZED') {
      // 3. Pago exitoso: Actualizamos la base de datos
      const order = await prisma.order.update({
        where: { token: token_ws }, 
        data: { 
          shippingStatus: 'CONFIRMADO'
        }, 
      });

      // Extraemos los datos del cliente
      const customer = JSON.parse(order.customer);

      // 4. Disparamos el correo de Resend
      await resend.emails.send({
        from: 'RD Spring <onboarding@resend.dev>', 
        // 👇 Tu correo institucional
        to: ['jorg.arayab@duocuc.cl'], 
        subject: `Confirmación de pedido #${order.buyOrder} - RD Spring`,
        react: ReceiptEmail({
          customerName: customer.fullName || 'Cliente', 
          buyOrder: order.buyOrder,
          amount: order.amount,
          itemsSummary: 'Revisa tu perfil para ver el detalle de los productos', 
        }),
      });

      // 5. Redirigimos a TU verdadera pantalla de éxito
      return NextResponse.redirect(new URL(`/checkout/success?buyOrder=${order.buyOrder}&amount=${order.amount}`, request.url));
      
    } else {
      // Tarjeta rechazada
      return NextResponse.redirect(new URL('/carro?error=rechazado', request.url));
    }
    
  } catch (error) {
    console.error('Error al confirmar transacción:', error);
    return NextResponse.redirect(new URL('/carro?error=sistema', request.url));
  }
}