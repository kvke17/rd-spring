'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
  Menu,
  X,
  Home,
  Droplet,
  Layers,
  Scan,
  ShieldCheck,
  Headphones,
  LayoutDashboard,
  User,
  LogOut,
  LogIn,
} from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { useCartStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface FluidNavMenuProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

// iOS / Dynamic Island Spring Physics Profile
const SPRING_TRANSITION = {
  type: 'spring' as const,
  stiffness: 350,
  damping: 30,
};

export default function FluidNavMenu({
  isOpen: controlledOpen,
  onOpenChange,
}: FluidNavMenuProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;

  const setIsOpen = useCallback(
    (open: boolean) => {
      if (controlledOpen === undefined) {
        setInternalOpen(open);
      }
      if (!open) {
        setHoveredItem(null);
      }
      onOpenChange?.(open);
    },
    [controlledOpen, onOpenChange]
  );

  const pathname = usePathname();
  const { data: session } = useSession();
  const clearCart = useCartStore((state) => state.clearCart);
  const menuRef = useRef<HTMLDivElement>(null);

  const isAdmin = (session?.user as any)?.role === 'ADMIN';

  const handleSignOut = async () => {
    setIsOpen(false);
    clearCart();
    await signOut({ callbackUrl: '/' });
  };

  // Click outside to close dock cleanly
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen, setIsOpen]);

  // Escape key to close dock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsOpen]);

  // Navigation Items Mapping
  const navItems = [
    {
      label: 'Inicio',
      href: '/',
      icon: Home,
    },
    {
      label: 'Catálogo de Aceites',
      href: '/catalogo',
      icon: Droplet,
    },
    {
      label: 'Repuestos de Suspensión',
      href: '/repuestos',
      icon: Layers,
    },
    {
      label: 'Cotización con VIN',
      href: '/cotizacion',
      icon: Scan,
    },
    {
      label: 'Garantía y Calidad',
      href: '/garantia',
      icon: ShieldCheck,
    },
    {
      label: 'Soporte y Contacto',
      href: '/soporte',
      icon: Headphones,
    },
    ...(isAdmin
      ? [
          {
            label: 'Centro de Control / Admin',
            href: '/admin',
            icon: LayoutDashboard,
            highlight: true,
            badge: 'ADMIN',
          },
        ]
      : []),
  ];

  // Container variants with matching iOS spring parameters
  const containerVariants: Variants = {
    closed: {
      width: 44,
      borderRadius: 22,
      backgroundColor: 'rgba(23, 23, 23, 1)',
      borderColor: 'rgba(64, 64, 64, 0.8)',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
      transition: SPRING_TRANSITION,
    },
    open: {
      width: 54,
      borderRadius: 26,
      backgroundColor: 'rgba(10, 10, 10, 0.96)',
      borderColor: 'rgba(38, 38, 38, 0.9)',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
      transition: SPRING_TRANSITION,
    },
  };

  // Collapsible inner items container
  const contentWrapperVariants: Variants = {
    hidden: {
      opacity: 0,
      height: 0,
      transition: {
        opacity: { duration: 0.15, ease: 'easeInOut' },
        height: SPRING_TRANSITION,
        staggerChildren: 0.015,
        staggerDirection: -1,
      },
    },
    visible: {
      opacity: 1,
      height: 'auto',
      transition: {
        height: SPRING_TRANSITION,
        opacity: { duration: 0.2, delay: 0.02 },
        staggerChildren: 0.035,
        delayChildren: 0.03,
      },
    },
  };

  // Individual item entrance and exit
  const itemVariants: Variants = {
    hidden: {
      opacity: 0,
      scale: 0.85,
      y: -8,
      transition: {
        duration: 0.18,
        ease: 'easeInOut',
      },
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: SPRING_TRANSITION,
    },
  };

  // Editorial tooltip pill variants
  const tooltipVariants: Variants = {
    hidden: {
      opacity: 0,
      x: -12,
      scale: 0.95,
      transition: {
        duration: 0.12,
        ease: 'easeIn',
      },
    },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: SPRING_TRANSITION,
    },
  };

  return (
    <div ref={menuRef} className="relative w-11 h-11 shrink-0 z-50">
      <motion.div
        layout
        initial={false}
        animate={isOpen ? 'open' : 'closed'}
        variants={containerVariants}
        className="absolute right-0 top-0 overflow-visible backdrop-blur-2xl border p-1 sm:p-1.5 flex flex-col items-center select-none"
      >
        {/* Top Button: Smooth Morphing between Hamburger (Menu) and Close (X) */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#b3131b] active:scale-95 relative shrink-0',
            isOpen ? 'hover:bg-neutral-800/70 text-neutral-300' : 'hover:bg-neutral-800 text-white'
          )}
          aria-label={isOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
          aria-expanded={isOpen}
          title={isOpen ? 'Cerrar Menú' : 'Menú'}
        >
          {/* Hamburger Icon */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            initial={false}
            animate={{
              rotate: isOpen ? 90 : 0,
              scale: isOpen ? 0.7 : 1,
              opacity: isOpen ? 0 : 1,
            }}
            transition={SPRING_TRANSITION}
          >
            <Menu className="w-4 h-4 text-white" />
          </motion.div>

          {/* Close X Icon */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            initial={false}
            animate={{
              rotate: isOpen ? 0 : -90,
              scale: isOpen ? 1 : 0.7,
              opacity: isOpen ? 1 : 0,
            }}
            transition={SPRING_TRANSITION}
          >
            <X className="w-4 h-4 text-neutral-200" />
          </motion.div>
        </button>

        {/* Collapsible Fluid Vertical Dock Stack */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              key="fluid-dock-content"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={contentWrapperVariants}
              className="flex flex-col items-center gap-1.5 w-full pt-1 overflow-visible"
            >
              {/* Navigation Items */}
              {navItems.map((item) => {
                const isActive =
                  item.href === '/'
                    ? pathname === '/'
                    : pathname.startsWith(item.href);
                const Icon = item.icon;
                const isHovered = hoveredItem === item.href;

                return (
                  <motion.div
                    key={item.href}
                    variants={itemVariants}
                    className="relative w-full flex items-center justify-center"
                    onMouseEnter={() => setHoveredItem(item.href)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        'w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-200 relative cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#b3131b] active:scale-95',
                        isActive
                          ? 'bg-[#b3131b]/15 text-white ring-1 ring-[#b3131b]/40 shadow-sm'
                          : 'text-neutral-400 hover:text-white'
                      )}
                      aria-label={item.label}
                      title={item.label}
                    >
                      {/* Sliding pill backdrop on hover */}
                      {isHovered && !isActive && (
                        <motion.div
                          layoutId="fluidNavHover"
                          className="absolute inset-0 rounded-2xl bg-neutral-800/80 -z-10"
                          transition={SPRING_TRANSITION}
                        />
                      )}

                      <Icon
                        className={cn(
                          'w-4 h-4 transition-transform duration-200',
                          isHovered && 'scale-110',
                          item.highlight && 'text-[#b3131b]',
                          isActive && !item.highlight && 'text-white'
                        )}
                      />

                      {/* Active Indicator Dot */}
                      {isActive && (
                        <span className="absolute right-1 top-1 w-1.5 h-1.5 rounded-full bg-[#b3131b] shadow-[0_0_6px_#b3131b]" />
                      )}
                    </Link>

                    {/* Editorial Tooltip Pill (glides left x: -12 on exit) */}
                    <AnimatePresence>
                      {isHovered && (
                        <motion.div
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                          variants={tooltipVariants}
                          className="pointer-events-none absolute right-full top-1/2 -translate-y-1/2 mr-3 z-50 whitespace-nowrap"
                          role="tooltip"
                        >
                          <div className="px-3 py-1.5 rounded-xl bg-neutral-900/95 border border-neutral-700/80 text-white text-xs font-semibold shadow-2xl backdrop-blur-xl flex items-center gap-2 ring-1 ring-white/10">
                            <span>{item.label}</span>
                            {item.badge && (
                              <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-[#b3131b] text-white">
                                {item.badge}
                              </span>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}

              {/* 1px Subtle Divider */}
              <motion.div
                variants={itemVariants}
                className="w-7 h-[1px] bg-neutral-800/90 my-1 rounded-full shrink-0"
              />

              {/* User Session Integration (Bottom Footer of the Dock) */}
              {session?.user ? (
                <>
                  {/* Mi Perfil Link */}
                  <motion.div
                    variants={itemVariants}
                    className="relative w-full flex items-center justify-center"
                    onMouseEnter={() => setHoveredItem('perfil')}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <Link
                      href="/perfil"
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        'w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-200 relative cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#b3131b] active:scale-95',
                        pathname.startsWith('/perfil')
                          ? 'bg-[#b3131b]/15 text-white ring-1 ring-[#b3131b]/40 shadow-sm'
                          : 'text-neutral-400 hover:text-white'
                      )}
                      aria-label="Mi Perfil"
                      title="Mi Perfil"
                    >
                      {hoveredItem === 'perfil' && !pathname.startsWith('/perfil') && (
                        <motion.div
                          layoutId="fluidNavHover"
                          className="absolute inset-0 rounded-2xl bg-neutral-800/80 -z-10"
                          transition={SPRING_TRANSITION}
                        />
                      )}
                      <User
                        className={cn(
                          'w-4 h-4 transition-transform duration-200',
                          hoveredItem === 'perfil' && 'scale-110'
                        )}
                      />
                      {pathname.startsWith('/perfil') && (
                        <span className="absolute right-1 top-1 w-1.5 h-1.5 rounded-full bg-[#b3131b] shadow-[0_0_6px_#b3131b]" />
                      )}
                    </Link>

                    <AnimatePresence>
                      {hoveredItem === 'perfil' && (
                        <motion.div
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                          variants={tooltipVariants}
                          className="pointer-events-none absolute right-full top-1/2 -translate-y-1/2 mr-3 z-50 whitespace-nowrap"
                          role="tooltip"
                        >
                          <div className="px-3 py-1.5 rounded-xl bg-neutral-900/95 border border-neutral-700/80 text-white text-xs font-semibold shadow-2xl backdrop-blur-xl flex items-center gap-2 ring-1 ring-white/10">
                            <span className="max-w-[160px] truncate">
                              {session.user.name || session.user.email}
                            </span>
                            {isAdmin ? (
                              <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-[#b3131b] text-white">
                                ADMIN
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-neutral-800 text-neutral-300">
                                PERFIL
                              </span>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Cerrar Sesión Button */}
                  <motion.div
                    variants={itemVariants}
                    className="relative w-full flex items-center justify-center"
                    onMouseEnter={() => setHoveredItem('logout')}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="w-10 h-10 rounded-2xl flex items-center justify-center text-red-400/90 hover:text-red-300 transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 active:scale-95 relative"
                      aria-label="Cerrar Sesión"
                      title="Cerrar Sesión"
                    >
                      {hoveredItem === 'logout' && (
                        <motion.div
                          layoutId="fluidNavHover"
                          className="absolute inset-0 rounded-2xl bg-red-500/15 -z-10"
                          transition={SPRING_TRANSITION}
                        />
                      )}
                      <LogOut
                        className={cn(
                          'w-4 h-4 transition-transform duration-200',
                          hoveredItem === 'logout' && 'scale-110'
                        )}
                      />
                    </button>

                    <AnimatePresence>
                      {hoveredItem === 'logout' && (
                        <motion.div
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                          variants={tooltipVariants}
                          className="pointer-events-none absolute right-full top-1/2 -translate-y-1/2 mr-3 z-50 whitespace-nowrap"
                          role="tooltip"
                        >
                          <div className="px-3 py-1.5 rounded-xl bg-neutral-900/95 border border-neutral-700/80 text-red-300 text-xs font-semibold shadow-2xl backdrop-blur-xl flex items-center gap-2 ring-1 ring-red-500/20">
                            <span>Cerrar Sesión</span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </>
              ) : (
                /* Not Logged In -> Ingresar / Registro */
                <motion.div
                  variants={itemVariants}
                  className="relative w-full flex items-center justify-center"
                  onMouseEnter={() => setHoveredItem('login')}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-neutral-300 hover:text-white transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#b3131b] active:scale-95 relative"
                    aria-label="Ingresar / Registro"
                    title="Ingresar / Registro"
                  >
                    {hoveredItem === 'login' && (
                      <motion.div
                        layoutId="fluidNavHover"
                        className="absolute inset-0 rounded-2xl bg-neutral-800/80 -z-10"
                        transition={SPRING_TRANSITION}
                      />
                    )}
                    <LogIn
                      className={cn(
                        'w-4 h-4 transition-transform duration-200',
                        hoveredItem === 'login' && 'scale-110'
                      )}
                    />
                  </Link>

                  <AnimatePresence>
                    {hoveredItem === 'login' && (
                      <motion.div
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        variants={tooltipVariants}
                        className="pointer-events-none absolute right-full top-1/2 -translate-y-1/2 mr-3 z-50 whitespace-nowrap"
                        role="tooltip"
                      >
                        <div className="px-3 py-1.5 rounded-xl bg-neutral-900/95 border border-neutral-700/80 text-white text-xs font-semibold shadow-2xl backdrop-blur-xl flex items-center gap-2 ring-1 ring-white/10">
                          <span>Ingresar / Registro</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
