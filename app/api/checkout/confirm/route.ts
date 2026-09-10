import { NextResponse } from 'next/server';
import { WebpayPlus, Options, Environment, IntegrationCommerceCodes, IntegrationApiKeys } from 'transbank-sdk';
import prisma from '@/lib/prisma';
import { Resend } from 'resend';
import ReceiptEmail from '@/components/emails/ReceiptEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

const commerceCode = process.env.TBK_COMMERCE_CODE || IntegrationCommerceCodes.WEBPAY_PLUS;
const apiKey = process.env.TBK_API_KEY || IntegrationApiKeys.WEBPAY;
const environment = process.env.TBK_COMMERCE_CODE ? Environment.Production : Environment.Integration;
const tx = new WebpayPlus.Transaction(new Options(commerceCode, apiKey, environment));

export async function POST(request: Request) { return processPayment(request); }
export async function GET(request: Request) { return processPayment(request); }

async function processPayment(request: Request) {
  try {
    let token_ws = null;
    let tbk_token = null;

    if (request.method === 'POST') {
      try {
        const bodyText = await request.text(); 
        const params = new URLSearchParams(bodyText);
        token_ws = params.get('token_ws');
        tbk_token = params.get('TBK_TOKEN');
      } catch (error) {
        console.error("Error leyendo body:", error);
      }
    } 
    
    if (!token_ws && !tbk_token) {
      const { searchParams } = new URL(request.url);
      token_ws = searchParams.get('token_ws');
      tbk_token = searchParams.get('TBK_TOKEN');
    }

    if (tbk_token && !token_ws) return NextResponse.redirect(new URL('/carro?error=cancelado', request.url), { status: 303 });
    if (!token_ws) return NextResponse.redirect(new URL('/carro?error=invalido', request.url), { status: 303 });

    const pendingOrder = await prisma.order.findUnique({ where: { token: token_ws } });
    if (!pendingOrder) return NextResponse.redirect(new URL('/carro?error=sistema', request.url), { status: 303 });

    if (pendingOrder.status === 'PAGADO') return NextResponse.redirect(new URL(`/checkout/success?buyOrder=${pendingOrder.buyOrder}&amount=${pendingOrder.amount}`, request.url), { status: 303 });

    const response = await tx.commit(token_ws);

    if (response.status === 'AUTHORIZED' && response.amount === pendingOrder.amount) {
      
      const items = JSON.parse(pendingOrder.items);
      const customer = JSON.parse(pendingOrder.customer);

      await prisma.$transaction(async (txPrisma) => {
        await txPrisma.order.update({
          where: { token: token_ws as string },
          data: { status: 'PAGADO', shippingStatus: 'CONFIRMADO' }
        });
        for (const item of items) {
          await txPrisma.product.update({
            where: { sku: item.product.sku },
            data: { stock: { decrement: item.quantity } }
          });
        }
      });

      // MOCK BOLETA
      let folioBoleta = "TEST-999";
      let linkPdfBoleta = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

      try {
        await resend.emails.send({
          from: 'onboarding@resend.dev',
          to: customer.email, 
          subject: `Confirmación de pedido #${pendingOrder.buyOrder} - RD Spring`,
          react: ReceiptEmail({
            customerName: customer.fullName || 'Cliente', 
            buyOrder: pendingOrder.buyOrder,
            amount: pendingOrder.amount,
            itemsSummary: `Tu boleta (Folio: ${folioBoleta}) ha sido emitida. Descárgala aquí: ${linkPdfBoleta}` 
          }),
        });
      } catch (emailError) {
        console.error('Error enviando correo:', emailError);
      }

      return NextResponse.redirect(new URL(`/checkout/success?buyOrder=${pendingOrder.buyOrder}&amount=${pendingOrder.amount}`, request.url), { status: 303 });
      
    } else {
      await prisma.order.update({
         where: { token: token_ws as string },
         data: { status: 'RECHAZADO' }
      });
      return NextResponse.redirect(new URL('/carro?error=rechazado', request.url), { status: 303 });
    }
    
  } catch (error) {
    console.error('Error al confirmar transacción:', error);
    return NextResponse.redirect(new URL('/carro?error=sistema', request.url), { status: 303 });
  }
}