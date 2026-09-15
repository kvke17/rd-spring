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

  // Estructura oficial exacta para Simple API (simpleapi.cl)
  const body = {
    Encabezado: {
      IdDoc: { TipoDTE: tipoDte },
      Receptor: esFactura
        ? {
            RUTRecep: customer.rut,
            RznSocRecep: order.razonSocial || customer.fullName,
            GiroRecep: order.giro || "Particular",
            DirRecep: customer.address || "Sin dirección",
            CmnaRecep: customer.comuna || "Santiago",
          }
        : {
            RUTRecep: customer.rut || RUT_GENERICO_BOLETA,
            RznSocRecep: customer.fullName || "Cliente Web",
          },
    },
    Detalle: items.map((item, index) => ({
      NroLinDet: index + 1,
      NmbItem: item.product.name.substring(0, 80),
      QtyItem: item.quantity,
      PrcItem: item.product.price,
    })),
  };

  const apiKey = process.env.SIMPLE_API_KEY || "";

  // Hay APIs que piden la llave directa y otras con "Bearer". 
  // Según la FAQ de Simple API, a veces va directo, pero si vuelve a dar 401 
  // cambiaremos esta línea a: `Bearer ${apiKey}` o Basic Auth.
  const authHeader = apiKey; 

  const res = await fetch(process.env.SIMPLE_API_URL as string, {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body),
  });

  const rawText = await res.text();
  let data: any = null;
  try {
    data = rawText ? JSON.parse(rawText) : null;
  } catch {}

  if (!res.ok) {
    throw new Error(`Simple API respondió ${res.status}: ${rawText.slice(0, 200)}`);
  }

  return {
    // Simple API suele devolver estos campos, ajustamos por si vienen en mayúscula o minúscula
    folio: data?.folio ?? data?.Folio ?? null,
    pdfUrl: data?.urlPdf ?? data?.UrlPdf ?? data?.pdf ?? null,
    tipoDte,
    raw: data,
  };
}