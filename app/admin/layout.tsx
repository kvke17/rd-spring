'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const tabs = [
    { name: 'Resumen', href: '/admin' },
    { name: 'Pedidos', href: '/admin/pedidos' },
    { name: 'Productos', href: '/admin/productos' }, 
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Cabecera del Panel */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold uppercase tracking-tight text-gray-900 mb-6">
            Centro de Control
          </h1>
          
          {/* Navegación interna (Estilo Tabs) */}
          <nav className="flex space-x-8 border-b border-gray-200">
            {tabs.map((tab) => {
              // 👇 AQUÍ ESTÁ LA SOLUCIÓN 👇
              // Si es la pestaña principal (/admin), exige que sea exacta. 
              // Si son las otras, permite que incluyan sub-rutas (ej: /admin/productos/nuevo)
              const isActive = 
                tab.href === '/admin' 
                  ? pathname === '/admin' 
                  : pathname === tab.href || pathname.startsWith(`${tab.href}/`);

              return (
                <Link
                  key={tab.name}
                  href={tab.href}
                  className={`pb-4 text-xs font-bold uppercase tracking-widest transition-colors relative ${
                    isActive ? 'text-[#b3131b]' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#b3131b] shadow-[0_0_10px_rgba(179,19,27,0.5)]" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-8">
          {children}
        </div>

      </div>
    </div>
  );
}