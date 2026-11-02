import type { Metadata } from 'next';
// Cambiamos a Inter para lograr el look moderno, técnico y grueso que pidió el cliente
import { Inter } from 'next/font/google'; 
// @ts-ignore
import './globals.css';
import Script from 'next/script';
import PublicChrome from '@/components/PublicChrome';
import AuthProvider from '@/components/AuthProvider';
import SmoothScroll from '@/components/SmoothScroll';
import WhatsAppButton from '@/components/WhatsAppButton';

// Configuramos la nueva fuente
const fuentePrincipal = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.rdspring.cl'),
  title: {
    default: 'RD Spring | Repuestos de Suspensión Europea y Aceites ROWE',
    template: '%s | RD Spring Chile',
  },
  description:
    'Especialistas en suspensión neumática, fuelles, compresores y repuestos OEM para Porsche, BMW, Mercedes-Benz y Audi. Lubricantes 100% sintéticos ROWE con homologación oficial.',
  keywords: [
    'repuestos suspension porsche chile',
    'suspension neumatica porsche macan cayenne',
    'repuestos bmw santiago',
    'aceite rowe chile',
    'amortiguadores neumaticos porsche',
    'cotizacion con vin repuestos',
  ],
  authors: [{ name: 'RD Spring', url: 'https://www.rdspring.cl' }],
  creator: 'RD Spring',
  publisher: 'RD Spring',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'RD Spring | Repuestos de Suspensión Europea y Aceites ROWE',
    description:
      'Catálogo homologado de suspensión para vehículos alemanes y europeos en Chile. Cotizaciones exactas por número de chasis (VIN).',
    url: 'https://www.rdspring.cl',
    siteName: 'RD Spring Chile',
    locale: 'es_CL',
    type: 'website',
    images: [
      {
        url: '/images/og-banner.jpg',
        width: 1200,
        height: 630,
        alt: 'RD Spring - Suspensión Europea de Alta Gama',
      },
    ],
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        {/* Google Ads Tag (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-18395317504"
          strategy="afterInteractive"
        />
        <Script id="google-ads-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-18395317504');
          `}
        </Script>
      </head>
      {/* Aplicamos la nueva fuente directamente al body para que herede a toda la página */}
      <body className={`${fuentePrincipal.className} bg-white text-gray-900 min-h-screen flex flex-col antialiased relative`}>
        <AuthProvider>
          <SmoothScroll />
          <PublicChrome>{children}</PublicChrome>
        </AuthProvider>
        {/* Botón flotante permanente */}
        <WhatsAppButton />
      </body>
    </html>
  );
}
