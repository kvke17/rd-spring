'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence, Variants, useScroll, useMotionValueEvent } from 'framer-motion';
import { ShoppingCart, User, Menu, X, ArrowUpRight, ShieldCheck, LogIn, LogOut } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { useCartStore } from '@/lib/store';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const { data: session } = useSession();
  const clearCart = useCartStore((state) => state.clearCart);

  // Verificamos si el usuario autenticado tiene el rol de ADMIN
  const isAdmin = (session?.user as any)?.role === 'ADMIN';

  const handleSignOut = async () => {
    setIsOpen(false);
    clearCart();
    await signOut({ callbackUrl: '/' });
  };

  // Detección de scroll desacoplada y suave con Framer Motion
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (latest: number) => {
    const previous = scrollY.getPrevious() ?? 0;
    const diff = latest - previous;

    // Al estar cerca de la cabecera (primeros 60px), siempre visible
    if (latest <= 60) {
      setHidden(false);
    } else if (diff > 10) {
      // Scrolleando hacia abajo -> deslizar suavemente hacia arriba
      setHidden(true);
    } else if (diff < -10) {
      // Scrolleando hacia arriba -> deslizar suavemente hacia abajo
      setHidden(false);
    }
  });

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Prevent scroll when fullscreen menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const navLinks = [
    { label: 'Inicio', href: '/' },
    { label: 'Catálogo de Aceites', href: '/catalogo' },
    { label: 'Repuestos de Suspensión', href: '/repuestos' },
    { label: 'Cotización con VIN', href: '/cotizacion' },
    { label: 'Garantía y Calidad', href: '/garantia' },
    { label: 'Soporte y Contacto', href: '/soporte' },
    ...(isAdmin ? [{ label: 'Centro de Control / Admin', href: '/admin' }] : []),
  ];

  const menuVariants: Variants = {
    closed: {
      opacity: 0,
      clipPath: 'circle(0% at calc(100% - 40px) 40px)',
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 35,
      },
    },
    open: {
      opacity: 1,
      clipPath: 'circle(150% at calc(100% - 40px) 40px)',
      transition: {
        type: 'spring',
        stiffness: 200,
        damping: 30,
        staggerChildren: 0.06,
        delayChildren: 0.15,
      },
    },
  };

  const itemVariants: Variants = {
    closed: { opacity: 0, y: 20 },
    open: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 24,
      },
    },
  };

  return (
    <>
      {/* Top Navbar: Deslizamiento suave hacia arriba al bajar, y hacia abajo al subir */}
      <motion.header
        variants={{
          visible: { y: '0%' },
          hidden: { y: '-100%' },
        }}
        initial="visible"
        animate={hidden && !isOpen ? 'hidden' : 'visible'}
        transition={{
          duration: 0.45,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="fixed top-0 left-0 w-full z-40 bg-transparent border-b border-transparent pointer-events-auto"
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center group transition-transform duration-160 active:scale-95 cursor-pointer"
          >
            <Image
              src="/images/logo-rd.png"
              alt="RD Spring Logo"
              width={200}
              height={28}
              priority
              className="h-8 sm:h-9 w-auto object-contain"
            />
          </Link>

          {/* Right Action Icons (Cart, Profile, Admin [if authorized], Hamburger Menu) */}
          <div className="flex items-center gap-3">
            <Link
              href="/carro"
              className="p-3 rounded-full bg-white/80 hover:bg-white border border-gray-200 text-gray-900 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
              title="Carrito de Compras"
              aria-label="Ver Carrito de Compras"
            >
              <ShoppingCart className="w-4 h-4" />
            </Link>

            <Link
              href={session?.user ? '/perfil' : '/login'}
              className="p-3 rounded-full bg-white/80 hover:bg-white border border-gray-200 text-gray-900 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
              title={session?.user ? `Mi Perfil (${session.user.name || session.user.email})` : 'Iniciar Sesión'}
              aria-label={session?.user ? 'Mi Perfil' : 'Iniciar Sesión'}
            >
              <User className="w-4 h-4" />
            </Link>

            {/* Icono de Administrador: Al lado del icono de perfil, visible solo si es ADMIN */}
            {isAdmin && (
              <Link
                href="/admin"
                className="p-3 rounded-full bg-white/80 hover:bg-white border border-red-200 text-[#b3131b] hover:text-red-700 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer group relative"
                title="Centro de Control / Panel Admin"
                aria-label="Ir al Panel de Administración"
              >
                <ShieldCheck className="w-4 h-4 text-[#b3131b] group-hover:scale-110 transition-transform" />
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#b3131b] rounded-full ring-2 ring-white animate-pulse" />
              </Link>
            )}

            {/* 3-bar (hamburger) menu icon right next to profile/admin icon */}
            <button
              onClick={() => setIsOpen(true)}
              className="p-3 rounded-full bg-white/80 hover:bg-white border border-gray-200 text-gray-900 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer group"
              aria-label="Abrir Menú de Navegación"
              title="Menú"
            >
              <Menu className="w-4 h-4 group-hover:text-[#b3131b] transition-colors" />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Fullscreen Overlay Navigation with Glassmorphism */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl text-white flex flex-col justify-between p-6 sm:p-12 overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-label="Menú de Navegación Completo"
          >
            {/* Top Bar inside Overlay */}
            <div className="max-w-7xl mx-auto w-full flex items-center justify-between border-b border-white/10 pb-6">
              <Link
                href="/"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2"
              >
                <Image
                  src="/images/logo-rd.png"
                  alt="RD Spring Logo"
                  width={180}
                  height={26}
                  className="h-7 sm:h-8 w-auto object-contain"
                />
              </Link>

              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all active:scale-90 min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer border border-white/10"
                aria-label="Cerrar Menú"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Central Navigation Links with Staggered Entrance */}
            <div className="max-w-7xl mx-auto w-full py-8 sm:py-12 flex-1 flex flex-col justify-center">
              <nav className="grid grid-cols-1 md:grid-cols-2 gap-y-5 md:gap-x-16">
                {navLinks.map((item) => (
                  <motion.div key={item.href} variants={itemVariants}>
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="group flex items-center justify-between text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight text-gray-300 hover:text-white transition-colors duration-200 py-2 border-b border-white/5"
                    >
                      <span className="group-hover:translate-x-3 transition-transform duration-200">
                        {item.label}
                      </span>
                      <ArrowUpRight className="w-6 h-6 text-gray-600 group-hover:text-[#b3131b] group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-200" />
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {/* Sección de Autenticación: Registrarte / Iniciar Sesión O Cerrar Sesión */}
              <motion.div
                variants={itemVariants}
                className="mt-10 pt-8 border-t border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
                {session?.user ? (
                  <>
                    <div className="flex items-center gap-3.5">
                      <div className="p-3 rounded-full bg-red-500/10 border border-red-500/20 text-[#b3131b]">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-[10px] uppercase font-mono tracking-widest text-gray-400">Sesión Iniciada</p>
                          {isAdmin && (
                            <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-[#b3131b] text-white">
                              ADMIN
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-bold text-white">{session.user.name || session.user.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Link
                        href="/perfil"
                        onClick={() => setIsOpen(false)}
                        className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider transition-all duration-200 border border-white/10 active:scale-95 cursor-pointer"
                      >
                        <User className="w-4 h-4" />
                        <span>Mi Perfil</span>
                      </Link>

                      {/* Botón Cerrar Sesión cuando está logueado */}
                      <button
                        onClick={handleSignOut}
                        className="btn-shine inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-red-950/60 hover:bg-[#b3131b] text-white border border-red-500/40 text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-md active:scale-95 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-red-400 group-hover:text-white" />
                        <span>Cerrar Sesión</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3.5">
                      <div className="p-3 rounded-full bg-white/5 border border-white/10 text-gray-400">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-mono tracking-widest text-gray-400">Cuenta de Usuario</p>
                        <p className="text-sm font-bold text-white">Accede a tus cotizaciones, órdenes y catálogo exclusivo</p>
                      </div>
                    </div>

                    {/* Botón Registrarte / Iniciar Sesión cuando NO está logueado */}
                    <Link
                      href="/login"
                      onClick={() => setIsOpen(false)}
                      className="btn-shine inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#b3131b] hover:bg-[#8f0f15] text-white text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-lg shadow-red-950/50 active:scale-95 cursor-pointer self-start sm:self-auto"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Registrarte / Iniciar Sesión</span>
                    </Link>
                  </>
                )}
              </motion.div>
            </div>

            {/* Bottom Telemetry & Studio Info */}
            <motion.div
              variants={itemVariants}
              className="max-w-7xl mx-auto w-full pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs font-mono text-gray-400"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#b3131b] animate-pulse" />
                <span>CHASSIS PRESTIGE STUDIO · SANTIAGO DE CHILE</span>
              </div>
              <p>Av. Las Condes 8550, Las Condes, Región Metropolitana</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}