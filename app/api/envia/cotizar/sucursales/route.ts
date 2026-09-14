import { NextResponse } from 'next/server';

const CODIGOS_REGION: Record<string, string> = {
  "Metropolitana de Santiago": "RM",
  "Valparaíso": "VS",
  "Biobío": "BI",
  // (Puedes dejar las principales o usar el mismo diccionario que ya tienes)
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { carrier, comuna, region } = body;

    // Envia.com tiene un endpoint para listar oficinas/sucursales (pickup/dropoff o offices)
    const payload = {
      carrier: carrier, // ej: "starken" o "chilexpress"
      country: "CL",
      state: CODIGOS_REGION[region] || "RM",
      city: comuna
    };

    const res = await fetch('https://api.envia.com/ship/offices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ENVIA_API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    return NextResponse.json({ offices: data.data || [] });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ offices: [] }, { status: 500 });
  }
}