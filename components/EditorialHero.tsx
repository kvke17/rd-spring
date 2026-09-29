'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, Variants } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { Syne, Instrument_Serif } from 'next/font/google';

const syne = Syne({
  subsets: ['latin'],
  weight: ['700', '800'],
  display: 'swap',
});

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  display: 'swap',
});

export default function EditorialHero() {
  // Stagger container for the masked lines
  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  // Masked slide-up animation: from y: '110%' to y: '0%' with organic cubic-bezier curve
  const lineVariants: Variants = {
    hidden: { y: '115%' },
    visible: {
      y: '0%',
      transition: {
        duration: 1.1,
        ease: [0.25, 1, 0.5, 1],
      },
    },
  };

  // Ultra-smooth scale-in for the coilover strut on the right: scale 1.05 -> 1.0, opacity 0 -> 1 over 1.4s
  const strutVariants: Variants = {
    hidden: { opacity: 0, scale: 1.05 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 1.4,
        ease: [0.25, 1, 0.5, 1],
        delay: 0.15,
      },
    },
  };

  return (
    <section className="relative w-full min-h-screen bg-[#f8fafc] flex items-center overflow-hidden pt-24 sm:pt-28 pb-16 sm:pb-20">
      
      {/* 1. Subtle Precision Engineering Background Grid */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(#0f172a 1px, transparent 1px), linear-gradient(90deg, #0f172a 1px, transparent 1px)',
          backgroundSize: '56px 56px',
        }}
      />

      {/* ========================================================
          DESKTOP FULLSCREEN EDGE-TO-EDGE SUSPENSION ASSET (>= 1024px)
          Seamless 2.7K coilover render anchored on the right with scale: 1.05 -> 1.0
         ======================================================== */}
      <motion.div
        variants={strutVariants}
        initial="hidden"
        animate="visible"
        className="hidden lg:block absolute inset-0 w-full h-full pointer-events-none select-none z-10"
      >
        <Image
          src="/images/sistemasuspencion.jpg"
          alt="Ingeniería y amortiguación de precisión RD Spring"
          fill
          priority
          quality={90}
          className="object-cover object-[78%_center] xl:object-[80%_center] 2xl:object-right"
          sizes="100vw"
        />

        {/* Seamless editorial blend: smooth transition on the left to maximize text contrast */}
        <div className="absolute inset-y-0 left-0 w-full lg:w-[58%] xl:w-[54%] bg-gradient-to-r from-[#f8fafc] via-[#f8fafc]/90 to-transparent pointer-events-none" />

        {/* Top subtle fade under navbar */}
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#f8fafc] via-[#f8fafc]/50 to-transparent pointer-events-none" />

        {/* Bottom seamless dissolve into pure white (#ffffff) of the next section */}
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-white via-white/60 to-transparent pointer-events-none" />
      </motion.div>

      {/* 2. Main Content Container */}
      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 w-full z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center min-h-[calc(100vh-10rem)]">
          
          {/* ========================================================
              LEFT COLUMN: Awwwards-Grade Editorial Typography & Micro-Motion
             ======================================================== */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-8 xl:col-span-7 flex flex-col justify-center text-left"
          >
            {/* Architectural Display Headline with Masked Line-by-Line Reveal */}
            <h1
              className={`${syne.className} text-5xl sm:text-6xl md:text-7xl lg:text-[5rem] xl:text-[5.5rem] font-bold tracking-[-0.035em] text-black leading-[0.96] max-w-3xl`}
            >
              {/* Line 1 */}
              <div className="overflow-hidden pb-1">
                <motion.span variants={lineVariants} className="block">
                  La ingeniería
                </motion.span>
              </div>

              {/* Line 2 */}
              <div className="overflow-hidden pb-1">
                <motion.span variants={lineVariants} className="block">
                  que sostiene
                </motion.span>
              </div>

              {/* Line 3: Signature Crimson Red Accent (#b3131b) on "lujo" */}
              <div className="overflow-hidden pb-1.5">
                <motion.span variants={lineVariants} className="block">
                  el{' '}
                  <span
                    className={`${instrumentSerif.className} font-normal italic text-[1.15em] tracking-normal text-[#b3131b] font-serif inline-block px-1`}
                  >
                    lujo
                  </span>{' '}
                  en
                </motion.span>
              </div>

              {/* Line 4 */}
              <div className="overflow-hidden pb-2">
                <motion.span variants={lineVariants} className="block">
                  movimiento.
                </motion.span>
              </div>
            </h1>

            {/* Masked Subheadline: Concise, technical, spaced with generous tracking */}
            <div className="overflow-hidden mt-6 sm:mt-8 max-w-lg">
              <motion.p
                variants={lineVariants}
                className="text-sm sm:text-base md:text-lg text-[#475569] font-normal leading-relaxed tracking-wide"
              >
                Sistemas de amortiguación activa, espirales progresivos y suspensión neumática diseñados con tolerancia milimétrica para marcas de élite:{' '}
                <span className="text-slate-800 font-medium">Porsche, BMW, Audi y Land Rover</span>.
              </motion.p>
            </div>

            {/* Masked Luxury Action Buttons */}
            <div className="overflow-hidden mt-8 sm:mt-10">
              <motion.div
                variants={lineVariants}
                className="flex flex-wrap items-center gap-4"
              >
                {/* Button 1: Pure solid black with white text & crimson accent arrow */}
                <Link
                  href="/cotizacion"
                  className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-black hover:bg-neutral-900 text-white text-xs sm:text-sm font-semibold uppercase tracking-wider shadow-xl shadow-black/15 hover:shadow-2xl hover:shadow-black/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer"
                >
                  <span>COTIZAR REPUESTO</span>
                  <span className="w-6 h-6 rounded-full bg-white/10 group-hover:bg-[#b3131b] flex items-center justify-center transition-colors duration-300">
                    <ArrowUpRight className="w-3.5 h-3.5 text-white transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </Link>

                {/* Button 2: Solid black with crisp white text and subtle border hover shift */}
                <Link
                  href="/catalogo"
                  className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-black hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-600 text-white text-xs sm:text-sm font-semibold uppercase tracking-wider shadow-xl shadow-black/10 hover:shadow-2xl hover:shadow-black/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer"
                >
                  <span>VER ACEITES ROWE</span>
                </Link>
              </motion.div>
            </div>
          </motion.div>

          {/* ========================================================
              MOBILE ONLY STRUT VIEW (< 1024px)
              Stacks cleanly and neatly centered below text with zero card containers
             ======================================================== */}
          <motion.div
            variants={strutVariants}
            initial="hidden"
            animate="visible"
            className="lg:hidden w-full flex items-center justify-center mt-6 sm:mt-8 relative"
          >
            <div className="relative w-full max-w-[360px] sm:max-w-[460px] h-[440px] sm:h-[540px] flex items-center justify-center overflow-hidden">
              <Image
                src="/images/sistemasuspencion.jpg"
                alt="Amortiguador y resorte de suspensión de alta gama"
                fill
                priority
                quality={90}
                className="object-cover object-[76%_center] select-none pointer-events-none"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              {/* Soft edge dissolves on mobile so there are zero visible borders */}
              <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#f8fafc] to-transparent pointer-events-none" />
              <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white to-transparent pointer-events-none" />
              <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-[#f8fafc] to-transparent pointer-events-none" />
              <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[#f8fafc] to-transparent pointer-events-none" />
            </div>
          </motion.div>

        </div>
      </div>

      {/* Bottom seamless dissolve into pure white of the next section */}
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-white via-white/50 to-transparent pointer-events-none z-10" />

    </section>
  );
}
