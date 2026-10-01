import { Suspense } from 'react';
import type { Metadata } from 'next';
import AuthSplitScreen from '@/components/auth/AuthSplitScreen';

export const metadata: Metadata = {
  title: 'Crear Cuenta | RD Spring',
  description: 'Regístrate en RD Spring para comprar más rápido y gestionar tus pedidos y configuraciones de suspensión.',
};

export default function RegistroPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a]" />}>
      <AuthSplitScreen initialMode="register" />
    </Suspense>
  );
}
