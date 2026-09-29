'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Lock, 
  Mail, 
  User, 
  AlertCircle, 
  ArrowRight, 
  ShieldCheck, 
  KeyRound, 
  ArrowLeft,
  RotateCcw
} from 'lucide-react';

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Estados específicos para el flujo de 2FA por Correo
  const [requires2FA, setRequires2FA] = useState(false);
  const [totpCode, setTotpCode] = useState('');
  const [resending, setResending] = useState(false);
  const [resendNotice, setResendNotice] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const payload: Record<string, string> = { 
          email: email.toLowerCase().trim(), 
          password 
        };
        
        if (requires2FA) {
          payload.totpCode = totpCode.trim();
        }

        const res = await signIn('credentials', { 
          ...payload, 
          redirect: false 
        });

        if (res?.error) {
          if (res.error === '2FA_REQUIRED') {
            // El usuario tiene 2FA activado: se envió el código al correo
            setRequires2FA(true);
            setError('');
            setResendNotice('Enviamos un código de 6 dígitos a tu correo.');
          } else if (res.error === 'CODIGO_2FA_INVALIDO') {
            setError('El código ingresado es incorrecto o expiró. Revisa tu correo o usa un código de respaldo.');
          } else {
            setError(res.error);
          }
        } else {
          router.push('/perfil');
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
          await signIn('credentials', { email, password, redirect: false });
          router.push('/perfil');
          router.refresh();
        } else {
          const data = await res.json();
          setError(data.error || 'Ocurrió un error al registrar la cuenta.');
        }
      }
    } catch {
      setError('Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResending(true);
    setError('');
    setResendNotice('');
    try {
      const res = await fetch('/api/auth/2fa/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al reenviar');
      setResendNotice('Nuevo código de 6 dígitos enviado a tu correo.');
    } catch (err: any) {
      setError(err.message || 'Error al reenviar el código');
    } finally {
      setResending(false);
    }
  };

  const handleBackFrom2FA = () => {
    setRequires2FA(false);
    setTotpCode('');
    setError('');
    setResendNotice('');
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex items-center justify-center p-4 pt-32 pb-20 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-10 shadow-xl shadow-slate-200/50">
        
        {/* Logo / Emblema */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block relative w-32 h-10 mb-4">
            <Image 
              src="/images/logo-rd.png" 
              alt="RD Spring" 
              fill 
              className="object-contain"
              priority
            />
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-100 text-[#b3131b] text-[10px] font-mono font-bold uppercase tracking-wider">
            {requires2FA ? <Mail className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
            <span>{requires2FA ? 'VERIFICACIÓN POR CORREO' : 'PORTAL DE CLIENTES'}</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 mt-2 tracking-tight">
            {requires2FA 
              ? 'Código de Acceso' 
              : isLogin 
              ? 'Acceso Seguro' 
              : 'Crear Cuenta'}
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            {requires2FA
              ? `Ingresa el código de 6 dígitos enviado a ${email}`
              : isLogin 
              ? 'Ingresa tus credenciales para administrar tus pedidos' 
              : 'Regístrate para comprar más rápido y seguir tus envíos'}
          </p>
        </div>

        {/* Switcher Login / Registro (Solo si no estamos en el paso de 2FA) */}
        {!requires2FA && (
          <div className="flex bg-slate-100 p-1 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                isLogin 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-slate-500 hover:text-gray-900'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                !isLogin 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-slate-500 hover:text-gray-900'
              }`}
            >
              Registrarme
            </button>
          </div>
        )}

        {/* FORMULARIO */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* PASO 2FA ACTIVADO */}
          {requires2FA ? (
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
              
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-center">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-700 font-bold block mb-1">
                  Código de 6 Dígitos
                </span>
                <p className="text-xs text-slate-500 mb-3">
                  Revisa tu correo (incluso spam) o ingresa un código de respaldo:
                </p>
                
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="123456"
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3.5 text-center text-2xl font-mono tracking-[0.25em] text-slate-900 font-black focus:outline-none focus:border-[#b3131b] focus:ring-2 focus:ring-red-100 transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs px-1">
                <span className="text-slate-400">¿No lo recibiste?</span>
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resending}
                  className="text-[#b3131b] font-bold hover:underline inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{resending ? 'Enviando...' : 'Reenviar código'}</span>
                </button>
              </div>

              {resendNotice && (
                <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl text-center font-medium">
                  ✓ {resendNotice}
                </p>
              )}

              {error && (
                <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 p-3 rounded-xl mt-3">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading || !totpCode.trim()}
                className="w-full bg-[#b3131b] hover:bg-[#8f0f15] text-white font-bold py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-2 mt-4 disabled:opacity-50 cursor-pointer"
              >
                <span>{loading ? 'VERIFICANDO...' : 'VERIFICAR Y ACCEDER'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleBackFrom2FA}
                className="w-full text-center text-xs text-slate-500 hover:text-gray-900 transition-colors py-2 flex items-center justify-center gap-1 font-medium cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Volver a ingresar contraseña</span>
              </button>
            </div>
          ) : (
            <>
              {/* PASO NORMAL (EMAIL + PASSWORD) */}
              {!isLogin && (
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-700 mb-1.5 font-bold">
                    Nombre Completo
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      placeholder="Tu nombre y apellido"
                      className="w-full bg-slate-50/60 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-[#b3131b] focus:bg-white focus:ring-2 focus:ring-red-100 transition-all" 
                      required={!isLogin} 
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-700 mb-1.5 font-bold">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="tu@correo.com"
                    className="w-full bg-slate-50/60 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-[#b3131b] focus:bg-white focus:ring-2 focus:ring-red-100 transition-all" 
                    required 
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-700 font-bold">
                    Contraseña
                  </label>
                  {isLogin && (
                    <Link 
                      href="/recuperar" 
                      className="text-[10px] font-mono uppercase tracking-wider text-slate-400 hover:text-[#b3131b] transition-colors"
                    >
                      ¿Olvidaste tu clave?
                    </Link>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder="••••••••"
                    className="w-full bg-slate-50/60 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-[#b3131b] focus:bg-white focus:ring-2 focus:ring-red-100 transition-all" 
                    required 
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 p-3 rounded-xl mt-3">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading} 
                className="w-full bg-[#b3131b] hover:bg-[#8f0f15] text-white font-bold py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-2 mt-6 disabled:opacity-50 cursor-pointer"
              >
                <span>{loading ? 'PROCESANDO...' : isLogin ? 'INICIAR SESIÓN' : 'CREAR MI CUENTA'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}

        </form>

        {!requires2FA && (
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500 font-medium">
              {isLogin ? '¿Aún no tienes cuenta?' : '¿Ya tienes una cuenta creada?'}
              {' '}
              <button 
                type="button" 
                onClick={() => { setIsLogin(!isLogin); setError(''); }} 
                className="text-[#b3131b] font-bold hover:underline ml-1 cursor-pointer"
              >
                {isLogin ? 'Regístrate aquí' : 'Inicia sesión'}
              </button>
            </p>
          </div>
        )}

      </div>
    </div>
  );
}