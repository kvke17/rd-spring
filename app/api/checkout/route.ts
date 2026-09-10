import { NextResponse } from 'next/server';
import { WebpayPlus, Options, IntegrationApiKeys, Environment, IntegrationCommerceCodes } from 'transbank-sdk';
import prisma from '@/lib/prisma';
import productsData from '@/data/products.json'; 

// 🚨 FORZAR MODO INTEGRACIÓN (PRUEBAS)
const tx = new WebpayPlus.Transaction(
  new Options(
    IntegrationCommerceCodes.WEBPAY_PLUS,
    IntegrationApiKeys.WEBPAY,
    Environment.Integration
  )
);

export async function POST(request: Request) {
  try {
    const { sessionId, buyOrder, returnUrl, customer, items, documentType, shippingId } = await request.json();

    let realTotalAmount = 0;

    for (const item of items) {
      // 🚨 1. VALIDACIÓN DE CANTIDAD
      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        return NextResponse.json({ error: `Cantidad inválida detectada.` }, { status: 400 });
      }

      // 🚨 2. BÚSQUEDA PROFUNDA EN EL JSON (Seguridad de Precio)
      let realPrice = 0;
      let realProductName = '';
      const productSku = item.product.sku;

      // A) Buscamos si el producto está directo en la raíz
      let baseProduct = (productsData as any[]).find(p => p.sku === productSku);
      
      if (baseProduct && baseProduct.price) {
          realPrice = baseProduct.price;
          realProductName = baseProduct.name;
      } else {
          // B) Si no está en la raíz, buscamos dentro del arreglo "formats"
          const parentProduct = (productsData as any[]).find(p => p.formats && p.formats.some((f: any) => f.sku === productSku));
          
          if (parentProduct) {
              const format = parentProduct.formats.find((f: any) => f.sku === productSku);
              realPrice = format.price;
              realProductName = `${parentProduct.name} (${format.size})`;
          }
      }

      if (realPrice === 0) {
        console.error("🔥 RECHAZO 400 - PRODUCTO NO ENCONTRADO EN JSON:", productSku);
        return NextResponse.json({ error: `Producto manipulado o no encontrado: ${productSku}` }, { status: 400 });
      }

      // 🚨 3. CONTROL DE STOCK CON TURSO (Base de datos real)
      const dbProduct = await prisma.product.findUnique({
          where: { sku: productSku }
      });

      const availableStock = dbProduct ? dbProduct.stock : 0; 
      
      if (item.quantity > availableStock) {
        console.error(`🔥 RECHAZO 400 - STOCK INSUFICIENTE EN TURSO: Pedido=${item.quantity}, Disponible=${availableStock}`);
        return NextResponse.json({ 
          error: `Stock insuficiente para: ${realProductName}. Solo quedan ${availableStock} unidades.` 
        }, { status: 400 });
      }

      // Sumamos al total usando el precio del JSON
      realTotalAmount += realPrice * item.quantity;
    }

    // 🚨 4. COSTO DE ENVÍO
    if (shippingId === 'santiago') {
      realTotalAmount += 12000;
    } else if (shippingId === 'regional') {
      realTotalAmount += 19900;
    }

    // Guardar orden
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

    const response = await tx.create(buyOrder, sessionId, realTotalAmount, returnUrl);

    await prisma.order.update({
      where: { buyOrder },
      data: { token: response.token },
    });

    return NextResponse.json({ url: response.url, token: response.token });
  } catch (error: any) {
    console.error('🔥 ERROR CRÍTICO 500 (Base de datos o Transbank):', error.message || error);
    return NextResponse.json({ error: 'Fallo al inicializar pago' }, { status: 500 });
  }
}