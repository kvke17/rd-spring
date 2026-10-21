/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. Tu configuración actual de imágenes
  images: {
    qualities: [75, 90],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      // Cuando tengas fotos reales de producto, agrega aquí el dominio
      // donde las alojes (ej. tu bucket de imágenes o CDN).
    ],
  },
  

  // 2. Las redirecciones para limpiar los enlaces viejos de Google
  async redirects() {
    return [
      {
        source: '/Contacto',
        destination: '/soporte',
        permanent: true,
      },
      {
        source: '/shopping-cart',
        destination: '/carro',
        permanent: true,
      },
      {
        source: '/shop/cart', 
        destination: '/carro',
        permanent: true,
      },
      {
        source: '/cotizar',
        destination: '/cotizacion', // O a la ruta de tu formulario de contacto si tienes una
        permanent: true,
      }
    ]
  },

  // 3. Encabezados HTTP de Seguridad Defensiva (OWASP)
  async headers() {
    const isDev = process.env.NODE_ENV !== 'production';

    const cspDirectives = [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline' ${isDev ? "'unsafe-eval'" : ''} https://accounts.google.com https://apis.google.com`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://res.cloudinary.com https://images.unsplash.com https://lh3.googleusercontent.com",
      "font-src 'self' data:",
      `connect-src 'self' ${isDev ? 'ws: wss:' : ''} https://api.cloudinary.com https://accounts.google.com https://webpay3gint.transbank.cl https://webpay3g.transbank.cl`,
      "frame-src 'self' https://accounts.google.com https://webpay3gint.transbank.cl https://webpay3g.transbank.cl",
      "form-action 'self' https://webpay3gint.transbank.cl https://webpay3g.transbank.cl https://*.transbank.cl",
      "frame-ancestors 'self'",
      "object-src 'none'",
      "base-uri 'self'",
    ]
      .map((directive) => directive.trim().replace(/\s+/g, ' '))
      .filter(Boolean)
      .join('; ');

    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value: cspDirectives,
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;