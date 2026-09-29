'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie } from 'lucide-react';

const STORAGE_KEY = 'rdspring_cookie_consent';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const storedPreference = localStorage.getItem(STORAGE_KEY);
      if (!storedPreference) {
        // Slight delay to ensure fluid entrance after initial paint
        const timer = setTimeout(() => setIsVisible(true), 700);
        return () => clearTimeout(timer);
      }
    } catch {
      // In case localStorage is blocked/restricted by browser privacy settings
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'accepted');
    } catch {
      // ignore storage write errors
    }
    setIsVisible(false);
  };

  const handleDecline = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'rejected');
    } catch {
      // ignore storage write errors
    }
    setIsVisible(false);
  };

  return (
    <div className="fixed inset-x-0 bottom-5 sm:bottom-6 pointer-events-none flex justify-center sm:justify-start sm:left-6 z-50 px-4 sm:px-0">
      <AnimatePresence>
        {isVisible && (
          <motion.div
            key="cookie-consent-island"
            initial={{ y: 40, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.96 }}
            transition={{
              type: 'spring',
              stiffness: 350,
              damping: 28,
            }}
            className="pointer-events-auto w-full sm:max-w-lg md:max-w-xl bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl border border-black/[0.08] dark:border-white/[0.1] rounded-2xl sm:rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] shadow-black/10 p-4 sm:px-5 sm:py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4"
            role="region"
            aria-label="Consentimiento de cookies"
          >
            {/* Visual Icon & Editorial Copy */}
            <div className="flex items-start sm:items-center gap-3">
              <div className="relative flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 dark:bg-neutral-800 flex items-center justify-center text-slate-800 dark:text-neutral-200 mt-0.5 sm:mt-0">
                <Cookie className="w-4 h-4 text-slate-700 dark:text-neutral-300" />
                {/* Subtle Crimson Red Accent Dot */}
                <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#b3131b] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#b3131b]" />
                </span>
              </div>
              <p className="text-xs sm:text-[13px] text-slate-700 dark:text-neutral-300 leading-snug">
                Utilizamos cookies técnicas y de rendimiento para garantizar la precisión en su experiencia en{' '}
                <strong className="font-semibold text-slate-900 dark:text-white">RD Spring</strong>.
              </p>
            </div>

            {/* Action Buttons: Apple Style */}
            <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
              <button
                type="button"
                onClick={handleDecline}
                className="text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white text-xs px-3 py-2 rounded-full transition-colors active:scale-95 cursor-pointer"
              >
                Rechazar
              </button>
              <button
                type="button"
                onClick={handleAccept}
                className="bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-xs font-medium px-4 py-2 rounded-full transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                Aceptar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
