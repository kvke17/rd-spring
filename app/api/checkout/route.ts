import { NextResponse } from 'next/server';
import { WebpayPlus, Options, Environment, IntegrationCommerceCodes, IntegrationApiKeys } from 'transbank-sdk';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from '@/lib/prisma';
import crypto from 'crypto';
import { checkRateLimit } from '@/lib/rateLimit';
import { sanitizeString, isValidEmail } from '@/lib/sanitize';

const commerceCode = process.env.TBK_COMMERCE_CODE || IntegrationCommerceCodes.WEBPAY_PLUS;
const apiKey = process.env.TBK_API_KEY_SECRET || IntegrationApiKeys.WEBPAY;
const environment = process.env.TBK_COMMERCE_CODE ? Environment.Production : Environment.Integration;
const tx = new WebpayPlus.Transaction(new Options(commerceCode, apiKey, environment));

export async function POST(request: Request) {
  // 0. Mitigación contra spam y creación desmedida de transacciones (15 intentos / 10 min)
  const rateLimit = checkRateLimit(request, {
    keyPrefix: 'checkout-init',
    maxRequests: 15,
    windowSeconds: 600,
  });

  if (!rateLimit.allowed && rateLimit.errorResponse) {
    return rateLimit.errorResponse;
  }

  try {
    // 1. Obtenemos la sesión del usuario logueado para vincular la compra
    const session = await getServerSession(authOptions);

    const body = await request.json();
    const {
      customer,
      items,
      documentType,
      shippingCost: rawShippingCost,
      shippingMethod: rawShippingMethod,
      shippingInfo: rawShippingInfo,
    } = body || {};

    if (!customer || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Datos de compra incompletos o carrito vacío.' }, { status: 400 });
    }

    // 2. Validación y sanitización rigurosa de datos del cliente
    if (!customer.email || !isValidEmail(customer.email)) {
      return NextResponse.json({ error: 'El correo electrónico ingresado no es válido.' }, { status: 400 });
    }

    // 2.1 Validación y cálculo del costo de envío
    const isRetiro = rawShippingMethod === 'retiro' || customer?.metodoEntrega === 'retiro';
    let verifiedShippingCost = 0;
    if (!isRetiro && rawShippingCost !== undefined && rawShippingCost !== null) {
      const parsedCost = Number(rawShippingCost);
      if (!isNaN(parsedCost) && parsedCost > 0) {
        verifiedShippingCost = Math.round(parsedCost);
      }
    }

    const cleanCustomer = {
      fullName: sanitizeString(customer.fullName, 100),
      email: sanitizeString(customer.email, 120).toLowerCase(),
      phone: sanitizeString(customer.phone, 30),
      rut: sanitizeString(customer.rut, 20),
      address: sanitizeString(customer.address, 150),
      comuna: sanitizeString(customer.comuna, 80),
      region: sanitizeString(customer.region, 80),
      razonSocial: customer.razonSocial ? sanitizeString(customer.razonSocial, 150) : null,
      giro: customer.giro ? sanitizeString(customer.giro, 150) : null,
      subtotal: 0,
      shippingCost: verifiedShippingCost,
      shippingMethod: isRetiro ? 'retiro' : (rawShippingMethod || 'despacho'),
      shippingInfo: rawShippingInfo || {
        cost: verifiedShippingCost,
        carrier: isRetiro ? 'RETIRO' : 'DESPACHO',
        serviceName: isRetiro ? 'En Tienda' : 'Courier',
        sucursalOficina: isRetiro ? 'Retiro en Tienda - Av. Las Condes 8550' : 'Envío a domicilio'
      }
    };

    // 3. Verificación de Precios contra Base de Datos (Anti Price-Tampering)
    // Extraemos los IDs y SKUs de los productos del carrito
    const identifiers = items
      .map((item: any) => item?.product?.id || item?.product?.sku)
      .filter(Boolean)
      .map((id: any) => String(id));

    const dbProducts = await prisma.product.findMany({
      where: {
        OR: [
          { id: { in: identifiers } },
          { sku: { in: identifiers } },
        ],
      },
    });

    const dbProductMap = new Map<string, any>();
    for (const prod of dbProducts) {
      if (prod.id) dbProductMap.set(prod.id, prod);
      if (prod.sku) dbProductMap.set(prod.sku, prod);
    }

    // Recalcular montos autenticados desde la base de datos
    let verifiedTotalAmount = 0;
    const verifiedItems = [];

    for (const item of items) {
      const prodRef = item?.product;
      const lookupKey = String(prodRef?.id || prodRef?.sku || '');
      const dbProd = dbProductMap.get(lookupKey);

      // Si existe en DB, usar el precio oficial del catálogo en servidor; si no existe, usar el precio de referencia validando que sea número positivo
      const unitPrice = dbProd ? Number(dbProd.price) : Number(prodRef?.price || 0);
      const rawQty = Number(item.quantity);
      const quantity = (!isNaN(rawQty) && rawQty > 0) ? Math.min(100, Math.floor(rawQty)) : 1;

      if (isNaN(unitPrice) || unitPrice < 0) {
        return NextResponse.json({ error: 'Error en el cálculo de precios del pedido.' }, { status: 400 });
      }

      const itemTotal = Math.round(unitPrice * quantity);
      verifiedTotalAmount += itemTotal;

      verifiedItems.push({
        ...item,
        quantity,
        product: {
          ...item.product,
          name: dbProd ? dbProd.name : sanitizeString(prodRef?.name, 150),
          price: unitPrice,
          sku: dbProd ? dbProd.sku : sanitizeString(prodRef?.sku, 50),
        },
      });
    }

    if (verifiedTotalAmount <= 0) {
      return NextResponse.json({ error: 'El monto total del carrito es inválido.' }, { status: 400 });
    }

    // Asignar el subtotal verificado y calcular monto final total con despacho
    cleanCustomer.subtotal = verifiedTotalAmount;
    const finalTotalAmount = verifiedTotalAmount + verifiedShippingCost;

    const shortUuid = crypto.randomUUID().split('-')[0].toUpperCase();
    const buyOrder = `ORD-${shortUuid}`;
    const finalSessionId = `SESSION-${shortUuid}`;
    
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const returnUrl = `${baseUrl}/api/checkout/confirm`;

    // 4. Crear orden vinculando el ID del usuario de la sesión y estado PENDIENTE con datos verificados y monto total exacto
    const order = await prisma.order.create({
      data: {
        buyOrder: buyOrder,
        amount: finalTotalAmount,
        status: 'PENDIENTE',
        shippingStatus: 'PREPARANDO',
        customer: JSON.stringify(cleanCustomer),
        items: JSON.stringify(verifiedItems),
        documentType: documentType === 'FACTURA' ? 'FACTURA' : 'BOLETA',
        razonSocial: cleanCustomer.razonSocial || null,
        giro: cleanCustomer.giro || null,
        userId: session?.user ? (session.user as any).id : null,
      }
    });

    // 5. Iniciar Transbank Webpay Plus con el monto final total (subtotal + envío)
    const response = await tx.create(buyOrder, finalSessionId, finalTotalAmount, returnUrl);

    // 6. Vincular Token
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