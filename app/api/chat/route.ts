import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

// Inicializamos el SDK con tu llave
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export async function POST(request: Request) {
  try {
    const { mensaje } = await request.json();

    if (!mensaje) {
      return NextResponse.json({ error: 'Mensaje vacío' }, { status: 400 });
    }

    const promptContexto = `
      Eres el asistente de ventas experto de 'RD Spring', distribuidor oficial de aceites de motor ROWE en Chile y especialistas en suspensión de alto rendimiento.
      
      REGLAS DE ORO OBLIGATORIAS:
      1. ACEITES: Recomiendas y hablas de aceites ROWE para Porsche, BMW, Audi y Land Rover.
      2. SUSPENSIÓN (LA EXCEPCIÓN): SÍ vendemos repuestos de suspensión (amortiguadores, resortes, espirales, etc.) para estas marcas de lujo. Si el usuario pregunta por suspensión, dile que deben cotizarlo y obligatoriamente incluye EXACTAMENTE esta palabra clave al final de tu respuesta: [BOTON_COTIZAR].
      3. CERO OTROS REPUESTOS: NO vendemos filtros, frenos, bujías ni otras piezas de motor. Si piden esto, niégalo amablemente recordando que somos especialistas solo en lubricantes y suspensión.
      4. ESTADO DE PEDIDOS: Si preguntan por un pedido (ej: #1024), diles: "Para ver el estado exacto, ingresa a 'Mi Cuenta' en el menú principal o contáctanos en soporte."
      5. Tono: Profesional, directo, experto automotriz de alta gama.

      El usuario dice: "${mensaje}"
    `;

    let text = "";

    // Le damos a Google un máximo de 5 segundos para responder por intento
    const configuracionRed = { timeout: 5000 };

    try {
      // Intento 1: El modelo principal (3.6)
      const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' }, configuracionRed);
      const result = await model.generateContent(promptContexto);
      text = result.response.text();
      
    } catch (error: any) {
      console.warn("Modelo 3.6 lento o saturado, intentando 3.8...");
      
      try {
        // Intento 2: El modelo de respaldo (3.8) con los mismos 5 segundos
        const fallbackModel = genAI.getGenerativeModel({ model: 'gemini-3.8-flash' }, configuracionRed);
        const result = await fallbackModel.generateContent(promptContexto);
        text = result.response.text();
        
      } catch (fallbackError) {
        console.error("Ambos modelos fallaron por tráfico de Google.");
        // Intento 3: Respuesta de emergencia sin romper la página
        return NextResponse.json({ 
          respuesta: "Nuestros mecánicos están todos ocupados en el taller en este momento. Por favor, inténtalo de nuevo en un par de minutos o envíanos un mensaje a Soporte." 
        });
      }
    }

    return NextResponse.json({ respuesta: text });

  } catch (error) {
    return NextResponse.json({ 
      respuesta: "Sistema en mantenimiento temporal. Vuelve a intentar en breve." 
    }, { status: 200 }); // Devolvemos 200 para que el frontend lo procese como mensaje y no explote
  }
}

