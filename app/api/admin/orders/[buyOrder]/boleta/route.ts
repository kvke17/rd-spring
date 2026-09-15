import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { emitirDTE } from '@/lib/simpleapi';

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

    if (order.dteEstado === "EMITIDO") {
      return NextResponse.json({ error: "Esta orden ya tiene una boleta o factura emitida exitosamente." }, { status: 400 });
    }

    // Usamos EXACTAMENTE la misma función que el checkout automático
    const dteResult = await emitirDTE({
      buyOrder: order.buyOrder,
      documentType: order.documentType,
      razonSocial: order.razonSocial,
      giro: order.giro,
      customer: order.customer,
      items: order.items
    });

    // Si fue exitoso, actualizamos la orden en la base de datos
    await prisma.order.update({
      where: { id: order.id },
      data: {
        dteEstado: 'EMITIDO',
        dteFolio: dteResult.folio,
        dteTipoDte: dteResult.tipoDte,
        dtePdfUrl: dteResult.pdfUrl,
        dteError: null
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: `Boleta emitida con éxito en Simple API (Folio: ${dteResult.folio})`,
      folio: dteResult.folio,
      pdf: dteResult.pdfUrl
    });

  } catch (error: any) {
    console.error('Error desde el Admin al emitir boleta:', error);
    
    // Si falla, guardamos el error en la base de datos para que lo puedas leer
    try {
        const { buyOrder } = await params;
        await prisma.order.update({
            where: { buyOrder },
            data: { dteEstado: 'ERROR', dteError: String(error?.message || error) }
        });
    } catch (dbError) {
        console.error("No se pudo actualizar el estado de error en la BD:", dbError);
    }

    return NextResponse.json({ error: error.message || "Error interno al generar boleta" }, { status: 500 });
  }
}