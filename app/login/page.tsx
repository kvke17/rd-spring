'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      // Flujo de Iniciar Sesión
      const res = await signIn('credentials', { email, password, redirect: false });
      if (res?.error) setError(res.error);
      else {
        router.push('/');
        router.refresh();
      }
    } else {
      // Flujo de Registro
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      
      if (res.ok) {
        // Si se registra bien, lo logueamos automáticamente
        await signIn('credentials', { email, password, redirect: false });
        router.push('/');
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-50 p-8 rounded-lg border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">
          {isLogin ? 'Acceso Seguro' : 'Crear Cuenta'}
        </h1>
        <p className="text-xs  text-gray-500 uppercase tracking-widest text-center mb-8">
          {isLogin ? 'Ingresa a tu cuenta' : 'Únete a nuestra tienda'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div>
              <label className="block text-[10px]  uppercase tracking-widest text-gray-600 mb-2">Nombre Completo</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-white border border-gray-300 rounded p-3 text-gray-900 focus:outline-none focus:border-[#b3131b]" required={!isLogin} />
            </div>
          )}
          <div>
            <label className="block text-[10px]  uppercase tracking-widest text-gray-600 mb-2">Correo Electrónico</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-white border border-gray-300 rounded p-3 text-gray-900 focus:outline-none focus:border-[#b3131b]" required />
          </div>
          
          <div>
            {/* Contenedor Flex para alinear el label y el enlace de recuperar contraseña */}
            <div className="flex justify-between items-center mb-2">
              <label className="block text-[10px]  uppercase tracking-widest text-gray-600">Contraseña</label>
              {isLogin && (
                <Link href="/recuperar" className="text-[10px]  uppercase tracking-widest text-gray-500 hover:text-[#b3131b] transition-colors">
                  ¿Olvidaste tu contraseña?
                </Link>
              )}
            </div>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-white border border-gray-300 rounded p-3 text-gray-900 focus:outline-none focus:border-[#b3131b]" required />
          </div>

          {error && <p className="text-red-500 text-xs  text-center border border-red-500/20 bg-red-500/10 p-2 rounded">{error}</p>}

          <button type="submit" className="w-full bg-[#b3131b] text-black font-bold py-4 rounded text-xs uppercase tracking-widest hover:bg-opacity-90 transition-all mt-4">
            {isLogin ? 'Iniciar Sesión' : 'Registrarme'}
          </button>
        </form>

        <button onClick={() => setIsLogin(!isLogin)} className="w-full mt-6 text-xs text-gray-600 hover:text-gray-900  tracking-widest transition-colors">
          {isLogin ? '¿NO TIENES CUENTA? REGÍSTRATE AQUÍ' : '¿YA TIENES CUENTA? INICIA SESIÓN'}
        </button>
      </div>
    </div>
  );
}