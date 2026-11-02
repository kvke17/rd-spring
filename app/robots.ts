import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/perfil/', '/carro', '/checkout/'],
    },
    sitemap: 'https://www.rdspring.cl/sitemap.xml',
  };
}
