'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutGrid, 
  Wrench,
  Droplet,
  ShoppingBag, 
  FileText, 
  X, 
  ExternalLink, 
  LogOut 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SPRING_TRANSITION } from '@/lib/theme-tokens';

interface AdminMobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  ordersBadge?: number;
}

function AdminMobileDrawerContent({
  isOpen,
  onClose,
  ordersBadge = 0
}: AdminMobileDrawerProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');

  const [counts, setCounts] = useState({
    repuestos: 0,
    aceites: 0,
    orders: ordersBadge,
  });

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const res = await fetch('/api/admin/stats');
        if (res.ok) {
          const data = await res.json();
          setCounts({
            repuestos: data.kpis?.repuestosCount ?? 0,
            aceites: data.kpis?.lubricantesCount ?? 0,
            orders: data.sales?.pendingOrdersCount ?? 0,
          });
        }
      } catch {}
    };
    fetchCounts();
  }, []);

  const prevPathnameRef = useRef(pathname);
  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      onClose();
      prevPathnameRef.current = pathname;
    }
  }, [pathname, onClose]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  const isRepuestosActive = pathname === '/admin/productos' && tabParam !== 'aceites';
  const isAceitesActive = pathname === '/admin/productos' && tabParam === 'aceites';

  const navItems = [
    {
      id: 'resumen',
      label: 'Panel / Resumen',
      href: '/admin',
      icon: LayoutGrid,
      isActive: pathname === '/admin',
      badge: null,
    },
    {
      id: 'repuestos',
      label: 'Repuestos de Suspensión',
      href: '/admin/productos?tab=repuestos',
      icon: Wrench,
      isActive: isRepuestosActive,
      badge: counts.repuestos > 0 ? counts.repuestos : null,
    },
    {
      id: 'aceites',
      label: 'Aceites ROWE (Bajo Pedido)',
      href: '/admin/productos?tab=aceites',
      icon: Droplet,
      isActive: isAceitesActive,
      badge: counts.aceites > 0 ? counts.aceites : null,
    },
    {
      id: 'pedidos',
      label: 'Pedidos / Ventas',
      href: '/admin/pedidos',
      icon: ShoppingBag,
      isActive: pathname.startsWith('/admin/pedidos'),
      badge: counts.orders > 0 ? counts.orders : null,
    },
    {
      id: 'cotizaciones',
      label: 'Cotizaciones con VIN',
      href: '/admin/cotizaciones',
      icon: FileText,
      isActive: pathname.startsWith('/admin/cotizaciones'),
      badge: null,
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 w-screen h-[100dvh] z-50 lg:hidden overflow-hidden" 
          role="dialog" 
          aria-modal="true" 
          aria-label="Menú de administración móvil"
        >
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 w-screen h-[100dvh] bg-black/60 backdrop-blur-sm cursor-pointer"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer Deslizante */}
          <motion.aside 
            initial={{ x: '-100%' }}
            animate={{ x: '0%' }}
            exit={{ x: '-100%' }}
            transition={SPRING_TRANSITION}
            className="fixed inset-0 w-72 max-w-[85vw] h-[100dvh] bg-white text-neutral-900 border-r border-neutral-200 shadow-2xl flex flex-col z-10 select-none justify-between overflow-hidden"
          >
            {/* Header del Drawer */}
            <div className="h-16 flex items-center justify-between px-5 border-b border-neutral-200/80 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white font-black text-xs">
                  <span>RD</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#b3131b] ml-0.5 mt-1.5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-mono font-bold tracking-widest uppercase text-neutral-900">
                    RD SPRING
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-bold">
                    ADMINISTRACIÓN
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar menú"
                className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navegación Móvil */}
            <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      'flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all',
                      item.isActive
                        ? 'bg-[#b3131b] text-white shadow-sm'
                        : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 shrink-0" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== null && (
                      <span className={cn(
                        "text-xs font-mono px-2 py-0.5 rounded-full font-bold",
                        item.isActive 
                          ? "bg-white text-[#b3131b]" 
                          : "bg-neutral-100 text-neutral-700"
                      )}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Footer Móvil */}
            <div className="p-4 border-t border-neutral-200/80 space-y-2 shrink-0 bg-neutral-50/50">
              <Link
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-white text-xs font-semibold transition-colors"
              >
                <ExternalLink className="w-4 h-4 shrink-0 text-neutral-500" />
                <span>Ver tienda</span>
              </Link>

              <button
                type="button"
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#b3131b] hover:bg-red-50 text-xs font-semibold cursor-pointer transition-colors"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span>Cerrar sesión</span>
              </button>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}

export default function AdminMobileDrawer(props: AdminMobileDrawerProps) {
  return (
    <Suspense fallback={null}>
      <AdminMobileDrawerContent {...props} />
    </Suspense>
  );
}
