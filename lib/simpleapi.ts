// lib/simpleapi.ts
type ItemOrden = {
  quantity: number;
  product: { name: string; price: number };
};

type ClienteOrden = {
  fullName?: string;
  rut?: string;
  address?: string;
  comuna?: string;
};

type OrdenParaDTE = {
  buyOrder: string;
  documentType: string;
  razonSocial: string | null;
  giro: string | null;
  customer: string;
  items: string;
};

export type ResultadoDTE = {
  folio: number | null;
  pdfUrl: string | null;
  tipoDte: number;
  raw: unknown;
};

const RUT_GENERICO_BOLETA = '66666666-6';

export async function emitirDTE(order: OrdenParaDTE): Promise<ResultadoDTE> {
  const customer: ClienteOrden = JSON.parse(order.customer);
  const items: ItemOrden[] = JSON.parse(order.items);
  const esFactura = order.documentType === 'FACTURA';
  const tipoDte = esFactura ? 33 : 39; 

  const rutEmisor = process.env.SIMPLE_RUT_EMISOR || "";

  // 1. Calculamos el Total
  let mntTotal = 0;
  const detalle = items.map((item, index) => {
    const qty = item.quantity;
    const price = Math.round(item.product.price);
    const monto = qty * price;
    mntTotal += monto;
    
    return {
      NroLinDet: index + 1,
      NmbItem: item.product.name.substring(0, 80),
      QtyItem: qty,
      PrcItem: price,
      MontoItem: monto
    };
  });

  // 2. Estructura OFICIAL de Simple API (Todo dentro de "Documento")
  const body = {
    Documento: {
      Encabezado: {
        IdentificacionDTE: {
          TipoDTE: tipoDte,
        },
        Emisor: {
          RutEmisor: rutEmisor 
        },
        Receptor: esFactura
          ? {
              RutRecep: customer.rut,
              RznSocRecep: order.razonSocial || customer.fullName || "Cliente",
              GiroRecep: order.giro || "Particular",
              DirRecep: customer.address || "Sin dirección",
              CmnaRecep: customer.comuna || "Santiago",
            }
          : {
              RutRecep: customer.rut || RUT_GENERICO_BOLETA,
              RznSocRecep: customer.fullName || "Cliente Web",
            },
        Totales: {
          MontoTotal: mntTotal,
          MntTotal: mntTotal
        }
      },
      Detalle: detalle
    }
  };

  const apiKey = process.env.SIMPLE_API_KEY || "";
  const apiUrl = process.env.SIMPLE_API_URL || "https://api.simpleapi.cl/api/v1/dte/generar";

  console.log("=== ENVIANDO A SIMPLE API ===");
  console.log("Payload:", JSON.stringify(body));

  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      // 🚨 AQUÍ ESTÁ LA CORRECCIÓN: La llave limpia, tal como te la dio tu cliente.
      'Authorization': apiKey, 
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body),
  });

  const rawText = await res.text();
  console.log("=== RESPUESTA DE SIMPLE API ===");
  console.log("Status:", res.status);
  console.log("Body:", rawText);

  let data: any = null;
  try {
    data = rawText ? JSON.parse(rawText) : null;
  } catch {}

  if (!res.ok) {
    throw new Error(`Código ${res.status}. Detalle: ${rawText.slice(0, 300)}`);
  }

  return {
    folio: data?.folio ?? data?.Folio ?? null,
    pdfUrl: data?.urlPdf ?? data?.UrlPdf ?? data?.pdf ?? null,
    tipoDte,
    raw: data,
  };
}