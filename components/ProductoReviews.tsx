'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useReducedMotion } from 'framer-motion';
import { Rating } from '@/components/ui/rating';
import { MessageSquarePlus, CheckCircle2, AlertCircle, ChevronDown, User, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReviewUser {
  name?: string | null;
}

interface ReviewItem {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  user?: ReviewUser | null;
}

interface ProductoReviewsProps {
  productId: string;
}

// 1. Privacidad del autor: "Matías González" -> "Matías G."
function formatAuthorName(name?: string | null): string {
  if (!name || !name.trim()) return 'Cliente';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  const firstName = parts[0];
  const lastInitial = parts[1].charAt(0).toUpperCase();
  return `${firstName} ${lastInitial}.`;
}

// 2. Iniciales para el avatar tipográfico
function getInitials(name?: string | null): string {
  if (!name || !name.trim()) return 'CL';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

// 3. Formato de fecha chilena: "12 de octubre de 2026"
function formatChileanDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('es-CL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

export default function ProductoReviews({ productId }: ProductoReviewsProps) {
  const { data: session } = useSession();
  const shouldReduceMotion = useReducedMotion();

  // Estados del formulario
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);

  // Estados de datos
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [visibleCount, setVisibleCount] = useState<number>(5);

  // Animación viewport de barras de distribución
  const [barsAnimated, setBarsAnimated] = useState<boolean>(false);
  const summaryRef = useRef<HTMLDivElement>(null);

  // Carga de reseñas desde la API oficial (/api/reviews)
  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch(`/api/reviews?productId=${encodeURIComponent(productId)}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error cargando reseñas del producto:', error);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Observer para animar las barras de calificación al entrar al viewport (una sola vez)
  useEffect(() => {
    const el = summaryRef.current;
    if (!el || shouldReduceMotion) {
      setBarsAnimated(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setBarsAnimated(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [shouldReduceMotion]);

  // Envío seguro de nueva reseña
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!session) {
      setErrorMessage('Por favor, inicia sesión para publicar tu valoración.');
      return;
    }

    if (rating < 1 || rating > 5) {
      setErrorMessage('Por favor selecciona una calificación entre 1 y 5 estrellas.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          rating,
          comment: comment.trim() || null,
        }),
      });

      if (res.ok) {
        setSuccessMessage('¡Gracias por tu reseña! Ha sido publicada exitosamente.');
        setComment('');
        setRating(5);
        setIsFormOpen(false);
        await fetchReviews(); // Recarga en caliente las reseñas reales
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorMessage(data.error || 'Ocurrió un error inesperado al procesar la reseña.');
      }
    } catch (error) {
      console.error('Falla al enviar la reseña:', error);
      setErrorMessage('Error de conexión con el servidor. Inténtalo nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cálculo matemático exacto de estadísticas y distribución
  const stats = useMemo(() => {
    const total = reviews.length;
    if (total === 0) {
      return {
        total: 0,
        average: 0,
        averageFormatted: '0',
        distribution: [5, 4, 3, 2, 1].map((stars) => ({ stars, count: 0, percentage: 0 })),
      };
    }

    const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
    const avg = sum / total;
    // Formato chileno con coma decimal: ej. "4,6"
    const avgFormatted = avg.toFixed(1).replace('.', ',');

    const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      const star = Math.max(1, Math.min(5, Math.round(Number(r.rating) || 5)));
      counts[star] = (counts[star] || 0) + 1;
    });

    const distribution = [5, 4, 3, 2, 1].map((stars) => {
      const count = counts[stars] || 0;
      const percentage = Math.round((count / total) * 100);
      return { stars, count, percentage };
    });

    return {
      total,
      average: avg,
      averageFormatted: avgFormatted,
      distribution,
    };
  }, [reviews]);

  const visibleReviews = useMemo(() => {
    return reviews.slice(0, visibleCount);
  }, [reviews, visibleCount]);

  if (loading) {
    return (
      <div className="py-8 space-y-6 animate-pulse">
        <div className="h-6 w-48 bg-slate-100 rounded-md" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 h-56 bg-slate-100 rounded-2xl" />
          <div className="lg:col-span-8 space-y-4">
            <div className="h-28 bg-slate-100 rounded-2xl" />
            <div className="h-28 bg-slate-100 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      
      {/* ========================================================
          CABECERA & ACCIÓN PRINCIPAL
         ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--brand-crimson)] font-bold block mb-1">
            EXPERIENCIAS REALES
          </span>
          <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-gray-900">
            Reseñas del Producto
          </h3>
        </div>

        <button
          type="button"
          onClick={() => setIsFormOpen((prev) => !prev)}
          className={cn(
            'inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer self-start sm:self-auto',
            isFormOpen
              ? 'bg-slate-100 text-slate-800 hover:bg-slate-200'
              : 'bg-black text-white hover:bg-neutral-800 active:scale-95 shadow-sm'
          )}
        >
          <MessageSquarePlus className="w-4 h-4 text-[var(--brand-crimson)]" />
          <span>{isFormOpen ? 'Cerrar Formulario' : 'Escribir una Reseña'}</span>
        </button>
      </div>

      {/* ========================================================
          FORMULARIO DE RESEÑA (DESPLEGABLE / MEJORADO)
         ======================================================== */}
      {isFormOpen && (
        <div className="bg-slate-50/80 rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs transition-all">
          <div className="mb-6">
            <h4 className="text-base font-bold text-gray-900 uppercase tracking-tight">
              Comparte tu experiencia
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Tu opinión ayuda a otros conductores a elegir el componente o lubricante adecuado.
            </p>
          </div>

          {/* Estado no autenticado */}
          {!session ? (
            <div className="bg-amber-50/80 border border-amber-200/90 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-amber-900">
                    Inicia sesión para publicar tu valoración
                  </p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    Para mantener la autenticidad de la comunidad, requerimos una cuenta activa.
                  </p>
                </div>
              </div>
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold uppercase tracking-wider transition-colors shrink-0 cursor-pointer"
              >
                Iniciar Sesión
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Alerta de Error */}
              {errorMessage && (
                <div
                  role="alert"
                  className="bg-red-50 border border-red-200 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-red-800"
                >
                  <AlertCircle className="w-4 h-4 text-[var(--brand-crimson)] shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Selector de Estrellas */}
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-700 font-bold mb-2">
                  Tu Calificación
                </label>
                <div className="flex items-center gap-3">
                  <Rating
                    value={rating}
                    readOnly={false}
                    onChange={(val) => setRating(val)}
                    size="lg"
                    ariaLabel="Calificar producto de 1 a 5 estrellas"
                  />
                  <span className="text-xs font-semibold text-slate-600 font-mono">
                    {rating} de 5 estrellas
                  </span>
                </div>
              </div>

              {/* Comentario */}
              <div>
                <label
                  htmlFor="review-comment"
                  className="block text-[11px] font-mono uppercase tracking-wider text-slate-700 font-bold mb-2"
                >
                  Comentario (Opcional)
                </label>
                <textarea
                  id="review-comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  maxLength={1000}
                  rows={3}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-sm text-gray-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--brand-crimson)] focus:border-transparent transition-shadow resize-none"
                  placeholder="Describe la compatibilidad, ajuste mecánico o sensaciones de manejo..."
                />
                <div className="flex justify-end mt-1 text-[10px] text-slate-400 font-mono">
                  {comment.length} / 1000 caracteres
                </div>
              </div>

              {/* Botón Guardar */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-gray-900 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-[var(--brand-crimson)] hover:bg-[#8f0f15] text-white text-xs font-bold uppercase tracking-wider transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none shadow-sm cursor-pointer"
                >
                  {isSubmitting ? 'Guardando...' : 'Publicar Reseña'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Alerta de Éxito al publicar */}
      {successMessage && (
        <div
          role="status"
          className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3 text-xs sm:text-sm text-emerald-800"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* ========================================================
          ESTADO 1: SIN RESEÑAS (CERO RESEÑAS)
          No muestra "0,0" ni barras vacías. Invita a dejar la primera.
         ======================================================== */}
      {stats.total === 0 ? (
        <div className="bg-slate-50/60 rounded-3xl border border-slate-200/80 p-8 sm:p-12 text-center flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 mb-4 shadow-2xs">
            <Star className="w-6 h-6 text-slate-300 stroke-slate-400" />
          </div>
          <h4 className="text-lg font-bold text-gray-900 mb-2">
            Aún no hay valoraciones para este producto
          </h4>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed mb-6">
            Sé el primero en compartir tu experiencia y calificación técnica sobre este repuesto o fluido de alta gama.
          </p>
          {!isFormOpen && (
            <button
              type="button"
              onClick={() => setIsFormOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider transition-all duration-200 active:scale-95 shadow-sm cursor-pointer"
            >
              <MessageSquarePlus className="w-4 h-4 text-[var(--brand-crimson)]" />
              <span>Dejar la Primera Reseña</span>
            </button>
          )}
        </div>
      ) : (
        /* ========================================================
            ESTADO 2 & 3: CON 1 O MÁS RESEÑAS
            Layout Desktop: Resumen a la izquierda (lg:col-span-5) y lista a la derecha (lg:col-span-7).
            Layout Móvil: Todo apilado, resumen primero.
           ======================================================== */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* COLUMNA IZQUIERDA: RESUMEN DE CALIFICACIONES (RATING SUMMARY) */}
          <div
            ref={summaryRef}
            className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-xs lg:sticky lg:top-28"
          >
            {/* Bloque superior: Promedio numérico en grande + Estrellas con relleno proporcional + Total */}
            <div className="flex flex-col items-center text-center pb-6">
              <span
                className="text-5xl sm:text-6xl font-black text-gray-900 tracking-tight leading-none mb-3 font-mono"
                aria-label={`Calificación promedio: ${stats.averageFormatted} de 5 estrellas`}
              >
                {stats.averageFormatted}
              </span>

              <div className="mb-2">
                <Rating value={stats.average} size="md" />
              </div>

              <span className="text-xs font-medium text-slate-500">
                {stats.total === 1 ? 'Basado en 1 reseña' : `Basado en ${stats.total} reseñas`}
              </span>
            </div>

            {/* Separador fino entre el promedio y la distribución */}
            <div className="border-t border-slate-100 pt-5 space-y-2.5">
              {stats.distribution.map((row, idx) => {
                const labelText = `${row.stars} estrellas: ${row.count} ${
                  row.count === 1 ? 'reseña' : 'reseñas'
                } (${row.percentage}%)`;

                return (
                  <div
                    key={row.stars}
                    className="flex items-center gap-3 text-xs"
                    aria-label={labelText}
                  >
                    {/* Etiqueta de número de estrellas */}
                    <div className="w-12 flex items-center justify-end gap-1 text-slate-600 font-medium shrink-0">
                      <span className="font-mono text-slate-700">{row.stars}</span>
                      <Star className="w-3 h-3 text-[var(--brand-crimson)] fill-[var(--brand-crimson)]" />
                    </div>

                    {/* Barra proporcional con animación transform: scaleX */}
                    <div
                      aria-hidden="true"
                      className="flex-1 h-2 sm:h-2.5 bg-slate-100 rounded-full overflow-hidden"
                    >
                      <div
                        className="h-full rounded-full bg-[var(--brand-crimson)]"
                        style={{
                          width: `${row.percentage}%`,
                          transformOrigin: 'left',
                          transform: barsAnimated ? 'scaleX(1)' : 'scaleX(0)',
                          transition: shouldReduceMotion
                            ? 'none'
                            : `transform 600ms cubic-bezier(0.23, 1, 0.32, 1) ${idx * 60}ms`,
                        }}
                      />
                    </div>

                    {/* Cantidad de reseñas por fila */}
                    <div className="w-8 text-right font-mono text-slate-400 text-[11px] shrink-0">
                      {row.count}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* COLUMNA DERECHA: LISTA DINÁMICA DE RESEÑAS */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between pb-2">
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                Opiniones Verificadas ({stats.total})
              </h4>
            </div>

            <div className="space-y-4">
              {visibleReviews.map((review) => {
                const author = formatAuthorName(review.user?.name);
                const initials = getInitials(review.user?.name);
                const formattedDate = formatChileanDate(review.createdAt);

                return (
                  <div
                    key={review.id}
                    className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs space-y-3 transition-colors hover:border-slate-300"
                  >
                    {/* Encabezado de la tarjeta: Avatar + Nombre + Fecha + Estrellas */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {/* Avatar con iniciales tipográficas */}
                        <div
                          aria-hidden="true"
                          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-100 border border-slate-200/80 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 select-none shadow-2xs font-mono"
                        >
                          {initials}
                        </div>

                        <div>
                          <p className="text-xs sm:text-sm font-bold text-gray-900 leading-snug">
                            {author}
                          </p>
                          <p className="text-[11px] text-slate-400 font-medium">
                            {formattedDate}
                          </p>
                        </div>
                      </div>

                      {/* Estrellas de la reseña individual */}
                      <div className="shrink-0 pt-0.5">
                        <Rating value={review.rating} size="sm" />
                      </div>
                    </div>

                    {/* Contenido / Comentario del cliente */}
                    {review.comment ? (
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed max-w-2xl whitespace-pre-line pt-1">
                        {review.comment}
                      </p>
                    ) : (
                      <p className="text-xs italic text-slate-400 pt-1">
                        El cliente no dejó comentario escrito.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Botón "Ver más reseñas" si hay más de 5 */}
            {reviews.length > visibleCount && (
              <div className="pt-4 text-center">
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => prev + 5)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold uppercase tracking-wider transition-all duration-150 active:scale-95 shadow-2xs cursor-pointer"
                >
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                  <span>
                    Ver más reseñas ({reviews.length - visibleCount} restantes)
                  </span>
                </button>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}