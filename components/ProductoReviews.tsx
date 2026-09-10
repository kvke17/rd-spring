'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function ProductReviews({ productId }: { productId: string }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      setMessage("⚠️ Por favor, inicia sesión para dejar una reseña.");
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, rating, comment }),
      });

      if (res.ok) {
        setMessage("✅ ¡Gracias por tu reseña!");
        setComment('');
        // Resetea el rating si quieres, o déjalo en 5
        router.refresh(); // Recarga la página para mostrar la reseña en la lista
      } else {
        const data = await res.json();
        setMessage(`❌ Error: ${data.error || "Ocurrió un error inesperado"}`);
      }
    } catch (error) {
      console.error(error);
      setMessage("❌ Falla de conexión al enviar la reseña.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-12 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Dejar una Reseña</h3>
      
      {message && (
        <div className={`p-3 mb-4 rounded-md text-sm ${message.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">¿Cómo calificarías este producto?</label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`text-2xl focus:outline-none transition-colors ${
                  star <= rating ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-200'
                }`}
              >
                ★
              </button>
            ))}
            <span className="ml-2 text-sm text-gray-500 font-medium">{rating} de 5 estrellas</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Comentario (opcional)</label>
          <textarea 
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow resize-none h-28"
            placeholder="Escribe tu opinión sobre el producto aquí..."
          />
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting || !session}
          className="self-start bg-blue-600 text-white font-medium py-2.5 px-6 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Enviando...' : 'Publicar Reseña'}
        </button>
      </form>
    </div>
  );
}