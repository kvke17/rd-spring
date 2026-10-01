'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
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

  if (!isOpen) return null;

  const isResumenActive = pathname === '/admin';
  const isPedidosActive = pathname.startsWith('/admin/pedidos');
  const isProductosActive = pathname.startsWith('/admin/productos');

  return (
    <div 
      className="fixed inset-0 z-50 lg:hidden overflow-hidden" 
      role="dialog" 
      aria-modal="true" 
      aria-label="Menú de administración móvil"
    >
      {/* 1. Backdrop con difuminado suave */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 2. Contenedor del Drawer deslizante */}
      <aside 
        className="relative w-72 max-w-[85vw] h-full bg-slate-950 text-slate-200 border-r border-slate-800/80 shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200"
      >
        {/* Header del Drawer */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/80 flex items-center justify-center shadow-inner">
              <span className="text-xs font-black tracking-tighter text-white">RD</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-crimson)] -ml-0.5 mt-2" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black tracking-wider uppercase text-white font-mono leading-none">
                RD SPRING
              </span>
              <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold mt-0.5">
                ADMINISTRACIÓN
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Cerrar menú"
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-crimson)] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navegación Principal */}
        <nav className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
          {/* Resumen */}
          <Link
            href="/admin"
            className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors ${
              isResumenActive
                ? 'bg-slate-900 text-white border border-slate-800 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <LayoutDashboard 
              className={`w-4 h-4 ${isResumenActive ? 'text-[var(--brand-crimson)]' : 'text-slate-400'}`} 
            />
            <span>Resumen</span>
            {isResumenActive && (
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--brand-crimson)] shadow-[0_0_8px_var(--brand-crimson)]" />
            )}
          </Link>

          {/* Pedidos */}
          <Link
            href="/admin/pedidos"
            className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors ${
              isPedidosActive
                ? 'bg-slate-900 text-white border border-slate-800 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <ShoppingBag 
                className={`w-4 h-4 ${isPedidosActive ? 'text-[var(--brand-crimson)]' : 'text-slate-400'}`} 
              />
              <span>Pedidos</span>
            </div>
            {ordersBadge > 0 && (
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700 rounded-full">
                {ordersBadge}
              </span>
            )}
          </Link>

          {/* Productos (Acordeón) */}
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => setProductsOpen(!productsOpen)}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                isProductosActive
                  ? 'bg-slate-900/80 text-white border border-slate-800'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
              aria-expanded={productsOpen}
            >
              <div className="flex items-center gap-3">
                <Package 
                  className={`w-4 h-4 ${isProductosActive ? 'text-[var(--brand-crimson)]' : 'text-slate-400'}`} 
                />
                <span>Productos</span>
              </div>
              <ChevronDown 
                className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                  productsOpen ? 'rotate-180' : ''
                }`} 
              />
            </button>

            {productsOpen && (
              <div className="ml-4 pl-3 border-l border-slate-800 space-y-1 py-1">
                <Link
                  href="/admin/productos"
                  className={`block px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    pathname === '/admin/productos'
                      ? 'text-white font-bold bg-slate-900'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                  }`}
                >
                  Todos los productos
                </Link>

                <Link
                  href="/admin/productos?categoria=Lubricantes"
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-slate-500" />
                    Lubricantes
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">
                    32
                  </span>
                </Link>

                <Link
                  href="/admin/productos/nuevo"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    pathname === '/admin/productos/nuevo'
                      ? 'text-[var(--brand-crimson)] font-bold bg-red-950/20'
                      : 'text-slate-400 hover:text-[var(--brand-crimson)] hover:bg-slate-900/40'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nuevo producto</span>
                </Link>
              </div>
            )}
          </div>
        </nav>

        {/* Footer del Drawer */}
        <div className="p-4 border-t border-slate-800/80 space-y-2 bg-slate-950/80">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-900/60 transition-colors"
          >
            <ExternalLink className="w-4 h-4 text-slate-400" />
            <span>Volver a la tienda</span>
          </Link>

          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-950/20 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>
    </div>
  );
}
