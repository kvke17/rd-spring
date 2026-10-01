'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';

interface SectionHeaderProps {
  badge: string;
  title: string;
  actionText?: string;
  actionHref?: string;
}

export default function SectionHeader({
  badge,
  title,
  actionText,
  actionHref,
}: SectionHeaderProps) {
  const shouldReduceMotion = useReducedMotion();
  const easeEditorial: [number, number, number, number] = [0.23, 1, 0.32, 1];

  return (
    <div className="flex justify-between items-end mb-12">
      <motion.div
        initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-20px' }}
        transition={{ duration: shouldReduceMotion ? 0.2 : 0.5, ease: easeEditorial }}
      >
        <p className="text-xs uppercase tracking-[0.25em] text-[#b3131b] mb-2 font-bold">
          {badge}
        </p>
        <h2 className="text-3xl font-bold uppercase tracking-tight text-gray-900">
          {title}
        </h2>
      </motion.div>

      {actionText && actionHref && (
        <motion.div
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-20px' }}
          transition={{ duration: shouldReduceMotion ? 0.2 : 0.5, delay: shouldReduceMotion ? 0 : 0.1, ease: easeEditorial }}
        >
          <Link
            href={actionHref}
            className="btn-shine border border-slate-200 bg-white text-xs uppercase tracking-widest px-5 py-2.5 rounded-xl hover:bg-slate-50 text-gray-900 font-bold shadow-sm hover:shadow transition-all duration-200 whitespace-nowrap ml-4 active:scale-95 cursor-pointer inline-block"
          >
            <span className="relative z-10">{actionText}</span>
          </Link>
        </motion.div>
      )}
    </div>
  );
}
