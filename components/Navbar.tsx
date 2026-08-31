'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useCartStore } from '@/lib/store';

export default function Navbar() {
  const [mounted, setMounted] = useState(false);
  const cartCount = useCartStore((state) => state.getCartCount());

  useEffect(() => setMounted(true), []);

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-1 font-bold text-xl tracking-tighter">
            <span className="text-[#E88A5C]">RD</span><span className="text-white">SPRING</span>
          </Link>
          <div className="hidden md:flex gap-6 text-[11px] font-mono uppercase tracking-widest text-gray-400">
            <Link href="/cotizacion?marca=Porsche" className="hover:text-white transition">Porsche</Link>
            <Link href="/cotizacion?marca=BMW" className="hover:text-white transition">BMW</Link>
            <Link href="/cotizacion?marca=Audi" className="hover:text-white transition">Audi</Link>
            <Link href="/cotizacion?marca=Land Rover" className="hover:text-white transition">Land Rover</Link>
            <Link href="/cotizacion" className="hover:text-[#E88A5C] text-[#E88A5C] transition ml-4 pl-4 border-l border-white/10">Cotizar Repuesto</Link>
            <Link href="/catalogo" className="hover:text-white transition">Aceites</Link>
            <Link href="/soporte" className="hover:text-white transition">Soporte</Link>
          </div>
        </div>
        <Link href="/carro" className="flex items-center gap-2 border border-white/20 px-4 py-2 text-xs font-mono uppercase tracking-widest hover:bg-white/10 transition">
          <span>Carro</span>
          {mounted && cartCount > 0 && <span className="text-[#E88A5C]">[{cartCount}]</span>}
        </Link>
      </div>
    </nav>
  );
}
