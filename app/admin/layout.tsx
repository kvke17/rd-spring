'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, ShoppingBag, Package, LayoutDashboard } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const tabs = [
    { name: 'Resumen', href: '/admin', icon: LayoutDashboard },
    { name: 'Pedidos', href: '/admin/pedidos', icon: ShoppingBag },
    { name: 'Productos', href: '/admin/productos', icon: Package }, 
  ];

  return (
    <div className="min-h-screen bg-slate-50/70 text-gray-900 pt-28 pb-24 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Luxury Header Banner */}
        <div className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-[#b3131b]" />
              <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#b3131b] font-bold">
                PANEL DE CONTROL TÉCNICO
              </p>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-gray-900">
              Centro de Control
            </h1>
          </div>

          {/* Internal Navigation: Luxury Rounded Tabs */}
          <nav className="inline-flex p-1.5 bg-white border border-slate-200/80 rounded-2xl shadow-sm self-start sm:self-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = 
                tab.href === '/admin' 
                  ? pathname === '/admin' 
                  : pathname === tab.href || pathname.startsWith(`${tab.href}/`);

              return (
                <Link
                  key={tab.name}
                  href={tab.href}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 active:scale-95 ${
                    isActive 
                      ? 'bg-slate-900 text-white shadow-md' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#b3131b]' : 'text-slate-400'}`} />
                  {tab.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Content Viewport */}
        <div>
          {children}
        </div>

      </div>
    </div>
  );
}