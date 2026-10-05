/**
 * Verificación y cotización de costos de envío con Envia.com en el servidor.
 * Protege contra manipulación de tarifas en el cliente (Anti Shipping Tampering).
 */

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

export interface VerifyShippingParams {
  comuna?: string;
  region?: string;
  items: any[];
  carrier?: string;
  clientCost: number;
}

export async function verifyShippingCostWithEnvia({
  comuna,
  region,
  items,
  carrier,
  clientCost,
}: VerifyShippingParams): Promise<{ verifiedCost: number; reCalculated: boolean; serverCost?: number }> {
  if (!comuna || !region || !process.env.ENVIA_API_KEY) {
    return { verifiedCost: clientCost, reCalculated: false };
  }

  try {
    const pesoTotal = (items || []).reduce((acc: number, item: any) => acc + (Number(item?.quantity || 1) * 2), 0);
    const codigoRegionCorto = CODIGOS_REGION[region] || "RM";
    const targetCarrier = (carrier || 'starken').toLowerCase();
    const carriersToQuery = ['starken', 'chilexpress', 'bluexpress'].includes(targetCarrier)
      ? [targetCarrier]
      : ['starken', 'chilexpress', 'bluexpress'];

    const promesas = carriersToQuery.map(async (currCarrier) => {
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
        shipment: { carrier: currCarrier, type: 1 }
      };

      try {
        const res = await fetch('https://api.envia.com/ship/rate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.ENVIA_API_KEY}`
          },
          body: JSON.stringify(payloadEnvia),
          signal: AbortSignal.timeout(6000)
        });

        const data = await res.json();
        if (data.meta !== 'error' && Array.isArray(data.data)) {
          return data.data.map((r: any) => ({
            carrier: (r.carrier || currCarrier).toLowerCase(),
            totalPrice: Number(r.totalPrice)
          }));
        }
        return [];
      } catch {
        return [];
      }
    });

    const results = await Promise.all(promesas);
    const allRates = results.flat();

    if (allRates.length === 0) {
      console.warn(`[SHIPPING] Envia API no devolvió tarifas para ${comuna}, ${region}. Manteniendo clientCost: ${clientCost}`);
      return { verifiedCost: clientCost, reCalculated: false };
    }

    const carrierRates = allRates.filter(r => r.carrier === targetCarrier);
    const applicableRates = carrierRates.length > 0 ? carrierRates : allRates;

    const maxRate = applicableRates.reduce(
      (prev, curr) => (curr.totalPrice > prev.totalPrice ? curr : prev),
      applicableRates[0]
    );
    const serverCost = Math.round(maxRate.totalPrice);

    // Margen de tolerancia razonable: ±$1 por redondeo
    const diff = Math.abs(clientCost - serverCost);
    if (diff <= 1) {
      return { verifiedCost: clientCost, reCalculated: true, serverCost };
    }

    console.warn(`[SHIPPING SECURITY] Discrepancia en costo de envío (${comuna}): Cliente=$${clientCost} vs Servidor=$${serverCost}. Sobrescribiendo con cotización real del servidor.`);
    return { verifiedCost: serverCost, reCalculated: true, serverCost };
  } catch (error) {
    console.error('[SHIPPING] Error verificando cotización con Envia:', error);
    return { verifiedCost: clientCost, reCalculated: false };
  }
}
