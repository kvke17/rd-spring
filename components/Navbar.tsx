'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useCartStore } from '@/lib/store';
import AuthButton from '@/components/AuthButton'; // <-- 1. Importamos el botón inteligente

export default function Navbar() {
  const [mounted, setMounted] = useState(false);
  
  // --- INICIO: Estados para el Smart Navbar ---
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  // --- FIN: Estados para el Smart Navbar ---

  const cartCount = useCartStore((state) => state.getCartCount());

  useEffect(() => {
    setMounted(true);

    // --- INICIO: Lógica para detectar el scroll ---
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Si bajamos más de 80px (la altura del menú), lo ocultamos
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setIsVisible(false);
      } else {
        // Si subimos, lo volvemos a mostrar
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
    // --- FIN: Lógica para detectar el scroll ---
  }, [lastScrollY]);

  return (
    <nav 
      className={`fixed top-0 w-full z-50 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/10 transition-transform duration-300 ease-in-out ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center">
            <Image 
              src="/images/logo-rd.png" 
              alt="RD Spring Logo" 
              width={130} 
              height={50} 
              className="object-contain"
              priority
            />
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
        
        {/* 2. Envolvemos el AuthButton y el Carro en un div flexible */}
        <div className="flex items-center gap-6">
          <AuthButton />
          
          <Link href="/carro" className="flex items-center gap-2 border border-white/20 px-4 py-2 text-xs font-mono uppercase tracking-widest hover:bg-white/10 transition">
            <span>Carro</span>
            {mounted && cartCount > 0 && <span className="text-[#E88A5C]">[{cartCount}]</span>}
          </Link>
        </div>
      </div>
    </nav>
  );
}