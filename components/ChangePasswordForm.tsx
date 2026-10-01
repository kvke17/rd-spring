'use client';

import { useState, useMemo } from 'react';
import { 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  KeyRound, 
  Shield, 
  Eye, 
  EyeOff, 
  Check 
} from 'lucide-react';
import { evaluatePassword } from '@/lib/passwordValidation';

export default function ChangePasswordForm({ email }: { email: string }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Evaluación de seguridad en tiempo real (ISO/IEC 27002 / NIST SP 800-63B)
  const passwordEvaluation = useMemo(() => {
    return evaluatePassword(newPassword, email);
  }, [newPassword, email]);

  const confirmPasswordDirty = confirmPassword.length > 0;
  const passwordsMatch = confirmPasswordDirty && newPassword === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!passwordEvaluation.isValid) {
      setError(passwordEvaluation.errors[0] || 'La nueva contraseña no cumple con los estándares de seguridad.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/perfil/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, currentPassword, newPassword }),
      });
      
      const data = await res.json();

      if (res.ok) {
        setMessage(data.message || 'Contraseña actualizada con éxito.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError(data.error || 'Error al cambiar contraseña.');
      }
    } catch {
      setError('Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 border-t border-slate-100 pt-6">
      <div className="flex items-center gap-1.5 mb-4">
        <Shield className="w-3.5 h-3.5 text-[#b3131b]" />
        <p className="text-[11px] font-mono uppercase tracking-wider text-slate-800 font-bold">
          Seguridad de la Cuenta
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Contraseña Actual */}
        <div>
          <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-600 mb-1.5 font-bold">
            Contraseña Actual
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type={showCurrentPassword ? 'text' : 'password'} 
              value={currentPassword} 
              onChange={(e) => setCurrentPassword(e.target.value)} 
              placeholder="••••••••"
              className="w-full bg-slate-50/70 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-slate-900 focus:outline-none focus:border-[#b3131b] focus:bg-white focus:ring-2 focus:ring-red-100 transition-all text-xs" 
              required 
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer focus:outline-none"
              aria-label={showCurrentPassword ? 'Ocultar contraseña actual' : 'Ver contraseña actual'}
            >
              {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Nueva Contraseña */}
        <div>
          <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-600 mb-1.5 font-bold">
            Nueva Contraseña
          </label>
          <div className="relative">
            <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type={showNewPassword ? 'text' : 'password'} 
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)} 
              placeholder="Mínimo 12 caracteres"
              className="w-full bg-slate-50/70 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-slate-900 focus:outline-none focus:border-[#b3131b] focus:bg-white focus:ring-2 focus:ring-red-100 transition-all text-xs" 
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
              <div className="flex justify-between items-center text-[10px]">
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

          {/* Checklist interactivo */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5 mt-2.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-600 font-bold block">
              Requisitos ISO/IEC 27002 / NIST:
            </span>
            <ul className="space-y-1">
              {passwordEvaluation.rules.map((rule) => (
                <li key={rule.id} className="flex items-center gap-2 text-[11px]">
                  {rule.passed ? (
                    <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                  ) : (
                    <span className="w-3 h-3 rounded-full border border-slate-300 shrink-0 inline-block" />
                  )}
                  <span className={rule.passed ? 'text-slate-800 font-medium' : 'text-slate-500'}>
                    {rule.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Repetir Contraseña */}
        <div>
          <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-600 mb-1.5 font-bold">
            Repetir Contraseña
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type={showConfirmPassword ? 'text' : 'password'} 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              placeholder="Repite la nueva contraseña"
              className="w-full bg-slate-50/70 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-slate-900 focus:outline-none focus:border-[#b3131b] focus:bg-white focus:ring-2 focus:ring-red-100 transition-all text-xs" 
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
        </div>

        {error && (
          <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 p-2.5 rounded-xl">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading} 
          className="w-full bg-slate-900 hover:bg-black text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition-all disabled:opacity-50 mt-2 shadow-2xs cursor-pointer"
        >
          {loading ? 'ACTUALIZANDO...' : 'ACTUALIZAR CONTRASEÑA'}
        </button>
      </form>
    </div>
  );
}