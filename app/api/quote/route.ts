import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { STORE_CONFIG } from '@/config/constants';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { name, email, phone, rut, vehicle, partNeeded } = await request.json();

    if (!name || !email || !phone || !partNeeded) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY no configurada: la cotización no se envió por correo.', { email, partNeeded });
      return NextResponse.json({ error: 'El servicio de correo no está configurado' }, { status: 503 });
    }

    const emailData = await resend.emails.send({
      from: 'RD Spring Cotizaciones <contacto@rdspring.cl>',
      to: [STORE_CONFIG.CONTACT_EMAIL],
      subject: `Nueva solicitud de cotización de repuesto`,
      html: `
        <h2>Nueva Solicitud de Cotización de Repuesto</h2>
        <p><strong>Repuesto solicitado:</strong><br/>${partNeeded}</p>
        <hr />
        <h3>Datos del Cliente</h3>
        <ul>
          <li><strong>Nombre:</strong> ${name}</li>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Teléfono:</strong> ${phone}</li>
          <li><strong>RUT:</strong> ${rut || 'No especificado'}</li>
          <li><strong>Vehículo:</strong> ${vehicle || 'No especificado'}</li>
        </ul>
      `,
    });

    return NextResponse.json({ success: true, data: emailData });
  } catch (error) {
    console.error('Error enviando cotización:', error);
    return NextResponse.json({ error: 'Error interno al procesar la cotización' }, { status: 500 });
  }
}
