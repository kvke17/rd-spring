/** @type {import('next').NextConfig} */
const nextConfig = {
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
};

module.exports = nextConfig;
