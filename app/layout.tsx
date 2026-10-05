import type { Metadata } from 'next';
// Cambiamos a Inter para lograr el look moderno, técnico y grueso que pidió el cliente
import { Inter } from 'next/font/google'; 
// @ts-ignore
import './globals.css';
import PublicChrome from '@/components/PublicChrome';
import AuthProvider from '@/components/AuthProvider';
import SmoothScroll from '@/components/SmoothScroll';

// Configuramos la nueva fuente
const fuentePrincipal = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'RD Spring | Chassis Prestige',
  description: 'Amortiguadores, resortes y suspensión de alto rendimiento para Porsche, BMW, Audi y Land Rover.',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      {/* Aplicamos la nueva fuente directamente al body para que herede a toda la página */}
      <body className={`${fuentePrincipal.className} bg-white text-gray-900 min-h-screen flex flex-col antialiased`}>
        <AuthProvider>
          <SmoothScroll />
          <PublicChrome>{children}</PublicChrome>
        </AuthProvider>
      </body>
    </html>
  );
}