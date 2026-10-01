'use client';

import { useState, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ShieldCheck, 
  KeyRound,
  Eye,
  EyeOff,
  Check
} from 'lucide-react';
import { evaluatePassword } from '@/lib/passwordValidation';

function FormularioNuevaClave() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Validación en tiempo real (ISO/IEC 27002 / NIST SP 800-63B)
  const passwordEvaluation = useMemo(() => {
    return evaluatePassword(newPassword);
  }, [newPassword]);

  const confirmPasswordDirty = confirmPassword.length > 0;
  const passwordsMatch = confirmPasswordDirty && newPassword === confirmPassword;

  if (!token) {
    return (
      <div className="text-center py-6">
        <div className="w-12 h-12 bg-red-50 text-[#b3131b] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-100">
          <AlertCircle className="w-6 h-6" />
        </div>
        <p className="text-gray-900 font-bold text-sm mb-2">Enlace no válido o expirado</p>
        <p className="text-xs text-slate-500 mb-6">El enlace de recuperación ha caducado o no cuenta con un token de seguridad.</p>
        <Link 
          href="/recuperar" 
          className="inline-block bg-slate-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl transition-colors shadow-2xs cursor-pointer"
        >
          Solicitar nuevo enlace
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!passwordEvaluation.isValid) {
      setError(passwordEvaluation.errors[0] || 'La contraseña no cumple con los requisitos de seguridad.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/recuperar/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('¡Contraseña actualizada con éxito! Redirigiendo a tu cuenta...');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(data.error || 'Ocurrió un error al restablecer la clave.');
      }
    } catch {
      setError('Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-700 mb-1.5 font-bold">
          Nueva Contraseña
        </label>
        <div className="relative">
          <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type={showNewPassword ? 'text' : 'password'} 
            value={newPassword} 
            onChange={(e) => setNewPassword(e.target.value)} 
            placeholder="Mínimo 12 caracteres"
            className="w-full bg-slate-50/60 border border-slate-200 rounded-xl pl-10 pr-11 py-3 text-sm text-slate-900 focus:outline-none focus:border-[#b3131b] focus:bg-white focus:ring-2 focus:ring-red-100 transition-all" 
            required 
          />
          <button
            type="button"
            onClick={() => setShowNewPassword(!showNewPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer focus:outline-none"
            aria-label={showNewPassword ? 'Ocultar nueva contraseña' : 'Ver nueva contraseña'}
          >
            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {/* Medidor visual de fuerza */}
        {newPassword.length > 0 && (
          <div className="mt-2 space-y-1.5 animate-in fade-in duration-200">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-500 font-mono uppercase tracking-wider">Seguridad:</span>
              <span className="font-bold text-slate-900">{passwordEvaluation.strengthLabel}</span>
            </div>
            <div
              role="progressbar"
              aria-valuenow={passwordEvaluation.scorePercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Fortaleza de contraseña: ${passwordEvaluation.strengthLabel}`}
              className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden"
            >
              <div
                className={`h-full transition-all duration-300 ${passwordEvaluation.strengthColor}`}
                style={{ width: `${Math.max(passwordEvaluation.scorePercent, 8)}%` }}
              />
            </div>
            <p className="sr-only" aria-live="polite">
              {passwordEvaluation.strengthAccessibleText}
            </p>
          </div>
        )}

        {/* Checklist interactivo de requisitos */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 mt-3">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-600 font-bold block">
            Requisitos de Seguridad (ISO/IEC 27002 / NIST):
          </span>
          <ul className="space-y-1.5">
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
      </div>

      {/* Repetir contraseña */}
      <div>
        <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-700 mb-1.5 font-bold">
          Repetir Contraseña
        </label>
        <div className="relative">
          <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type={showConfirmPassword ? 'text' : 'password'} 
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)} 
            placeholder="Repite tu nueva contraseña"
            className="w-full bg-slate-50/60 border border-slate-200 rounded-xl pl-10 pr-11 py-3 text-sm text-slate-900 focus:outline-none focus:border-[#b3131b] focus:bg-white focus:ring-2 focus:ring-red-100 transition-all" 
            required 
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer focus:outline-none"
            aria-label={showConfirmPassword ? 'Ocultar confirmación de contraseña' : 'Ver confirmación de contraseña'}
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
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 p-3 rounded-xl mt-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {message && (
        <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 p-3 rounded-xl mt-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      <button 
        type="submit" 
        disabled={loading} 
        className="w-full bg-[#b3131b] hover:bg-[#8f0f15] text-white font-bold py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-2 mt-6 disabled:opacity-50 cursor-pointer"
      >
        <span>{loading ? 'ACTUALIZANDO...' : 'GUARDAR NUEVA CONTRASEÑA'}</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </form>
  );
}

export default function NuevaClavePage() {
  return (
    <div className="min-h-screen bg-slate-50/50 flex items-center justify-center p-4 pt-32 pb-20 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-10 shadow-xl shadow-slate-200/50">
        
        {/* Logo / Emblema */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block relative w-32 h-10 mb-4 cursor-pointer">
            <Image 
              src="/images/logo-rd.png" 
              alt="RD Spring" 
              fill 
              className="object-contain"
              priority
            />
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-100 text-[#b3131b] text-[10px] font-mono font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3 h-3" />
            <span>ACCESO PROTEGIDO</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 mt-2 tracking-tight">
            Crear Nueva Contraseña
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Ingresa tu nueva clave de acceso de acuerdo con los estándares de seguridad de RD Spring.
          </p>
        </div>

        <Suspense fallback={<div className="text-center py-6 text-xs text-slate-400">Cargando...</div>}>
          <FormularioNuevaClave />
        </Suspense>

      </div>
    </div>
  );
}