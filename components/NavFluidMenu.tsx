'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Home, User, ShieldCheck, LogOut, LogIn } from 'lucide-react';
import { MenuContainer, MenuItem } from '@/components/ui/fluid-menu';

export default function NavFluidMenu() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  const isAuthenticated = status === 'authenticated' && !!session?.user;
  const isAdmin = (session?.user as any)?.role === 'ADMIN';

  return (
    <nav aria-label="Menú de usuario fluido">
      <MenuContainer>
        {/* Caso 1: Administrador (role === 'ADMIN') */}
        {/* Orden exacto: Casa -> Perfil -> Admin -> Cerrar sesión */}
        {isAuthenticated && isAdmin && (
          <>
            <MenuItem
              icon={<Home className="w-5 h-5" />}
              label="Inicio"
              href="/"
              isActive={pathname === '/'}
            />
            <MenuItem
              icon={<User className="w-5 h-5" />}
              label="Perfil"
              href="/perfil"
              isActive={pathname.startsWith('/perfil')}
            />
            <MenuItem
              icon={<ShieldCheck className="w-5 h-5 text-[#b3131b]" />}
              label="Panel Admin"
              href="/admin"
              isActive={pathname.startsWith('/admin')}
            />
            <MenuItem
              icon={<LogOut className="w-5 h-5 text-red-500" />}
              label="Cerrar sesión"
              onClick={() => signOut({ callbackUrl: '/' })}
            />
          </>
        )}

        {/* Caso 2: Usuario Registrado Estándar (No Admin) */}
        {/* Orden exacto: Inicio -> Perfil -> Cerrar sesión */}
        {isAuthenticated && !isAdmin && (
          <>
            <MenuItem
              icon={<Home className="w-5 h-5" />}
              label="Inicio"
              href="/"
              isActive={pathname === '/'}
            />
            <MenuItem
              icon={<User className="w-5 h-5" />}
              label="Perfil"
              href="/perfil"
              isActive={pathname.startsWith('/perfil')}
            />
            <MenuItem
              icon={<LogOut className="w-5 h-5 text-red-500" />}
              label="Cerrar sesión"
              onClick={() => signOut({ callbackUrl: '/' })}
            />
          </>
        )}

        {/* Caso 3: Visitante (Sin sesión) */}
        {/* Orden exacto: Inicio -> Iniciar sesión */}
        {!isAuthenticated && (
          <>
            <MenuItem
              icon={<Home className="w-5 h-5" />}
              label="Inicio"
              href="/"
              isActive={pathname === '/'}
            />
            <MenuItem
              icon={<LogIn className="w-5 h-5 text-[#b3131b]" />}
              label="Iniciar sesión"
              href="/login"
              isActive={pathname === '/login'}
            />
          </>
        )}
      </MenuContainer>
    </nav>
  );
}
