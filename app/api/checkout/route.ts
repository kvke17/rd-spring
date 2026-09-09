import { NextResponse } from 'next/server';
import { WebpayPlus, Options, IntegrationApiKeys, Environment, IntegrationCommerceCodes } from 'transbank-sdk';
import prisma from '@/lib/prisma';
import productsData from '@/data/products.json'; 


// 🚨 VARIABLES DINÁMICAS: Listo para producción y sandbox
const tx = new WebpayPlus.Transaction(
  new Options(
    process.env.WEBPAY_COMMERCE_CODE || process.env.TBK_COMMERCE_CODE || IntegrationCommerceCodes.WEBPAY_PLUS,
    process.env.WEBPAY_API_KEY || process.env.TBK_API_KEY || IntegrationApiKeys.WEBPAY,
    process.env.WEBPAY_COMMERCE_CODE ? Environment.Production : Environment.Integration
  )
);

export async function POST(request: Request) {
  try {
    const { sessionId, buyOrder, returnUrl, customer, items, documentType, shippingId } = await request.json();

    let realTotalAmount = 0;

    for (const item of items) {
      // 🚨 1. SEGURIDAD EXTREMA: Bloquear cantidades negativas, decimales o ceros
      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        return NextResponse.json({ error: `Cantidad inválida detectada en el carrito.` }, { status: 400 });
      }

      // Buscamos el producto en la fuente de verdad (backend)
      const realProduct = (productsData as any[]).find(
        (p) => p.id === item.product.id || p.sku === item.product.sku
      );

      if (!realProduct) {
        return NextResponse.json({ error: `Producto manipulado o no encontrado: ${item.product.sku}` }, { status: 400 });
      }

      // 🚨 2. CONTROL DE STOCK: Verificar que hay inventario antes de cobrar
      // Asumimos 99 si el JSON no tiene la propiedad stock definida para algún producto
      const availableStock = realProduct.stock ?? 99; 
      if (item.quantity > availableStock) {
        return NextResponse.json({ 
          error: `Stock insuficiente para: ${realProduct.name}. Solo quedan ${availableStock} unidades.` 
        }, { status: 400 });
      }

      realTotalAmount += realProduct.price * item.quantity;
    }

    // 🚨 3. COSTO DE ENVÍO EXACTO
    if (shippingId === 'santiago') {
      realTotalAmount += 12000;
    } else if (shippingId === 'regional') {
      realTotalAmount += 19900;
    }

    // Guardamos la orden como PENDING
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

    // Enviamos a Transbank
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