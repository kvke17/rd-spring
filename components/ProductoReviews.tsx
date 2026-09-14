'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function ProductReviews({ productId }: { productId: string }) {
  const { data: session } = useSession();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [reviews, setReviews] = useState<any[]>([]);

  // Función que trae las reseñas de la base de datos
  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/reviews?productId=${productId}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (error) {
      console.error("Error cargando reseñas:", error);
    }
  };

  // Se ejecuta automáticamente al cargar el componente
  useEffect(() => {
    fetchReviews();
  }, [productId]);

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
        fetchReviews(); // Recarga la lista instantáneamente sin recargar la página
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
    <div className="space-y-12">
      {/* 1. FORMULARIO DE RESEÑA */}
      <div className="bg-gray-50 p-6 border border-white/5">
        <h3 className="text-xl font-bold text-gray-900 uppercase tracking-tight mb-4">Dejar una Reseña</h3>
        
        {message && (
          <div className={`p-3 mb-4 rounded text-sm  ${message.includes('✅') ? 'bg-green-900/30 text-green-400' : 'bg-[#b3131b]/20 text-[#b3131b]'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-600 mb-2 ">Calificación</label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`text-2xl focus:outline-none transition-colors ${
                    star <= rating ? 'text-[#b3131b]' : 'text-gray-600 hover:text-red-400/50'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-600 mb-2 ">Comentario</label>
            <textarea 
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full bg-black/50 border border-gray-200 text-gray-900 p-3 focus:ring-1 focus:ring-[#b3131b] focus:border-[#b3131b] transition-shadow resize-none h-24 text-sm"
              placeholder="¿Qué tal funciona este producto en tu vehículo?"
            />
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting || !session}
            className="self-start bg-white text-black font-bold uppercase tracking-wide text-xs py-3 px-6 hover:bg-gray-200 transition-colors disabled:bg-gray-600 disabled:text-gray-600 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Guardando...' : 'Publicar Reseña'}
          </button>
        </form>
      </div>

      {/* 2. LISTA DINÁMICA DE RESEÑAS */}
      <div className="space-y-6 pt-8 border-t border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 uppercase tracking-tight mb-6">Valoraciones Recientes</h3>
        
        {reviews.length === 0 ? (
          <p className="text-sm text-gray-500 ">No hay valoraciones aún. ¡Sé el primero en opinar!</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="bg-gray-50 p-6 border border-white/5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#b3131b]/10 text-[#b3131b] rounded-full flex items-center justify-center text-xs font-bold ">
                    {review.user?.name ? review.user.name.substring(0, 2).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{review.user?.name || 'Cliente'}</p>
                    <p className="text-xs text-[#b3131b] tracking-widest mt-1">
                      {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)} 
                      <span className="text-green-500  text-[10px] ml-2 tracking-normal uppercase">✓ Verificado</span>
                    </p>
                  </div>
                </div>
                <span className="text-[10px]  text-gray-500">
                  {new Date(review.createdAt).toLocaleDateString('es-CL')}
                </span>
              </div>
              {review.comment && (
                <p className="text-sm text-gray-700 leading-relaxed">
                  {review.comment}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}