/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. Tu configuración actual de imágenes
  images: {
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
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: blob: https: res.cloudinary.com; font-src 'self' data: https:; connect-src 'self' https:; frame-ancestors 'self';",
          },
        ],
      },
    ];
  },
};


module.exports = nextConfig;