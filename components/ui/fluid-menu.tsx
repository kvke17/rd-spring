'use client';

import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FluidMenuContextType {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  closeMenu: () => void;
}

const FluidMenuContext = createContext<FluidMenuContextType | null>(null);

function useFluidMenu() {
  const context = useContext(FluidMenuContext);
  if (!context) {
    throw new Error('useFluidMenu must be used within a MenuContainer');
  }
  return context;
}

export interface MenuContainerProps {
  children: React.ReactNode;
  className?: string;
  defaultOpen?: boolean;
}

export function MenuContainer({
  children,
  className,
  defaultOpen = false,
}: MenuContainerProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const containerRef = useRef<HTMLDivElement>(null);

  const closeMenu = () => setIsOpen(false);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Cerrar con Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <FluidMenuContext.Provider value={{ isOpen, setIsOpen, closeMenu }}>
      <div
        ref={containerRef}
        className={cn('relative inline-flex flex-col items-center select-none', className)}
      >
        {/* Gatillador Superior Fijo (Alterna entre Menu y X) */}
        <motion.button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={isOpen}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            'relative z-30 w-11 h-11 rounded-full flex items-center justify-center transition-colors shadow-sm cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#b3131b]',
            isOpen
              ? 'bg-neutral-900 text-white border border-neutral-800'
              : 'bg-white/90 hover:bg-white text-neutral-800 border border-neutral-200/90 hover:border-neutral-300'
          )}
        >
          <AnimatePresence mode="wait" initial={false}>
            {isOpen ? (
              <motion.div
                key="close-icon"
                initial={{ rotate: -90, opacity: 0, scale: 0.8 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 90, opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="flex items-center justify-center"
              >
                <X className="w-5 h-5 text-white" />
              </motion.div>
            ) : (
              <motion.div
                key="menu-icon"
                initial={{ rotate: 90, opacity: 0, scale: 0.8 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: -90, opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="flex items-center justify-center"
              >
                <Menu className="w-5 h-5 text-neutral-900" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Cascada de Ítems Fluidos */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              key="fluid-items-stack"
              initial="closed"
              animate="open"
              exit="closed"
              variants={{
                open: {
                  transition: {
                    staggerChildren: 0.04,
                    delayChildren: 0.02,
                  },
                },
                closed: {
                  transition: {
                    staggerChildren: 0.03,
                    staggerDirection: -1,
                  },
                },
              }}
              className="absolute top-full right-0 pt-2.5 flex flex-col items-center gap-2 z-40 pointer-events-auto"
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </FluidMenuContext.Provider>
  );
}

export interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  href?: string;
  onClick?: () => void;
  isActive?: boolean;
  className?: string;
}

export function MenuItem({
  icon,
  label,
  href,
  onClick,
  isActive = false,
  className,
}: MenuItemProps) {
  const { closeMenu } = useFluidMenu();

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      onClick();
    }
    closeMenu();
  };

  const itemContent = (
    <div className="relative group flex items-center justify-center">
      {/* Tooltip flotante al costado izquierdo sin desfase */}
      <div
        role="tooltip"
        className="pointer-events-none absolute right-full mr-3.5 top-1/2 -translate-y-1/2 whitespace-nowrap opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150 ease-out z-50 flex items-center"
      >
        <span className="px-3 py-1.5 text-xs font-semibold text-white bg-neutral-900 border border-neutral-800 rounded-xl shadow-xl flex items-center gap-1.5">
          {label}
        </span>
        {/* Flecha indicadora apuntando al círculo */}
        <span className="w-0 h-0 border-y-4 border-y-transparent border-l-4 border-l-neutral-900 ml-[-1px]" />
      </div>

      {/* Círculo interactivo */}
      <motion.div
        variants={{
          open: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { type: 'spring', stiffness: 350, damping: 25 },
          },
          closed: {
            opacity: 0,
            y: -10,
            scale: 0.8,
            transition: { duration: 0.15 },
          },
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.92 }}
        className={cn(
          'w-11 h-11 rounded-full flex items-center justify-center border transition-colors shadow-md cursor-pointer',
          isActive
            ? 'bg-[#b3131b] text-white border-[#b3131b] shadow-[#b3131b]/30'
            : 'bg-white text-neutral-700 hover:text-neutral-950 hover:bg-neutral-50 border-neutral-200/90 hover:border-neutral-300',
          className
        )}
      >
        {icon}
      </motion.div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} onClick={handleClick} aria-label={label} className="focus:outline-none">
        {itemContent}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={label}
      className="focus:outline-none bg-transparent border-none p-0 cursor-pointer"
    >
      {itemContent}
    </button>
  );
}
