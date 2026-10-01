'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  ChevronDown, 
  ChevronLeft, 
  ExternalLink, 
  LogOut, 
  Plus, 
  Layers
} from 'lucide-react';

interface AdminSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  ordersBadge?: number;
}

export default function AdminSidebar({ 
  collapsed, 
  onToggleCollapse,
  ordersBadge = 0 
}: AdminSidebarProps) {
  const pathname = usePathname();
  const [productsOpen, setProductsOpen] = useState(true);

  // Mantener abierto el submenú si la ruta activa es de productos
  useEffect(() => {
    if (pathname.startsWith('/admin/productos')) {
      setProductsOpen(true);
    }
  }, [pathname]);

  const isResumenActive = pathname === '/admin';
  const isPedidosActive = pathname.startsWith('/admin/pedidos');
  const isProductosActive = pathname.startsWith('/admin/productos');

  return (
    <aside 
      className={`hidden lg:flex flex-col flex-shrink-0 h-screen sticky top-0 bg-slate-950 text-slate-200 border-r border-slate-800/80 z-40 select-none transition-[width] duration-200 ease-out motion-reduce:transition-none ${
        collapsed ? 'w-[70px]' : 'w-64'
      }`}
      aria-label="Navegación del panel de administración"
    >
      {/* 1. Header / Logo Marca */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3 overflow-hidden">
          <Link 
            href="/admin" 
            className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-crimson)] rounded-lg p-1"
            title="Ir al Resumen"
          >
            {/* Monograma RD con acento carmesí */}
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/80 flex items-center justify-center flex-shrink-0 shadow-inner group-hover:border-[var(--brand-crimson)] transition-colors">
              <span className="text-xs font-black tracking-tighter text-white">RD</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-crimson)] -ml-0.5 mt-2" />
            </div>
            {!collapsed && (
              <div className="flex flex-col truncate">
                <span className="text-xs font-black tracking-wider uppercase text-white font-mono leading-none">
                  RD SPRING
                </span>
                <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold mt-0.5">
                  ADMINISTRACIÓN
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* Botón de Colapsar / Expandir */}
        <button
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Expandir barra lateral' : 'Colapsar barra lateral'}
          aria-expanded={!collapsed}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-crimson)] cursor-pointer"
          title={collapsed ? 'Expandir barra lateral' : 'Colapsar barra lateral'}
        >
          <ChevronLeft 
            className={`w-4 h-4 transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`} 
          />
        </button>
      </div>

      {/* 2. Cuerpo de Navegación */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto overflow-x-hidden">
        
        {/* Item 1: Resumen */}
        <div className="relative group">
          <Link
            href="/admin"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-crimson)] ${
              isResumenActive
                ? 'bg-slate-900 text-white shadow-sm border border-slate-800'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
            aria-describedby={collapsed ? 'tooltip-resumen' : undefined}
          >
            {/* Indicador activo con --brand-crimson */}
            <div className="relative flex items-center justify-center flex-shrink-0">
              <LayoutDashboard 
                className={`w-4 h-4 transition-colors ${
                  isResumenActive ? 'text-[var(--brand-crimson)]' : 'text-slate-400 group-hover:text-slate-200'
                }`} 
              />
              {isResumenActive && (
                <span className="absolute -left-3.5 w-1 h-5 rounded-r bg-[var(--brand-crimson)] shadow-[0_0_8px_var(--brand-crimson)]" />
              )}
            </div>

            {!collapsed && (
              <span className="truncate">Resumen</span>
            )}
          </Link>

          {/* Accessible Floating Tooltip (Solo en colapsado) */}
          {collapsed && (
            <div 
              id="tooltip-resumen" 
              role="tooltip" 
              className="absolute left-[calc(100%+10px)] top-1/2 -translate-y-1/2 py-1.5 px-3 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xl border border-slate-700/80 whitespace-nowrap z-50 pointer-events-none opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-150"
            >
              Resumen Operativo
            </div>
          )}
        </div>

        {/* Item 2: Pedidos */}
        <div className="relative group">
          <Link
            href="/admin/pedidos"
            className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-crimson)] ${
              isPedidosActive
                ? 'bg-slate-900 text-white shadow-sm border border-slate-800'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
            aria-describedby={collapsed ? 'tooltip-pedidos' : undefined}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative flex items-center justify-center flex-shrink-0">
                <ShoppingBag 
                  className={`w-4 h-4 transition-colors ${
                    isPedidosActive ? 'text-[var(--brand-crimson)]' : 'text-slate-400 group-hover:text-slate-200'
                  }`} 
                />
                {isPedidosActive && (
                  <span className="absolute -left-3.5 w-1 h-5 rounded-r bg-[var(--brand-crimson)] shadow-[0_0_8px_var(--brand-crimson)]" />
                )}
              </div>
              {!collapsed && (
                <span className="truncate">Pedidos</span>
              )}
            </div>

            {/* Badge de pedidos pagados */}
            {!collapsed && ordersBadge > 0 && (
              <span className="ml-auto px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700 rounded-full">
                {ordersBadge}
              </span>
            )}
          </Link>

          {collapsed && (
            <div 
              id="tooltip-pedidos" 
              role="tooltip" 
              className="absolute left-[calc(100%+10px)] top-1/2 -translate-y-1/2 py-1.5 px-3 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xl border border-slate-700/80 whitespace-nowrap z-50 pointer-events-none opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-150 flex items-center gap-2"
            >
              <span>Gestión de Pedidos</span>
              {ordersBadge > 0 && (
                <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold bg-slate-800 text-slate-300 rounded-full">
                  {ordersBadge}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Item 3: Productos (Acordeón con subcategorías reales) */}
        <div className="relative group">
          {collapsed ? (
            /* Vista colapsada: Enlace directo a productos */
            <Link
              href="/admin/productos"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-crimson)] ${
                isProductosActive
                  ? 'bg-slate-900 text-white shadow-sm border border-slate-800'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
              aria-describedby="tooltip-productos"
            >
              <div className="relative flex items-center justify-center flex-shrink-0">
                <Package 
                  className={`w-4 h-4 transition-colors ${
                    isProductosActive ? 'text-[var(--brand-crimson)]' : 'text-slate-400 group-hover:text-slate-200'
                  }`} 
                />
                {isProductosActive && (
                  <span className="absolute -left-3.5 w-1 h-5 rounded-r bg-[var(--brand-crimson)] shadow-[0_0_8px_var(--brand-crimson)]" />
                )}
              </div>
            </Link>
          ) : (
            /* Vista expandida: Botón acordeón */
            <div>
              <button
                type="button"
                onClick={() => setProductsOpen(!productsOpen)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-crimson)] cursor-pointer ${
                  isProductosActive
                    ? 'bg-slate-900/80 text-white border border-slate-800/80'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                }`}
                aria-expanded={productsOpen}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative flex items-center justify-center flex-shrink-0">
                    <Package 
                      className={`w-4 h-4 transition-colors ${
                        isProductosActive ? 'text-[var(--brand-crimson)]' : 'text-slate-400 group-hover:text-slate-200'
                      }`} 
                    />
                    {isProductosActive && (
                      <span className="absolute -left-3.5 w-1 h-5 rounded-r bg-[var(--brand-crimson)] shadow-[0_0_8px_var(--brand-crimson)]" />
                    )}
                  </div>
                  <span className="truncate">Productos</span>
                </div>
                <ChevronDown 
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                    productsOpen ? 'rotate-180' : ''
                  }`} 
                />
              </button>

              {/* Subitems del acordeón */}
              {productsOpen && (
                <div className="mt-1 ml-4 pl-3 border-l border-slate-800 space-y-1 py-1">
                  <Link
                    href="/admin/productos"
                    className={`block px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                      pathname === '/admin/productos'
                        ? 'text-white font-bold bg-slate-900/90'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                    }`}
                  >
                    Todos los productos
                  </Link>

                  {/* Categoría real de la base de datos: Lubricantes */}
                  <Link
                    href="/admin/productos?categoria=Lubricantes"
                    className="flex items-center justify-between px-3 py-1.5 rounded-lg text-[11px] font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 transition-colors"
                  >
                    <span className="flex items-center gap-1.5">
                      <Layers className="w-3 h-3 text-slate-500" />
                      Lubricantes
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-1.5 py-0.2 rounded">
                      32
                    </span>
                  </Link>

                  <Link
                    href="/admin/productos/nuevo"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                      pathname === '/admin/productos/nuevo'
                        ? 'text-[var(--brand-crimson)] font-bold bg-red-950/20'
                        : 'text-slate-400 hover:text-[var(--brand-crimson)] hover:bg-slate-900/40'
                    }`}
                  >
                    <Plus className="w-3 h-3" />
                    <span>Nuevo producto</span>
                  </Link>
                </div>
              )}
            </div>
          )}

          {collapsed && (
            <div 
              id="tooltip-productos" 
              role="tooltip" 
              className="absolute left-[calc(100%+10px)] top-1/2 -translate-y-1/2 py-1.5 px-3 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xl border border-slate-700/80 whitespace-nowrap z-50 pointer-events-none opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-150"
            >
              Catálogo de Productos
            </div>
          )}
        </div>

      </nav>

      {/* 3. Footer / Acciones Secundarias */}
      <div className="p-3 border-t border-slate-800/80 space-y-1 bg-slate-950/60">
        {/* Volver a la tienda */}
        <div className="relative group">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-900/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-crimson)]"
            aria-describedby={collapsed ? 'tooltip-tienda' : undefined}
          >
            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-slate-200 flex-shrink-0" />
            {!collapsed && (
              <span className="truncate">Ver tienda</span>
            )}
          </Link>
          {collapsed && (
            <div 
              id="tooltip-tienda" 
              role="tooltip" 
              className="absolute left-[calc(100%+10px)] top-1/2 -translate-y-1/2 py-1.5 px-3 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xl border border-slate-700/80 whitespace-nowrap z-50 pointer-events-none opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-150"
            >
              Volver a la tienda
            </div>
          )}
        </div>

        {/* Cerrar Sesión */}
        <div className="relative group">
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-red-400/90 hover:text-red-300 hover:bg-red-950/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-crimson)] cursor-pointer"
            aria-describedby={collapsed ? 'tooltip-logout' : undefined}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!collapsed && (
              <span className="truncate">Cerrar sesión</span>
            )}
          </button>
          {collapsed && (
            <div 
              id="tooltip-logout" 
              role="tooltip" 
              className="absolute left-[calc(100%+10px)] top-1/2 -translate-y-1/2 py-1.5 px-3 bg-red-950 text-red-200 text-xs font-semibold rounded-lg shadow-xl border border-red-900/80 whitespace-nowrap z-50 pointer-events-none opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-150"
            >
              Cerrar sesión
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
