'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';

const marcas = [
  {
    nombre: 'Porsche',
    logo: '/images/marcas/porsche.png',
    // Graphic is 1093x1412 in 1200x1550 (aspect 0.77)
    boxClass: 'w-[42px] h-[54px] sm:w-[50px] sm:h-[64px]',
  },
  {
    nombre: 'Audi',
    logo: '/images/marcas/audi.png',
    // Graphic is 1411x497 in 1470x1100 (aspect 2.84, compensated padding)
    boxClass: 'w-[118px] h-[88px] sm:w-[140px] sm:h-[105px]',
  },
  {
    nombre: 'BMW',
    logo: '/images/marcas/bmw.png',
    // Graphic is 1998x1999 in 2048x2048 (aspect 1.00)
    boxClass: 'w-[48px] h-[48px] sm:w-[58px] sm:h-[58px]',
  },
  {
    nombre: 'Land Rover',
    logo: '/images/marcas/landrover.png',
    // Graphic is 1212x634 in 1920x1080 (aspect 1.91, compensated padding)
    boxClass: 'w-[124px] h-[70px] sm:w-[148px] sm:h-[83px]',
  },
  {
    nombre: 'Volkswagen',
    logo: '/images/marcas/vw.png',
    // Graphic is 765x765 in 768x768 (aspect 1.00)
    boxClass: 'w-[48px] h-[48px] sm:w-[58px] sm:h-[58px]',
  },
  {
    nombre: 'Mercedes-Benz',
    logo: '/images/marcas/mercedes.png',
    // Graphic is 1530x883 in 1920x1080 (aspect 1.73, compensated padding)
    boxClass: 'w-[98px] h-[55px] sm:w-[118px] sm:h-[66px]',
  },
  {
    nombre: 'Jaguar',
    logo: '/images/marcas/jaguar.png',
    // Graphic is 1481x664 in 1920x1080 (aspect 2.23, compensated padding)
    boxClass: 'w-[118px] h-[66px] sm:w-[142px] sm:h-[80px]',
  },
];

export default function BrandShowcase() {
  const shouldReduceMotion = useReducedMotion();

  const easeEditorial: [number, number, number, number] = [0.23, 1, 0.32, 1];

  return (
    <section className="py-20 sm:py-24 border-b border-gray-100 bg-white relative z-10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Eyebrow con entrada suave */}
        <motion.p
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: easeEditorial }}
          className="text-xs uppercase tracking-[0.25em] text-gray-400 font-bold mb-4"
        >
          ESPECIALISTAS EN ALTA GAMA
        </motion.p>

        {/* Encabezado */}
        <motion.h2
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: shouldReduceMotion ? 0 : 0.08, ease: easeEditorial }}
          className="text-2xl sm:text-3xl font-bold text-gray-900 mb-14 sm:mb-16 tracking-tight"
        >
          Marcas con las que trabajamos
        </motion.h2>

        <div className="flex flex-col gap-8 sm:gap-12 items-center">
          {/* FILA 1: Primeras 4 marcas */}
          <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-10 md:gap-12 w-full">
            {marcas.slice(0, 4).map((marca, idx) => (
              <motion.div
                key={marca.nombre}
                initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-20px' }}
                transition={{
                  duration: shouldReduceMotion ? 0.2 : 0.5,
                  delay: shouldReduceMotion ? 0 : idx * 0.05,
                  ease: easeEditorial,
                }}
                className="brand-logo-item relative w-32 h-18 sm:w-40 sm:h-22 md:w-48 md:h-24 flex items-center justify-center cursor-default p-2"
              >
                <div className={`relative ${marca.boxClass} brand-logo-zoom flex items-center justify-center`}>
                  <Image
                    src={marca.logo}
                    alt={`Logo de ${marca.nombre}`}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 130px, 160px"
                  />
                </div>
              </motion.div>
            ))}
          </div>

          {/* FILA 2: Las 3 marcas restantes */}
          <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-10 md:gap-12 w-full">
            {marcas.slice(4).map((marca, idx) => (
              <motion.div
                key={marca.nombre}
                initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-20px' }}
                transition={{
                  duration: shouldReduceMotion ? 0.2 : 0.5,
                  delay: shouldReduceMotion ? 0 : (idx + 4) * 0.05,
                  ease: easeEditorial,
                }}
                className="brand-logo-item relative w-32 h-18 sm:w-40 sm:h-22 md:w-48 md:h-24 flex items-center justify-center cursor-default p-2"
              >
                <div className={`relative ${marca.boxClass} brand-logo-zoom flex items-center justify-center`}>
                  <Image
                    src={marca.logo}
                    alt={`Logo de ${marca.nombre}`}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 130px, 160px"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
