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

// 🛡️ Mantiene la función que asegura el guion en el RUT
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

  // 1. Calcular Totales
  let montoTotal = 0;
  
  // 🚨 Usamos las etiquetas exactas del JSON oficial
  const detalles = items.map((item) => {
    const cantidad = item.quantity;
    const precio = Math.round(item.product.price);
    const montoItem = cantidad * precio;
    montoTotal += montoItem;
    
    return {
      IndicadorExento: 0,
      Nombre: item.product.name.substring(0, 80),
      Cantidad: cantidad,
      Precio: precio,
      MontoItem: montoItem
    };
  });

  const montoNeto = Math.round(montoTotal / 1.19);
  const iva = montoTotal - montoNeto;

  // 2. Estructura idéntica al JSON de documentacion.simpleapi.cl
  const body = {
    Documento: {
      Encabezado: {
        IdentificacionDTE: {
          TipoDTE: tipoDte,
          FechaEmision: fechaHoy,
          FormaPago: 1
        },
        Emisor: {
          Rut: rutEmisor
        },
        Receptor: esFactura
          ? {
              Rut: receptorRut,
              RazonSocial: order.razonSocial || customer.fullName || "Cliente",
              Giro: order.giro || "Particular",
              Direccion: customer.address || "Sin dirección",
              Comuna: customer.comuna || "Santiago"
            }
          : {
              Rut: receptorRut,
              RazonSocial: customer.fullName || "Cliente Web"
            },
        Totales: {
          MontoNeto: montoNeto,
          TasaIVA: 19,
          IVA: iva,
          MontoTotal: montoTotal
        }
      },
      Detalles: detalles // Ojo: Va en plural como pide la documentación
    }
  };

  const apiKey = process.env.SIMPLE_API_KEY || "";
  const apiUrl = process.env.SIMPLE_API_URL || "https://api.simpleapi.cl/api/v1/dte/generar";

  console.log("=== ENVIANDO A SIMPLE API ===");
  console.log("RUT Emisor:", rutEmisor);
  console.log("Payload:", JSON.stringify(body));

  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': apiKey, // La llave ya demostró que funciona limpia
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