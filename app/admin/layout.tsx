'use client';

import { useState, useEffect, useCallback } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminMobileDrawer from '@/components/admin/AdminMobileDrawer';
import AdminHeader from '@/components/admin/AdminHeader';
import { useSession } from 'next-auth/react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [ordersCount, setOrdersCount] = useState<number>(0);
  const { data: session } = useSession();

  // 1. Cargar persistencia de la barra lateral desde localStorage sin parpadeo
  useEffect(() => {
    try {
      const saved = localStorage.getItem('rd_admin_sidebar_collapsed');
      if (saved !== null) {
        setCollapsed(saved === 'true');
      }
    } catch {
      // Ignorar fallos de localStorage en entornos restringidos
    }
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('rd_admin_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  // 2. Obtener conteo de órdenes pagadas para el badge de navegación
  useEffect(() => {
    const loadOrdersCount = async () => {
      try {
        const res = await fetch('/api/admin/orders');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.orders)) {
            setOrdersCount(data.orders.length);
          }
        }
      } catch (err) {
        console.error('Error cargando badge de órdenes:', err);
      }
    };
    loadOrdersCount();
  }, []);

  const closeMobileDrawer = useCallback(() => {
    setMobileDrawerOpen(false);
  }, []);

  return (
    <div 
      className="flex min-h-screen bg-neutral-50/70 text-neutral-900 font-sans selection:bg-[#b3131b] selection:text-white"
      data-lenis-prevent
    >
      {/* Sidebar fija colapsable para desktop */}
      <AdminSidebar 
        collapsed={collapsed} 
        onToggleCollapse={toggleCollapsed} 
        ordersBadge={ordersCount}
      />

      {/* Drawer deslizante para móviles (< 1024px) */}
      <AdminMobileDrawer
        isOpen={mobileDrawerOpen}
        onClose={closeMobileDrawer}
        ordersBadge={ordersCount}
      />

      {/* Área de contenido principal */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <AdminHeader 
          onOpenMobileDrawer={() => setMobileDrawerOpen(true)}
          adminName={session?.user?.name || 'Administrador'}
          adminEmail={session?.user?.email || 'admin@rdspring.cl'}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}