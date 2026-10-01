import type { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const rawBaseUrl = process.env.NEXTAUTH_URL || 'https://rdspring.cl';
  const baseUrl = rawBaseUrl.includes('localhost') ? 'https://rdspring.cl' : rawBaseUrl.replace(/\/$/, '');

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/catalogo`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/repuestos`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/cotizacion`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/nosotros`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/soporte`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/garantia`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/terminos`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  let productSlugs: { slug: string; updatedAt?: Date }[] = [];

  try {
    const dbProducts = await prisma.product.findMany({
      select: {
        slug: true,
        updatedAt: true,
      },
    });

    if (dbProducts && dbProducts.length > 0) {
      productSlugs = dbProducts
        .filter((p) => Boolean(p.slug))
        .map((p) => ({
          slug: p.slug as string,
          updatedAt: p.updatedAt,
        }));
    }
  } catch (dbError) {
    console.warn('Sitemap: Fallo al consultar base de datos, usando respaldo data/products.json', dbError);
  }

  // Fallback seguro a data/products.json si no hubo resultados de la base de datos
  if (productSlugs.length === 0) {
    try {
      const jsonPath = path.join(process.cwd(), 'data', 'products.json');
      if (fs.existsSync(jsonPath)) {
        const fileContent = fs.readFileSync(jsonPath, 'utf8');
        const jsonProducts = JSON.parse(fileContent);
        if (Array.isArray(jsonProducts)) {
          productSlugs = jsonProducts
            .filter((p: any) => Boolean(p.slug || p.id))
            .map((p: any) => ({
              slug: (p.slug || p.id) as string,
              updatedAt: new Date(),
            }));
        }
      }
    } catch (fsError) {
      console.warn('Sitemap: Fallo al leer respaldo local data/products.json', fsError);
    }
  }

  // Deduplicar slugs
  const seen = new Set<string>();
  const uniqueProducts = productSlugs.filter((p) => {
    if (seen.has(p.slug)) return false;
    seen.add(p.slug);
    return true;
  });

  const productRoutes: MetadataRoute.Sitemap = uniqueProducts.map((prod) => ({
    url: `${baseUrl}/productos/${prod.slug}`,
    lastModified: prod.updatedAt || new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticRoutes, ...productRoutes];
}
