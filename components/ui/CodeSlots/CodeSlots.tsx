'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { 
  animate, 
  motion, 
  motionValue, 
  useMotionValue, 
  useReducedMotion, 
  useTransform,
  type MotionValue
} from 'motion/react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Tick02Icon } from '@hugeicons/core-free-icons';
import './CodeSlots.css';

const EASE_OUT = [0.23, 1, 0.32, 1] as const;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const digitsOf = (raw: string | number | undefined | null) => String(raw ?? '').replace(/\D/g, '');
const toSlots = (raw: string | number | undefined | null, n: number) => 
  Array.from({ length: n }, (_, i) => digitsOf(raw).slice(0, n)[i] ?? '');
const firstEmptyOf = (slots: string[]) => { 
  const i = slots.indexOf(''); 
  return i === -1 ? slots.length - 1 : i; 
};
const isFull = (slots: string[]) => slots.every(Boolean);

export interface CodeSlotsProps {
  length?: number;
  value?: string;
  defaultValue?: string;
  onChange?: (code: string) => void;
  onComplete?: (code: string) => void;
  status?: 'idle' | 'error' | 'success';
  mask?: boolean;
  caret?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  accentColor?: string;
  inkColor?: string;
  slotColor?: string;
  digitColor?: string;
  dangerColor?: string;
  slotSize?: number;
  gap?: number;
  radius?: number;
  bounce?: number;
  settle?: number;
  rise?: number;
  cascade?: number;
  ariaLabel?: string;
  className?: string;
}

export default function CodeSlots({
  length = 6,
  value,
  defaultValue = '',
  onChange,
  onComplete,
  status = 'idle',
  mask = false,
  caret = true,
  disabled = false,
  autoFocus = false,
  accentColor = '#ffffff',
  inkColor = '#b3131b',
  slotColor = '#18181b',
  digitColor = '#09090b',
  dangerColor = '#b3131b',
  slotSize = 46,
  gap = 8,
  radius = 12,
  bounce = 0.2,
  settle = 0.3,
  rise = 8,
  cascade = 20,
  ariaLabel = 'One-time code',
  className = ''
}: CodeSlotsProps) {
  const uid = useId();
  const reduce = useReducedMotion();
  const inputRef = useRef<HTMLInputElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  
  // Responsive slot measurement to fit small mobile screens (< 400px)
  const [windowWidth, setWindowWidth] = useState<number | null>(null);
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isSmallScreen = windowWidth !== null && windowWidth < 400;
  const effectiveSlotSize = isSmallScreen ? Math.min(slotSize, 38) : slotSize;
  const effectiveGap = isSmallScreen ? Math.min(gap, 6) : gap;

  const [slots, setSlots] = useState<string[]>(() => toSlots(value ?? defaultValue, length));
  const [active, setActive] = useState<number>(() => firstEmptyOf(slots));
  const [focused, setFocused] = useState(false);
  const [veiled, setVeiled] = useState(status === 'success');
  
  const activeMv = useMotionValue(active);
  const openMv = useMotionValue(status === 'success' ? 1 : 0);
  const checkMv = useMotionValue(status === 'success' ? 1 : 0);
  
  const glide = useRef<Set<number>>(new Set());
  const target = useRef<number[]>([]);
  const draining = useRef<boolean>(false);
  const drainTimer = useRef<NodeJS.Timeout | undefined>(undefined);
  const statusRef = useRef<'idle' | 'error' | 'success'>(status);
  statusRef.current = status;
  
  const emitted = useRef(digitsOf(value ?? defaultValue).slice(0, length));
  const slotsRef = useRef<string[]>(slots);
  slotsRef.current = slots;
  
  const live = useRef({ settle, bounce, cascade, reduce: Boolean(reduce) });
  live.current = { settle, bounce, cascade, reduce: Boolean(reduce) };

  const springs = useMemo(() => ({
    mvs: Array.from({ length }, (_, i) => motionValue(slotsRef.current[i] ? 1 : 0)),
    drops: Array.from({ length }, () => motionValue(statusRef.current === 'success' ? 1 : 0))
  }), [length]);
  
  const { mvs, drops } = springs;
  const pitch = effectiveSlotSize + effectiveGap;
  const height = Math.round(effectiveSlotSize * 1.18);
  const washRadius = Math.min(radius, effectiveSlotSize / 2);

  const drive = useCallback((i: number, to: number, delayMs = 0) => {
    const mv = mvs[i];
    if (!mv) return;
    target.current[i] = to;
    if (live.current.reduce) { 
      mv.jump(to); 
      return; 
    }
    animate(mv, to, { 
      type: 'spring', 
      duration: live.current.settle, 
      bounce: live.current.bounce, 
      delay: delayMs / 1000 
    });
  }, [mvs]);

  const land = useCallback((i: number, delayMs = 0) => {
    if (mvs[i].get() > 0) mvs[i].jump(0);
    drive(i, 1, delayMs);
  }, [mvs, drive]);

  const moveActive = useCallback((next: number, crossed: number[]) => {
    crossed.forEach(j => glide.current.add(j));
    activeMv.jump(next); 
    setActive(next);
  }, [activeMv]);

  const jumpActive = useCallback((next: number) => {
    glide.current.clear(); 
    activeMv.jump(next); 
    setActive(next);
  }, [activeMv]);

  const caretX = useTransform(() => {
    const a = activeMv.get();
    let x = a * pitch;
    for (let j = 0; j < mvs.length; j++) {
      const h = clamp01(mvs[j].get());
      if (!glide.current.has(j)) continue;
      const to = target.current[j];
      if (to === undefined || h === clamp01(to)) { 
        glide.current.delete(j); 
        continue; 
      }
      x += j < a ? -(1 - h) * pitch : h * pitch;
    }
    return Math.min(Math.max(x, 0), (mvs.length - 1) * pitch);
  });

  const commit = useCallback((next: string[]) => {
    const prev = slotsRef.current;
    slotsRef.current = next;
    setSlots(next);
    const code = next.join('');
    emitted.current = code;
    onChange?.(code);
    if (!isFull(prev) && isFull(next)) onComplete?.(code);
  }, [onChange, onComplete]);

  const insert = (raw: string, from = active) => {
    const digits = digitsOf(raw);
    if (!digits) return;
    const next = [...slotsRef.current];
    const crossed: number[] = [];
    const step = reduce ? 0 : cascade;
    let i = from;
    for (const ch of digits) {
      if (i >= length) break;
      next[i] = ch; 
      land(i, (i - from) * step); 
      crossed.push(i); 
      i += 1;
    }
    if (!crossed.length) return;
    commit(next);
    moveActive(Math.min(i, length - 1), crossed);
  };

  const clearSlot = (i: number, stepBack = false) => {
    if (!slotsRef.current[i]) { 
      if (stepBack) jumpActive(i); 
      return; 
    }
    const next = [...slotsRef.current];
    next[i] = ''; 
    drive(i, 0); 
    commit(next);
    if (stepBack) moveActive(i, [i]);
  };

  const busy = disabled || draining.current || status === 'success';

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (busy || e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key;
    if (/^[0-9]$/.test(k)) { 
      e.preventDefault(); 
      insert(k); 
    } else if (k === 'Backspace') { 
      e.preventDefault(); 
      if (slots[active]) clearSlot(active); 
      else if (active > 0) clearSlot(active - 1, true); 
    } else if (k === 'Delete') { 
      e.preventDefault(); 
      clearSlot(active); 
    } else if (k === 'ArrowLeft') { 
      e.preventDefault(); 
      jumpActive(Math.max(active - 1, 0)); 
    } else if (k === 'ArrowRight') { 
      e.preventDefault(); 
      jumpActive(Math.min(active + 1, length - 1)); 
    }
  };

  useEffect(() => {
    if (status === 'success') {
      setVeiled(true);
      animate(openMv, 1, { duration: 0.3, ease: EASE_OUT });
      drops.forEach((d, k) => animate(d, 1, { type: 'spring', duration: 0.3, bounce: 0, delay: 0.06 + k * 0.03 }));
      animate(checkMv, 1, { type: 'spring', duration: 0.35, bounce: bounce, delay: 0.28 });
    } else if (status === 'error') {
      const filled = slotsRef.current.map((c, i) => (c ? i : -1)).filter(i => i >= 0).reverse();
      draining.current = true;
      const step = reduce ? 0 : cascade;
      filled.forEach((i, k) => drive(i, 0, k * step));
      moveActive(0, slotsRef.current.map((_, j) => j));
      if (drainTimer.current) clearTimeout(drainTimer.current);
      drainTimer.current = setTimeout(() => {
        draining.current = false; 
        commit(Array.from({ length }, () => ''));
      }, (filled.length - 1) * step + settle * 1000);
    }
  }, [status, openMv, checkMv, drops, drive, moveActive, commit, length, reduce, cascade, settle, bounce]);

  // Sync external controlled value if passed
  useEffect(() => {
    if (value !== undefined) {
      const formatted = toSlots(value, length);
      if (formatted.join('') !== slotsRef.current.join('')) {
        slotsRef.current = formatted;
        setSlots(formatted);
        const nextActive = firstEmptyOf(formatted);
        setActive(nextActive);
        activeMv.jump(nextActive);
        formatted.forEach((ch, idx) => {
          if (mvs[idx]) {
            mvs[idx].jump(ch ? 1 : 0);
          }
        });
      }
    }
  }, [value, length, activeMv, mvs]);

  // Auto focus input when autoFocus prop is enabled
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
      setFocused(true);
    }
  }, [autoFocus]);

  const view = slots.length === length ? slots : Array.from({ length }, (_, i) => slots[i] ?? '');
  const showCaret = caret && focused && !disabled && !veiled && status !== 'success' && (status === 'error' || !view[active]);

  return (
    <div 
      className={`code-slots ${className}`} 
      style={{
        '--cs-accent': accentColor, 
        '--cs-ink': inkColor, 
        '--cs-slot': slotColor,
        '--cs-digit': digitColor, 
        '--cs-danger': dangerColor, 
        '--cs-size': `${effectiveSlotSize}px`,
        '--cs-height': `${height}px`, 
        '--cs-gap': `${effectiveGap}px`, 
        '--cs-radius': `${washRadius}px`,
        '--cs-font': `${Math.round(effectiveSlotSize * 0.5)}px`
      } as React.CSSProperties}
    >
      <div 
        ref={rowRef} 
        className="code-slots__row" 
        data-status={status} 
        data-focused={focused ? '' : undefined} 
        data-disabled={disabled ? '' : undefined} 
        onMouseDown={() => inputRef.current?.focus()}
      >
        <input 
          ref={inputRef} 
          className="code-slots__input" 
          type="text" 
          inputMode="numeric" 
          autoComplete="one-time-code" 
          pattern="[0-9]*" 
          value="" 
          maxLength={length} 
          aria-label={ariaLabel} 
          aria-invalid={status === 'error'} 
          disabled={disabled} 
          readOnly={status === 'success'} 
          autoFocus={autoFocus}
          onKeyDown={onKeyDown} 
          onPaste={e => { 
            e.preventDefault(); 
            insert(e.clipboardData.getData('text')); 
          }} 
          onChange={e => { 
            const d = digitsOf(e.target.value); 
            if (d) insert(d, active); 
          }} 
          onFocus={() => setFocused(true)} 
          onBlur={() => setFocused(false)} 
        />
        {view.map((ch, i) => (
          <Slot
            key={i}
            mv={mvs[i]}
            drop={drops[i]}
            char={mask && ch ? '•' : ch}
            active={focused && active === i}
            rise={rise}
            sink={Math.round(height * 0.5)}
          />
        ))}
        <motion.span 
          className="code-slots__wash" 
          aria-hidden="true" 
          style={{ clipPath: useTransform(openMv, o => `inset(0 ${(1 - clamp01(o)) * 50}% round ${washRadius}px)`) }}
        >
          <motion.span 
            className="code-slots__check" 
            style={{ 
              transform: useTransform(checkMv, c => `translateY(${(1 - c) * 8}px) scale(${0.85 + 0.15 * Math.max(c, 0)})`), 
              opacity: useTransform(checkMv, clamp01) 
            }}
          >
            <HugeiconsIcon icon={Tick02Icon} size={Math.round(effectiveSlotSize * 0.6)} strokeWidth={2.2} />
          </motion.span>
        </motion.span>
        <motion.span 
          className="code-slots__caret" 
          aria-hidden="true" 
          data-show={showCaret ? '' : undefined} 
          style={{ transform: useTransform(caretX, x => `translateX(${x}px)`) }}
        >
          <span key={active} className="code-slots__caret-line" />
        </motion.span>
      </div>
      <span id={`${uid}-count`} className="code-slots__sr" aria-live="polite">
        {status === 'success' ? 'Code accepted' : `${view.filter(Boolean).length} of ${length} digits entered`}
      </span>
    </div>
  );
}

interface SlotProps {
  mv: MotionValue<number>;
  drop: MotionValue<number>;
  char: string;
  active: boolean;
  rise: number;
  sink: number;
}

function Slot({ mv, drop, char, active, rise, sink }: SlotProps) {
  const [shown, setShown] = useState(char);
  if (char && char !== shown) setShown(char);
  
  const fill = useTransform(mv, (t: number) => `scale(${Math.max(t, 0)})`);
  const lift = useTransform([mv, drop], ([t, d]: number[]) => `translateY(${(1 - t) * rise + Math.max(d, 0) * sink}px)`);
  const ink = useTransform([mv, drop], ([t, d]: number[]) => clamp01(t) * (1 - clamp01(d / 0.6)));
  
  return (
    <span 
      className="code-slots__slot" 
      data-active={active ? '' : undefined} 
      data-filled={char ? '' : undefined} 
      aria-hidden="true"
    >
      <motion.span className="code-slots__fill" style={{ transform: fill }} />
      {shown ? (
        <motion.span className="code-slots__digit" style={{ transform: lift, opacity: ink }}>
          {shown}
        </motion.span>
      ) : null}
    </span>
  );
}

export { CodeSlots };
