import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ buyOrder: string }> }
) {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "ACCESO DENEGADO" }, { status: 401 });
  }

  try {
    const { buyOrder } = await params;

    const order = await prisma.order.findUnique({
      where: { buyOrder }
    });

    if (!order) {
      return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });
    }

    const items = JSON.parse(order.items as string);
    const customer = JSON.parse(order.customer as string);

    if (!process.env.SIMPLE_API_URL || !process.env.SIMPLE_API_KEY) {
      return NextResponse.json({ error: "Faltan las credenciales de Simple API en las variables de entorno" }, { status: 500 });
    }

    const detallesBoleta = items.map((item: any, index: number) => ({
      NroLinDet: index + 1,
      NmbItem: item.product.name,
      QtyItem: item.quantity,
      PrcItem: item.product.price,
      MontoItem: item.quantity * item.product.price
    }));

    const boletaPayload = {
      Documento: {
        Encabezado: {
          IdDoc: { TipoDTE: 39 },
          Receptor: {
            RUTRecep: customer.rut || "66666666-6",
            RznSocRecep: customer.fullName || "Cliente Web",
            DirRecep: customer.address || "Sin dirección",
            CmnaRecep: customer.comuna || "Santiago"
          }
        },
        Detalle: detallesBoleta
      }
    };

    const boletaResponse = await fetch(process.env.SIMPLE_API_URL as string, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${process.env.SIMPLE_API_KEY}` 
      },
      body: JSON.stringify(boletaPayload)
    });

    if (boletaResponse.ok) {
      const boletaData = await boletaResponse.json();
      const folioBoleta = boletaData.folio || boletaData.Folio || "Generado";
      const linkPdfBoleta = boletaData.pdf || boletaData.UrlPdf || "";

      return NextResponse.json({ 
        success: true, 
        message: `Boleta emitida con éxito (Folio: ${folioBoleta})`,
        folio: folioBoleta,
        pdf: linkPdfBoleta
      });
    } else {
      const errorText = await boletaResponse.text();
      console.error("Error Simple API Admin:", errorText);
      return NextResponse.json({ error: `Error del proveedor de boletas: ${errorText}` }, { status: 400 });
    }

  } catch (error: any) {
    console.error('Error al emitir boleta manual:', error);
    return NextResponse.json({ error: error.message || "Error interno al generar boleta" }, { status: 500 });
  }
}