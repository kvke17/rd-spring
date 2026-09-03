import { NextResponse } from 'next/server';
import { WebpayPlus, Options, IntegrationApiKeys, Environment, IntegrationCommerceCodes } from 'transbank-sdk';
import { PrismaClient } from '@prisma/client';

// Importamos tu catálogo real para que el servidor haga los cálculos
import productsData from '@/data/products.json'; 

const prisma = new PrismaClient();

const tx = new WebpayPlus.Transaction(
  new Options(
    process.env.TBK_COMMERCE_CODE || IntegrationCommerceCodes.WEBPAY_PLUS,
    process.env.TBK_API_KEY || IntegrationApiKeys.WEBPAY,
    process.env.TBK_COMMERCE_CODE ? Environment.Production : Environment.Integration
  )
);

export async function POST(request: Request) {
  try {
    const { sessionId, buyOrder, returnUrl, customer, items, documentType, shippingId } = await request.json();

    // 🚨 1. LÓGICA DE SEGURIDAD: RECALCULAMOS EL PRECIO DE LOS PRODUCTOS 🚨
    let realTotalAmount = 0;

   for (const item of items) {
      // Le decimos a TypeScript que confíe en que es un arreglo usando "as any[]"
      const realProduct = (productsData as any[]).find(
        (p) => p.id === item.product.id || p.sku === item.product.sku
      );

      if (!realProduct) {
        return NextResponse.json({ error: `Producto manipulado o no encontrado: ${item.product.sku}` }, { status: 400 });
      }

      realTotalAmount += realProduct.price * item.quantity;
    }

    // 🚨 2. LÓGICA DE SEGURIDAD: SUMAMOS EL COSTO DE ENVÍO EXACTO 🚨
    if (shippingId === 'santiago') {
      realTotalAmount += 12000;
    } else if (shippingId === 'regional') {
      realTotalAmount += 19900;
    }
    // Si es 'pickup', el costo es 0, así que no sumamos nada.

    // 3. Guardamos la orden con el monto REAL seguro
    await prisma.order.create({
      data: {
        buyOrder,
        amount: realTotalAmount, 
        customer: JSON.stringify(customer),
        items: JSON.stringify(items),
        documentType: documentType || 'BOLETA',
        razonSocial: customer.razonSocial || null,
        giro: customer.giro || null,
      },
    });

    // 4. Enviamos el monto REAL a Transbank
    const response = await tx.create(buyOrder, sessionId, realTotalAmount, returnUrl);

    await prisma.order.update({
      where: { buyOrder },
      data: { token: response.token },
    });

    return NextResponse.json({ url: response.url, token: response.token });
  } catch (error) {
    console.error('Error al crear transacción segura:', error);
    return NextResponse.json({ error: 'Fallo al inicializar pago' }, { status: 500 });
  }
}