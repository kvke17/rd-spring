'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  ChevronDown, 
  X, 
  ExternalLink, 
  LogOut, 
  Plus, 
  Layers 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SPRING_TRANSITION } from '@/lib/theme-tokens';

interface AdminMobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  ordersBadge?: number;
}

export default function AdminMobileDrawer({
  isOpen,
  onClose,
  ordersBadge = 0
}: AdminMobileDrawerProps) {
  const pathname = usePathname();
  const [productsOpen, setProductsOpen] = useState(true);

  // Cerrar solo cuando efectivamente cambie de ruta
  const prevPathnameRef = useRef(pathname);
  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      onClose();
      prevPathnameRef.current = pathname;
    }
  }, [pathname, onClose]);

  // Manejo de la tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Bloqueo estricto del scroll del body cuando el drawer está activo
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  const isResumenActive = pathname === '/admin';
  const isPedidosActive = pathname.startsWith('/admin/pedidos');
  const isProductosActive = pathname.startsWith('/admin/productos');

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 w-screen h-[100dvh] z-50 lg:hidden overflow-hidden" 
          role="dialog" 
          aria-modal="true" 
          aria-label="Menú de administración móvil"
        >
          {/* 1. Backdrop con difuminado suave y fade in/out */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 w-screen h-[100dvh] bg-black/75 backdrop-blur-sm cursor-pointer"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* 2. Contenedor del Drawer deslizante con físicas de resorte de la tienda */}
          <motion.aside 
            initial={{ x: '-100%' }}
            animate={{ x: '0%' }}
            exit={{ x: '-100%' }}
            transition={SPRING_TRANSITION}
            className="fixed inset-0 w-full h-[100dvh] sm:relative sm:w-80 sm:max-w-xs bg-[#0a0a0a] text-neutral-200 border-r border-neutral-800/80 shadow-2xl flex flex-col z-10 select-none justify-between overflow-hidden"
          >
            {/* Header del Drawer */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-neutral-800/80 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-700/80 flex items-center justify-center shadow-sm">
                  <span className="text-xs font-black tracking-tighter text-white">RD</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#b3131b] -ml-0.5 mt-2" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#b3131b] animate-pulse shrink-0" />
                    <span className="text-xs font-mono font-bold tracking-widest uppercase text-white leading-none">
                      RD SPRING
                    </span>
                  </div>
                  <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold mt-1">
                    ADMINISTRACIÓN
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar menú"
                className="w-9 h-9 rounded-full flex items-center justify-center bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#b3131b] active:scale-95 cursor-pointer border border-neutral-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Navegación Principal con items estilizados */}
            <nav className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {/* Resumen */}
              <Link
                href="/admin"
                onClick={onClose}
                className={cn(
                  'group flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all duration-200 cursor-pointer active:scale-[0.98]',
                  isResumenActive
                    ? 'bg-[#b3131b]/15 text-white ring-1 ring-[#b3131b]/40 shadow-sm'
                    : 'text-neutral-300 hover:text-white hover:bg-neutral-900/70'
                )}
              >
                <div
                  className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors',
                    isResumenActive
                      ? 'bg-[#b3131b]/20 text-white'
                      : 'bg-neutral-900 text-neutral-400 group-hover:text-white group-hover:bg-neutral-800'
                  )}
                >
                  <LayoutDashboard className="w-4 h-4" />
                </div>
                <span className="text-sm font-semibold tracking-tight">Resumen</span>
                {isResumenActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#b3131b] shadow-[0_0_8px_#b3131b]" />
                )}
              </Link>

              {/* Pedidos */}
              <Link
                href="/admin/pedidos"
                onClick={onClose}
                className={cn(
                  'group flex items-center justify-between px-3.5 py-3 rounded-xl transition-all duration-200 cursor-pointer active:scale-[0.98]',
                  isPedidosActive
                    ? 'bg-[#b3131b]/15 text-white ring-1 ring-[#b3131b]/40 shadow-sm'
                    : 'text-neutral-300 hover:text-white hover:bg-neutral-900/70'
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors',
                      isPedidosActive
                        ? 'bg-[#b3131b]/20 text-white'
                        : 'bg-neutral-900 text-neutral-400 group-hover:text-white group-hover:bg-neutral-800'
                    )}
                  >
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-semibold tracking-tight">Pedidos</span>
                </div>
                {ordersBadge > 0 && (
                  <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-[#b3131b] text-white rounded">
                    {ordersBadge}
                  </span>
                )}
                {isPedidosActive && ordersBadge === 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#b3131b] shadow-[0_0_8px_#b3131b]" />
                )}
              </Link>

              {/* Productos Desplegable */}
              <div>
                <button
                  type="button"
                  onClick={() => setProductsOpen(!productsOpen)}
                  className={cn(
                    'w-full flex items-center justify-between px-3.5 py-3 rounded-xl transition-all duration-200 cursor-pointer active:scale-[0.98]',
                    isProductosActive
                      ? 'bg-neutral-900/80 text-white border border-neutral-800/80'
                      : 'text-neutral-300 hover:text-white hover:bg-neutral-900/70'
                  )}
                  aria-expanded={productsOpen}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors',
                        isProductosActive
                          ? 'bg-[#b3131b]/20 text-white'
                          : 'bg-neutral-900 text-neutral-400'
                      )}
                    >
                      <Package className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-semibold tracking-tight">Productos</span>
                  </div>
                  <motion.div
                    initial={false}
                    animate={{ rotate: productsOpen ? 180 : 0 }}
                    transition={SPRING_TRANSITION}
                    className="text-neutral-400"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </motion.div>
                </button>

                {/* Subitems del acordeón */}
                <AnimatePresence initial={false}>
                  {productsOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={SPRING_TRANSITION}
                      className="overflow-hidden mt-1 ml-4 pl-3 border-l border-neutral-800 space-y-1 py-1"
                    >
                      <Link
                        href="/admin/productos"
                        onClick={onClose}
                        className={cn(
                          'block px-3 py-2 rounded-lg text-xs font-medium transition-colors',
                          pathname === '/admin/productos'
                            ? 'text-white font-bold bg-[#b3131b]/15 ring-1 ring-[#b3131b]/40'
                            : 'text-neutral-400 hover:text-white hover:bg-neutral-900/60'
                        )}
                      >
                        Todos los productos
                      </Link>

                      <Link
                        href="/admin/productos?categoria=Lubricantes"
                        onClick={onClose}
                        className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-neutral-400 hover:text-white hover:bg-neutral-900/60 transition-colors"
                      >
                        <span className="flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-neutral-500" />
                          Lubricantes
                        </span>
                        <span className="text-[10px] font-mono text-neutral-300 bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800">
                          32
                        </span>
                      </Link>

                      <Link
                        href="/admin/productos/nuevo"
                        onClick={onClose}
                        className={cn(
                          'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors',
                          pathname === '/admin/productos/nuevo'
                            ? 'text-white font-bold bg-[#b3131b]/20 ring-1 ring-[#b3131b]/40'
                            : 'text-neutral-300 hover:text-[#b3131b] hover:bg-neutral-900/60'
                        )}
                      >
                        <Plus className="w-3.5 h-3.5 text-[#b3131b]" />
                        <span>Nuevo producto</span>
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </nav>

            {/* Footer / Acciones Secundarias (Separador + Ver tienda + Cerrar sesión en rojo) */}
            <div className="p-3 border-t border-neutral-800/80 space-y-1 bg-[#0a0a0a] shrink-0">
              <Link
                href="/"
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-900/80 transition-all duration-200 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center shrink-0">
                  <ExternalLink className="w-4 h-4 text-neutral-400" />
                </div>
                <span className="text-sm font-semibold tracking-tight">Ver tienda</span>
              </Link>

              <button
                type="button"
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-red-500/10 text-red-400">
                  <LogOut className="w-4 h-4" />
                </div>
                <span className="text-sm font-semibold tracking-tight">Cerrar sesión</span>
              </button>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
