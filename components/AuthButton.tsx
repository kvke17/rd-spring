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
    return <div className="text-xs  text-gray-500">...</div>;
  }

  if (session) {
    const isRoleAdmin = (session.user as any)?.role === 'ADMIN';

    return (
      <div className="flex items-center gap-4 text-xs  uppercase tracking-widest">
        
        {/* Aquí está el cambio: Transformamos el nombre en un enlace */}
        <Link 
          href="/perfil" 
          className="text-[#b3131b] hover:text-gray-900 transition-colors hidden sm:inline"
        >
          {session.user?.name?.split(' ')[0]}
        </Link>
        
        {isRoleAdmin && (
          <Link href="/admin" className="text-gray-600 hover:text-gray-900 transition-colors">
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
    <Link href="/login" className="text-xs  uppercase tracking-widest text-gray-600 hover:text-gray-900 transition-colors border border-gray-300 px-4 py-2 rounded hover:border-white/50">
      LOGIN / REGISTRO
    </Link>
  );
}