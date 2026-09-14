'use client';
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

export default function AsistenteIA() {
  const [abierto, setAbierto] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [historial, setHistorial] = useState<{ rol: 'user' | 'bot'; texto: string }[]>([
    { rol: 'bot', texto: 'Hola. Soy el experto virtual de RD Spring. ¿En qué te puedo ayudar hoy?' }
  ]);
  const [cargando, setCargando] = useState(false);
  const mensajesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mensajesRef.current) {
      mensajesRef.current.scrollTop = mensajesRef.current.scrollHeight;
    }
  }, [historial, cargando]);

  const enviarMensaje = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mensaje.trim()) return;

    const textoUsuario = mensaje;
    setMensaje('');
    setHistorial((prev) => [...prev, { rol: 'user', texto: textoUsuario }]);
    setCargando(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensaje: textoUsuario }),
      });
      const data = await res.json();

      setHistorial((prev) => [...prev, { rol: 'bot', texto: data.respuesta || 'Error de conexión.' }]);
    } catch (error) {
      setHistorial((prev) => [...prev, { rol: 'bot', texto: 'Nuestros mecánicos están todos ocupados en el taller en este momento. Por favor, inténtalo de nuevo en un par de minutos o envíanos un mensaje a Soporte.' }]);
    } finally {
      setCargando(false);
    }
  };

  return (
    // font-sans fuerza a usar una tipografía limpia y legible, ignorando la fuente de lujo global
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      
      {/* Botón flotante Gemini */}
      {!abierto && (
        <button
          onClick={() => setAbierto(true)}
          className="bg-[linear-gradient(#000000)] text-white font-bold text-xs tracking-widest px-6 py-4 rounded-full shadow-lg hover:opacity-90 transition-all flex items-center gap-2 border border-white/50"
        >
          <span>✨ ASISTENTE IA</span>
        </button>
      )}

      {/* Ventana del Chat */}
      {abierto && (
        <div className="w-80 sm:w-96 bg-white border border-gray-200 rounded-lg shadow-2xl flex flex-col overflow-hidden">
          
          {/* Header del Chat */}
          <div className="bg-gray-50 border-b border-gray-200 p-4 flex justify-between items-center">
            <h3 className="text-[#b91c1c] font-bold text-sm uppercase tracking-widest">Mecánico Virtual</h3>
            <button onClick={() => setAbierto(false)} className="text-gray-400 hover:text-gray-900 text-lg transition-colors">
              ✕
            </button>
          </div>

          {/* Área de Mensajes */}
          <div ref={mensajesRef} className="h-96 p-4 overflow-y-auto bg-white flex flex-col gap-4">
            {historial.map((msg, index) => (
              <div
                key={index}
                className={`max-w-[85%] p-3 rounded-lg text-sm leading-relaxed ${
                  msg.rol === 'user'
                    ? 'bg-gray-100 text-gray-900 self-end rounded-tr-none border border-gray-200' // Mensaje del usuario (Gris)
                    : 'bg-red-50 text-gray-900 self-start rounded-tl-none border border-red-100'   // Mensaje del bot (Rojo muy sutil, texto oscuro)
                }`}
              >
                {msg.rol === 'bot' ? (
                  msg.texto.split('[BOTON_COTIZAR]').map((parte, i, arreglo) => (
                    <span key={i}>
                      {parte}
                      {i !== arreglo.length - 1 && (
                        <Link
                          href="/cotizacion"
                          className="mt-4 block w-full text-center bg-[#b91c1c] text-white font-bold py-3 px-4 rounded text-xs uppercase tracking-widest hover:bg-red-800 transition-colors shadow-sm"
                          onClick={() => setAbierto(false)}
                        >
                          ➔ IR A COTIZACIÓN
                        </Link>
                      )}
                    </span>
                  ))
                ) : (
                  msg.texto
                )}
              </div>
            ))}
            
            {/* Animación de "Escribiendo..." */}
            {cargando && (
              <div className="bg-red-50 text-gray-500 text-xs self-start p-3 rounded-lg rounded-tl-none border border-red-100 flex gap-1">
                <span className="animate-bounce">●</span>
                <span className="animate-bounce delay-75">●</span>
                <span className="animate-bounce delay-150">●</span>
              </div>
            )}
          </div>

          {/* Input de texto */}
          <div className="p-3 bg-gray-50 border-t border-gray-200">
            <form onSubmit={enviarMensaje} className="flex gap-2">
              <input
                type="text"
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                placeholder="Escribe tu consulta..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm text-gray-900 bg-white focus:outline-none focus:border-[#b91c1c] focus:ring-1 focus:ring-[#b91c1c]"
              />
              <button
                type="submit"
                disabled={cargando}
                className="bg-[#b91c1c] text-white px-4 py-2 rounded hover:bg-red-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ➔
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}