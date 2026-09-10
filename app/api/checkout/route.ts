import { NextResponse } from 'next/server';
import { WebpayPlus, Options, Environment, IntegrationCommerceCodes, IntegrationApiKeys } from 'transbank-sdk';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from '@/lib/prisma';
import crypto from 'crypto';

const commerceCode = process.env.TBK_COMMERCE_CODE || IntegrationCommerceCodes.WEBPAY_PLUS;
const apiKey = process.env.TBK_API_KEY || IntegrationApiKeys.WEBPAY;
const environment = process.env.TBK_COMMERCE_CODE ? Environment.Production : Environment.Integration;
const tx = new WebpayPlus.Transaction(new Options(commerceCode, apiKey, environment));

export async function POST(request: Request) {
  try {
    // 1. Obtenemos la sesión del usuario logueado para vincular la compra
    const session = await getServerSession(authOptions);

    const body = await request.json();
    const { customer, items } = body;

    // Calcula el monto seguro
    const totalAmount = items.reduce((sum: number, item: any) => {
      return sum + (item.product.price * item.quantity);
    }, 0);

    if (totalAmount <= 0) {
      return NextResponse.json({ error: 'El carrito está vacío' }, { status: 400 });
    }

    const shortUuid = crypto.randomUUID().split('-')[0].toUpperCase();
    const buyOrder = `ORD-${shortUuid}`;
    const finalSessionId = `SESSION-${shortUuid}`;
    
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const returnUrl = `${baseUrl}/api/checkout/confirm`;

    // 2. Crear orden vinculando el ID del usuario de la sesión
    const order = await prisma.order.create({
      data: {
        buyOrder: buyOrder,
        amount: totalAmount,
        status: 'PENDING',
        shippingStatus: 'PREPARANDO',
        customer: JSON.stringify(customer),
        items: JSON.stringify(items),
        userId: session?.user ? (session.user as any).id : null,
      }
    });

    // 3. Iniciar Transbank
    const response = await tx.create(buyOrder, finalSessionId, totalAmount, returnUrl);

    // 4. Vincular Token
    await prisma.order.update({
      where: { buyOrder },
      data: { token: response.token }
    });

    // Devuelve la URL para que el frontend redirija
    return NextResponse.json({ url: response.url, token: response.token });
  } catch (error) {
    console.error('Error iniciando pago:', error);
    return NextResponse.json({ error: 'Error al iniciar pago' }, { status: 500 });
  }
}