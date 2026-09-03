'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const tabs = [
    { name: 'Resumen', href: '/admin' },
    { name: 'Pedidos', href: '/admin/pedidos' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Cabecera del Panel */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold uppercase tracking-tight text-white mb-6">
            Centro de Control
          </h1>
          
          {/* Navegación interna (Estilo Tabs) */}
          <nav className="flex space-x-8 border-b border-white/10">
            {tabs.map((tab) => {
              const isActive = pathname === tab.href;
              return (
                <Link
                  key={tab.name}
                  href={tab.href}
                  className={`pb-4 text-xs font-mono uppercase tracking-widest transition-colors relative ${
                    isActive ? 'text-[#FF0000]' : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {tab.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#FF0000] shadow-[0_0_10px_rgba(232,138,92,0.5)]" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Aquí se renderizará dinámicamente la página que elijas (Estadísticas o Pedidos) */}
        <div className="mt-8">
          {children}
        </div>

      </div>
    </div>
  );
}