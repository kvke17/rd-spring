import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface InteractiveHoverButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  href?: string;
  children: React.ReactNode;
  className?: string;
}

export const InteractiveHoverButton = React.forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  InteractiveHoverButtonProps
>(({ href, children, className, ...props }, ref) => {
  const content = (
    <>
      {/* 1. Contenedor de reposo en el flujo natural del documento (determina el ancho sin saltos) */}
      <div className="relative z-10 flex items-center gap-2.5">
        {/* Punto de acento en reposo que crece concéntricamente en hover hasta llenar el botón */}
        <span
          aria-hidden="true"
          className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand-crimson)] pointer-events-none transition-transform duration-[320ms] ease-[cubic-bezier(0.23,1,0.32,1)] [@media(hover:hover)]:group-hover:scale-[100] group-focus-visible:scale-[100] motion-reduce:!duration-[220ms] motion-reduce:ease-out"
        />

        {/* Texto: en modo estándar sale hacia la derecha; en reduced-motion NO se desplaza */}
        <span className="relative inline-flex items-center transition-[transform,opacity] duration-[320ms] ease-[cubic-bezier(0.23,1,0.32,1)] motion-safe:[@media(hover:hover)]:group-hover:translate-x-8 motion-safe:[@media(hover:hover)]:group-hover:opacity-0 motion-safe:group-focus-visible:translate-x-8 motion-safe:group-focus-visible:opacity-0 motion-reduce:!transform-none motion-reduce:!opacity-100">
          <span>{children}</span>

          {/* Flecha exclusiva para prefers-reduced-motion: fade de 150ms sin desplazamiento */}
          <span
            aria-hidden="true"
            className="hidden motion-reduce:inline-flex absolute left-full ml-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-0 transition-opacity duration-150 ease-out [@media(hover:hover)]:group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:!duration-[150ms]"
          >
            <ArrowRight className="w-4 h-4 shrink-0" />
          </span>
        </span>
      </div>

      {/* 2. Copia en hover (modo estándar): entra desde la izquierda acompañada por ArrowRight */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center gap-2 px-7 sm:px-8 opacity-0 -translate-x-8 transition-[transform,opacity] duration-[320ms] ease-[cubic-bezier(0.23,1,0.32,1)] motion-safe:[@media(hover:hover)]:group-hover:translate-x-0 motion-safe:[@media(hover:hover)]:group-hover:opacity-100 motion-safe:group-focus-visible:translate-x-0 motion-safe:group-focus-visible:opacity-100 motion-reduce:hidden"
      >
        <span>{children}</span>
        <ArrowRight className="w-4 h-4 shrink-0 transition-transform duration-[320ms] ease-[cubic-bezier(0.23,1,0.32,1)] [@media(hover:hover)]:group-hover:translate-x-0.5 group-focus-visible:translate-x-0.5" />
      </div>
    </>
  );

  const sharedClasses = cn(
    // Layout y contenedor pill
    'group relative inline-flex items-center justify-center select-none overflow-hidden rounded-full',
    // Altura mínima y paddings (mínimo 44px táctil en móvil, 48px en desktop)
    'min-h-[44px] sm:min-h-[48px] px-7 sm:px-8 py-3 sm:py-3.5',
    // Tipografía y tracking
    'text-xs sm:text-sm font-semibold uppercase tracking-wider text-white whitespace-nowrap cursor-pointer',
    // Fondo negro que se mantiene negro mientras el relleno rojo avanza sobre él
    'bg-black shadow-xl shadow-black/15',
    // Sombra en hover
    '[@media(hover:hover)]:hover:shadow-2xl [@media(hover:hover)]:hover:shadow-[var(--brand-crimson)]/25',
    // Foco de teclado accesible y distinguible en fondos claros y oscuros
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-crimson)] focus-visible:ring-offset-2 focus-visible:ring-offset-white',
    // Feedback táctil activo: feedback físico scale(0.97) y cambio a carmesí al pulsar
    'active:scale-[0.97] active:bg-[var(--brand-crimson)] active:duration-100',
    className
  );

  if (href) {
    return (
      <Link
        href={href}
        ref={ref as React.Ref<HTMLAnchorElement>}
        className={sharedClasses}
        {...(props as any)}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      type={(props.type as any) || 'button'}
      className={sharedClasses}
      {...props}
    >
      {content}
    </button>
  );
});

InteractiveHoverButton.displayName = 'InteractiveHoverButton';
