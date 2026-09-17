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

  // 🚨 OJO: Lee el RUT de tu empresa desde Vercel
  const rutEmisor = process.env.SIMPLE_RUT_EMISOR || "";

  // Estructura oficial y exacta para Simple API
  const body = {
    Encabezado: {
      IdentificacionDTE: { // Nombre exacto que pide Simple API
        TipoDTE: tipoDte 
      },
      Emisor: {
        RutEmisor: rutEmisor // El RUT de RD Spring
      },
      Receptor: esFactura
        ? {
            RutRecep: customer.rut,
            RznSocRecep: order.razonSocial || customer.fullName,
            GiroRecep: order.giro || "Particular",
            DirRecep: customer.address || "Sin dirección",
            CmnaRecep: customer.comuna || "Santiago",
          }
        : {
            RutRecep: customer.rut || RUT_GENERICO_BOLETA,
            RznSocRecep: customer.fullName || "Cliente Web",
          },
    },
    Detalle: items.map((item, index) => ({
      NroLinDet: index + 1,
      NmbItem: item.product.name.substring(0, 80),
      QtyItem: item.quantity,
      PrcItem: item.product.price,
      MontoItem: item.quantity * item.product.price // Obligatorio: Cantidad x Precio
    })),
  };

  const apiKey = process.env.SIMPLE_API_KEY || "";

  const res = await fetch(process.env.SIMPLE_API_URL as string, {
    method: 'POST',
    headers: {
      'Authorization': apiKey,
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
    folio: data?.folio ?? data?.Folio ?? null,
    pdfUrl: data?.urlPdf ?? data?.UrlPdf ?? data?.pdf ?? null,
    tipoDte,
    raw: data,
  };
}