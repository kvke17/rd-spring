export const STORE_CONFIG = {
  WHATSAPP_NUMBER: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '56942081583',
  CONTACT_EMAIL: process.env.CONTACT_EMAIL || 'contacto@rdspring.cl',
  INSTAGRAM_USERNAME: '@rdspring.cl',
  INSTAGRAM_PROFILE_URL: 'https://www.instagram.com/rdspring.cl/',
  // Abre directamente el chat de Instagram con la cuenta de la tienda.
  INSTAGRAM_DM_URL: 'https://ig.me/m/rdspring.cl',
  CURRENCY_FORMAT: new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }),
};
