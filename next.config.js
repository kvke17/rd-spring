/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. Tu configuración actual de imágenes
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      // Cuando tengas fotos reales de producto, agrega aquí el dominio
      // donde las alojes (ej. tu bucket de imágenes o CDN).
    ],
  },

  // 2. Las redirecciones para limpiar los enlaces viejos de Google
  async redirects() {
    return [
      {
        source: '/contact-us',
        destination: '/',
        permanent: true,
      },
      {
        source: '/shopping-cart',
        destination: '/carro',
        permanent: true,
      },
      {
        source: '/shop/cart', // Otra ruta común que usa Odoo para el carrito
        destination: '/carro',
        permanent: true,
      },
      {
        source: '/cotizar',
        destination: '/', // O a la ruta de tu formulario de contacto si tienes una
        permanent: true,
      }
    ]
  }
};

module.exports = nextConfig;