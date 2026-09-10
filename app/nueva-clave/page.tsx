'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function FormularioNuevaClave() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Si alguien entra a la página sin un token en la URL
  if (!token) {
    return (
      <div className="text-center">
        <p className="text-[#FF0000] font-mono text-xs uppercase tracking-widest mb-6">Enlace inválido o expirado</p>
        <Link href="/recuperar" className="text-xs font-mono uppercase tracking-widest text-gray-400 hover:text-white transition-colors border border-white/20 p-3 rounded">
          Solicitar nuevo enlace
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

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
        setMessage('¡Clave actualizada! Redirigiendo...');
        // Redirigir al login después de 2 segundos
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-2">Nueva Contraseña</label>
        <input 
          type="password" 
          value={newPassword} 
          onChange={(e) => setNewPassword(e.target.value)} 
          className="w-full bg-[#0a0a0a] border border-white/20 rounded p-3 text-white focus:outline-none focus:border-[#FF0000]" 
          required 
        />
      </div>
      <div>
        <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-2">Confirmar Contraseña</label>
        <input 
          type="password" 
          value={confirmPassword} 
          onChange={(e) => setConfirmPassword(e.target.value)} 
          className="w-full bg-[#0a0a0a] border border-white/20 rounded p-3 text-white focus:outline-none focus:border-[#FF0000]" 
          required 
        />
      </div>

      {error && <p className="text-red-500 text-xs font-mono text-center border border-red-500/20 bg-red-500/10 p-2 rounded">{error}</p>}
      {message && <p className="text-emerald-500 text-xs font-mono text-center border border-emerald-500/20 bg-emerald-500/10 p-2 rounded">{message}</p>}

      <button type="submit" disabled={loading} className="w-full bg-[#FF0000] text-black font-bold py-4 rounded text-xs uppercase tracking-widest hover:bg-opacity-90 transition-all mt-4 disabled:opacity-50">
        {loading ? 'GUARDANDO...' : 'GUARDAR NUEVA CLAVE'}
      </button>
    </form>
  );
}

export default function NuevaClavePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#121212] p-8 rounded-lg border border-white/10">
        <h1 className="text-2xl font-bold text-white mb-2 text-center">Restablecer</h1>
        <p className="text-xs font-mono text-gray-500 uppercase tracking-widest text-center mb-8">Ingresa tu nueva clave de acceso</p>
        
        {/* Usamos Suspense porque useSearchParams necesita un entorno asíncrono en Next 13+ */}
        <Suspense fallback={<p className="text-center text-xs font-mono text-gray-500">Cargando...</p>}>
          <FormularioNuevaClave />
        </Suspense>
      </div>
    </div>
  );
}