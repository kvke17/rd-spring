import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // Importamos las opciones

const prisma = new PrismaClient();

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ buyOrder: string }> }
) {
  // Le pasamos authOptions
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "ACCESO DENEGADO" }, { status: 401 });
  }

  try {
    const { buyOrder } = await params;
    const body = await request.json();
    const { shippingStatus } = body;

    const updatedOrder = await prisma.order.update({
      where: { buyOrder },
      data: { shippingStatus }
    });

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    return NextResponse.json({ error: "Error al actualizar el estado" }, { status: 500 });
  }
}