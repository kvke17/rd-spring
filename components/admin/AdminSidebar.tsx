'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { 
  LayoutGrid, 
  Wrench, 
  Droplet, 
  ShoppingBag, 
  FileText, 
  ExternalLink, 
  LogOut 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminSidebarProps {
  ordersBadge?: number;
  totalProductsBadge?: number;
}

function AdminSidebarContent({
  ordersBadge = 0,
}: AdminSidebarProps) {
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
      label: 'Aceites y Fluidos ROWE',
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
    <aside 
      className="hidden lg:flex flex-col items-center justify-between w-18 h-screen sticky top-0 bg-white border-r border-neutral-200/80 z-40 select-none py-5 shrink-0 shadow-xs"
      aria-label="Barra lateral de administración compacta"
    >
      {/* 1. Brand Mark Superior (Logo Badge RD Spring) */}
      <div className="flex flex-col items-center">
        <Link 
          href="/admin" 
          className="group relative flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#b3131b] rounded-xl"
          aria-label="Ir al Panel de Administración"
        >
          <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white font-black text-xs relative shadow-xs group-hover:scale-105 group-hover:border-[#b3131b] transition-all duration-150">
            <span>RD</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#b3131b] ml-0.5 mt-2" />
          </div>

          {/* Tooltip Brand */}
          <div className="pointer-events-none absolute left-14 top-1/2 -translate-y-1/2 z-50 whitespace-nowrap opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150">
            <div className="py-1 px-2.5 bg-neutral-900 text-white text-[11px] font-bold rounded-lg shadow-xl border border-neutral-800">
              RD SPRING • Panel
            </div>
          </div>
        </Link>
      </div>

      {/* 2. Navegación Principal (Icon-Only + Tooltip en Español) */}
      <nav className="flex flex-col items-center gap-3 w-full px-2 my-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.id} className="relative group flex items-center justify-center w-full">
              <Link
                href={item.href}
                className={cn(
                  'relative flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#b3131b]',
                  item.isActive
                    ? 'bg-[#b3131b] text-white shadow-sm shadow-[#b3131b]/20 scale-102'
                    : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100'
                )}
                aria-label={item.label}
              >
                <Icon className="w-5 h-5" />

                {/* Badge de conteo real si existe */}
                {item.badge !== null && (
                  <span className={cn(
                    'absolute -top-1 -right-1 font-mono text-[9px] font-bold px-1.5 py-0.2 rounded-full border shadow-2xs',
                    item.isActive 
                      ? 'bg-white text-[#b3131b] border-white' 
                      : 'bg-[#b3131b] text-white border-white'
                  )}>
                    {item.badge}
                  </span>
                )}
              </Link>

              {/* Floating Tooltip estrictamente en Español */}
              <div className="pointer-events-none absolute left-14 top-1/2 -translate-y-1/2 z-50 whitespace-nowrap opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150">
                <div className="py-1.5 px-3 bg-neutral-900 text-white text-xs font-semibold rounded-xl shadow-xl border border-neutral-800 flex items-center gap-2">
                  <span>{item.label}</span>
                  {item.badge !== null && (
                    <span className="font-mono text-[10px] bg-neutral-800 text-neutral-300 px-1.5 py-0.2 rounded">
                      {item.badge}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </nav>

      {/* 3. Acciones Inferiores: "Ver tienda" y "Cerrar sesión" */}
      <div className="flex flex-col items-center gap-2.5 w-full px-2 pt-4 border-t border-neutral-200/80">
        {/* Ver tienda */}
        <div className="relative group flex items-center justify-center w-full">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-10 h-10 rounded-xl text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
            aria-label="Ver tienda"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>

          <div className="pointer-events-none absolute left-14 top-1/2 -translate-y-1/2 z-50 whitespace-nowrap opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150">
            <div className="py-1.5 px-3 bg-neutral-900 text-white text-xs font-semibold rounded-xl shadow-xl border border-neutral-800">
              Ver tienda
            </div>
          </div>
        </div>

        {/* Cerrar sesión */}
        <div className="relative group flex items-center justify-center w-full">
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center justify-center w-10 h-10 rounded-xl text-neutral-400 hover:text-[#b3131b] hover:bg-red-50 transition-colors cursor-pointer"
            aria-label="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>

          <div className="pointer-events-none absolute left-14 top-1/2 -translate-y-1/2 z-50 whitespace-nowrap opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150">
            <div className="py-1.5 px-3 bg-neutral-900 text-white text-xs font-semibold rounded-xl shadow-xl border border-neutral-800">
              Cerrar sesión
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default function AdminSidebar(props: AdminSidebarProps) {
  return (
    <Suspense fallback={<aside className="hidden lg:flex w-18 h-screen bg-white border-r border-neutral-200" />}>
      <AdminSidebarContent {...props} />
    </Suspense>
  );
}
