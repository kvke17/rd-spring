import { NextResponse } from 'next/server';

const CODIGOS_REGION: Record<string, string> = {
  "Arica y Parinacota": "AP",
  "Tarapacá": "TA",
  "Antofagasta": "AN",
  "Atacama": "AT",
  "Coquimbo": "CO",
  "Valparaíso": "VS",
  "Metropolitana de Santiago": "RM",
  "Libertador Gral. Bernardo O'Higgins": "LI",
  "Maule": "ML",
  "Ñuble": "NB",
  "Biobío": "BI",
  "La Araucanía": "AR",
  "Los Ríos": "LR",
  "Los Lagos": "LL",
  "Aysén del Gral. Carlos Ibáñez del Campo": "AI",
  "Magallanes y de la Antártica Chilena": "MA"
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { comuna, region, items } = body;

    const pesoTotal = items.reduce((acc: number, item: any) => acc + (item.quantity * 2), 0);
    const codigoRegionCorto = CODIGOS_REGION[region] || "RM";
    const carriersActivos = ["starken", "chilexpress", "bluexpress"];

    const promesasCotizacion = carriersActivos.map(async (carrier) => {
      const payloadEnvia = {
        origin: {
          name: "RD Spring",
          company: "RD Spring",
          email: "contacto@rdspring.cl",
          phone: "912345678",
          street: "Av. Principal 123", 
          district: "Santiago",
          city: "Santiago",
          state: "RM",
          country: "CL",
          postalCode: "8320000",
        },
        destination: {
          name: "Cliente",
          company: "",
          email: "",
          phone: "",
          street: "Dirección de destino",
          district: comuna,
          city: comuna,
          state: codigoRegionCorto,
          country: "CL",
          postalCode: "0000000",
        },
        packages: [
          {
            content: "Repuestos de alta gama",
            amount: 1,
            type: "box",
            dimensions: { length: 30, width: 20, height: 20 },
            weight: pesoTotal || 1, 
            weightUnit: "KG",
            lengthUnit: "CM",
          }
        ],
        shipment: { carrier: carrier, type: 1 }
      };

      try {
        const enviaRes = await fetch('https://api.envia.com/ship/rate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.ENVIA_API_KEY}`
          },
          body: JSON.stringify(payloadEnvia)
        });

        const data = await enviaRes.json();
        
        if (data.meta !== 'error' && data.data) {
          return data.data.map((rate: any) => ({
            carrier: rate.carrier,
            serviceName: 'Envío a Domicilio',
            deliveryEstimate: rate.deliveryEstimate || '1-3 días hábiles',
            totalPrice: rate.totalPrice
          }));
        }
        return []; 
      } catch (error) {
        return []; 
      }
    });

    const resultadosPorCarrier = await Promise.all(promesasCotizacion);
    const todasLasTarifas = resultadosPorCarrier.flat();

    // SELECCIONAMOS LA TARIFA MÁS ALTA (DOMICILIO) POR CADA COURIER
    const tarifasUnicasPorCarrier = Object.values(
      todasLasTarifas.reduce((acc: Record<string, any>, tarifa: any) => {
        if (!acc[tarifa.carrier] || tarifa.totalPrice > acc[tarifa.carrier].totalPrice) {
          acc[tarifa.carrier] = tarifa;
        }
        return acc;
      }, {})
    );

    if (tarifasUnicasPorCarrier.length === 0) {
      return NextResponse.json({ error: 'No se encontraron tarifas de domicilio para esta ruta' }, { status: 400 });
    }

    return NextResponse.json({ rates: tarifasUnicasPorCarrier }); 

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error interno al procesar paralelo' }, { status: 500 });
  }
}