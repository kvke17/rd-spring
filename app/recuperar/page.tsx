'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, CheckCircle2, ArrowRight, ShieldCheck, ChevronLeft } from 'lucide-react';

export default function RecuperarPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    
    try {
      const res = await fetch('/api/recuperar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
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
            <ShieldCheck className="w-3 h-3" />
            <span>RECUPERACIÓN SEGURA</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 mt-2 tracking-tight">
            Restablecer Clave
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Ingresa tu correo y te enviaremos un enlace protegido para renovar tu contraseña.
          </p>
        </div>

        {status === 'success' ? (
          <div className="text-center py-6">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-100">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Correo de Recuperación Enviado</h3>
            <p className="text-xs text-slate-600 mb-6 leading-relaxed">
              Si el correo <strong>{email}</strong> está registrado, recibirás un enlace seguro para crear tu nueva contraseña en los próximos minutos.
            </p>
            <Link 
              href="/login" 
              className="inline-flex items-center justify-center gap-2 w-full bg-slate-900 hover:bg-black text-white font-bold py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-colors shadow-2xs"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Volver a Iniciar Sesión</span>
            </Link>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-[11px] font-mono uppercase tracking-wider text-slate-700 mb-1.5 font-bold">
                Correo Electrónico Registrado
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50/60 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-[#b3131b] focus:bg-white focus:ring-2 focus:ring-red-100 transition-all"
                  placeholder="tu@correo.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-[#b3131b] hover:bg-[#8f0f15] text-white font-bold py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
            >
              <span>{status === 'loading' ? 'ENVIANDO ENLACE...' : 'ENVIAR ENLACE DE RECUPERACIÓN'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <Link 
            href="/login" 
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-gray-900 font-medium transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>¿Recordaste tu contraseña? Inicia sesión aquí</span>
          </Link>
        </div>

      </div>
    </div>
  );
}