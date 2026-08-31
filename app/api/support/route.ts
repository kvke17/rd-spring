import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { STORE_CONFIG } from '@/config/constants';

const resend = new Resend(process.env.RESEND_API_KEY);

const MOTIVO_LABELS: Record<string, string> = {
  general: 'Consulta general',
  compatibilidad: 'Compatibilidad de repuesto',
  cotizacion: 'Cotización',
  garantia: 'Garantía',
  otro: 'Otro',
};

export async function POST(request: Request) {
  try {
    const { name, email, motivo, vehicle, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY no configurada: la consulta de soporte no se envió por correo.', { email, motivo });
      return NextResponse.json({ error: 'El servicio de correo no está configurado' }, { status: 503 });
    }

    const motivoLabel = MOTIVO_LABELS[motivo] || 'Consulta general';

    await resend.emails.send({
      from: 'RD Spring Soporte <contacto@rdspring.cl>',
      to: [STORE_CONFIG.CONTACT_EMAIL],
      subject: `Nueva consulta de Soporte: ${motivoLabel}`,
      html: `
        <h2>Nueva consulta de Soporte</h2>
        <p><strong>Motivo:</strong> ${motivoLabel}</p>
        <p><strong>Nombre:</strong> ${name}<br/><strong>Email:</strong> ${email}</p>
        ${vehicle ? `<p><strong>Vehículo / Chasis:</strong> ${vehicle}</p>` : ''}
        <p><strong>Mensaje:</strong><br/>${message}</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error enviando consulta de soporte:', error);
    return NextResponse.json({ error: 'Error interno al procesar la consulta' }, { status: 500 });
  }
}
