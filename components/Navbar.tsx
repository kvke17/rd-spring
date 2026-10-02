'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import FluidNavMenu from '@/components/navigation/FluidNavMenu';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const cartItems = useCartStore((state) => state.items);
  const cartCount = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);

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

  return (
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

        {/* Right Action Icons (Cart & Minimalist Fluid Navigation Capsule Menu) */}
        <div className="flex items-center gap-3">
          <Link
            href="/carro"
            className="p-3 rounded-full bg-white/80 hover:bg-white border border-gray-200 text-gray-900 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer relative group"
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

          {/* Minimalist "Fluid Navigation" Capsule Menu */}
          <FluidNavMenu isOpen={isOpen} onOpenChange={setIsOpen} />
        </div>
      </div>
    </motion.header>
  );
}