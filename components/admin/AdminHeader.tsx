'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, ExternalLink, ShieldCheck, Database } from 'lucide-react';

interface AdminHeaderProps {
  onOpenMobileDrawer: () => void;
  adminName?: string;
  adminEmail?: string;
}

export default function AdminHeader({
  onOpenMobileDrawer,
  adminName = 'Administrador',
  adminEmail = 'admin@rdspring.cl'
}: AdminHeaderProps) {
  const pathname = usePathname();

  // Helper para generar el breadcrumb legible según la ruta activa
  const getBreadcrumbTitle = () => {
    if (pathname === '/admin') return 'Resumen Operativo';
    if (pathname.startsWith('/admin/pedidos')) return 'Gestión de Pedidos';
    if (pathname === '/admin/productos') return 'Catálogo de Productos';
    if (pathname === '/admin/productos/nuevo') return 'Catálogo / Nuevo Producto';
    if (pathname.startsWith('/admin/productos/editar')) return 'Catálogo / Editar Producto';
    return 'Administración';
  };

  return (
    <>
      {/* 1. Mobile Sticky Topbar (< 1024px) */}
      <header className="sticky top-0 z-30 flex lg:hidden items-center justify-between h-14 px-4 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-neutral-800/80">
        <button
          type="button"
          onClick={onOpenMobileDrawer}
          aria-label="Abrir menú de navegación"
          className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-700/80 text-white flex items-center justify-center hover:bg-neutral-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#b3131b] active:scale-95 cursor-pointer shadow-sm"
        >
          <Menu className="w-4 h-4 text-white" />
        </button>

        {/* Brand Center con acento carmesí */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-neutral-900 border border-neutral-700/80 flex items-center justify-center">
            <span className="text-[10px] font-black tracking-tighter text-white">RD</span>
            <span className="w-1 h-1 rounded-full bg-[#b3131b] ml-0.5" />
          </div>
          <span className="text-xs font-black uppercase tracking-wider text-white font-mono">
            RD SPRING
          </span>
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#b3131b] text-white uppercase font-bold tracking-wider">
            ADMIN
          </span>
        </div>

        {/* Enlace rápido a tienda */}
        <Link
          href="/"
          className="p-2 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          title="Ver tienda en vivo"
          aria-label="Ver tienda en vivo"
        >
          <ExternalLink className="w-4 h-4" />
        </Link>
      </header>

      {/* 2. Desktop Topbar (lg:flex) */}
      <header className="hidden lg:flex items-center justify-between h-16 px-8 bg-white/80 backdrop-blur-md border-b border-black/[0.06] shadow-xs select-none sticky top-0 z-30">
        {/* Breadcrumb contextual con tipografía clara */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono">
            <span>Panel</span>
            <span>/</span>
            <span className="font-bold text-neutral-900 uppercase tracking-wider font-sans">
              {getBreadcrumbTitle()}
            </span>
          </div>
        </div>

        {/* Operational Status & User Profile */}
        <div className="flex items-center gap-4">
          {/* DB Live status */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50/80 border border-emerald-200/80 text-emerald-800 text-[11px] font-medium shadow-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Database className="w-3 h-3 text-emerald-600" />
            <span className="font-mono text-[10px] tracking-tight font-semibold">Turso DB Conectado</span>
          </div>

          <div className="h-4 w-px bg-neutral-200" />

          {/* User Profile Pill */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-neutral-900 text-white flex items-center justify-center font-mono text-xs font-bold shadow-xs border border-neutral-800">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-neutral-900 leading-tight">
                  {adminName}
                </span>
                <span className="px-1.5 py-0.2 rounded text-[8px] font-bold uppercase tracking-wider bg-[#b3131b] text-white shrink-0">
                  ADMIN
                </span>
              </div>
              <span className="text-[10px] text-neutral-400 font-mono leading-tight">
                {adminEmail}
              </span>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
