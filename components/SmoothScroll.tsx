'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';

export default function SmoothScroll() {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // 0. Desactivar y limpiar Lenis completamente en rutas administrativas (/admin/*)
    if (pathname?.startsWith('/admin')) {
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
      }
      return;
    }

    // 1. Respetar estrictamente la preferencia de movimiento reducido
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      return;
    }

    // 2. Inicializar Lenis una sola vez
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Curva exponencial natural y reactiva
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      touchMultiplier: 1.2,
      wheelMultiplier: 1.0,
      autoResize: true,
    });

    lenisRef.current = lenis;

    // 3. Loop sincronizado con requestAnimationFrame
    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    // 4. Manejo fluido de enlaces de ancla interna (#) sin saltos bruscos
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      if (href && href.startsWith('#') && href.length > 1) {
        const element = document.querySelector(href);
        if (element) {
          e.preventDefault();
          lenis.scrollTo(element as HTMLElement, { offset: -80 });
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);

    // 5. Manejo dinámico si el usuario activa 'prefers-reduced-motion' en tiempo real
    const handleMotionChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        lenis.destroy();
        lenisRef.current = null;
        cancelAnimationFrame(rafId);
      }
    };
    mediaQuery.addEventListener('change', handleMotionChange);

    // Limpieza estricta al desmontar
    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener('click', handleAnchorClick);
      mediaQuery.removeEventListener('change', handleMotionChange);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [pathname]);

  // 6. Restablecer scroll al inicio en cambios de ruta de Next.js
  useEffect(() => {
    if (pathname?.startsWith('/admin')) return;
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
}
