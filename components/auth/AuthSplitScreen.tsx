'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, 
  Mail, 
  User, 
  AlertCircle, 
  ArrowRight, 
  ShieldCheck, 
  KeyRound, 
  ArrowLeft,
  RotateCcw,
  Eye,
  EyeOff,
  Check,
  ChevronLeft
} from 'lucide-react';
import { evaluatePassword } from '@/lib/passwordValidation';
import CodeSlots from '@/components/ui/CodeSlots/CodeSlots';

interface AuthSplitScreenProps {
  initialMode?: 'login' | 'register';
}

export default function AuthSplitScreen({ initialMode = 'login' }: AuthSplitScreenProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/perfil';
  const preview2FA = searchParams.get('twoFactor') === 'true';

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const isLogin = mode === 'login';

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // 2FA Flow States
  const [requires2FA, setRequires2FA] = useState(preview2FA);
  const [totpCode, setTotpCode] = useState('');
  const [totpStatus, setTotpStatus] = useState<'idle' | 'error' | 'success'>('idle');
  const [resending, setResending] = useState(false);
  const [resendNotice, setResendNotice] = useState('');

  // Password evaluation (ISO/IEC 27002 / NIST SP 800-63B)
  const passwordEvaluation = useMemo(() => {
    return evaluatePassword(password, email, name);
  }, [password, email, name]);

  const confirmPasswordDirty = confirmPassword.length > 0;
  const passwordsMatch = confirmPasswordDirty && password === confirmPassword;

  // Manejo de errores que vengan en la URL de NextAuth (ej. al redirigir de Google)
  useEffect(() => {
    const authError = searchParams.get('error');
    if (authError === 'Configuration' || authError === 'OAuthSignin') {
      setError('Para activar el acceso con Google, agrega GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET en el archivo .env.');
    } else if (authError === 'OAuthCallback') {
      setError('Ocurrió un error al recibir la respuesta de Google. Inténtalo nuevamente.');
    } else if (authError === 'AccessDenied') {
      setError('Acceso denegado durante el proceso de autenticación con Google.');
    }
  }, [searchParams]);

  // Toggle Mode Handler
  const handleToggleMode = (newMode: 'login' | 'register') => {
    setMode(newMode);
    setError('');
    setConfirmPassword('');
    setRequires2FA(false);
    setTotpCode('');
    setTotpStatus('idle');
    window.history.replaceState(null, '', newMode === 'login' ? '/login' : '/registro');
  };

  // Google OAuth Login & Account Creation
  const handleGoogleLogin = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      // Inicia el flujo de autenticación oficial con Google mediante NextAuth
      // Redirige a Google Consent y, tras el callback, el backend crea/vincula la cuenta y redirige a /perfil
      const res = await signIn('google', { 
        callbackUrl, 
        redirect: true 
      });

      if (res?.error) {
        if (res.error === 'OAuthSignin' || res.error === 'Configuration') {
          setError('El proveedor Google no está configurado en .env (faltan GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET).');
        } else {
          setError(`Error al conectar con Google: ${res.error}`);
        }
      }
    } catch {
      setError('No fue posible conectar con Google. Por favor intenta con tu correo.');
    } finally {
      setGoogleLoading(false);
    }
  };

  // Form Submission
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
            setRequires2FA(true);
            setError('');
            setResendNotice('Enviamos un código de 6 dígitos a tu correo.');
          } else if (res.error === 'CODIGO_2FA_INVALIDO') {
            setError('El código ingresado es incorrecto o expiró.');
          } else {
            setError(res.error);
          }
        } else {
          router.push(callbackUrl);
          router.refresh();
        }
      } else {
        // Register flow: Client validation
        if (!passwordEvaluation.isValid) {
          setError(passwordEvaluation.errors[0] || 'La contraseña no cumple con los requisitos de seguridad.');
          setLoading(false);
          return;
        }

        if (password !== confirmPassword) {
          setError('Las contraseñas no coinciden.');
          setLoading(false);
          return;
        }

        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: name.trim(), email: email.toLowerCase().trim(), password }),
        });
        
        if (res.ok) {
          const loginRes = await signIn('credentials', { 
            email: email.toLowerCase().trim(), 
            password, 
            redirect: false 
          });
          if (loginRes?.ok) {
            router.push('/perfil');
            router.refresh();
          } else {
            handleToggleMode('login');
          }
        } else {
          const data = await res.json();
          setError(data.error || 'Ocurrió un error al registrar la cuenta.');
        }
      }
    } catch {
      setError('Error de conexión con el servidor. Inténtalo nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyTotp = async (customCode?: string) => {
    const code = (customCode ?? totpCode).trim();
    if (!code || code.length < 6) return;
    setError('');
    setLoading(true);

    try {
      const res = await signIn('credentials', { 
        email: email.toLowerCase().trim(), 
        password,
        totpCode: code,
        redirect: false 
      });

      if (res?.error) {
        setTotpStatus('error');
        if (res.error === 'CODIGO_2FA_INVALIDO') {
          setError('El código ingresado es incorrecto o expiró.');
        } else {
          setError(res.error);
        }
      } else {
        setTotpStatus('success');
        setTimeout(() => {
          router.push(callbackUrl);
          router.refresh();
        }, 500);
      }
    } catch {
      setTotpStatus('error');
      setError('Error de conexión con el servidor. Inténtalo nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResending(true);
    setError('');
    setResendNotice('');
    setTotpStatus('idle');
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
    setTotpStatus('idle');
    setError('');
    setResendNotice('');
  };

  return (
    <div className="min-h-screen w-full flex bg-slate-50/70 text-slate-900 font-sans selection:bg-[var(--brand-crimson)] selection:text-white relative overflow-x-hidden">
      
      {/* ======================================================== */}
      {/* COLUMNA IZQUIERDA: SHOWCASE DE MARCA & FÍSICA DE SUSPENSIÓN */}
      {/* Visible solo en desktop (lg:) con paleta clara editorial */}
      {/* ======================================================== */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 lg:p-16 relative overflow-hidden bg-slate-100/70 border-r border-slate-200/80">
        
        {/* Lienzo SVG con líneas de física de suspensión y resplandor carmesí */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <svg
            className="w-full h-full opacity-65"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 800 800"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <linearGradient id="springCrimsonGradLight" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#b3131b" stopOpacity="0.85" />
                <stop offset="50%" stopColor="#b3131b" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#475569" stopOpacity="0.1" />
              </linearGradient>
              <radialGradient id="ambientCrimsonGlowLight" cx="35%" cy="50%" r="55%">
                <stop offset="0%" stopColor="#b3131b" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#f1f5f9" stopOpacity="0" />
              </radialGradient>
              <pattern id="telemetryGridLight" width="36" height="36" patternUnits="userSpaceOnUse">
                <path d="M 36 0 L 0 0 0 36" fill="none" stroke="rgba(15,23,42,0.035)" strokeWidth="1" />
              </pattern>
            </defs>

            {/* Resplandor Carmesí Suave de Fondo */}
            <rect width="100%" height="100%" fill="url(#ambientCrimsonGlowLight)" />

            {/* Cuadrícula Milimétrica CAD */}
            <rect width="100%" height="100%" fill="url(#telemetryGridLight)" />

            {/* Curvas de Amortiguación y Ondas de Respuesta Dinámica */}
            <g strokeWidth="1.5" fill="none">
              {/* Curva Principal de Desplazamiento y Rebote */}
              <path
                d="M-50,380 C120,180 220,540 420,380 C580,240 680,460 850,390"
                stroke="url(#springCrimsonGradLight)"
                strokeWidth="2.5"
              />
              {/* Curva de Armónicos Amortiguados */}
              <path
                d="M-50,400 C100,220 260,500 420,400 C600,280 660,440 850,405"
                stroke="rgba(15,23,42,0.2)"
                strokeDasharray="4 4"
              />
              <path
                d="M-50,420 C80,260 280,460 420,420 C620,320 640,420 850,415"
                stroke="rgba(179,19,27,0.35)"
              />

              {/* Geometría de Resorte Helicoidal (Wireframe Proyectado) */}
              <g transform="translate(180, 130)" stroke="rgba(15,23,42,0.12)" strokeWidth="1.5">
                <ellipse cx="180" cy="80" rx="85" ry="24" />
                <ellipse cx="180" cy="130" rx="85" ry="24" stroke="rgba(179,19,27,0.3)" />
                <ellipse cx="180" cy="180" rx="85" ry="24" />
                <ellipse cx="180" cy="230" rx="85" ry="24" stroke="rgba(179,19,27,0.3)" />
                <ellipse cx="180" cy="280" rx="85" ry="24" />
                <ellipse cx="180" cy="330" rx="85" ry="24" stroke="rgba(179,19,27,0.3)" />
                <ellipse cx="180" cy="380" rx="85" ry="24" />
                <line x1="95" y1="80" x2="95" y2="380" strokeDasharray="5 5" />
                <line x1="265" y1="80" x2="265" y2="380" strokeDasharray="5 5" />
              </g>
            </g>
          </svg>
        </div>

        {/* Encabezado Superior: LOGO OFICIAL RD SPRING */}
        <div className="relative z-10">
          <Link href="/" className="inline-block group transition-transform active:scale-95" title="RD Spring Inicio">
            <Image 
              src="/images/logo-rd.png" 
              alt="RD Spring" 
              width={180} 
              height={40} 
              className="h-8 sm:h-9 w-auto object-contain"
              priority
            />
          </Link>
        </div>

        {/* Tarjeta Inferior: Cita Editorial de Alto Impacto */}
        <div className="relative z-10 p-6 sm:p-8 rounded-2xl bg-white/90 border border-slate-200/90 backdrop-blur-xl shadow-sm space-y-4 max-w-lg">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[var(--brand-crimson)] shadow-[0_0_8px_var(--brand-crimson)] animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold">
              RD Spring 
            </span>
          </div>

          <blockquote className="text-base sm:text-lg font-light text-slate-800 italic leading-relaxed">
            “Sistemas de amortiguación y lubricación desarrollados bajo los estándares más exigentes del automovilismo alemán”
          </blockquote>

          <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-900 tracking-wide">RD Spring</span>
            <span className="font-mono text-slate-400 text-[10px] uppercase">Especialistas En Suspensíon </span>
          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* COLUMNA DERECHA: TARJETA DE AUTENTICACIÓN & FORMULARIO (BLANCO) */}
      {/* ======================================================== */}
      <div className="flex-1 flex flex-col justify-center items-center p-4 sm:p-8 lg:p-12 relative min-h-screen bg-slate-50/50">
        
        {/* Barra superior de navegación rápida */}
        <div className="w-full max-w-md flex items-center justify-between mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors py-1.5 px-2.5 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Volver a la tienda</span>
          </Link>

          {/* Logo oficial para pantallas móviles */}
          <div className="lg:hidden">
            <Link href="/" title="RD Spring">
              <Image 
                src="/images/logo-rd.png" 
                alt="RD Spring" 
                width={130} 
                height={28} 
                className="h-6 w-auto object-contain"
                priority
              />
            </Link>
          </div>
        </div>

        {/* Tarjeta Flotante Blanca (Floating light surface) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 max-w-md w-full shadow-xl shadow-slate-200/60 relative"
        >
          {/* Header del Formulario */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 border border-red-100 text-[var(--brand-crimson)] text-[10px] font-mono font-bold uppercase tracking-wider mb-2.5">
              {requires2FA ? <Mail className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
              <span>{requires2FA ? 'AUTENTICACIÓN 2FA' : 'ACCESO SEGURO'}</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {requires2FA 
                ? 'Código de Acceso' 
                : isLogin 
                ? 'Iniciar Sesión' 
                : 'Crear Cuenta'}
            </h1>
            
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 font-normal leading-relaxed">
              {requires2FA
                ? `Ingresa el código de 6 dígitos enviado a tu correo ${email}`
                : isLogin 
                ? 'Accede a tu panel para gestionar tus pedidos y configuraciones de suspensión.' 
                : 'Regístrate para gestionar tus pedidos y acceder a ingeniería de suspensión de élite.'}
            </p>
          </div>

          {/* Switcher Login / Registro (Solo si no está en 2FA) */}
          {!requires2FA && (
            <div className="flex bg-slate-100 p-1 rounded-2xl mb-6 border border-slate-200/70">
              <button
                type="button"
                onClick={() => handleToggleMode('login')}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-150 cursor-pointer ${
                  isLogin 
                    ? 'bg-white text-slate-900 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Iniciar Sesión
              </button>
              <button
                type="button"
                onClick={() => handleToggleMode('register')}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-150 cursor-pointer ${
                  !isLogin 
                    ? 'bg-white text-slate-900 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Crear Cuenta
              </button>
            </div>
          )}

          {/* PASO 2FA ACTIVADO */}
          {requires2FA ? (
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleVerifyTotp();
              }} 
              className="space-y-5 animate-in fade-in duration-200"
            >
              <div className="bg-slate-50/90 p-5 rounded-2xl border border-slate-200/80 text-center flex flex-col items-center">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-700 font-bold block mb-1">
                  Código de 6 Dígitos
                </span>
                <p className="text-xs text-slate-500 mb-4">
                  Revisa tu bandeja de entrada o usa un código de respaldo seguro:
                </p>
                
                <div className="flex justify-center items-center py-1">
                  <CodeSlots
                    length={6}
                    value={totpCode}
                    status={totpStatus}
                    onChange={(code) => {
                      setTotpCode(code);
                      if (totpStatus === 'error') setTotpStatus('idle');
                      if (error) setError('');
                    }}
                    onComplete={(code) => {
                      handleVerifyTotp(code);
                    }}
                    accentColor="#ffffff"
                    inkColor="#b3131b"
                    slotColor="#18181b"
                    digitColor="#09090b"
                    dangerColor="#b3131b"
                    slotSize={48}
                    gap={10}
                    radius={12}
                    bounce={0.2}
                    settle={0.3}
                    rise={8}
                    cascade={20}
                    autoFocus={true}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs px-1">
                <span className="text-slate-500">¿No lo recibiste?</span>
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resending}
                  className="text-[var(--brand-crimson)] hover:brightness-125 font-bold inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
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
                <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 border border-red-200 p-3 rounded-xl">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading || totpCode.trim().length < 6}
                className="w-full bg-[var(--brand-crimson)] hover:brightness-110 active:scale-[0.98] text-white font-bold py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-red-500/20 flex items-center justify-center gap-2 mt-4 disabled:opacity-50 cursor-pointer"
              >
                <span>
                  {totpStatus === 'success' ? 'CÓDIGO VERIFICADO ✓' : loading ? 'VERIFICANDO...' : 'VERIFICAR Y ACCEDER'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleBackFrom2FA}
                className="w-full text-center text-xs text-slate-500 hover:text-slate-900 transition-colors py-2 flex items-center justify-center gap-1 font-medium cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Volver a ingresar contraseña</span>
              </button>
            </form>
          ) : (
            <>
              {/* ======================================================== */}
              {/* BOTÓN PROVEEDOR SOCIAL: GOOGLE LOGIN (EXCLUSIÓN ESTRICTA: NO GITHUB) */}
              {/* ======================================================== */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={googleLoading}
                className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-800 font-bold py-3.5 px-4 rounded-xl text-sm border border-slate-200 shadow-2xs hover:shadow-xs active:scale-[0.98] transition-all disabled:opacity-60 cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>{googleLoading ? 'Conectando con Google...' : 'Continuar con Google'}</span>
              </button>

              {/* Separador Elegante */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase tracking-widest">
                  <span className="bg-white px-3 text-slate-400 text-[10px] font-mono">
                    O con tu correo electrónico
                  </span>
                </div>
              </div>

              {/* FORMULARIO DE CREDENCIALES */}
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Nombre (Solo en Registro) */}
                <AnimatePresence>
                  {!isLogin && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
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
                          className="w-full bg-slate-50/80 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[var(--brand-crimson)] focus:bg-white focus:ring-2 focus:ring-red-100 transition-all font-medium" 
                          required={!isLogin} 
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Correo Electrónico */}
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
                      className="w-full bg-slate-50/80 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[var(--brand-crimson)] focus:bg-white focus:ring-2 focus:ring-red-100 transition-all font-medium" 
                      required 
                    />
                  </div>
                </div>

                {/* Contraseña */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-700 font-bold">
                      Contraseña
                    </label>
                    {isLogin && (
                      <Link 
                        href="/recuperar" 
                        className="text-[10px] font-mono uppercase tracking-wider text-slate-400 hover:text-[var(--brand-crimson)] transition-colors"
                      >
                        ¿Olvidaste tu clave?
                      </Link>
                    )}
                  </div>
                  
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      placeholder="••••••••••••"
                      className="w-full bg-slate-50/80 border border-slate-200 rounded-xl pl-10 pr-11 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[var(--brand-crimson)] focus:bg-white focus:ring-2 focus:ring-red-100 transition-all font-medium" 
                      required 
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer focus:outline-none"
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Medidor visual de seguridad en tiempo real (Registro) */}
                  {!isLogin && password.length > 0 && (
                    <div className="mt-2.5 space-y-1.5 animate-in fade-in duration-200">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-500 font-mono uppercase tracking-wider">Fortaleza:</span>
                        <span className="font-bold text-slate-800 font-mono">{passwordEvaluation.strengthLabel}</span>
                      </div>
                      <div
                        role="progressbar"
                        aria-valuenow={passwordEvaluation.scorePercent}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200"
                      >
                        <div
                          className={`h-full transition-all duration-300 ${passwordEvaluation.strengthColor}`}
                          style={{ width: `${Math.max(passwordEvaluation.scorePercent, 8)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Requisitos NIST / ISO 27002 (Registro) */}
                  {!isLogin && (
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5 mt-2.5">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-600 font-bold block">
                        Requisitos de Seguridad (ISO/IEC 27002 / NIST):
                      </span>
                      <ul className="space-y-1">
                        {passwordEvaluation.rules.map((rule) => (
                          <li key={rule.id} className="flex items-center gap-2 text-xs">
                            {rule.passed ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            ) : (
                              <span className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0 inline-block" />
                            )}
                            <span className={rule.passed ? 'text-slate-800 font-medium' : 'text-slate-500'}>
                              {rule.label}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Confirmar Contraseña (Registro) */}
                <AnimatePresence>
                  {!isLogin && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-700 mb-1.5 font-bold">
                        Confirmar Contraseña
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input 
                          type={showConfirmPassword ? 'text' : 'password'} 
                          value={confirmPassword} 
                          onChange={(e) => setConfirmPassword(e.target.value)} 
                          placeholder="Repite tu contraseña"
                          className="w-full bg-slate-50/80 border border-slate-200 rounded-xl pl-10 pr-11 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[var(--brand-crimson)] focus:bg-white focus:ring-2 focus:ring-red-100 transition-all font-medium" 
                          required 
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer focus:outline-none"
                          aria-label={showConfirmPassword ? 'Ocultar confirmación' : 'Ver confirmación'}
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      {confirmPasswordDirty && (
                        <div className="mt-1.5 flex items-center gap-1.5 text-xs">
                          {passwordsMatch ? (
                            <span className="text-emerald-600 font-medium flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" />
                              <span>Las contraseñas coinciden</span>
                            </span>
                          ) : (
                            <span className="text-red-500 font-medium flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>Las contraseñas no coinciden</span>
                            </span>
                          )}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Mensaje de Error en Línea */}
                {error && (
                  <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 border border-red-200 p-3 rounded-xl mt-3 animate-in fade-in duration-150">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Botón de Acción Principal */}
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full bg-[var(--brand-crimson)] hover:brightness-110 active:scale-[0.98] text-white font-bold py-3.5 px-6 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-red-500/20 flex items-center justify-center gap-2 mt-6 disabled:opacity-50 cursor-pointer"
                >
                  <span>
                    {loading 
                      ? 'Procesando...' 
                      : isLogin 
                      ? 'Ingresar' 
                      : 'Crear Mi Cuenta'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Enlace de Alternancia Inferior */}
              <div className="mt-6 pt-5 border-t border-slate-200 text-center">
                <p className="text-xs text-slate-500 font-medium">
                  {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes una cuenta creada?'}
                  {' '}
                  <button 
                    type="button" 
                    onClick={() => handleToggleMode(isLogin ? 'register' : 'login')} 
                    className="text-[var(--brand-crimson)] hover:brightness-125 font-bold hover:underline ml-1 cursor-pointer"
                  >
                    {isLogin ? 'Regístrate aquí' : 'Inicia sesión'}
                  </button>
                </p>
              </div>

              {/* Disclaimer Legal */}
              <p className="mt-4 text-[11px] text-slate-400 text-center leading-relaxed">
                Al continuar, aceptas nuestros{' '}
                <Link href="/terminos" className="text-slate-600 hover:underline">
                  Términos de Servicio
                </Link>{' '}
                y{' '}
                <Link href="/terminos" className="text-slate-600 hover:underline">
                  Política de Privacidad
                </Link>.
              </p>
            </>
          )}

        </motion.div>
      </div>

    </div>
  );
}
