import type { Metadata } from 'next';
// Cambiamos a Inter para lograr el look moderno, técnico y grueso que pidió el cliente
import { Inter } from 'next/font/google'; 
// @ts-ignore
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuthProvider from '@/components/AuthProvider';
import AsistenteIA from '@/components/AsistenteIA';

// Configuramos la nueva fuente
const fuentePrincipal = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'RD Spring | Chassis Prestige',
  description: 'Amortiguadores, resortes y suspensión de alto rendimiento para Porsche, BMW, Audi y Land Rover.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      {/* Aplicamos la nueva fuente directamente al body para que herede a toda la página */}
      <body className={`${fuentePrincipal.className} bg-white text-gray-900 min-h-screen flex flex-col antialiased`}>
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <AsistenteIA />
        </AuthProvider>
      </body>
    </html>
  );
}