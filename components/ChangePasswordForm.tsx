'use client';

import { useState } from 'react';
import { Lock, CheckCircle2, AlertCircle, KeyRound, Shield } from 'lucide-react';

export default function ChangePasswordForm({ email }: { email: string }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
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
        <p className="text-[11px] font-mono uppercase tracking-wider text-slate-800 font-bold">Seguridad de la Cuenta</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-600 mb-1.5 font-bold">
            Contraseña Actual
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="password" 
              value={currentPassword} 
              onChange={(e) => setCurrentPassword(e.target.value)} 
              placeholder="••••••••"
              className="w-full bg-slate-50/70 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-slate-900 focus:outline-none focus:border-[#b3131b] focus:bg-white focus:ring-2 focus:ring-red-100 transition-all text-xs" 
              required 
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-600 mb-1.5 font-bold">
            Nueva Contraseña
          </label>
          <div className="relative">
            <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="password" 
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)} 
              placeholder="Mínimo 6 caracteres"
              className="w-full bg-slate-50/70 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-slate-900 focus:outline-none focus:border-[#b3131b] focus:bg-white focus:ring-2 focus:ring-red-100 transition-all text-xs" 
              required 
            />
          </div>
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
          className="w-full bg-slate-900 hover:bg-black text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition-all disabled:opacity-50 mt-2 shadow-2xs"
        >
          {loading ? 'ACTUALIZANDO...' : 'ACTUALIZAR CONTRASEÑA'}
        </button>
      </form>
    </div>
  );
}