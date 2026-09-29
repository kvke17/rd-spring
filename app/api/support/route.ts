import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { STORE_CONFIG } from '@/config/constants';
import { checkRateLimit } from '@/lib/rateLimit';
import { escapeHtml, sanitizeString, isValidEmail } from '@/lib/sanitize';

const resend = new Resend(process.env.RESEND_API_KEY);

const MOTIVO_LABELS: Record<string, string> = {
  general: 'Consulta general',
  compatibilidad: 'Compatibilidad de repuesto',
  cotizacion: 'Cotización',
  garantia: 'Garantía',
  otro: 'Otro',
};

export async function POST(request: Request) {
  // 0. Mitigación contra spam y bombardeo de correos (5 solicitudes / 10 min)
  const rateLimit = checkRateLimit(request, {
    keyPrefix: 'support-contact',
    maxRequests: 5,
    windowSeconds: 600,
  });

  if (!rateLimit.allowed && rateLimit.errorResponse) {
    return rateLimit.errorResponse;
  }

  try {
    const body = await request.json();
    const { name, email, motivo, vehicle, message } = body || {};

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Formato de correo electrónico inválido' }, { status: 400 });
    }

    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY no configurada: la consulta de soporte no se envió por correo.', { email, motivo });
      return NextResponse.json({ error: 'El servicio de correo no está configurado' }, { status: 503 });
    }

    // Sanitización y escape HTML defensivo para evitar inyecciones en el correo
    const safeName = escapeHtml(sanitizeString(name, 100));
    const safeEmail = escapeHtml(sanitizeString(email, 120));
    const safeVehicle = vehicle ? escapeHtml(sanitizeString(vehicle, 100)) : '';
    const safeMessage = escapeHtml(sanitizeString(message, 3000)).replace(/\n/g, '<br/>');

    const motivoKey = typeof motivo === 'string' ? motivo.toLowerCase().trim() : 'general';
    const motivoLabel = MOTIVO_LABELS[motivoKey] || 'Consulta general';

    await resend.emails.send({
      from: 'RD Spring Soporte <contacto@rdspring.cl>',
      to: [STORE_CONFIG.CONTACT_EMAIL],
      subject: `Nueva consulta de Soporte: ${motivoLabel}`,
      html: `
        <h2>Nueva consulta de Soporte</h2>
        <p><strong>Motivo:</strong> ${escapeHtml(motivoLabel)}</p>
        <p><strong>Nombre:</strong> ${safeName}<br/><strong>Email:</strong> ${safeEmail}</p>
        ${safeVehicle ? `<p><strong>Vehículo / Chasis:</strong> ${safeVehicle}</p>` : ''}
        <p><strong>Mensaje:</strong><br/>${safeMessage}</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error enviando consulta de soporte:', error);
    return NextResponse.json({ error: 'Error interno al procesar la consulta' }, { status: 500 });
  }
}
