import type { Metadata } from 'next';
import { Inter_Tight } from 'next/font/google';
import './globals.css'; // <--- ¡ESTA ES LA LÍNEA MÁGICA QUE FALTABA!
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuthProvider from '@/components/AuthProvider';

const interTight = Inter_Tight({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter-tight',
});

export const metadata: Metadata = {
  title: 'RD Spring | Chassis Prestige',
  description: 'Amortiguadores, resortes y suspensión de alto rendimiento para Porsche, BMW, Audi y Land Rover.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${interTight.variable} font-sans`}>
      <body className="bg-[#0a0a0a] text-white min-h-screen flex flex-col">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}