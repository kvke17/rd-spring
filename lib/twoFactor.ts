import { generateSecret, generateURI, verifySync } from 'otplib';
import QRCode from 'qrcode';
import crypto from 'crypto';

export interface TwoFactorSetupData {
  secret: string;
  qrCodeUrl: string;
  otpauthUrl: string;
  backupCodes: string[];
}

/**
 * Genera el secreto TOTP, la URL otpauth://, el código QR en base64 y 8 códigos de respaldo.
 */
export async function generateTwoFactorSetup(userEmail: string): Promise<TwoFactorSetupData> {
  const secret = generateSecret();
  const issuer = 'RD Spring';
  const otpauthUrl = generateURI({
    issuer,
    label: userEmail,
    secret,
  });

  const qrCodeUrl = await QRCode.toDataURL(otpauthUrl, {
    width: 256,
    margin: 2,
    color: {
      dark: '#111827',
      light: '#ffffff',
    },
  });

  // Generamos 8 códigos de respaldo aleatorios de 8 caracteres alfanuméricos
  const backupCodes: string[] = [];
  for (let i = 0; i < 8; i++) {
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    backupCodes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
  }

  return {
    secret,
    qrCodeUrl,
    otpauthUrl,
    backupCodes,
  };
}

/**
 * Verifica un código TOTP de 6 dígitos con el secreto guardado (con ventana de tolerancia de ±30s).
 */
export function verifyTwoFactorCode(code: string, secret: string): boolean {
  try {
    const cleanCode = code.replace(/\s+/g, '').trim();
    const result = verifySync({
      token: cleanCode,
      secret,
      epochTolerance: 30,
    });
    return !!result?.valid;
  } catch (error) {
    console.error('Error al verificar código 2FA:', error);
    return false;
  }
}

/**
 * Verifica si un código ingresado coincide con un código de respaldo.
 * Si coincide, lo consume y devuelve la nueva lista de códigos de respaldo.
 */
export function verifyAndConsumeBackupCode(
  enteredCode: string,
  backupCodesJson: string | null
): { isValid: boolean; remainingCodesJson: string | null } {
  if (!backupCodesJson) return { isValid: false, remainingCodesJson: null };

  try {
    const codes: string[] = JSON.parse(backupCodesJson);
    const cleanEntered = enteredCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');

    const index = codes.findIndex(
      (c) => c.replace(/[^A-Z0-9]/g, '').toUpperCase() === cleanEntered
    );

    if (index !== -1) {
      // Código válido encontrado, lo consumimos eliminándolo de la lista
      codes.splice(index, 1);
      return {
        isValid: true,
        remainingCodesJson: JSON.stringify(codes),
      };
    }
  } catch (error) {
    console.error('Error procesando códigos de respaldo:', error);
  }

  return { isValid: false, remainingCodesJson: backupCodesJson };
}
