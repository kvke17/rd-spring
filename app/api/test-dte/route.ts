// app/api/test-dte/route.ts
//
// SOLO PARA PRUEBAS — bórrala cuando termines de verificar la integración.
// Visita http://localhost:3000/api/test-dte con el servidor corriendo
// (npm run dev) y verás en pantalla la respuesta cruda de SimpleAPI.

import { NextResponse } from 'next/server';
import { emitirDTE } from '@/lib/simpleapi';

export async function GET() {
  const ordenDePrueba = {
    buyOrder: 'TEST-001',
    documentType: 'BOLETA',
    razonSocial: null,
    giro: null,
    customer: JSON.stringify({ fullName: 'Cliente de Prueba', rut: '11111111-1' }),
    items: JSON.stringify([
      { quantity: 1, product: { name: 'Producto de prueba', price: 1000 } },
    ]),
  };

  try {
    const resultado = await emitirDTE(ordenDePrueba);
    // resultado.raw trae la respuesta ORIGINAL de SimpleAPI, sin procesar.
    // Compárala con resultado.folio / resultado.pdfUrl para confirmar si
    // los nombres de campo que asumí en lib/simpleapi.ts son correctos.
    return NextResponse.json(resultado);
  } catch (error: any) {
    console.error('=== ERROR EN /api/test-dte ===', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}