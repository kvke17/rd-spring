import { NextResponse } from 'next/server';
import { WebpayPlus, Options, IntegrationApiKeys, Environment, IntegrationCommerceCodes } from 'transbank-sdk';
import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

const tx = new WebpayPlus.Transaction(
  new Options(
    process.env.TBK_COMMERCE_CODE || IntegrationCommerceCodes.WEBPAY_PLUS,
    process.env.TBK_API_KEY || IntegrationApiKeys.WEBPAY,
    process.env.TBK_COMMERCE_CODE ? Environment.Production : Environment.Integration
  )
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token_ws');

  if (!token) return NextResponse.redirect(new URL('/checkout?status=cancelled', request.url));

  try {
    const response = await tx.commit(token);

    if (response.status === 'AUTHORIZED' && response.response_code === 0) {
      const order = await prisma.order.update({
        where: { buyOrder: response.buy_order },
        data: { status: 'PAID' },
      });

      const customer = JSON.parse(order.customer);
      const items = JSON.parse(order.items);

      for (const item of items) {
        await prisma.product.updateMany({
          where: { sku: item.product.sku },
          data: { stock: { decrement: item.quantity } },
        });
      }

      if (process.env.RESEND_API_KEY) {
        await resend.emails
          .send({
            from: 'RD Spring <contacto@rdspring.cl>',
            to: [customer.email],
            subject: `Confirmación de Pedido ${order.buyOrder} - RD SPRING`,
            html: `<h2>¡Gracias por tu compra, ${customer.fullName}!</h2>
                   <p>Tu orden <strong>${order.buyOrder}</strong> ha sido confirmada por ${new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(order.amount)}.</p>
                   <p>Prepararemos tu envío a la brevedad.</p>`,
          })
          .catch((e) => console.error('Error enviando correo de confirmación:', e));
      } else {
        console.warn('RESEND_API_KEY no configurada: no se envió el correo de confirmación de la orden', order.buyOrder);
      }

      const redirectUrl = new URL('/checkout/success', request.url);
      redirectUrl.searchParams.set('buyOrder', response.buy_order);
      redirectUrl.searchParams.set('amount', response.amount.toString());
      redirectUrl.searchParams.set('authorizationCode', response.authorization_code);
      return NextResponse.redirect(redirectUrl);
    } else {
      await prisma.order.update({
        where: { token },
        data: { status: 'REJECTED' },
      });
      return NextResponse.redirect(new URL('/checkout?status=rejected', request.url));
    }
  } catch (error) {
    console.error('Error al confirmar pago con Transbank:', error);
    return NextResponse.redirect(new URL('/checkout?status=error', request.url));
  }
}
