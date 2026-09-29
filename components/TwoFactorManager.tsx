'use client';

import { useState } from 'react';
import Image from 'next/image';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Smartphone, 
  Key, 
  Copy, 
  Check, 
  AlertCircle, 
  Lock, 
  ChevronRight, 
  X,
  QrCode,
  Download
} from 'lucide-react';

interface TwoFactorManagerProps {
  initialEnabled: boolean;
  userEmail: string;
}

export default function TwoFactorManager({ initialEnabled }: TwoFactorManagerProps) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [modalMode, setModalMode] = useState<'idle' | 'setup' | 'disable'>('idle');

  // Estados de Setup
  const [setupData, setSetupData] = useState<{
    secret: string;
    qrCodeUrl: string;
    backupCodes: string[];
  } | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [setupLoading, setSetupLoading] = useState(false);
  const [setupError, setSetupError] = useState('');
  const [secretCopied, setSecretCopied] = useState(false);
  const [backupCopied, setBackupCopied] = useState(false);

  // Estados de Desactivación
  const [disablePassword, setDisablePassword] = useState('');
  const [disableLoading, setDisableLoading] = useState(false);
  const [disableError, setDisableError] = useState('');

  const handleStartSetup = async () => {
    setSetupLoading(true);
    setSetupError('');
    try {
      const res = await fetch('/api/auth/2fa/setup', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al iniciar configuración');
      setSetupData(data);
      setModalMode('setup');
    } catch (err: any) {
      setSetupError(err.message || 'Error de conexión');
    } finally {
      setSetupLoading(false);
    }
  };

  const handleConfirmEnable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!setupData) return;
    setSetupLoading(true);
    setSetupError('');

    try {
      const res = await fetch('/api/auth/2fa/verify-and-enable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: verificationCode,
          secret: setupData.secret,
          backupCodes: setupData.backupCodes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Código incorrecto');

      setEnabled(true);
      setModalMode('idle');
      setSetupData(null);
      setVerificationCode('');
    } catch (err: any) {
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
      setModalMode('idle');
      setDisablePassword('');
    } catch (err: any) {
      setDisableError(err.message || 'Error al desactivar 2FA');
    } finally {
      setDisableLoading(false);
    }
  };

  const copyToClipboard = (text: string, type: 'secret' | 'backup') => {
    navigator.clipboard.writeText(text);
    if (type === 'secret') {
      setSecretCopied(true);
      setTimeout(() => setSecretCopied(false), 2000);
    } else {
      setBackupCopied(true);
      setTimeout(() => setBackupCopied(false), 2000);
    }
  };

  return (
    <div className="mt-8 border-t border-slate-100 pt-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5">
          <Smartphone className="w-3.5 h-3.5 text-[#b3131b]" />
          <p className="text-[11px] font-mono uppercase tracking-wider text-slate-800 font-bold">
            Autenticación en Dos Pasos (2FA)
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
          ? 'Tu cuenta está protegida con código de seguridad temporal (TOTP). Al iniciar sesión se te pedirá el código de 6 dígitos.'
          : 'Añade una capa extra de protección utilizando Google Authenticator, Microsoft Authenticator o Apple Passwords.'}
      </p>

      {setupError && modalMode === 'idle' && (
        <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 p-2.5 rounded-xl mb-4">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{setupError}</span>
        </div>
      )}

      {enabled ? (
        <button
          onClick={() => { setModalMode('disable'); setDisableError(''); setDisablePassword(''); }}
          className="w-full bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-700 font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-colors border border-slate-200"
        >
          Desactivar 2FA
        </button>
      ) : (
        <button
          onClick={handleStartSetup}
          disabled={setupLoading}
          className="w-full bg-[#b3131b] hover:bg-[#8f0f15] text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-2xs flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>{setupLoading ? 'Preparando...' : 'Activar 2FA'}</span>
        </button>
      )}

      {/* MODAL / OVERLAY DE CONFIGURACIÓN 2FA */}
      {modalMode === 'setup' && setupData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-red-50 text-[#b3131b] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-gray-900 text-base">Activar Autenticación 2FA</h3>
              </div>
              <button 
                onClick={() => setModalMode('idle')}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Paso 1: Escanear QR */}
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#b3131b] font-bold block mb-1">
                  Paso 1 · Escanea el código QR
                </span>
                <p className="text-xs text-slate-600 mb-4">
                  Abre tu aplicación de autenticación (Google Authenticator, Authy, etc.) y escanea el siguiente código:
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="relative w-36 h-36 bg-white p-2 rounded-xl shadow-xs border border-slate-200 shrink-0">
                    <Image 
                      src={setupData.qrCodeUrl} 
                      alt="Código QR 2FA" 
                      fill 
                      className="object-contain" 
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">¿No puedes escanear?</span>
                    <p className="text-xs text-slate-600 mb-2 font-medium">Ingresa esta clave manualmente:</p>
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                      <code className="text-xs font-mono font-bold text-gray-900 truncate">
                        {setupData.secret}
                      </code>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(setupData.secret, 'secret')}
                        className="text-slate-500 hover:text-[#b3131b] shrink-0"
                        title="Copiar clave"
                      >
                        {secretCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Paso 2: Códigos de Respaldo */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#b3131b] font-bold">
                    Paso 2 · Códigos de Respaldo
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(setupData.backupCodes.join('\n'), 'backup')}
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 hover:text-gray-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-md transition-colors"
                  >
                    {backupCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{backupCopied ? 'Copiados' : 'Copiar Códigos'}</span>
                  </button>
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  Guarda estos códigos en un lugar seguro. Si pierdes acceso a tu teléfono, podrás usarlos para entrar a tu cuenta:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 font-mono text-[11px] text-center font-bold text-slate-800">
                  {setupData.backupCodes.map((code, idx) => (
                    <span key={idx} className="bg-white py-1 px-2 rounded border border-slate-200">
                      {code}
                    </span>
                  ))}
                </div>
              </div>

              {/* Paso 3: Verificar Código */}
              <form onSubmit={handleConfirmEnable} className="space-y-4 pt-2 border-t border-slate-100">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#b3131b] font-bold block mb-1">
                    Paso 3 · Confirmar con código de 6 dígitos
                  </span>
                  <p className="text-xs text-slate-600 mb-2">
                    Escribe el código de 6 dígitos que muestra tu app de autenticación:
                  </p>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-4 py-3 text-center text-xl font-mono tracking-widest text-gray-900 focus:outline-none focus:border-[#b3131b] focus:bg-white focus:ring-2 focus:ring-red-100 transition-all font-bold"
                  />
                </div>

                {setupError && (
                  <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 p-2.5 rounded-xl">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{setupError}</span>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setModalMode('idle')}
                    className="flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={setupLoading || verificationCode.length !== 6}
                    className="flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#b3131b] hover:bg-[#8f0f15] text-white transition-all shadow-sm disabled:opacity-50"
                  >
                    {setupLoading ? 'Verificando...' : 'Confirmar y Activar'}
                  </button>
                </div>
              </form>

            </div>

          </div>
        </div>
      )}

      {/* MODAL DE DESACTIVACIÓN */}
      {modalMode === 'disable' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-red-50 text-[#b3131b] flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-gray-900 text-base">Desactivar 2FA</h3>
              </div>
              <button 
                onClick={() => setModalMode('idle')}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-6 leading-relaxed">
              Por razones de seguridad, ingresa tu contraseña actual para confirmar la desactivación del segundo factor de autenticación.
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
                  onClick={() => setModalMode('idle')}
                  className="flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={disableLoading || !disablePassword}
                  className="flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider bg-red-600 hover:bg-red-700 text-white transition-all shadow-sm disabled:opacity-50"
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
