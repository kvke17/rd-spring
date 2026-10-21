'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ExpandableSearchBarProps = {
  expandDirection?: 'left' | 'right';
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
  defaultOpen?: boolean;
  width?: number;
};

const COLLAPSED_SIZE = 40;

export default function ExpandableSearchBar({
  expandDirection = 'left',
  placeholder = 'Buscar repuestos, aceites...',
  onSearch,
  className = '',
  defaultOpen = false,
  width = 280,
}: ExpandableSearchBarProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [value, setValue] = useState('');
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const inputPadding = expandDirection === 'left' ? 'pl-4 pr-11' : 'pl-11 pr-4';

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (
        !containerRef.current?.contains(e.target as Node) &&
        open &&
        value === ''
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open, value]);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => inputRef.current?.focus(), 120);
      return () => clearTimeout(timer);
    } else {
      setValue('');
    }
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        setOpen(false);
        setValue('');
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSearch?.(value);
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn('relative inline-flex items-center', className)}
      style={{ height: COLLAPSED_SIZE }}
    >
      <button
        type="button"
        aria-label={open ? 'Cerrar búsqueda' : 'Abrir búsqueda'}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          'relative z-20 size-10 grid place-items-center rounded-full border transition-colors shadow-sm cursor-pointer',
          'bg-white/90 dark:bg-neutral-900/90 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-200 hover:text-neutral-950 dark:hover:text-white backdrop-blur-sm'
        )}
      >
        {open ? <X className="size-4" /> : <Search className="size-4" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.form
            key="expandable-search-form"
            onSubmit={handleSubmit}
            className={cn(
              'absolute top-0 h-10 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 text-neutral-900 dark:text-white shadow-lg overflow-hidden flex items-center backdrop-blur-md z-10',
              expandDirection === 'left' ? 'right-0' : 'left-0'
            )}
            initial={{ width: COLLAPSED_SIZE, opacity: 0.8 }}
            animate={{ width, opacity: 1 }}
            exit={{
              width: COLLAPSED_SIZE,
              opacity: 0,
              transition: { type: 'spring', stiffness: 280, damping: 26 },
            }}
            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
          >
            <div className="relative flex-1 min-w-0 flex items-center">
              <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={placeholder}
                className={cn(
                  'w-full bg-transparent text-sm outline-none placeholder:text-neutral-400',
                  inputPadding
                )}
              />
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

export { ExpandableSearchBar };
