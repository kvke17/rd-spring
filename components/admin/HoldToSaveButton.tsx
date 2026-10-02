'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Save, Check, Loader2, Sparkles, AlertCircle } from 'lucide-react';

interface HoldToSaveButtonProps {
  onConfirm: () => void | Promise<void>;
  isSubmitting?: boolean;
  disabled?: boolean;
  disabledReason?: string;
  label?: string;
  holdDuration?: number; // duration in ms, default 1200ms
  className?: string;
}

export default function HoldToSaveButton({
  onConfirm,
  isSubmitting = false,
  disabled = false,
  disabledReason = '',
  label = 'GUARDAR PRODUCTO',
  holdDuration = 1200,
  className = '',
}: HoldToSaveButtonProps) {
  const [progress, setProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [shake, setShake] = useState(false);

  const startTimeRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const controls = useAnimation();

  const isCompletedRef = useRef(false);

  // Reset progress when submission finishes or disabled changes
  useEffect(() => {
    if (!isSubmitting) {
      setIsCompleted(false);
      isCompletedRef.current = false;
      setProgress(0);
    }
  }, [isSubmitting]);

  // Clean animation loop on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const triggerHaptic = (pattern: number[]) => {
    try {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(pattern);
      }
    } catch {}
  };

  const handleStartHold = (e: React.PointerEvent | React.KeyboardEvent) => {
    // Ignore right clicks or if already submitting / completed
    if ('button' in e && e.button !== 0) return;
    if (isSubmitting || isCompletedRef.current) return;

    if (disabled) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      triggerHaptic([30, 40]);
      return;
    }

    if ('pointerId' in e && typeof e.currentTarget?.setPointerCapture === 'function') {
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {}
    }

    setIsHolding(true);
    startTimeRef.current = performance.now();
    triggerHaptic([25]);

    const step = (now: number) => {
      if (!startTimeRef.current) return;
      const elapsed = now - startTimeRef.current;
      const currentProgress = Math.min((elapsed / holdDuration) * 100, 100);

      setProgress(currentProgress);

      if (currentProgress < 100) {
        animationFrameRef.current = requestAnimationFrame(step);
      } else {
        isCompletedRef.current = true;
        setIsCompleted(true);
        setIsHolding(false);
        triggerHaptic([40, 60, 40]);
        onConfirm();
      }
    };

    animationFrameRef.current = requestAnimationFrame(step);
  };

  const handleEndHold = (e?: React.PointerEvent | React.KeyboardEvent) => {
    if (isCompletedRef.current || isCompleted || isSubmitting || disabled) return;

    // If pointerleave fires while mouse button is still actively held down, ignore it
    if (e && 'buttons' in e && (e.buttons & 1) === 1 && e.type === 'pointerleave') {
      return;
    }

    if (e && 'pointerId' in e && typeof e.currentTarget?.releasePointerCapture === 'function') {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    startTimeRef.current = null;
    setIsHolding(false);

    // Smooth release back to 0
    let current = progress;
    const drain = () => {
      current = Math.max(0, current - 8);
      setProgress(current);
      if (current > 0) {
        animationFrameRef.current = requestAnimationFrame(drain);
      }
    };
    animationFrameRef.current = requestAnimationFrame(drain);
  };

  // Keyboard accessibility (Space / Enter hold)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === ' ' || e.key === 'Enter') && !isHolding && !e.repeat) {
      e.preventDefault();
      handleStartHold(e);
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleEndHold();
    }
  };

  return (
    <div className={`relative flex flex-col items-center w-full select-none ${className}`}>
      <motion.button
        type="button"
        onPointerDown={handleStartHold}
        onPointerUp={handleEndHold}
        onPointerLeave={handleEndHold}
        onPointerCancel={handleEndHold}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        animate={
          shake
            ? { x: [-5, 5, -4, 4, -2, 2, 0] }
            : isHolding
            ? { scale: 0.985 }
            : { scale: 1 }
        }
        transition={{ duration: shake ? 0.4 : 0.15 }}
        disabled={isSubmitting}
        aria-label={label}
        className={`group relative w-full h-16 sm:h-18 rounded-2xl overflow-hidden font-black text-xs sm:text-sm tracking-wider uppercase transition-all duration-300 shadow-lg cursor-pointer flex items-center justify-center ${
          disabled
            ? 'bg-neutral-800/80 border border-neutral-700/60 text-neutral-400 cursor-not-allowed shadow-none'
            : isHolding
            ? 'bg-neutral-900 border border-red-500/50 shadow-red-950/40'
            : 'bg-neutral-950 hover:bg-neutral-900 border border-neutral-700/80 hover:border-neutral-600 text-white shadow-xl hover:shadow-2xl'
        }`}
      >
        {/* Animated Background Fluid Fill */}
        {!disabled && (
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#8f0f15] via-[#b3131b] to-[#e11d48] transition-all"
            style={{
              width: `${progress}%`,
              transition: isHolding ? 'none' : 'width 0.2s ease-out',
            }}
          >
            {/* Glowing progress front edge line */}
            {progress > 0 && progress < 100 && (
              <div className="absolute right-0 inset-y-0 w-2 bg-white/70 shadow-[0_0_12px_#fff]" />
            )}
          </div>
        )}

        {/* Content Layer */}
        <div className="relative z-10 flex items-center justify-center gap-3 px-6 w-full pointer-events-none">
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-white" />
              <span className="text-white tracking-widest font-black">
                GUARDANDO EN BASE DE DATOS...
              </span>
            </>
          ) : isCompleted ? (
            <>
              <Check className="w-5 h-5 text-white stroke-[3]" />
              <span className="text-white tracking-widest font-black">
                ¡CONFIRMADO Y GUARDANDO!
              </span>
            </>
          ) : isHolding ? (
            <>
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              >
                <Sparkles className="w-5 h-5 text-white" />
              </motion.div>
              <div className="flex flex-col items-center">
                <span className="text-white font-black tracking-widest text-sm">
                  MANTÉN PRESIONADO ({Math.round(progress)}%)
                </span>
                <span className="text-[10px] text-white/80 font-mono tracking-tight lowercase">
                  suelta para cancelar
                </span>
              </div>
            </>
          ) : disabled ? (
            <>
              <AlertCircle className="w-4 h-4 text-neutral-400" />
              <span>{label}</span>
            </>
          ) : (
            <>
              <div className="w-8 h-8 rounded-xl bg-white/10 group-hover:bg-[#b3131b] flex items-center justify-center transition-colors duration-200">
                <Save className="w-4 h-4 text-white" />
              </div>
              <div className="flex flex-col items-center">
                <span className="text-white font-black tracking-wider text-xs sm:text-sm">
                  {label}
                </span>
                <span className="text-[10px] text-neutral-400 font-mono tracking-wider">
                  MANTÉN APRETADO PARA CONFIRMAR
                </span>
              </div>
            </>
          )}
        </div>

        {/* Subtle Ambient Pulse on Idle */}
        {!disabled && !isHolding && !isSubmitting && (
          <div className="absolute inset-0 bg-radial from-white/[0.07] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        )}
      </motion.button>

      {/* Helper Context Subtitle / Disabled Reason */}
      <div className="mt-2.5 text-center min-h-[20px]">
        {disabled && disabledReason ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-mono text-amber-600 bg-amber-50/80 px-3 py-1 rounded-full border border-amber-200/60">
            <AlertCircle className="w-3.5 h-3.5" />
            {disabledReason}
          </span>
        ) : (
          <span className="text-[11px] font-mono text-neutral-600 tracking-wide">
            Presiona y mantén durante 1.2s para prevenir guardados accidentales.
          </span>
        )}
      </div>
    </div>
  );
}
