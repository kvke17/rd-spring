import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const rawBaseUrl = process.env.NEXTAUTH_URL || 'https://rdspring.cl';
  const baseUrl = rawBaseUrl.includes('localhost') ? 'https://rdspring.cl' : rawBaseUrl.replace(/\/$/, '');

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/catalogo',
          '/repuestos',
          '/nosotros',
          '/garantia',
          '/terminos',
        ],
        disallow: [
          '/admin/',
          '/api/',
          '/perfil/',
          '/carro',
          '/checkout/',
          '/nueva-clave/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
