'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
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
import { SPRING_TRANSITION } from '@/lib/theme-tokens';

interface FluidNavMenuProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function FluidNavMenu({
  isOpen: controlledOpen,
  onOpenChange,
}: FluidNavMenuProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;

  const [isDesktop, setIsDesktop] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(900);
  const [offsets, setOffsets] = useState({ top: 0, right: 0 });

  const setIsOpen = useCallback(
    (open: boolean) => {
      if (controlledOpen === undefined) {
        setInternalOpen(open);
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

  const updateOffsets = useCallback(() => {
    if (typeof window === 'undefined') return;
    setViewportHeight(window.innerHeight);
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const clientW = document.documentElement.clientWidth || window.innerWidth;
      setOffsets({
        top: -rect.top,
        right: -(clientW - rect.right),
      });
    }
  }, []);

  // Sync offsets, media query, and resize listener
  useEffect(() => {
    setMounted(true);
    const mql = window.matchMedia('(min-width: 768px)');
    const handleMedia = () => setIsDesktop(mql.matches);
    handleMedia();
    updateOffsets();

    mql.addEventListener('change', handleMedia);
    window.addEventListener('resize', updateOffsets);

    return () => {
      mql.removeEventListener('change', handleMedia);
      window.removeEventListener('resize', updateOffsets);
    };
  }, [updateOffsets]);

  // Lock body scroll when open and ensure offsets are fresh
  useEffect(() => {
    if (isOpen) {
      updateOffsets();
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isOpen, updateOffsets]);

  const handleToggle = () => {
    if (!isOpen) {
      updateOffsets();
    }
    setIsOpen(!isOpen);
  };

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

  // Navigation Items Mapping (con títulos solicitados)
  const navItems = [
    {
      label: 'Inicio',
      href: '/',
      icon: Home,
    },
    {
      label: 'Aceites y Lubricantes',
      href: '/catalogo',
      icon: Droplet,
    },
    {
      label: 'Repuestos de Calidad',
      href: '/repuestos',
      icon: Layers,
    },
    {
      label: 'Cotizar repuesto',
      href: '/cotizacion',
      icon: Scan,
    },
    {
      label: 'Garantía',
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
            label: 'Panel',
            href: '/admin',
            icon: LayoutDashboard,
            highlight: true,
            badge: 'ADMIN',
          },
        ]
      : []),
  ];

  // Desktop variants: expands seamlessly to right drawer anchored to screen edges (top: 0, right: 0, 100dvh)
  const desktopVariants: Variants = {
    closed: {
      width: 44,
      height: 44,
      top: 0,
      right: 0,
      paddingTop: 4,
      paddingBottom: 4,
      paddingLeft: 4,
      paddingRight: 4,
      borderTopLeftRadius: 22,
      borderTopRightRadius: 22,
      borderBottomLeftRadius: 22,
      borderBottomRightRadius: 22,
      borderStyle: 'solid',
      borderLeftWidth: 1,
      borderTopWidth: 1,
      borderRightWidth: 1,
      borderBottomWidth: 1,
      backgroundColor: 'rgba(23, 23, 23, 1)',
      borderColor: 'rgba(64, 64, 64, 0.8)',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
      transition: SPRING_TRANSITION,
    },
    open: {
      width: Math.min(360, typeof window !== 'undefined' ? window.innerWidth * 0.9 : 360),
      height: viewportHeight || '100dvh',
      top: offsets.top,
      right: offsets.right,
      paddingTop: 24,
      paddingBottom: 24,
      paddingLeft: 20,
      paddingRight: 20,
      borderTopLeftRadius: 32,
      borderBottomLeftRadius: 32,
      borderTopRightRadius: 0,
      borderBottomRightRadius: 0,
      borderStyle: 'solid',
      borderLeftWidth: 1,
      borderTopWidth: 0,
      borderRightWidth: 0,
      borderBottomWidth: 0,
      backgroundColor: 'rgba(10, 10, 10, 0.98)',
      borderColor: 'rgba(38, 38, 38, 0.9)',
      boxShadow: '-12px 0 40px rgba(0, 0, 0, 0.75)',
      transition: SPRING_TRANSITION,
    },
  };

  // Mobile variants: remains 100% identical floating panel for screens < 768px
  const mobileVariants: Variants = {
    closed: {
      width: 44,
      height: 44,
      top: 0,
      right: 0,
      paddingTop: 4,
      paddingBottom: 4,
      paddingLeft: 4,
      paddingRight: 4,
      borderTopLeftRadius: 22,
      borderTopRightRadius: 22,
      borderBottomLeftRadius: 22,
      borderBottomRightRadius: 22,
      borderStyle: 'solid',
      borderLeftWidth: 1,
      borderTopWidth: 1,
      borderRightWidth: 1,
      borderBottomWidth: 1,
      backgroundColor: 'rgba(23, 23, 23, 1)',
      borderColor: 'rgba(64, 64, 64, 0.8)',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
      transition: SPRING_TRANSITION,
    },
    open: {
      width: 300,
      height: 'calc(100dvh - 24px)',
      top: -6,
      right: 0,
      paddingTop: 14,
      paddingBottom: 14,
      paddingLeft: 14,
      paddingRight: 14,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      borderBottomLeftRadius: 28,
      borderBottomRightRadius: 28,
      borderStyle: 'solid',
      borderLeftWidth: 1,
      borderTopWidth: 1,
      borderRightWidth: 1,
      borderBottomWidth: 1,
      backgroundColor: 'rgba(10, 10, 10, 0.96)',
      borderColor: 'rgba(38, 38, 38, 0.9)',
      boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.75)',
      transition: SPRING_TRANSITION,
    },
  };

  // Collapsible inner items container
  const contentWrapperVariants: Variants = {
    hidden: {
      opacity: 0,
      transition: {
        duration: 0.15,
        ease: 'easeInOut',
        staggerChildren: 0.012,
        staggerDirection: -1,
      },
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.035,
        delayChildren: 0.03,
      },
    },
  };

  // Individual item entrance and exit (fade + horizontal displacement x: -14 -> 0)
  const itemVariants: Variants = {
    hidden: {
      opacity: 0,
      x: -14,
      transition: {
        duration: 0.15,
        ease: 'easeInOut',
      },
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: SPRING_TRANSITION,
    },
  };

  return (
    <>
      {/* Desktop Backdrop: Dark semi-transparent overlay covering full screen behind the drawer */}
      {mounted &&
        isDesktop &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <motion.div
                key="desktop-nav-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 z-[39] bg-[rgba(10,10,12,0.45)] backdrop-blur-[2px] cursor-pointer"
                aria-hidden="true"
              />
            )}
          </AnimatePresence>,
          document.body
        )}

      <div ref={menuRef} className="relative w-11 h-11 shrink-0 z-50">
        <motion.div
          initial={false}
          animate={isOpen ? 'open' : 'closed'}
          variants={isDesktop ? desktopVariants : mobileVariants}
          className="absolute overflow-hidden backdrop-blur-2xl flex flex-col justify-between select-none max-w-[calc(100vw-24px)] md:max-w-none"
        >
          {/* Top Header Row: Title on the left (when open) + Morphing Hamburger <-> X on the right */}
          <div className="w-full flex items-center justify-between pb-2 shrink-0">
            {isOpen ? (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-2 pl-2"
              >
                <span className="w-2 h-2 rounded-full bg-[#b3131b] animate-pulse" />
                <span className="text-xs font-mono font-bold tracking-widest uppercase text-neutral-300">
                  Menú
                </span>
              </motion.div>
            ) : (
              <div className="w-0" />
            )}

            {/* Toggle Button */}
            <button
              type="button"
              onClick={handleToggle}
              className={cn(
                'w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#b3131b] active:scale-95 relative shrink-0',
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
        </div>

        {/* Collapsible Panel Content with Icon + Title Stack */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              key="panel-dock-content"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={contentWrapperVariants}
              className="flex-1 flex flex-col justify-between w-full overflow-hidden pt-1"
            >
              {/* Main Navigation List */}
              <div className="flex flex-col gap-1 overflow-y-auto pr-1 py-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {navItems.map((item) => {
                  const isActive =
                    item.href === '/'
                      ? pathname === '/'
                      : pathname.startsWith(item.href);
                  const Icon = item.icon;

                  return (
                    <motion.div
                      key={item.href}
                      variants={itemVariants}
                      className="w-full"
                    >
                      <Link
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          'group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#b3131b] active:scale-[0.98]',
                          isActive
                            ? 'bg-[#b3131b]/15 text-white ring-1 ring-[#b3131b]/40 shadow-sm'
                            : 'text-neutral-300 hover:text-white hover:bg-neutral-800/70'
                        )}
                        aria-label={item.label}
                      >
                        <div
                          className={cn(
                            'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors',
                            isActive
                              ? 'bg-[#b3131b]/20 text-white'
                              : 'text-neutral-400 group-hover:text-white group-hover:bg-neutral-800'
                          )}
                        >
                          <Icon
                            className={cn(
                              'w-4 h-4 transition-transform duration-200 group-hover:scale-110',
                              item.highlight && 'text-[#b3131b]',
                              isActive && !item.highlight && 'text-white'
                            )}
                          />
                        </div>

                        <span className="text-sm font-semibold tracking-tight truncate">
                          {item.label}
                        </span>

                        {item.badge && (
                          <span className="ml-auto px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-[#b3131b] text-white shrink-0">
                            {item.badge}
                          </span>
                        )}

                        {isActive && !item.badge && (
                          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#b3131b] shadow-[0_0_8px_#b3131b] shrink-0" />
                        )}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              {/* Bottom Footer Section (Separador + Mi cuenta + Cerrar sesión) */}
              <div className="mt-auto pt-2 shrink-0 border-t border-neutral-800/80">
                {session?.user ? (
                  <div className="flex flex-col gap-1">
                    {/* Mi cuenta Link */}
                    <motion.div variants={itemVariants} className="w-full">
                      <Link
                        href="/perfil"
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          'group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#b3131b] active:scale-[0.98]',
                          pathname.startsWith('/perfil')
                            ? 'bg-[#b3131b]/15 text-white ring-1 ring-[#b3131b]/40 shadow-sm'
                            : 'text-neutral-300 hover:text-white hover:bg-neutral-800/70'
                        )}
                        aria-label="Mi cuenta"
                      >
                        <div
                          className={cn(
                            'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors',
                            pathname.startsWith('/perfil')
                              ? 'bg-[#b3131b]/20 text-white'
                              : 'text-neutral-400 group-hover:text-white group-hover:bg-neutral-800'
                          )}
                        >
                          <User className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
                        </div>

                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="text-sm font-semibold tracking-tight truncate">
                            Mi cuenta
                          </span>
                          <span className="text-[10px] text-neutral-400 truncate">
                            {session.user.name || session.user.email}
                          </span>
                        </div>

                        {isAdmin && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-[#b3131b] text-white shrink-0">
                            ADMIN
                          </span>
                        )}
                      </Link>
                    </motion.div>

                    {/* Cerrar sesión Button (Rojo) */}
                    <motion.div variants={itemVariants} className="w-full">
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 active:scale-[0.98]"
                        aria-label="Cerrar sesión"
                      >
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-red-500/10 text-red-400 group-hover:bg-red-500/20 group-hover:text-red-300 transition-colors">
                          <LogOut className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
                        </div>
                        <span className="text-sm font-semibold tracking-tight">
                          Cerrar sesión
                        </span>
                      </button>
                    </motion.div>
                  </div>
                ) : (
                  /* Not Logged In -> Mi cuenta (Ingresar) */
                  <div className="flex flex-col gap-1">
                    <motion.div variants={itemVariants} className="w-full">
                      <Link
                        href="/login"
                        onClick={() => setIsOpen(false)}
                        className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-neutral-300 hover:text-white hover:bg-neutral-800/70 transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#b3131b] active:scale-[0.98]"
                        aria-label="Mi cuenta"
                      >
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-neutral-800 text-neutral-400 group-hover:text-white transition-colors">
                          <LogIn className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="text-sm font-semibold tracking-tight">
                            Mi cuenta
                          </span>
                          <span className="text-[10px] text-neutral-400">
                            Iniciar sesión o registrarte
                          </span>
                        </div>
                      </Link>
                    </motion.div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
    </>
  );
}
