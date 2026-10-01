'use client';

import Image from 'next/image';
import { motion, useReducedMotion, Variants } from 'framer-motion';
import { Syne, Instrument_Serif } from 'next/font/google';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';

const easeEditorial: [number, number, number, number] = [0.23, 1, 0.32, 1];

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

interface WordItem {
  text: string;
  isAccent?: boolean;
}

interface LineItem {
  words: WordItem[];
}

const headlineLines: LineItem[] = [
  { words: [{ text: 'La' }, { text: 'ingeniería' }] },
  { words: [{ text: 'que' }, { text: 'sostiene' }] },
  { words: [{ text: 'el' }, { text: 'lujo', isAccent: true }, { text: 'en' }] },
  { words: [{ text: 'movimiento.' }] },
];

export default function EditorialHero() {
  const shouldReduceMotion = useReducedMotion();

  // Ultra-smooth scale-in for the coilover strut on the right: scale 1.05 -> 1.0, opacity 0 -> 1 over 1.4s
  const strutVariants: Variants = {
    hidden: { opacity: 0, scale: shouldReduceMotion ? 1 : 1.05 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: shouldReduceMotion ? 0.3 : 1.4,
        ease: easeEditorial,
        delay: shouldReduceMotion ? 0 : 0.15,
      },
    },
  };

  // Pre-calculate character delays to maintain continuous stagger across all 4 lines
  let charCounter = 0;

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
          <div className="lg:col-span-8 xl:col-span-7 flex flex-col justify-center text-left">
            {/* Architectural Display Headline with Accessible Letter-by-Letter Masked Reveal */}
            <h1
              className={`${syne.className} text-5xl sm:text-6xl md:text-7xl lg:text-[5rem] xl:text-[5.5rem] font-bold tracking-[-0.035em] text-black leading-[0.96] max-w-3xl`}
              aria-label="La ingeniería que sostiene el lujo en movimiento."
            >
              <div aria-hidden="true" className="flex flex-col">
                {headlineLines.map((line, lineIdx) => (
                  <div key={lineIdx} className="overflow-hidden pb-1 sm:pb-1.5 flex flex-wrap items-baseline">
                    {line.words.map((word, wordIdx) => (
                      <span
                        key={wordIdx}
                        className={`inline-flex whitespace-nowrap mr-[0.24em] last:mr-0 ${
                          word.isAccent
                            ? `${instrumentSerif.className} font-normal italic text-[1.12em] tracking-normal text-[#b3131b] font-serif px-1`
                            : ''
                        }`}
                      >
                        {word.text.split('').map((char, charIdx) => {
                          const delay = 0.05 + charCounter * 0.017;
                          charCounter++;

                          return (
                            <span
                              key={charIdx}
                              className="inline-block overflow-hidden align-bottom"
                            >
                              <motion.span
                                className="inline-block"
                                initial={shouldReduceMotion ? { opacity: 0 } : { y: '115%', opacity: 0 }}
                                animate={{ y: '0%', opacity: 1 }}
                                transition={
                                  shouldReduceMotion
                                    ? { duration: 0.15, delay: 0.04 }
                                    : {
                                        duration: 0.52,
                                        ease: easeEditorial,
                                        delay,
                                      }
                                }
                              >
                                {char}
                              </motion.span>
                            </span>
                          );
                        })}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </h1>

            {/* Masked Subheadline: Concise, technical, spaced with generous tracking (Cascaded Reveal) */}
            <div className="overflow-hidden mt-6 sm:mt-8 max-w-lg">
              <motion.p
                initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: shouldReduceMotion ? 0.2 : 0.48,
                  ease: easeEditorial,
                  delay: shouldReduceMotion ? 0.08 : 0.60,
                }}
                className="text-sm sm:text-base md:text-lg text-[#475569] font-normal leading-relaxed tracking-wide"
              >
                Sistemas de amortiguación activa, espirales progresivos y suspensión neumática diseñados con tolerancia milimétrica para marcas de élite:{' '}
                <span className="text-slate-800 font-medium">Porsche, BMW, Audi y Land Rover</span>.
              </motion.p>
            </div>

            {/* Masked Luxury Action Buttons (Cascaded Reveal) */}
            <div className="overflow-hidden mt-8 sm:mt-10">
              <motion.div
                initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: shouldReduceMotion ? 0.2 : 0.48,
                  ease: easeEditorial,
                  delay: shouldReduceMotion ? 0.12 : 0.78,
                }}
                className="flex flex-wrap items-center gap-4"
              >
                {/* Button 1: Interactive Hover Button - Cotizar Repuesto */}
                <InteractiveHoverButton href="/cotizacion">
                  COTIZAR REPUESTO
                </InteractiveHoverButton>

                {/* Button 2: Interactive Hover Button - Ver Aceites Rowe */}
                <InteractiveHoverButton href="/catalogo">
                  VER ACEITES ROWE
                </InteractiveHoverButton>
              </motion.div>
            </div>
          </div>

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
