import { WebpayPlus, Options, Environment, IntegrationCommerceCodes, IntegrationApiKeys } from 'transbank-sdk';

/**
 * Obtiene la instancia de transacción de Transbank Webpay Plus garantizando
 * que en entornos de producción no se degrade silenciosamente al sandbox de integración.
 */
export function getTransbankTransaction(request?: Request): InstanceType<typeof WebpayPlus.Transaction> {
  const host = request?.headers.get('host') || '';
  const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1');

  // Detección estricta de entorno de producción
  const isProduction =
    process.env.NODE_ENV === 'production' ||
    process.env.VERCEL_ENV === 'production' ||
    (Boolean(host) && !isLocalhost && !host.includes('vercel.app'));

  const commerceCode = process.env.TBK_COMMERCE_CODE?.trim();
  const apiKey = (process.env.TBK_API_KEY_SECRET || process.env.TBK_API_KEY)?.trim();

  // En producción, si faltan las credenciales reales, fallar explícitamente
  if (isProduction) {
    if (!commerceCode || !apiKey) {
      const missing: string[] = [];
      if (!commerceCode) missing.push('TBK_COMMERCE_CODE');
      if (!apiKey) missing.push('TBK_API_KEY_SECRET / TBK_API_KEY');

      const alertMsg = `[CRITICAL SECURITY ALERT] Faltan credenciales de Transbank en entorno de producción: ${missing.join(', ')}. Cancelando inicio de checkout para prevenir pagos fantasmas en sandbox.`;
      console.error(alertMsg);
      throw new Error(`Transbank no configurado en producción: faltan ${missing.join(', ')}.`);
    }

    return new WebpayPlus.Transaction(new Options(commerceCode, apiKey, Environment.Production));
  }

  // Fuera de desarrollo local (ej. despliegues de preview o entornos remotos), alertar si se usa sandbox
  const isSandbox = !commerceCode || !apiKey;
  if (isSandbox && !isLocalhost) {
    console.warn(
      '⚠️ [TRANSBANK ADVERTENCIA]: Webpay Plus está ejecutándose en modo SANDBOX / INTEGRACIÓN fuera de desarrollo local. Las transacciones no cobrarán dinero real.'
    );
  }

  const finalCommerceCode = commerceCode || IntegrationCommerceCodes.WEBPAY_PLUS;
  const finalApiKey = apiKey || IntegrationApiKeys.WEBPAY;
  const environment = commerceCode && apiKey ? Environment.Production : Environment.Integration;

  return new WebpayPlus.Transaction(new Options(finalCommerceCode, finalApiKey, environment));
}
