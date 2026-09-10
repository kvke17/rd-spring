export const dynamic = 'force-dynamic'; // Evita que Next.js congele la pantalla

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma'; // 🚨 AQUÍ ESTÁ LA MAGIA, USAMOS TURSO

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "ACCESO DENEGADO" }, { status: 401 });
  }

  try {
    const dbOrders = await prisma.order.findMany({ orderBy: { createdAt: 'desc' } });

    const orders = dbOrders.map(order => {
      let customerName = "Cliente";
      let customerEmail = "Sin email";
      try {
        const customerData = JSON.parse(order.customer);
        customerName = customerData.name || "Cliente";
        customerEmail = customerData.email || "Sin email";
      } catch (e) {}

      return {
        buyOrder: order.buyOrder,
        amount: order.amount,
        shippingStatus: order.shippingStatus,
        createdAt: order.createdAt,
        customerName,
        customerEmail,
        itemsSummary: "Ver detalle", 
      };
    });

    return NextResponse.json({ orders });
  } catch (error) {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}