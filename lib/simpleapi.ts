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

// Función para asegurar el formato correcto del RUT (12345678-9)
function formatearRutAPI(rut: string | undefined | null): string {
  if (!rut) return "";
  const cleanRut = rut.replace(/[^0-9kK]/g, '').toUpperCase();
  if (cleanRut.length < 2) return cleanRut;
  return `${cleanRut.slice(0, -1)}-${cleanRut.slice(-1)}`;
}

export async function emitirDTE(order: OrdenParaDTE): Promise<ResultadoDTE> {
  const customer: ClienteOrden = JSON.parse(order.customer);
  const items: ItemOrden[] = JSON.parse(order.items);
  const esFactura = order.documentType === 'FACTURA';
  const tipoDte = esFactura ? 33 : 39; 

  const rutEmisor = formatearRutAPI(process.env.SIMPLE_RUT_EMISOR);
  const receptorRut = customer.rut ? formatearRutAPI(customer.rut) : RUT_GENERICO_BOLETA;
  const fechaHoy = new Date().toISOString().split('T')[0];

  // 1. Calcular el Total
  let mntTotal = 0;
  const detalle = items.map((item, index) => {
    const qty = item.quantity;
    const price = Math.round(item.product.price);
    const monto = qty * price;
    mntTotal += monto;
    
    // Mapeo exacto al XML (<NroLinDet>, <NmbItem>, etc.)
    return {
      NroLinDet: index + 1,
      NmbItem: item.product.name.substring(0, 80),
      QtyItem: qty,
      PrcItem: price,
      MontoItem: monto
    };
  });

  // 2. Estructura JSON como espejo exacto del XML
  const body = {
    Encabezado: {
      IdDoc: {
        TipoDTE: tipoDte,
        FchEmis: fechaHoy,
        FmaPago: 1
      },
      Emisor: {
        RUTEmisor: rutEmisor
      },
      Receptor: esFactura
        ? {
            RUTRecep: receptorRut,
            RznSocRecep: order.razonSocial || customer.fullName || "Cliente",
            GiroRecep: order.giro || "Particular",
            DirRecep: customer.address || "Sin dirección",
            CmnaRecep: customer.comuna || "Santiago",
          }
        : {
            RUTRecep: receptorRut,
            RznSocRecep: customer.fullName || "Cliente Web",
          },
      Totales: {
        MntTotal: mntTotal // Etiqueta exacta del XML
      }
    },
    Detalle: detalle // Etiqueta exacta del XML (Singular)
  };

  const apiKey = process.env.SIMPLE_API_KEY || "";
  const apiUrl = process.env.SIMPLE_API_URL || "https://api.simpleapi.cl/api/v1/dte/generar";

  // Nos aseguramos de enviar la llave tal cual la tienes en Vercel. 
  // (Si en Vercel la guardaste con la palabra Bearer, pasará con Bearer. Si no, pasará limpia).
  const authHeader = apiKey;

  console.log("=== ENVIANDO A SIMPLE API ===");
  console.log("RUT Emisor:", rutEmisor);
  console.log("Payload:", JSON.stringify(body));

  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': authHeader, 
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