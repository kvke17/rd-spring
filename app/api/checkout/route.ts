import { NextResponse } from 'next/server';
import { WebpayPlus, Options, IntegrationApiKeys, Environment, IntegrationCommerceCodes } from 'transbank-sdk';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Usa credenciales de producción si están configuradas en .env,
// de lo contrario cae automáticamente en el sandbox de integración.
const tx = new WebpayPlus.Transaction(
  new Options(
    process.env.TBK_COMMERCE_CODE || IntegrationCommerceCodes.WEBPAY_PLUS,
    process.env.TBK_API_KEY || IntegrationApiKeys.WEBPAY,
    process.env.TBK_COMMERCE_CODE ? Environment.Production : Environment.Integration
  )
);

export async function POST(request: Request) {
  try {
    // 1. Agregamos "documentType" a los datos que extraemos del frontend
    const { amount, sessionId, buyOrder, returnUrl, customer, items, documentType } = await request.json();

    // 2. Guardamos la orden incluyendo los nuevos campos tributarios
    await prisma.order.create({
      data: {
        buyOrder,
        amount,
        customer: JSON.stringify(customer),
        items: JSON.stringify(items),
        documentType: documentType || 'BOLETA',
        razonSocial: customer.razonSocial || null,
        giro: customer.giro || null,
      },
    });

    const response = await tx.create(buyOrder, sessionId, amount, returnUrl);

    await prisma.order.update({
      where: { buyOrder },
      data: { token: response.token },
    });

    return NextResponse.json({ url: response.url, token: response.token });
  } catch (error) {
    console.error('Error al crear transacción:', error);
    return NextResponse.json({ error: 'Fallo al inicializar pago' }, { status: 500 });
  }
}