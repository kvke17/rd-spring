// lib/simpleapi.ts
type ItemOrden = {
  quantity: number;
  product: { name: string; price: number; id?: string };
};

type ClienteOrden = {
  fullName?: string;
  rut?: string;
  address?: string;
  comuna?: string;
  email?: string;
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

export async function emitirDTE(order: OrdenParaDTE): Promise<ResultadoDTE> {
  const customer: ClienteOrden = JSON.parse(order.customer);
  const items: ItemOrden[] = JSON.parse(order.items);
  
  const esFactura = order.documentType === 'FACTURA';
  const tipoDte = esFactura ? 33 : 39; 

  const rutEmisor = process.env.SIMPLE_RUT_EMBISOR; 
  const rutContribuyente = process.env.SIMPLE_RUT_CONTRIBUYENTE || rutEmisor;
  const sucursal = process.env.SIMPLE_SUCURSAL || "Casa Matriz";
  const ambiente = process.env.SIMPLE_AMBIENTE || "1"; 

  if (!rutEmisor) {
    throw new Error("Falta configurar SIMPLE_RUT_EMBISOR en las variables de entorno.");
  }

  // 1. Mapeo de detalles según SimpleFactura
  const detallesDTE = items.map((item, index) => ({
    nroLinDet: index + 1,
    nombre: item.product.name.substring(0, 40),
    descripcion: item.product.name,
    cantidad: item.quantity,
    precio: item.product.price,
    montoItem: item.quantity * item.product.price
  }));

  // 2. Estructura oficial del payload
  const body = {
    credenciales: {
      rutEmisor: rutEmisor,
      rutContribuyente: rutContribuyente
    },
    dte: {
      encabezado: {
        idDoc: { tipoDTE: tipoDte },
        receptor: esFactura
          ? {
              RUTRecep: customer.rut,
              RznSocRecep: order.razonSocial || customer.fullName,
              GiroRecep: order.giro,
              DirRecep: customer.address,
              CmnaRecep: customer.comuna,
            }
          : {
              RUTRecep: customer.rut || "66666666-6",
              RznSocRecep: customer.fullName || "Cliente Web",
              DirRecep: customer.address || "Sin dirección",
              CmnaRecep: customer.comuna || "Santiago"
            },
      },
      detalle: detallesDTE
    },
    ambiente: Number(ambiente)
  };

  const targetUrl = `https://api.simplefactura.cl/invoiceV2/${encodeURIComponent(sucursal)}`;

  const res = await fetch(targetUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(body),
  });

  const rawText = await res.text();
  let data: any = null;
  try {
    data = rawText ? JSON.parse(rawText) : null;
  } catch {
    // Ignorar si no es JSON
  }

  if (!res.ok) {
    throw new Error(`SimpleFactura respondió ${res.status}: ${rawText.slice(0, 200)}`);
  }

  return {
    folio: data?.folio ?? data?.Folio ?? null,
    pdfUrl: data?.pdf ?? data?.UrlPdf ?? null,
    tipoDte,
    raw: data,
  };
}