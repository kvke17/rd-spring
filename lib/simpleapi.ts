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

  // 🚨 FORMATO ESTRICTO SII: Respetando mayúsculas exactas
  const body = {
    Encabezado: {
      IdDoc: {
        TipoDTE: tipoDte,
      },
      Emisor: {
        RUTEmisor: rutEmisor // OJO: Las tres primeras en mayúscula
      },
      Receptor: esFactura
        ? {
            RUTRecep: customer.rut,
            RznSocRecep: order.razonSocial || customer.fullName || "Cliente",
            GiroRecep: order.giro || "Particular",
            DirRecep: customer.address || "Sin dirección",
            CmnaRecep: customer.comuna || "Santiago",
          }
        : {
            RUTRecep: customer.rut || RUT_GENERICO_BOLETA,
            RznSocRecep: customer.fullName || "Cliente Web",
          },
    },
    Detalle: items.map((item, index) => {
      const qty = item.quantity;
      const price = Math.round(item.product.price); // Previene caída por decimales
      return {
        NroLinDet: index + 1,
        NmbItem: item.product.name.substring(0, 80), // Corta nombres muy largos
        QtyItem: qty,
        PrcItem: price,
        MontoItem: qty * price
      };
    }),
  };

  const apiKey = process.env.SIMPLE_API_KEY || "";
  const apiUrl = process.env.SIMPLE_API_URL || "https://api.simpleapi.cl/api/v1/dte/generar";

  // LOGS PARA DEBUG: Veremos esto en Vercel si llega a fallar
  console.log("=== ENVIANDO A SIMPLE API ===");
  console.log("RUT Emisor detectado:", rutEmisor);
  console.log("Payload:", JSON.stringify(body));

  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: {
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
    // Esto hará que el panel rojo te muestre EL MOTIVO REAL del error
    throw new Error(`Código ${res.status}. Detalle: ${rawText.slice(0, 300)}`);
  }

  return {
    folio: data?.folio ?? data?.Folio ?? null,
    pdfUrl: data?.urlPdf ?? data?.UrlPdf ?? data?.pdf ?? null,
    tipoDte,
    raw: data,
  };
}