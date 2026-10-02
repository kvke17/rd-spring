'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { cn } from '@/lib/utils';
import { SPRING_TRANSITION } from '@/lib/theme-tokens';

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
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Mantener abierto el submenú si la ruta activa es de productos
  useEffect(() => {
    if (pathname.startsWith('/admin/productos')) {
      setProductsOpen(true);
    }
  }, [pathname]);

  const isResumenActive = pathname === '/admin';
  const isPedidosActive = pathname.startsWith('/admin/pedidos');
  const isProductosActive = pathname.startsWith('/admin/productos');

  const tooltipVariants = {
    hidden: { opacity: 0, x: -8, scale: 0.96 },
    visible: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.15 } },
  };

  return (
    <motion.aside 
      initial={false}
      animate={{ width: collapsed ? 72 : 256 }}
      transition={SPRING_TRANSITION}
      className={cn(
        "hidden lg:flex flex-col flex-shrink-0 h-screen sticky top-0 bg-[#0a0a0a] text-neutral-200 border-r border-neutral-800/80 z-40 select-none shadow-[4px_0_24px_rgba(0,0,0,0.5)]",
        collapsed ? "overflow-visible" : "overflow-hidden"
      )}
      aria-label="Navegación del panel de administración"
    >
      {/* 1. Header / Logo Marca con punto carmesí y botón toggle */}
      <div className="h-16 flex items-center justify-between px-3.5 border-b border-neutral-800/80 shrink-0">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <Link 
            href="/admin" 
            className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#b3131b] rounded-xl p-1"
            aria-label="Ir al Resumen Operativo"
          >
            {/* Monograma RD con acento carmesí idéntico a la tienda */}
            <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-700/80 flex items-center justify-center shrink-0 shadow-sm group-hover:border-[#b3131b] transition-colors relative">
              <span className="text-xs font-black tracking-tighter text-white">RD</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#b3131b] -ml-0.5 mt-2" />
            </div>

            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center gap-2 truncate"
                >
                  <span className="w-2 h-2 rounded-full bg-[#b3131b] animate-pulse shrink-0" />
                  <div className="flex flex-col truncate">
                    <span className="text-xs font-mono font-bold tracking-widest uppercase text-white leading-none">
                      RD SPRING
                    </span>
                    <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold mt-1">
                      ADMINISTRACIÓN
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Link>
        </div>

        {/* Botón de Colapsar / Expandir con morfismo y rotación suave */}
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Expandir barra lateral' : 'Colapsar barra lateral'}
          aria-expanded={!collapsed}
          className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-800/70 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#b3131b] active:scale-95 cursor-pointer shrink-0 ml-auto"
          title={collapsed ? 'Expandir barra lateral' : 'Colapsar barra lateral'}
        >
          <motion.div
            initial={false}
            animate={{
              rotate: collapsed ? 180 : 0,
              scale: collapsed ? 0.95 : 1,
            }}
            transition={SPRING_TRANSITION}
            className="flex items-center justify-center pointer-events-none"
          >
            <ChevronLeft className="w-4 h-4 text-neutral-300" />
          </motion.div>
        </button>
      </div>

      {/* 2. Cuerpo de Navegación con Staggered Entrance & Sliding Active Pill */}
      <nav className={cn(
        "flex-1 py-4 px-2 space-y-1.5",
        collapsed ? "overflow-visible" : "overflow-y-auto overflow-x-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      )}>
        
        {/* Item 1: Resumen */}
        <div 
          className="relative"
          onMouseEnter={() => collapsed && setHoveredItem('resumen')}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <Link
            href="/admin"
            className={cn(
              'group/item relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#b3131b] active:scale-[0.98]',
              isResumenActive
                ? 'text-white shadow-sm'
                : 'text-neutral-300 hover:text-white hover:bg-neutral-900/70',
              collapsed && 'justify-center px-0'
            )}
            aria-describedby={collapsed ? 'tooltip-resumen' : undefined}
          >
            {/* Sliding Active Pill Background (Framer Motion layoutId) */}
            {isResumenActive && (
              <motion.div
                layoutId="adminActiveIndicator"
                transition={SPRING_TRANSITION}
                className="absolute inset-0 bg-[#b3131b]/15 ring-1 ring-[#b3131b]/40 rounded-xl"
              />
            )}

            {/* Icono en caja sutil */}
            <div
              className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors relative z-10',
                isResumenActive
                  ? 'bg-[#b3131b]/20 text-white'
                  : 'bg-neutral-900 text-neutral-400 group-hover/item:text-white group-hover/item:bg-neutral-800'
              )}
            >
              <LayoutDashboard 
                className={cn(
                  'w-4 h-4 transition-transform duration-200 group-hover/item:scale-110',
                  isResumenActive && 'text-white'
                )} 
              />
            </div>

            {!collapsed && (
              <span className="text-sm font-semibold tracking-tight truncate relative z-10">
                Resumen
              </span>
            )}

            {!collapsed && isResumenActive && (
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#b3131b] shadow-[0_0_8px_#b3131b] shrink-0 relative z-10" />
            )}
          </Link>

          {/* Accessible Floating Tooltip (Solo en colapsado) */}
          <AnimatePresence>
            {collapsed && hoveredItem === 'resumen' && (
              <motion.div
                id="tooltip-resumen"
                role="tooltip"
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={tooltipVariants}
                className="pointer-events-none absolute left-[calc(100%+14px)] top-1/2 -translate-y-1/2 z-50 whitespace-nowrap"
              >
                <div className="py-1.5 px-3 bg-neutral-900/95 text-white text-xs font-semibold rounded-xl shadow-2xl border border-neutral-800 backdrop-blur-xl ring-1 ring-white/10">
                  Resumen Operativo
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Item 2: Pedidos */}
        <div 
          className="relative"
          onMouseEnter={() => collapsed && setHoveredItem('pedidos')}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <Link
            href="/admin/pedidos"
            className={cn(
              'group/item relative flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#b3131b] active:scale-[0.98]',
              isPedidosActive
                ? 'text-white shadow-sm'
                : 'text-neutral-300 hover:text-white hover:bg-neutral-900/70',
              collapsed && 'justify-center px-0'
            )}
            aria-describedby={collapsed ? 'tooltip-pedidos' : undefined}
          >
            {/* Sliding Active Pill Background (Framer Motion layoutId) */}
            {isPedidosActive && (
              <motion.div
                layoutId="adminActiveIndicator"
                transition={SPRING_TRANSITION}
                className="absolute inset-0 bg-[#b3131b]/15 ring-1 ring-[#b3131b]/40 rounded-xl"
              />
            )}

            <div className={cn('flex items-center gap-3 min-w-0 relative z-10', collapsed && 'gap-0')}>
              <div
                className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors',
                  isPedidosActive
                    ? 'bg-[#b3131b]/20 text-white'
                    : 'bg-neutral-900 text-neutral-400 group-hover/item:text-white group-hover/item:bg-neutral-800'
                )}
              >
                <ShoppingBag 
                  className={cn(
                    'w-4 h-4 transition-transform duration-200 group-hover/item:scale-110',
                    isPedidosActive && 'text-white'
                  )} 
                />
              </div>
              {!collapsed && (
                <span className="text-sm font-semibold tracking-tight truncate">
                  Pedidos
                </span>
              )}
            </div>

            {/* Badge de pedidos pagados (estilo badge rojo ADMIN) */}
            {!collapsed && ordersBadge > 0 && (
              <span className="ml-auto px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-[#b3131b] text-white shrink-0 relative z-10 shadow-sm">
                {ordersBadge}
              </span>
            )}

            {!collapsed && isPedidosActive && ordersBadge === 0 && (
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#b3131b] shadow-[0_0_8px_#b3131b] shrink-0 relative z-10" />
            )}
          </Link>

          <AnimatePresence>
            {collapsed && hoveredItem === 'pedidos' && (
              <motion.div
                id="tooltip-pedidos"
                role="tooltip"
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={tooltipVariants}
                className="pointer-events-none absolute left-[calc(100%+14px)] top-1/2 -translate-y-1/2 z-50 whitespace-nowrap"
              >
                <div className="py-1.5 px-3 bg-neutral-900/95 text-white text-xs font-semibold rounded-xl shadow-2xl border border-neutral-800 backdrop-blur-xl ring-1 ring-white/10 flex items-center gap-2">
                  <span>Gestión de Pedidos</span>
                  {ordersBadge > 0 && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-[#b3131b] text-white">
                      {ordersBadge}
                    </span>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Item 3: Productos (Acordeón desplegable con físicas de resorte) */}
        <div 
          className="relative"
          onMouseEnter={() => collapsed && setHoveredItem('productos')}
          onMouseLeave={() => setHoveredItem(null)}
        >
          {collapsed ? (
            /* Vista colapsada: Enlace directo a productos */
            <Link
              href="/admin/productos"
              className={cn(
                'group/item relative flex items-center justify-center px-0 py-2.5 rounded-xl transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#b3131b] active:scale-[0.98]',
                isProductosActive
                  ? 'text-white shadow-sm'
                  : 'text-neutral-300 hover:text-white hover:bg-neutral-900/70'
              )}
              aria-describedby="tooltip-productos"
            >
              {isProductosActive && (
                <motion.div
                  layoutId="adminActiveIndicator"
                  transition={SPRING_TRANSITION}
                  className="absolute inset-0 bg-[#b3131b]/15 ring-1 ring-[#b3131b]/40 rounded-xl"
                />
              )}
              <div
                className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors relative z-10',
                  isProductosActive
                    ? 'bg-[#b3131b]/20 text-white'
                    : 'bg-neutral-900 text-neutral-400 group-hover/item:text-white group-hover/item:bg-neutral-800'
                )}
              >
                <Package 
                  className={cn(
                    'w-4 h-4 transition-transform duration-200 group-hover/item:scale-110',
                    isProductosActive && 'text-white'
                  )} 
                />
              </div>
            </Link>
          ) : (
            /* Vista expandida: Botón acordeón con rotación de chevron */
            <div>
              <button
                type="button"
                onClick={() => setProductsOpen(!productsOpen)}
                className={cn(
                  'group/item w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#b3131b] active:scale-[0.98] relative',
                  isProductosActive
                    ? 'text-white bg-neutral-900/80 border border-neutral-800/80'
                    : 'text-neutral-300 hover:text-white hover:bg-neutral-900/70'
                )}
                aria-expanded={productsOpen}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors',
                      isProductosActive
                        ? 'bg-[#b3131b]/20 text-white'
                        : 'bg-neutral-900 text-neutral-400 group-hover/item:text-white group-hover/item:bg-neutral-800'
                    )}
                  >
                    <Package 
                      className={cn(
                        'w-4 h-4 transition-transform duration-200 group-hover/item:scale-110',
                        isProductosActive && 'text-white'
                      )} 
                    />
                  </div>
                  <span className="text-sm font-semibold tracking-tight truncate">
                    Productos
                  </span>
                </div>
                <motion.div
                  initial={false}
                  animate={{ rotate: productsOpen ? 180 : 0 }}
                  transition={SPRING_TRANSITION}
                  className="flex items-center justify-center text-neutral-400"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </motion.div>
              </button>

              {/* Subitems del acordeón con animación de altura suave */}
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
                      className={cn(
                        'block px-3 py-2 rounded-lg text-xs font-medium transition-colors',
                        pathname === '/admin/productos'
                          ? 'text-white font-bold bg-[#b3131b]/15 ring-1 ring-[#b3131b]/40 shadow-xs'
                          : 'text-neutral-400 hover:text-white hover:bg-neutral-900/60'
                      )}
                    >
                      Todos los productos
                    </Link>

                    {/* Categoría real: Lubricantes con contador */}
                    <Link
                      href="/admin/productos?categoria=Lubricantes"
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

                    {/* Nuevo Producto con acento carmesí */}
                    <Link
                      href="/admin/productos/nuevo"
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
          )}

          <AnimatePresence>
            {collapsed && hoveredItem === 'productos' && (
              <motion.div
                id="tooltip-productos"
                role="tooltip"
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={tooltipVariants}
                className="pointer-events-none absolute left-[calc(100%+14px)] top-1/2 -translate-y-1/2 z-50 whitespace-nowrap"
              >
                <div className="py-1.5 px-3 bg-neutral-900/95 text-white text-xs font-semibold rounded-xl shadow-2xl border border-neutral-800 backdrop-blur-xl ring-1 ring-white/10">
                  Catálogo de Productos
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </nav>

      {/* 3. Footer / Acciones Secundarias (Separador + Ver tienda + Cerrar sesión en rojo) */}
      <div className={cn(
        "p-2 border-t border-neutral-800/80 space-y-1 bg-[#0a0a0a] shrink-0",
        collapsed ? "overflow-visible" : "overflow-hidden"
      )}>
        {/* Volver a la tienda */}
        <div 
          className="relative"
          onMouseEnter={() => collapsed && setHoveredItem('tienda')}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <Link
            href="/"
            className={cn(
              'group/item flex items-center gap-3 px-3 py-2.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-900/80 transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#b3131b] active:scale-[0.98]',
              collapsed && 'justify-center px-0'
            )}
            aria-describedby={collapsed ? 'tooltip-tienda' : undefined}
          >
            <div className="w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center shrink-0 group-hover/item:bg-neutral-800 transition-colors">
              <ExternalLink className="w-4 h-4 text-neutral-400 group-hover/item:text-white" />
            </div>
            {!collapsed && (
              <span className="text-sm font-semibold tracking-tight truncate">
                Ver tienda
              </span>
            )}
          </Link>
          <AnimatePresence>
            {collapsed && hoveredItem === 'tienda' && (
              <motion.div
                id="tooltip-tienda"
                role="tooltip"
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={tooltipVariants}
                className="pointer-events-none absolute left-[calc(100%+14px)] top-1/2 -translate-y-1/2 z-50 whitespace-nowrap"
              >
                <div className="py-1.5 px-3 bg-neutral-900/95 text-white text-xs font-semibold rounded-xl shadow-2xl border border-neutral-800 backdrop-blur-xl ring-1 ring-white/10">
                  Volver a la tienda
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Cerrar Sesión en Rojo */}
        <div 
          className="relative"
          onMouseEnter={() => collapsed && setHoveredItem('logout')}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: '/login' })}
            className={cn(
              'group/item w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 active:scale-[0.98]',
              collapsed && 'justify-center px-0'
            )}
            aria-describedby={collapsed ? 'tooltip-logout' : undefined}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-red-500/10 text-red-400 group-hover/item:bg-red-500/20 group-hover/item:text-red-300 transition-colors">
              <LogOut className="w-4 h-4 transition-transform duration-200 group-hover/item:scale-110" />
            </div>
            {!collapsed && (
              <span className="text-sm font-semibold tracking-tight truncate">
                Cerrar sesión
              </span>
            )}
          </button>
          <AnimatePresence>
            {collapsed && hoveredItem === 'logout' && (
              <motion.div
                id="tooltip-logout"
                role="tooltip"
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={tooltipVariants}
                className="pointer-events-none absolute left-[calc(100%+14px)] top-1/2 -translate-y-1/2 z-50 whitespace-nowrap"
              >
                <div className="py-1.5 px-3 bg-neutral-900/95 text-red-300 text-xs font-semibold rounded-xl shadow-2xl border border-neutral-800 backdrop-blur-xl ring-1 ring-red-500/20">
                  Cerrar sesión
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  );
}
