'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useCartStore } from '@/lib/store';
import AuthButton from '@/components/AuthButton'; 

export default function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // Estado para el menú móvil
  
  // --- Estados para el Smart Navbar ---
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const cartCount = useCartStore((state) => state.getCartCount());

  useEffect(() => {
    setMounted(true);

    // --- Lógica para detectar el scroll ---
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setIsVisible(false);
        setIsOpen(false); // Cierra el menú móvil si hace scroll hacia abajo
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
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
          
          {/* MENÚ CENTRAL DE ESCRITORIO */}
          <div className="hidden md:flex gap-8 text-[11px] font-bold uppercase tracking-widest">
            <Link href="/cotizacion" className="text-[#b3131b] hover:text-red-800 transition">COTIZAR REPUESTO</Link>
            <Link href="/catalogo" className="text-gray-600 hover:text-gray-900 transition">ACEITES</Link>
            <Link href="/soporte" className="text-gray-600 hover:text-gray-900 transition">SOPORTE</Link>
            <Link href="/nosotros" className="text-gray-600 hover:text-gray-900 transition">NOSOTROS</Link>
          </div>
        </div>
        
        {/* Lado Derecho: Autenticación, Carro y Botón Hamburguesa Móvil */}
        <div className="flex items-center gap-4 sm:gap-6">
          <AuthButton />
          
          <Link href="/carro" className="flex items-center gap-2 border border-gray-300 px-4 py-2 text-[11px] font-bold uppercase tracking-widest hover:bg-gray-50 text-gray-900 transition">
            <span>Carro</span>
            {mounted && cartCount > 0 && <span className="text-[#b3131b]">[{cartCount}]</span>}
          </Link>

          {/* BOTÓN HAMBURGUESA (Solo visible en celular) */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-gray-900 focus:outline-none p-2"
            aria-label="Abrir menú"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* MENÚ LATERAL / DESPLEGABLE MÓVIL */}
      {isOpen && (
        <div className="absolute top-20 left-0 w-full bg-white border-b border-gray-200 shadow-xl md:hidden flex flex-col p-6 space-y-4 animate-in fade-in slide-in-from-top duration-200">
          <Link 
            href="/cotizacion" 
            onClick={() => setIsOpen(false)}
            className="text-xs font-bold uppercase tracking-widest text-[#b3131b] border-b border-gray-100 pb-3"
          >
            COTIZAR REPUESTO
          </Link>
          <Link 
            href="/catalogo" 
            onClick={() => setIsOpen(false)}
            className="text-xs font-bold uppercase tracking-widest text-gray-800 border-b border-gray-100 pb-3"
          >
            ACEITES
          </Link>
          <Link 
            href="/soporte" 
            onClick={() => setIsOpen(false)}
            className="text-xs font-bold uppercase tracking-widest text-gray-800 border-b border-gray-100 pb-3"
          >
            SOPORTE
          </Link>
          <Link 
            href="/nosotros" 
            onClick={() => setIsOpen(false)}
            className="text-xs font-bold uppercase tracking-widest text-gray-800 pb-2"
          >
            NOSOTROS
          </Link>
        </div>
      )}
    </nav>
  );
}