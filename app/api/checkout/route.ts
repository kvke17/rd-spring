import { NextResponse } from 'next/server';
import { WebpayPlus, Options, IntegrationApiKeys, Environment, IntegrationCommerceCodes } from 'transbank-sdk';
import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';
// Asumo que tienes tu componente de correo aquí según el árbol de archivos
import ReceiptEmail from '@/components/emails/ReceiptEmail'; 

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

// 1. CORRECCIÓN DE VARIABLES: Ahora busca WEBPAY_ primero, y luego TBK_ por si acaso.
const tx = new WebpayPlus.Transaction(
  new Options(
    process.env.WEBPAY_COMMERCE_CODE || process.env.TBK_COMMERCE_CODE || IntegrationCommerceCodes.WEBPAY_PLUS,
    process.env.WEBPAY_API_KEY || process.env.TBK_API_KEY || IntegrationApiKeys.WEBPAY,
    process.env.WEBPAY_COMMERCE_CODE ? Environment.Production : Environment.Integration
  )
);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const token_ws = formData.get('token_ws')?.toString();

    // Si no hay token, el usuario canceló el pago en la pantalla del banco
    if (!token_ws) {
      return NextResponse.redirect(new URL('/checkout/error', request.url));
    }

    // Confirmamos la transacción con Transbank
    const response = await tx.commit(token_ws);

    if (response.response_code === 0 && response.status === 'AUTHORIZED') {
      
      // 2. ESTADO DEL PEDIDO: Marcamos como PAGADO
      const order = await prisma.order.update({
        where: { buyOrder: response.buy_order },
        data: { status: 'PAGADO' }
      });

      const customer = JSON.parse(order.customer as string);
      const items = JSON.parse(order.items as string);

      // 3. DESCUENTO DE STOCK: Actualizamos la base de datos
      try {
        for (const item of items) {
          await prisma.product.update({
            where: { sku: item.product.sku },
            data: { stock: { decrement: item.quantity } }
          });
        }
      } catch (stockError) {
        console.error('Error al descontar stock (posible producto sin tracking de DB):', stockError);
      }

      try {
        // Armamos un texto bonito con el resumen de los productos comprados
        const itemsSummaryString = items
          .map((item: any) => `${item.quantity}x ${item.product.name}`)
          .join(', ');

        await resend.emails.send({
          from: 'Ventas RD Spring <ventas@rdspring.cl>', 
          to: customer.email, 
          subject: `Confirmación de compra - Pedido ${order.buyOrder}`,
          // Le pasamos exactamente las 4 propiedades que pide ReceiptEmailProps
          react: ReceiptEmail({ 
            customerName: customer.fullName || 'Cliente', 
            buyOrder: order.buyOrder, 
            amount: order.amount, 
            itemsSummary: itemsSummaryString 
          }) 
        });
      } catch (emailError) {
        console.error('Error enviando el recibo por correo:', emailError);
      }

      // Redirigir a la pantalla de éxito
      return NextResponse.redirect(new URL(`/checkout/success?order=${order.buyOrder}`, request.url));
    } else {
      // El pago fue rechazado (sin saldo, clave errónea, etc.)
      await prisma.order.update({
        where: { buyOrder: response.buy_order },
        data: { status: 'RECHAZADO' }
      });
      return NextResponse.redirect(new URL('/checkout/error', request.url));
    }

  } catch (error) {
    console.error('Error fatal confirmando pago:', error);
    return NextResponse.redirect(new URL('/checkout/error', request.url));
  }
}