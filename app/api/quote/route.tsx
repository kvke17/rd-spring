// app/api/quote/route.ts
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { STORE_CONFIG } from '@/config/constants';
import { QuoteEmail } from '@/components/emails/QuoteEmail'; 

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { name, email, phone, rut, vehicle, partNeeded } = await request.json();

    if (!name || !email || !phone || !partNeeded) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY no configurada: la cotización no se envió por correo.');
      return NextResponse.json({ error: 'El servicio de correo no está configurado' }, { status: 503 });
    }

    const emailData = await resend.emails.send({
      from: 'RD Spring Cotizaciones <contacto@rdspring.cl>',
      to: [STORE_CONFIG.CONTACT_EMAIL], 
      cc: [email], 
      subject: `Nueva solicitud de cotización de repuesto - ${name}`,
      // Instancia el componente como JSX en lugar de llamarlo como función
      react: (
        <QuoteEmail 
          name={name} 
          email={email} 
          phone={phone} 
          rut={rut} 
          vehicle={vehicle} 
          partNeeded={partNeeded} 
        />
      ),
    });

    return NextResponse.json({ success: true, data: emailData });
  } catch (error) {
    console.error('Error enviando cotización:', error);
    return NextResponse.json({ error: 'Error interno al procesar la cotización' }, { status: 500 });
  }
}