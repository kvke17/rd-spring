'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import NavFluidMenu from '@/components/NavFluidMenu';
import ExpandableSearchBar from '@/components/ui/expandable-search-bar';
import { resolveSearchCatalog } from '@/lib/search-utils';
import { cn } from '@/lib/utils';

const navLinks = [
  { label: 'Nosotros', href: '/nosotros' },
  { label: 'Repuestos', href: '/repuestos' },
  { label: 'Aceites', href: '/catalogo' },
  { label: 'Cotización', href: '/cotizacion' },
  { label: 'Contacto', href: '/soporte' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [hidden, setHidden] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const cartItems = useCartStore((state) => state.items);
  const cartCount = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);

  // Detección de scroll desacoplada y suave con Framer Motion
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (latest: number) => {
    const previous = scrollY.getPrevious() ?? 0;
    const diff = latest - previous;

    // Fondo según scroll
    setIsScrolled(latest > 20);

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

  return (
    <motion.header
      variants={{
        visible: { y: '0%' },
        hidden: { y: '-100%' },
      }}
      initial="visible"
      animate={hidden ? 'hidden' : 'visible'}
      transition={{
        duration: 0.35,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={cn(
        'fixed top-0 left-0 w-full z-40 transition-colors duration-200 pointer-events-auto',
        isScrolled
          ? 'bg-white/90 backdrop-blur-md border-b border-neutral-200/70 shadow-xs'
          : 'bg-transparent border-b border-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-4">
        {/* 1. Izquierda: Logo oficial RD Spring con enlace a / */}
        <Link
          href="/"
          className="flex items-center group transition-transform duration-160 active:scale-95 cursor-pointer shrink-0"
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

        {/* 2. Centro: Enlaces de navegación principales (Desktop) */}
        <nav
          className="hidden md:flex items-center gap-6 lg:gap-8 mx-auto"
          aria-label="Navegación principal"
        >
          {navLinks.map((link) => {
            const isActive =
              link.href === '/'
                ? pathname === '/'
                : pathname === link.href || pathname.startsWith(`${link.href}/`);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-sm font-medium transition-colors duration-200 hover:text-[#b3131b] select-none py-1 relative group cursor-pointer',
                  isActive
                    ? 'text-[#b3131b] font-semibold'
                    : 'text-neutral-700'
                )}
              >
                <span>{link.label}</span>
                {isActive && (
                  <motion.span
                    layoutId="navbar-active-indicator"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#b3131b] rounded-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* 3. Derecha: Cluster de Acciones (Buscador, Carro, Menú Fluido) */}
        <div className="flex items-center gap-3 shrink-0">
          <ExpandableSearchBar
            expandDirection="left"
            placeholder="Buscar repuestos, aceites..."
            width={260}
            onSearch={(query) => {
              const { targetPath, cleanQuery } = resolveSearchCatalog(query);
              const param = encodeURIComponent(cleanQuery || query.trim());
              window.location.href = `${targetPath}?q=${param}`;
            }}
          />

          <Link
            href="/carro"
            className="p-3 rounded-full bg-white/90 hover:bg-white border border-neutral-200/90 text-neutral-800 hover:text-neutral-950 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer relative group"
            title="Carrito de Compras"
            aria-label="Ver Carrito de Compras"
          >
            <ShoppingCart className="w-4 h-4 transition-transform group-hover:scale-105" />
            {cartCount > 0 && (
              <motion.span
                key={cartCount}
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.35, 1] }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#b3131b] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm pointer-events-none"
              >
                {cartCount}
              </motion.span>
            )}
          </Link>

          {/* Menú Fluido Vertical con Control de Sesión */}
          <NavFluidMenu />
        </div>
      </div>
    </motion.header>
  );
}
