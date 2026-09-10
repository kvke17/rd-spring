'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function RecuperarPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/recuperar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      
      if (res.ok) {
        // Mostramos el mensaje de éxito que nos mandó la API
        setMessage(data.message);
        setEmail(''); // Limpiamos el input
      } else {
        setMessage(data.error || 'Ocurrió un error. Inténtalo de nuevo.');
      }
    } catch (error) {
      setMessage('Ocurrió un error de conexión. Revisa tu internet.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-[#0a0a0a] px-4 py-12">
      <div className="max-w-md w-full bg-[#111111] p-8 rounded-xl shadow-2xl border border-neutral-800">
        <h1 className="text-2xl font-bold text-white mb-2 text-center">Recuperar Contraseña</h1>
        <p className="text-gray-400 text-sm mb-8 text-center">
          Ingresa tu correo electrónico y te enviaremos un enlace seguro para crear una nueva contraseña.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-md bg-black border border-neutral-700 text-white px-4 py-3 focus:outline-none focus:border-[#eab308] focus:ring-1 focus:ring-[#eab308] transition-colors"
              placeholder="tu@correo.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#eab308] hover:bg-yellow-500 text-black font-bold py-3 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Enviando enlace...' : 'Enviar enlace de recuperación'}
          </button>
        </form>

        {message && (
          <div className="mt-6 p-4 rounded-md bg-neutral-900 border border-neutral-700 text-gray-200 text-sm text-center">
            {message}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors">
            ¿Recordaste tu contraseña? <span className="text-[#eab308]">Inicia sesión aquí</span>
          </Link>
        </div>
      </div>
    </div>
  );
}