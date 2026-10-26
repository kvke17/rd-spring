'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminMobileDrawer from '@/components/admin/AdminMobileDrawer';
import AdminHeader from '@/components/admin/AdminHeader';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [ordersCount, setOrdersCount] = useState<number>(0);

  // 1. Control de acceso y seguridad estricta para ADMINISTRADORES
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/admin');
    } else if (status === 'authenticated') {
      const userRole = (session?.user as any)?.role;
      if (userRole !== 'ADMIN') {
        router.push('/');
      }
    }
  }, [status, session, router]);

  // 2. Conteo de órdenes para el badge
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

  if (status === 'loading') {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#F8F9FA]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 rounded-full border-2 border-neutral-300 border-t-[#b3131b] animate-spin" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-500">
            Verificando credenciales de Administrador...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="flex min-h-screen bg-[#F8F9FA] text-neutral-900 font-sans selection:bg-[#b3131b] selection:text-white"
      data-lenis-prevent
    >
      {/* Sidebar compacta de iconos fija para desktop (Estilo Vessa) */}
      <AdminSidebar ordersBadge={ordersCount} />

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
