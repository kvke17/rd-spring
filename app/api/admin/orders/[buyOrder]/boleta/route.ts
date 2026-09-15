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

    // Variables de entorno para SimpleFactura
    const rutEmisor = process.env.SIMPLE_RUT_EMBISOR; // Ej: 78181331-1 (Sin puntos, con guión)
    const rutContribuyente = process.env.SIMPLE_RUT_CONTRIBUYENTE; 
    const sucursal = process.env.SIMPLE_SUCURSAL || "Casa Matriz";
    const ambiente = process.env.SIMPLE_AMBIENTE || "1"; // 0: Certificación, 1: Producción

    if (!rutEmisor) {
      return NextResponse.json({ 
        error: "Falta configurar el RUT del emisor de SimpleFactura en las variables de entorno (SIMPLE_RUT_EMBISOR)." 
      }, { status: 400 });
    }

    // 1. Mapeo de los detalles de productos según el formato de SimpleFactura
    const detallesDTE = items.map((item: any, index: number) => ({
      nroLinDet: index + 1,
      nombre: item.product.name.substring(0, 40),
      descripcion: item.product.name,
      cantidad: item.quantity,
      precio: item.product.price,
      montoItem: item.quantity * item.product.price
    }));

    // 2. Estructura oficial del payload que exige SimpleFactura para emitir DTE / Boleta (Tipo 39)
    const simplePayload = {
      credenciales: {
        rutEmisor: rutEmisor,
        rutContribuyente: rutContribuyente || rutEmisor
      },
      dte: {
        encabezado: {
          idDoc: {
            tipoDTE: 39 // 39 = Boleta Electrónica
          },
          receptor: {
            rutRecep: customer.rut || "66666666-6",
            rznSocRecep: customer.fullName || "Cliente Web",
            dirRecep: customer.address || "Sin dirección",
            cmnaRecep: customer.comuna || "Santiago"
          }
        },
        detalle: detallesDTE
      },
      ambiente: Number(ambiente)
    };

    // Endpoint oficial de emisión en SimpleFactura
    const targetUrl = `https://api.simplefactura.cl/invoiceV2/${encodeURIComponent(sucursal)}`;

    const simpleResponse = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(simplePayload)
    });

    if (simpleResponse.ok) {
      const responseData = await simpleResponse.json();
      const folioGenerado = responseData.folio || responseData.Folio || "Emitido";
      const urlPdf = responseData.pdf || responseData.UrlPdf || "";

      return NextResponse.json({ 
        success: true, 
        message: `Boleta emitida con éxito en SimpleFactura (Folio: ${folioGenerado})`,
        folio: folioGenerado,
        pdf: urlPdf
      });
    } else {
      const errorText = await simpleResponse.text();
      console.error("Error SimpleFactura API Admin:", errorText);
      return NextResponse.json({ error: `Error de SimpleFactura: ${errorText}` }, { status: 400 });
    }

  } catch (error: any) {
    console.error('Error al emitir boleta con SimpleFactura:', error);
    return NextResponse.json({ error: error.message || "Error interno al generar boleta" }, { status: 500 });
  }
}