import { NextResponse } from 'next/server';
import { WebpayPlus, Options, Environment, IntegrationCommerceCodes, IntegrationApiKeys } from 'transbank-sdk';
import prisma from '@/lib/prisma';
import { Resend } from 'resend';
import ReceiptEmail from '@/components/emails/ReceiptEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

const commerceCode = process.env.TBK_COMMERCE_CODE || IntegrationCommerceCodes.WEBPAY_PLUS;
const apiKey = process.env.TBK_API_KEY_SECRET || IntegrationApiKeys.WEBPAY;
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
      
      // ==========================================
      // ACTUALIZAR ESTADO A "PAGADO" EN LA BASE DE DATOS
      // ==========================================
      await prisma.order.update({
        where: { token: token_ws },
        data: { status: 'PAID' }
      });

      const items = JSON.parse(pendingOrder.items);
      const customer = JSON.parse(pendingOrder.customer);

      // ==========================================
      // ESTADO DE LA BOLETA (Se emitirá manualmente desde el Admin)
      // ==========================================
      let summaryText = `Tu pago ha sido procesado con éxito. Tu boleta electrónica será emitida y enviada a tu correo a la brevedad.`;

      // ==========================================
      // ENVÍO DE CORREO AL CLIENTE
      // ==========================================
      try {
        const dataResend = await resend.emails.send({
          from: 'Ventas RD Spring <contacto@rdspring.cl>', 
          to: customer.email, 
          subject: `Confirmación de pedido #${pendingOrder.buyOrder} - RD Spring`,
          react: ReceiptEmail({
            customerName: customer.fullName || 'Cliente', 
            buyOrder: pendingOrder.buyOrder,
            amount: pendingOrder.amount,
            itemsSummary: summaryText // <-- Texto limpio y profesional
          }),
        });
        console.log("Correo enviado al cliente exitosamente:", dataResend);
      } catch (emailError: any) {
        console.error('=== ERROR DETALLADO DE RESEND (CLIENTE) ===', JSON.stringify(emailError, null, 2));
      }

      // ==========================================
      // CORREO INTERNO PARA EL ADMINISTRADOR (NUEVA VENTA)
      // ==========================================
      try {
        let adminShippingInfo: any = {};
        try {
          const orderAny = pendingOrder as any;
          adminShippingInfo = orderAny.shippingInfo ? JSON.parse(orderAny.shippingInfo as string) : {};
        } catch (e) {
          adminShippingInfo = { sucursalOficina: 'Envío a domicilio' };
        }
        
        let htmlAdmin = `
          <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h2 style="color: #b3131b; margin-top: 0;">¡Nueva Venta Realizada! 🎉</h2>
            <p><strong>Orden:</strong> ${pendingOrder.buyOrder}</p>
            <p><strong>Monto Total:</strong> $${pendingOrder.amount.toLocaleString('es-CL')}</p>
            <br/>
            <h3 style="border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; color: #111;">Datos del Cliente</h3>
            <p><strong>Nombre:</strong> ${customer.fullName}</p>
            <p><strong>Email:</strong> ${customer.email}</p>
            <p><strong>Teléfono:</strong> ${customer.phone}</p>
            <p><strong>RUT:</strong> ${customer.rut}</p>
            <br/>
            <h3 style="border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; color: #111;">Método de Entrega</h3>
            <p><strong>Tipo:</strong> ${adminShippingInfo.sucursalOficina || 'Envío a Domicilio'}</p>
            <p><strong>Dirección:</strong> ${customer.address || 'Retiro en Tienda (Av. Las Condes 8550)'}, ${customer.comuna || ''}, ${customer.region || ''}</p>
            <br/>
            <h3 style="border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; color: #111;">Productos Vendidos</h3>
            <ul>
              ${items.map((i: any) => `<li><strong>${i.quantity}x</strong> ${i.product.name} ($${i.product.price.toLocaleString('es-CL')})</li>`).join('')}
            </ul>
          </div>
        `;

        await resend.emails.send({
          from: 'Ventas RD Spring <contacto@rdspring.cl>', 
          to: 'contacto@rdspring.cl', 
          subject: `💰 NUEVA VENTA - Orden #${pendingOrder.buyOrder}`,
          html: htmlAdmin
        });
        console.log("Correo de aviso al administrador enviado exitosamente.");
      } catch (adminEmailError) {
        console.error('Error enviando aviso al admin:', adminEmailError);
      }
      // ==========================================

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