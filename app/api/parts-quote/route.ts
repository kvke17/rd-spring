import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { STORE_CONFIG } from '@/config/constants';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { name, email, phone, vehicle, vin, partNeeded } = await request.json();

    if (!name || !email || !phone || !partNeeded) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY no configurada: la solicitud de repuesto no se envió por correo.', { email, partNeeded });
      return NextResponse.json({ error: 'El servicio de correo no está configurado' }, { status: 503 });
    }

    await resend.emails.send({
      from: 'RD Spring Cotizaciones <contacto@rdspring.cl>',
      to: [STORE_CONFIG.CONTACT_EMAIL],
      subject: `Nueva solicitud de cotización de repuesto`,
      html: `
        <h2>Nueva solicitud de cotización de repuesto</h2>
        <p><strong>Nombre:</strong> ${name}<br/><strong>Email:</strong> ${email}<br/><strong>Teléfono:</strong> ${phone}</p>
        <p><strong>Vehículo:</strong> ${vehicle || 'No especificado'}</p>
        <p><strong>N° de Chasis (VIN):</strong> ${vin || 'No especificado'}</p>
        <p><strong>Repuesto solicitado:</strong><br/>${partNeeded}</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error enviando solicitud de cotización de repuesto:', error);
    return NextResponse.json({ error: 'Error interno al procesar la solicitud' }, { status: 500 });
  }
}
