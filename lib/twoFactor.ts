import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Genera 8 códigos de respaldo alfanuméricos de un solo uso.
 */
export function generateBackupCodes(): string[] {
  const backupCodes: string[] = [];
  for (let i = 0; i < 8; i++) {
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    backupCodes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
  }
  return backupCodes;
}

/**
 * Genera un código de 6 dígitos numérico, lo guarda en la base de datos (con validez de 10 min)
 * y lo envía por correo electrónico usando Resend.
 */
export async function generateAndSendEmailCode(
  userEmail: string,
  purpose: 'setup' | 'login' = 'login'
): Promise<{ success: boolean; codeSent: boolean }> {
  const cleanEmail = userEmail.toLowerCase().trim();
  
  // Generar código de 6 dígitos
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

  // Guardar en la base de datos
  await prisma.user.update({
    where: { email: cleanEmail },
    data: {
      twoFactorTempCode: code,
      twoFactorCodeExpires: expires,
    },
  });

  const subject =
    purpose === 'setup'
      ? 'Código de confirmación 2FA - RD Spring'
      : 'Tu código de acceso seguro - RD Spring';

  const actionText =
    purpose === 'setup'
      ? 'Has solicitado activar la Autenticación en Dos Pasos (2FA) en tu cuenta de RD Spring.'
      : 'Has solicitado iniciar sesión en tu cuenta de RD Spring.';

  // Enviamos por correo con Resend
  let codeSent = false;
  try {
    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: 'Seguridad RD Spring <contacto@rdspring.cl>',
        to: cleanEmail,
        subject,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; padding: 32px;">
            <div style="text-align: center; margin-bottom: 24px;">
              <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; color: #b3131b; background: #fef2f2; padding: 4px 12px; border-radius: 9999px; border: 1px solid #fee2e2;">
                SEGURIDAD RD SPRING
              </span>
              <h2 style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 16px 0 8px 0;">
                Código de Verificación
              </h2>
              <p style="font-size: 14px; color: #64748b; margin: 0; line-height: 1.5;">
                ${actionText}
              </p>
            </div>

            <div style="background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
              <span style="display: block; font-size: 11px; text-transform: uppercase; font-weight: 700; color: #64748b; letter-spacing: 0.1em; margin-bottom: 8px;">
                CÓDIGO DE 6 DÍGITOS
              </span>
              <span style="font-size: 36px; font-weight: 900; letter-spacing: 6px; color: #0f172a; font-family: monospace;">
                ${code}
              </span>
            </div>

            <p style="font-size: 13px; color: #64748b; text-align: center; line-height: 1.5; margin: 0 0 16px 0;">
              Este código vence en <strong>10 minutos</strong>. Si no fuiste tú quien intentó acceder, puedes ignorar este mensaje; tu contraseña no ha sido modificada.
            </p>

            <div style="border-top: 1px solid #f1f5f9; padding-top: 16px; text-align: center;">
              <p style="font-size: 11px; color: #94a3b8; margin: 0;">
                RD Spring · Especialistas en Repuestos de Alta Gama
              </p>
            </div>
          </div>
        `,
      });
      codeSent = true;
    }
  } catch (err) {
    console.error('Error enviando código 2FA por correo:', err);
  }

  // Respaldo en consola para desarrollo
  console.log(`\n========================================`);
  console.log(`[2FA CORREO] Código para ${cleanEmail}: ${code}`);
  console.log(`========================================\n`);

  return { success: true, codeSent };
}

/**
 * Valida si el código ingresado coincide con el código de 6 dígitos enviado al correo
 * o con alguno de los códigos de respaldo guardados.
 */
export async function verifyTwoFactorEmailOrBackupCode(
  userEmail: string,
  enteredCode: string
): Promise<{ isValid: boolean; method?: 'email' | 'backup' }> {
  const cleanEmail = userEmail.toLowerCase().trim();
  const cleanCode = enteredCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');

  const user = await prisma.user.findUnique({
    where: { email: cleanEmail },
  });

  if (!user) return { isValid: false };

  // 1. Verificación del código de 6 dígitos del correo
  if (user.twoFactorTempCode && user.twoFactorCodeExpires) {
    const isNotExpired = new Date(user.twoFactorCodeExpires).getTime() > Date.now();
    if (isNotExpired && user.twoFactorTempCode.trim() === cleanCode) {
      // Código válido: lo limpiamos para que no se re-use
      await prisma.user.update({
        where: { id: user.id },
        data: {
          twoFactorTempCode: null,
          twoFactorCodeExpires: null,
        },
      });
      return { isValid: true, method: 'email' };
    }
  }

  // 2. Verificación de códigos de respaldo (si tiene)
  if (user.twoFactorBackupCodes) {
    try {
      const backupList: string[] = JSON.parse(user.twoFactorBackupCodes);
      const index = backupList.findIndex(
        (c) => c.replace(/[^A-Z0-9]/g, '').toUpperCase() === cleanCode
      );

      if (index !== -1) {
        // Código de respaldo válido: lo consumimos eliminándolo de la lista
        backupList.splice(index, 1);
        await prisma.user.update({
          where: { id: user.id },
          data: {
            twoFactorBackupCodes: JSON.stringify(backupList),
            twoFactorTempCode: null,
            twoFactorCodeExpires: null,
          },
        });
        return { isValid: true, method: 'backup' };
      }
    } catch (err) {
      console.error('Error verificando código de respaldo:', err);
    }
  }

  return { isValid: false };
}
