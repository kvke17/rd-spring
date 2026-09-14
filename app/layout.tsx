import type { Metadata } from 'next';
// Importamos Playfair Display para un look de lujo
import { Playfair_Display } from 'next/font/google'; 
// @ts-ignore
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuthProvider from '@/components/AuthProvider';
import AsistenteIA from '@/components/AsistenteIA';

const fuentePrincipal = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-principal',
  weight: ['400', '600', '700'], 
});

export const metadata: Metadata = {
  title: 'RD Spring | Chassis Prestige',
  description: 'Amortiguadores, resortes y suspensión de alto rendimiento para Porsche, BMW, Audi y Land Rover.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${fuentePrincipal.variable} font-sans`}>
      <body className="bg-white text-gray-900 min-h-screen flex flex-col">
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