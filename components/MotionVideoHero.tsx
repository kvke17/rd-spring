'use client';

import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { ChevronRight, ArrowDown } from 'lucide-react';

export default function MotionVideoHero() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.23, 1, 0.32, 1],
      },
    },
  };

  return (
    <section className="relative w-full h-screen min-h-[720px] max-h-[1080px] bg-black text-white overflow-hidden flex items-center justify-center">
      
      {/* 1. Full-Screen Background Video (suspension.mov) */}
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        src="/suspension.mov"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none [transform:translate3d(0,0,0)] will-change-transform opacity-80"
      >
        <source src="/suspension.mov" type="video/mp4" />
        <source src="/suspension.mov" type="video/quicktime" />
      </video>

      {/* 2. Cinematic Multi-Layer Overlays for Optimal Text Readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/65 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.65)_100%)] pointer-events-none" />
      
      {/* Subtle Brand Crimson Ambient Light Glow */}
      <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#b3131b]/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Precision Engineering Grid Texture */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* 3. Hero Foreground Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10 text-center pt-16 sm:pt-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center"
        >
          {/* Live Studio Badge */}
          <motion.div variants={itemVariants} className="mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/15 shadow-2xl">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#b3131b] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#b3131b]"></span>
              </span>
              <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-white font-mono font-bold">
                · Especialistas En Suspensíon
              </span>
            </div>
          </motion.div>

          {/* High-Impact Main Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight text-white leading-[1.05] max-w-4xl"
          >
            Ingeniería de Suspensión <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-[#b3131b]">
              de Élite.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed font-light"
          >
            Amortiguadores adaptativos, resortes progresivos y suspensión neumática original para Porsche y vehículos deportivos de alto rendimiento.
          </motion.p>

          {/* Action Call-to-Action Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap items-center justify-center gap-3.5 mt-8 sm:mt-10"
          >
            <Link
              href="/cotizacion"
              className="btn-shine bg-[#b3131b] hover:bg-[#8f0f15] text-white font-bold px-8 py-4 rounded-xl uppercase text-xs tracking-widest transition-all duration-200 shadow-2xl shadow-red-950/70 active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <span>COTIZAR REPUESTO</span>
              <ChevronRight className="w-4 h-4" />
            </Link>

            <Link
              href="/catalogo"
              className="btn-shine bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white font-bold px-7 py-4 rounded-xl uppercase text-xs tracking-widest transition-all duration-200 active:scale-95 cursor-pointer"
            >
              <span>VER ACEITES ROWE</span>
            </Link>

            <Link
              href="/repuestos"
              className="btn-shine bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white font-bold px-7 py-4 rounded-xl uppercase text-xs tracking-widest transition-all duration-200 active:scale-95 cursor-pointer"
            >
              <span>VER REPUESTOS DISPONIBLES</span>
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom Scroll Indicator */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 z-20 pointer-events-none opacity-80">
        <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-slate-400">
          EXPLORAR CATÁLOGO & REPUESTOS
        </span>
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
        >
          <ArrowDown className="w-3.5 h-3.5 text-[#b3131b]" />
        </motion.div>
      </div>

    </section>
  );
}
