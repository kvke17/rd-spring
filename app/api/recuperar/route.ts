import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Resend } from 'resend';
import crypto from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // 1. Verificamos si el usuario existe en tu tabla (ajusta 'user' si tu tabla se llama distinto)
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      // Truco de seguridad: Siempre devolvemos un mensaje de éxito aunque el correo no exista,
      // así los hackers no pueden usar este formulario para adivinar qué correos están registrados.
      return NextResponse.json({ message: 'Si el correo está registrado, te enviamos un enlace de recuperación.' });
    }

    // 2. Generamos un token seguro y único
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600 * 1000); // Expira en 1 hora

    // 3. Guardamos el token en la base de datos
    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expires
      }
    });

    // 4. Construimos el enlace que el cliente clickeará
    // Usa la variable de tu URL base (asegúrate de tener NEXT_PUBLIC_BASE_URL en tu .env)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.rdspring.cl';
    const resetLink = `${baseUrl}/nueva-clave?token=${token}`;

    // 5. Enviamos el correo oficial usando tu cuenta verificada de Resend
    await resend.emails.send({
      from: 'Soporte RD Spring <contacto@rdspring.cl>', 
      to: email,
      subject: 'Recuperación de contraseña - RD Spring',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Recuperación de contraseña</h2>
          <p>Hola,</p>
          <p>Has solicitado restablecer tu contraseña en <strong>RD Spring</strong>. Haz clic en el botón de abajo para crear una nueva:</p>
          <br>
          <a href="${resetLink}" style="display:inline-block; padding:12px 24px; background-color:#eab308; color:#000; text-decoration:none; font-weight:bold; border-radius:5px;">Restablecer contraseña</a>
          <br><br>
          <p style="font-size: 14px; color: #666;">Este enlace expirará en 1 hora.</p>
          <p style="font-size: 14px; color: #666;">Si no fuiste tú quien solicitó este cambio, puedes ignorar este correo de forma segura. Tu cuenta sigue protegida.</p>
        </div>
      `
    });

    return NextResponse.json({ message: 'Si el correo está registrado, te enviamos un enlace de recuperación.' });

  } catch (error) {
    console.error('Error en recuperación:', error);
    return NextResponse.json({ error: 'Hubo un problema al procesar la solicitud.' }, { status: 500 });
  }
}