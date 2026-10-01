'use client';

import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface RatingProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  readOnly?: boolean;
  onChange?: (val: number) => void;
  className?: string;
  ariaLabel?: string;
}

const sizeConfig = {
  sm: {
    star: 'w-3.5 h-3.5',
    gap: 'gap-1',
  },
  md: {
    star: 'w-4 sm:w-5 h-4 sm:h-5',
    gap: 'gap-1 sm:gap-1.5',
  },
  lg: {
    star: 'w-6 sm:w-7 h-6 sm:h-7',
    gap: 'gap-2',
  },
};

export function Rating({
  value,
  max = 5,
  size = 'md',
  readOnly = true,
  onChange,
  className,
  ariaLabel,
}: RatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const activeRating = hoverValue !== null ? hoverValue : value;
  const currentSize = sizeConfig[size];

  // Modo interactivo (editable para formularios)
  if (!readOnly && onChange) {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        e.preventDefault();
        const next = Math.min(max, (value || 0) + 1);
        onChange(next);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        e.preventDefault();
        const prev = Math.max(1, (value || 1) - 1);
        onChange(prev);
      }
    };

    return (
      <div
        role="radiogroup"
        aria-label={ariaLabel || 'Seleccionar calificación en estrellas'}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onMouseLeave={() => setHoverValue(null)}
        className={cn(
          'inline-flex items-center',
          currentSize.gap,
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-crimson)] focus-visible:ring-offset-2 rounded-lg p-1',
          className
        )}
      >
        {Array.from({ length: max }, (_, index) => {
          const starNumber = index + 1;
          const isFilled = starNumber <= activeRating;

          return (
            <button
              key={starNumber}
              type="button"
              role="radio"
              aria-checked={value === starNumber}
              aria-label={`${starNumber} de ${max} estrellas`}
              onClick={() => onChange(starNumber)}
              onMouseEnter={() => setHoverValue(starNumber)}
              className={cn(
                'relative p-1 rounded-md transition-transform duration-150 cursor-pointer select-none active:scale-90',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-crimson)]'
              )}
            >
              <Star
                className={cn(
                  currentSize.star,
                  'transition-colors duration-150',
                  isFilled
                    ? 'text-[var(--brand-crimson)] fill-[var(--brand-crimson)] stroke-[var(--brand-crimson)]'
                    : 'text-slate-300 fill-slate-100 stroke-slate-300 hover:text-slate-400'
                )}
              />
            </button>
          );
        })}
      </div>
    );
  }

  // Modo solo lectura (visualización con relleno fraccionario exacto)
  return (
    <div
      role="img"
      aria-label={ariaLabel || `Calificación: ${value.toFixed(1).replace('.', ',')} de ${max} estrellas`}
      className={cn('inline-flex items-center select-none', currentSize.gap, className)}
    >
      {Array.from({ length: max }, (_, index) => {
        const starNumber = index + 1;
        // Cálculo del porcentaje de llenado (0% a 100%)
        let fillPercent = 0;
        if (value >= starNumber) {
          fillPercent = 100;
        } else if (value > starNumber - 1) {
          fillPercent = Math.max(0, Math.min(100, Math.round((value - (starNumber - 1)) * 100)));
        }

        return (
          <div key={starNumber} className="relative inline-block leading-none">
            {/* Estrella base (fondo gris vacío) */}
            <Star
              aria-hidden="true"
              className={cn(
                currentSize.star,
                'text-slate-200 fill-slate-100 stroke-slate-300'
              )}
            />

            {/* Estrella con relleno proporcional en rojo carmesí de marca */}
            {fillPercent > 0 && (
              <div
                aria-hidden="true"
                className="absolute inset-0 overflow-hidden pointer-events-none"
                style={{ width: `${fillPercent}%` }}
              >
                <Star
                  className={cn(
                    currentSize.star,
                    'text-[var(--brand-crimson)] fill-[var(--brand-crimson)] stroke-[var(--brand-crimson)]'
                  )}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
