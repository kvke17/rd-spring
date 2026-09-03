'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useCartStore } from '@/lib/store';

export default function AuthButton() {
  const { data: session, status } = useSession();
  const clearCart = useCartStore((state) => state.clearCart);

  const handleSignOut = async () => {
    clearCart(); 
    await signOut({ callbackUrl: '/' }); 
  };

  if (status === 'loading') {
    return <div className="text-xs font-mono text-gray-500">...</div>;
  }

  if (session) {
    const isRoleAdmin = (session.user as any)?.role === 'ADMIN';

    return (
      <div className="flex items-center gap-4 text-xs font-mono uppercase tracking-widest">
        
        {/* Aquí está el cambio: Transformamos el nombre en un enlace */}
        <Link 
          href="/perfil" 
          className="text-[#FF0000] hover:text-white transition-colors hidden sm:inline"
        >
          {session.user?.name?.split(' ')[0]}
        </Link>
        
        {isRoleAdmin && (
          <Link href="/admin" className="text-gray-400 hover:text-white transition-colors">
            ADMIN
          </Link>
        )}
        
        <button 
          onClick={handleSignOut}
          className="text-gray-500 hover:text-red-400 transition-colors"
        >
          SALIR
        </button>
      </div>
    );
  }

  return (
    <Link href="/login" className="text-xs font-mono uppercase tracking-widest text-gray-400 hover:text-white transition-colors border border-white/20 px-4 py-2 rounded hover:border-white/50">
      LOGIN / REGISTRO
    </Link>
  );
}