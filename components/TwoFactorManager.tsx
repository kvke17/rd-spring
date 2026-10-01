'use client';

import { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Mail, 
  Copy, 
  Check, 
  AlertCircle, 
  Lock, 
  X,
  RotateCcw,
  KeyRound
} from 'lucide-react';
import CodeSlots from '@/components/ui/CodeSlots/CodeSlots';

interface TwoFactorManagerProps {
  initialEnabled: boolean;
  userEmail: string;
}

export default function TwoFactorManager({ initialEnabled, userEmail }: TwoFactorManagerProps) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [modalMode, setModalMode] = useState<'idle' | 'setup' | 'disable'>('idle');

  // Estados de Configuración
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [setupStatus, setSetupStatus] = useState<'idle' | 'error' | 'success'>('idle');
  const [setupLoading, setSetupLoading] = useState(false);
  const [setupError, setSetupError] = useState('');
  const [backupCopied, setBackupCopied] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  // Estados de Desactivación
  const [disablePassword, setDisablePassword] = useState('');
  const [disableLoading, setDisableLoading] = useState(false);
  const [disableError, setDisableError] = useState('');

  // Escuchar tecla Escape para cerrar modales de inmediato
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setModalMode('idle');
      }
    };
    if (modalMode !== 'idle') {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalMode]);

  const closeModal = () => {
    setModalMode('idle');
    setSetupError('');
    setDisableError('');
    setVerificationCode('');
    setSetupStatus('idle');
    setDisablePassword('');
    setResendMessage('');
  };

  const handleStartSetup = async () => {
    setSetupLoading(true);
    setSetupError('');
    setResendMessage('');
    setSetupStatus('idle');
    try {
      const res = await fetch('/api/auth/2fa/setup', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al iniciar configuración');
      setBackupCodes(data.backupCodes || []);
      setModalMode('setup');
    } catch (err: any) {
      setSetupError(err.message || 'Error de conexión');
    } finally {
      setSetupLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResending(true);
    setSetupError('');
    setResendMessage('');
    setSetupStatus('idle');
    try {
      const res = await fetch('/api/auth/2fa/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al reenviar');
      setResendMessage('Nuevo código enviado a tu correo.');
    } catch (err: any) {
      setSetupError(err.message || 'Error al reenviar');
    } finally {
      setResending(false);
    }
  };

  const handleConfirmEnable = async (e?: React.FormEvent, customCode?: string) => {
    if (e) e.preventDefault();
    const code = (customCode ?? verificationCode).trim();
    if (!code || code.length !== 6) return;

    setSetupLoading(true);
    setSetupError('');

    try {
      const res = await fetch('/api/auth/2fa/verify-and-enable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          backupCodes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setSetupStatus('error');
        throw new Error(data.error || 'Código incorrecto');
      }

      setSetupStatus('success');
      setTimeout(() => {
        setEnabled(true);
        closeModal();
      }, 600);
    } catch (err: any) {
      setSetupStatus('error');
      setSetupError(err.message || 'Error al verificar código');
    } finally {
      setSetupLoading(false);
    }
  };

  const handleConfirmDisable = async (e: React.FormEvent) => {
    e.preventDefault();
    setDisableLoading(true);
    setDisableError('');

    try {
      const res = await fetch('/api/auth/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: disablePassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Contraseña incorrecta');

      setEnabled(false);
      closeModal();
    } catch (err: any) {
      setDisableError(err.message || 'Error al desactivar 2FA');
    } finally {
      setDisableLoading(false);
    }
  };

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    setBackupCopied(true);
    setTimeout(() => setBackupCopied(false), 2000);
  };

  return (
    <div className="mt-8 border-t border-slate-100 pt-6">
      
      {/* Encabezado de la Tarjeta */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5">
          <Mail className="w-3.5 h-3.5 text-[#b3131b]" />
          <p className="text-[11px] font-mono uppercase tracking-wider text-slate-800 font-bold">
            Verificación 2FA por Correo
          </p>
        </div>

        <span className={`text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${
          enabled 
            ? 'border-emerald-200 text-emerald-700 bg-emerald-50' 
            : 'border-slate-200 text-slate-500 bg-slate-50'
        }`}>
          {enabled ? 'Activado' : 'Desactivado'}
        </span>
      </div>

      <p className="text-xs text-slate-500 mb-4 leading-relaxed font-normal">
        {enabled
          ? `Tu cuenta está protegida. Al iniciar sesión se enviará automáticamente un código de 6 dígitos a tu correo ${userEmail}.`
          : 'Protege tu cuenta con verificación de seguridad. Al iniciar sesión, recibirás un código de 6 dígitos en tu correo para confirmar tu identidad.'}
      </p>

      {setupError && modalMode === 'idle' && (
        <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 p-2.5 rounded-xl mb-4">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{setupError}</span>
        </div>
      )}

      {enabled ? (
        <button
          type="button"
          onClick={() => { setModalMode('disable'); setDisableError(''); setDisablePassword(''); }}
          className="w-full bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-700 font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-colors border border-slate-200 cursor-pointer"
        >
          Desactivar 2FA
        </button>
      ) : (
        <button
          type="button"
          onClick={handleStartSetup}
          disabled={setupLoading}
          className="w-full bg-[#b3131b] hover:bg-[#8f0f15] text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-2xs flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>{setupLoading ? 'Enviando código...' : 'Activar 2FA por Correo'}</span>
        </button>
      )}

      {/* MODAL DE ACTIVACIÓN 2FA POR CORREO */}
      {modalMode === 'setup' && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
          className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto relative animate-in zoom-in-95 duration-200"
          >
            
            {/* Header del Modal */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-red-50 text-[#b3131b] flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base leading-tight">Activar 2FA por Correo</h3>
                  <p className="text-[11px] text-slate-500 font-medium">{userEmail}</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={closeModal}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 hover:text-gray-900 transition-colors cursor-pointer"
                title="Cerrar ventana"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              
              {/* Paso 1: Notificación de Correo Enviado */}
              <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-red-50 text-[#b3131b] flex items-center justify-center shrink-0 mt-0.5">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900 mb-0.5">
                    Revisa tu bandeja de entrada
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Hemos enviado un código de seguridad de 6 dígitos a <strong className="text-gray-900">{userEmail}</strong>. Escríbelo abajo para confirmar la activación.
                  </p>
                </div>
              </div>

              {/* Paso 2: Códigos de Respaldo */}
              {backupCodes.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-[#b3131b] font-bold">
                      Códigos de Respaldo (8 Códigos)
                    </span>
                    <button
                      type="button"
                      onClick={copyBackupCodes}
                      className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-700 hover:text-gray-900 bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-lg transition-colors cursor-pointer"
                    >
                      {backupCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{backupCopied ? '¡Copiados!' : 'Copiar Códigos'}</span>
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mb-3 font-normal">
                    Guarda estos códigos en un lugar seguro. Si no tienes acceso a tu correo, podrás usarlos para entrar a tu cuenta:
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200 font-mono text-xs text-center font-bold text-slate-800">
                    {backupCodes.map((code, idx) => (
                      <span key={idx} className="bg-white py-1.5 px-2 rounded-lg border border-slate-200 shadow-2xs">
                        {code}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Paso 3: Input de 6 dígitos con CodeSlots */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleConfirmEnable();
                }} 
                className="space-y-4 pt-2 border-t border-slate-100"
              >
                <div className="flex flex-col items-center">
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-700 mb-3 font-bold text-center">
                    Ingresa el código de 6 dígitos recibido por correo:
                  </label>
                  <div className="flex justify-center items-center py-1">
                    <CodeSlots
                      length={6}
                      value={verificationCode}
                      status={setupStatus}
                      onChange={(code) => {
                        setVerificationCode(code);
                        if (setupStatus === 'error') setSetupStatus('idle');
                        if (setupError) setSetupError('');
                      }}
                      onComplete={(code) => {
                        handleConfirmEnable(undefined, code);
                      }}
                      accentColor="#ffffff"
                      inkColor="#b3131b"
                      slotColor="#18181b"
                      digitColor="#09090b"
                      dangerColor="#b3131b"
                      slotSize={46}
                      gap={8}
                      radius={12}
                      bounce={0.2}
                      settle={0.3}
                      rise={8}
                      cascade={20}
                      autoFocus={true}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">¿No te llegó el correo?</span>
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

                {resendMessage && (
                  <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl text-center font-medium">
                    ✓ {resendMessage}
                  </p>
                )}

                {setupError && (
                  <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 p-2.5 rounded-xl">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{setupError}</span>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 py-3.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer text-center"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={setupLoading || verificationCode.length !== 6}
                    className="flex-1 py-3.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#b3131b] hover:bg-[#8f0f15] text-white transition-all shadow-sm disabled:opacity-50 cursor-pointer text-center"
                  >
                    {setupStatus === 'success' ? 'Verificado ✓' : setupLoading ? 'Verificando...' : 'Confirmar y Activar'}
                  </button>
                </div>
              </form>

            </div>

          </div>
        </div>
      )}

      {/* MODAL DE DESACTIVACIÓN */}
      {modalMode === 'disable' && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
          className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 sm:p-8 shadow-2xl relative animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-red-50 text-[#b3131b] flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-gray-900 text-base">Desactivar 2FA</h3>
              </div>
              <button 
                type="button"
                onClick={closeModal}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 hover:text-gray-900 transition-colors cursor-pointer"
                title="Cerrar ventana"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-6 leading-relaxed">
              Para desactivar la verificación en dos pasos, confirma tu contraseña actual:
            </p>

            <form onSubmit={handleConfirmDisable} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-700 mb-1.5 font-bold">
                  Contraseña Actual
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    autoFocus
                    placeholder="••••••••"
                    value={disablePassword}
                    onChange={(e) => setDisablePassword(e.target.value)}
                    className="w-full bg-slate-50/70 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#b3131b] focus:bg-white focus:ring-2 focus:ring-red-100 transition-all"
                  />
                </div>
              </div>

              {disableError && (
                <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 p-2.5 rounded-xl">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{disableError}</span>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={disableLoading || !disablePassword}
                  className="flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider bg-red-600 hover:bg-red-700 text-white transition-all shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {disableLoading ? 'Verificando...' : 'Desactivar 2FA'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
