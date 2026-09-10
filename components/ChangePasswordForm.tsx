'use client';
import { useState } from 'react';

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
        setMessage(data.message);
        setCurrentPassword('');
        setNewPassword('');
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
    <div className="mt-6 border-t border-white/10 pt-6">
      <p className="text-xs uppercase font-mono tracking-widest text-[#FF0000] mb-4">Seguridad</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[10px] text-gray-500 font-mono uppercase mb-2">Contraseña Actual</label>
          <input 
            type="password" 
            value={currentPassword} 
            onChange={(e) => setCurrentPassword(e.target.value)} 
            className="w-full bg-[#0a0a0a] border border-white/20 rounded p-3 text-white focus:outline-none focus:border-[#FF0000] text-sm" 
            required 
          />
        </div>
        <div>
          <label className="block text-[10px] text-gray-500 font-mono uppercase mb-2">Nueva Contraseña</label>
          <input 
            type="password" 
            value={newPassword} 
            onChange={(e) => setNewPassword(e.target.value)} 
            className="w-full bg-[#0a0a0a] border border-white/20 rounded p-3 text-white focus:outline-none focus:border-[#FF0000] text-sm" 
            required 
          />
        </div>

        {error && <p className="text-red-500 text-[10px] font-mono border border-red-500/20 bg-red-500/10 p-2 rounded text-center">{error}</p>}
        {message && <p className="text-emerald-500 text-[10px] font-mono border border-emerald-500/20 bg-emerald-500/10 p-2 rounded text-center">{message}</p>}

        <button 
          type="submit" 
          disabled={loading} 
          className="w-full bg-[#FF0000] text-black font-bold py-3 rounded text-xs uppercase tracking-widest hover:bg-opacity-90 transition-all disabled:opacity-50 mt-2"
        >
          {loading ? 'ACTUALIZANDO...' : 'ACTUALIZAR CLAVE'}
        </button>
      </form>
    </div>
  );
}