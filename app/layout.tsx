import type { Metadata } from 'next';
import { Inter_Tight } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

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
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
