/**
 * RD Spring Luxury Theme & Motion Tokens
 * Centralized design tokens matching FluidNavMenu and brand aesthetic.
 */

// iOS / Dynamic Island Spring Physics Profile
export const SPRING_TRANSITION = {
  type: 'spring' as const,
  stiffness: 350,
  damping: 30,
};

// Smooth Spring for larger morphing containers
export const SPRING_CONTAINER = {
  type: 'spring' as const,
  stiffness: 350,
  damping: 32,
};

// Quick Spring for buttons, pills and micro-interactions
export const SPRING_BOUNCE = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 25,
};

// Stagger and Coordination Delays
export const STAGGER_DELAYS = {
  staggerChildren: 0.035,
  delayChildren: 0.03,
};

export const EXIT_TRANSITION = {
  duration: 0.15,
  ease: 'easeInOut' as const,
  staggerChildren: 0.012,
  staggerDirection: -1 as const,
};

// Shared Color Palette Tokens
export const THEME_COLORS = {
  brandCrimson: '#b3131b',
  brandCrimsonHover: '#960f16',
  darkBg: '#0a0a0a',
  darkSurface: 'rgba(10, 10, 10, 0.98)',
  darkCard: 'rgba(23, 23, 23, 1)',
  borderDark: 'rgba(38, 38, 38, 0.9)',
  borderSubtle: 'rgba(255, 255, 255, 0.08)',
  activePillBg: 'rgba(179, 19, 27, 0.15)',
  activePillRing: 'rgba(179, 19, 27, 0.40)',
  activeIconBg: 'rgba(179, 19, 27, 0.20)',
  textPrimary: '#ffffff',
  textMuted: '#d4d4d4', // neutral-300
  textDim: '#a3a3a3',   // neutral-400
  textDarkHeading: '#0f172a',
};

// SweetAlert2 Luxury Modal Custom Styling (matching "Vaciar carro" modal)
export const swalLuxuryConfig = {
  confirmButtonColor: '#b3131b',
  cancelButtonColor: '#64748b',
  customClass: {
    popup: 'rounded-2xl border border-neutral-200/80 shadow-2xl backdrop-blur-xl',
    title: 'text-lg font-bold text-gray-900 tracking-tight',
    htmlContainer: 'text-sm text-gray-600',
    confirmButton: 'rounded-xl font-bold uppercase text-xs tracking-wider px-5 py-3 shadow-sm',
    cancelButton: 'rounded-xl font-bold uppercase text-xs tracking-wider px-5 py-3',
  },
};
