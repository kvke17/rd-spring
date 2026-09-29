'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, User, Menu, X, ShieldCheck, Wrench, PhoneCall } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 bg-black/60 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-black tracking-widest text-white">
              RD<span className="text-[#b3131b]">SPRING</span>
            </span>
          </Link>

          {/* Enlaces de navegación centrales (Desktop) */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-widest text-gray-300">
            <Link href="#catalogo" className="hover:text-white transition">Catálogo</Link>
            <Link href="#tecnologia" className="hover:text-white transition">Ingeniería</Link>
            <Link href="#compatibilidad" className="hover:text-white transition">Vehículos</Link>
            <Link href="#contacto" className="hover:text-white transition">Contacto</Link>
          </nav>

          {/* Iconos limpios (Sin textos de Carrito / Perfil) */}
          <div className="flex items-center gap-4">
            <Link 
              href="/carrito" 
              className="p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white transition shadow-lg"
              title="Carrito"
            >
              <ShoppingCart className="w-4 h-4" />
            </Link>
            
            <Link 
              href="/admin" 
              className="p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white transition shadow-lg"
              title="Mi Perfil / Admin"
            >
              <User className="w-4 h-4" />
            </Link>

            {/* Botón menú lateral (Sidebar) */}
            <button 
              onClick={() => setIsOpen(true)}
              className="p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white transition md:hidden"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Barra Lateral / Menú Desplegable (Sidebar) */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Fondo oscuro difuminado */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            />

            {/* Contenedor del Drawer */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-80 bg-neutral-950 border-l border-white/10 z-50 p-8 flex flex-col justify-between shadow-2xl rounded-l-3xl"
            >
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-black tracking-widest text-white">
                    RD<span className="text-[#b3131b]">SPRING</span>
                  </span>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-full bg-white/5 text-white hover:bg-white/10 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="flex flex-col gap-6 text-sm font-bold uppercase tracking-widest text-gray-300">
                  <Link href="#catalogo" onClick={() => setIsOpen(false)} className="hover:text-white transition">Catálogo</Link>
                  <Link href="#tecnologia" onClick={() => setIsOpen(false)} className="hover:text-white transition">Ingeniería</Link>
                  <Link href="#compatibilidad" onClick={() => setIsOpen(false)} className="hover:text-white transition">Vehículos</Link>
                  <Link href="#contacto" onClick={() => setIsOpen(false)} className="hover:text-white transition">Contacto</Link>
                </nav>
              </div>

              <div className="border-t border-white/10 pt-6 text-xs text-gray-500">
                <p>Ingeniería que sostiene el lujo en movimiento.</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}