'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useCartStore } from '@/lib/store';
import AuthButton from '@/components/AuthButton'; 

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
      className={`fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 transition-transform duration-300 ease-in-out ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-12">
          <Link href="/" className="flex items-center">
            <Image 
              src="/images/logo-rd.png" 
              alt="RD Spring Logo" 
              width={150} 
              height={50} 
              className="object-contain"
              priority
            />
          </Link>
          
          {/* MENÚ CENTRAL LIMPIO Y MINIMALISTA */}
          <div className="hidden md:flex gap-8 text-[11px] font-bold uppercase tracking-widest">
            <Link href="/cotizacion" className="text-[#b3131b] hover:text-red-800 transition">COTIZAR REPUESTO</Link>
            <Link href="/catalogo" className="text-gray-600 hover:text-gray-900 transition">ACEITES</Link>
            <Link href="/soporte" className="text-gray-600 hover:text-gray-900 transition">SOPORTE</Link>
            <Link href="/nosotros" className="text-gray-600 hover:text-gray-900 transition">NOSOTROS</Link>
            
          </div>
        </div>
        
        {/* Lado Derecho: Autenticación y Carro */}
        <div className="flex items-center gap-6">
          <AuthButton />
          
          <Link href="/carro" className="flex items-center gap-2 border border-gray-300 px-4 py-2 text-[11px] font-bold uppercase tracking-widest hover:bg-gray-50 text-gray-900 transition">
            <span>Carro</span>
            {mounted && cartCount > 0 && <span className="text-[#b3131b]">[{cartCount}]</span>}
          </Link>
        </div>
      </div>
    </nav>
  );
}