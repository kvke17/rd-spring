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
      <header className="sticky top-0 z-30 flex lg:hidden items-center justify-between h-14 px-4 bg-slate-950/95 backdrop-blur border-b border-slate-800/80">
        <button
          onClick={onOpenMobileDrawer}
          aria-label="Abrir menú de navegación"
          className="p-2 -ml-1 text-slate-300 hover:text-white hover:bg-slate-900 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-crimson)] cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Brand Center */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center">
            <span className="text-[10px] font-black tracking-tighter text-white">RD</span>
            <span className="w-1 h-1 rounded-full bg-[var(--brand-crimson)] ml-0.5" />
          </div>
          <span className="text-xs font-black uppercase tracking-wider text-white font-mono">
            RD SPRING
          </span>
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-red-950/60 text-red-300 border border-red-900/60 uppercase font-bold">
            ADMIN
          </span>
        </div>

        {/* Enlace rápido a tienda */}
        <Link
          href="/"
          className="p-2 text-slate-400 hover:text-white transition-colors"
          title="Ver tienda en vivo"
        >
          <ExternalLink className="w-4 h-4" />
        </Link>
      </header>

      {/* 2. Desktop Topbar (lg:flex) */}
      <header className="hidden lg:flex items-center justify-between h-16 px-8 bg-white border-b border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] select-none">
        {/* Breadcrumb contextual */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span>Panel</span>
            <span>/</span>
            <span className="font-bold text-slate-900 uppercase tracking-wider font-sans">
              {getBreadcrumbTitle()}
            </span>
          </div>
        </div>

        {/* Operational Status & User Profile */}
        <div className="flex items-center gap-4">
          {/* DB Live status */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/70 text-emerald-800 text-[11px] font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Database className="w-3 h-3 text-emerald-600" />
            <span className="font-mono text-[10px] tracking-tight">Turso DB Conectado</span>
          </div>

          <div className="h-4 w-px bg-slate-200" />

          {/* User Profile Pill */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center font-mono text-xs font-bold shadow-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-slate-900 leading-tight">
                {adminName}
              </span>
              <span className="text-[10px] text-slate-400 font-mono leading-tight">
                {adminEmail}
              </span>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
