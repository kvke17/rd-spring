'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';

const marcas = [
  {
    nombre: 'Porsche',
    logo: '/images/marcas/porsche.png',
    // Gráfico 1093x1412 (aspecto 0.77 - escudo vertical)
    boxClass: 'w-[48px] h-[62px] sm:w-[62px] sm:h-[80px] lg:w-[74px] lg:h-[96px]',
  },
  {
    nombre: 'Audi',
    logo: '/images/marcas/audi.png',
    // Gráfico 1411x497 (aspecto 2.84 - anillos horizontales anchos)
    boxClass: 'w-[100px] h-[35px] sm:w-[130px] sm:h-[46px] lg:w-[156px] lg:h-[55px]',
  },
  {
    nombre: 'BMW',
    logo: '/images/marcas/bmw.png',
    // Gráfico 1998x1999 (aspecto 1.00 - circular)
    boxClass: 'w-[52px] h-[52px] sm:w-[68px] sm:h-[68px] lg:w-[82px] lg:h-[82px]',
  },
  {
    nombre: 'Land Rover',
    logo: '/images/marcas/landrover.png',
    // Gráfico 1212x634 (aspecto 1.91 - óvalo horizontal)
    boxClass: 'w-[92px] h-[48px] sm:w-[120px] sm:h-[63px] lg:w-[144px] lg:h-[75px]',
  },
  {
    nombre: 'Volkswagen',
    logo: '/images/marcas/vw.png',
    // Gráfico 765x765 (aspecto 1.00 - circular)
    boxClass: 'w-[52px] h-[52px] sm:w-[68px] sm:h-[68px] lg:w-[82px] lg:h-[82px]',
  },
  {
    nombre: 'Mercedes-Benz',
    logo: '/images/marcas/mercedes.png',
    // Gráfico 1530x883 (aspecto 1.73 - estrella + tipografía inferior)
    boxClass: 'w-[84px] h-[49px] sm:w-[110px] sm:h-[64px] lg:w-[132px] lg:h-[76px]',
  },
  {
    nombre: 'Jaguar',
    logo: '/images/marcas/jaguar.png',
    // Gráfico 1481x664 (aspecto 2.23 - felino horizontal + texto)
    boxClass: 'w-[98px] h-[44px] sm:w-[128px] sm:h-[57px] lg:w-[154px] lg:h-[69px]',
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

        <div className="flex flex-col gap-8 sm:gap-12 lg:gap-14 items-center">
          {/* FILA 1: Primeras 4 marcas (Porsche, Audi, BMW, Land Rover) */}
          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-8 md:gap-10 lg:gap-14 w-full">
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
                className="brand-logo-item relative w-[105px] h-[68px] sm:w-[140px] sm:h-[88px] lg:w-[174px] lg:h-[104px] flex items-center justify-center cursor-default p-2"
              >
                <div className={`relative ${marca.boxClass} brand-logo-zoom flex items-center justify-center`}>
                  <Image
                    src={marca.logo}
                    alt={`Logo de ${marca.nombre}`}
                    fill
                    className="object-contain"
                    sizes="(max-width: 640px) 110px, (max-width: 1024px) 140px, 180px"
                  />
                </div>
              </motion.div>
            ))}
          </div>

          {/* FILA 2: Las 3 marcas restantes (Volkswagen, Mercedes-Benz, Jaguar) centradas */}
          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-8 md:gap-10 lg:gap-14 w-full">
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
                className="brand-logo-item relative w-[105px] h-[68px] sm:w-[140px] sm:h-[88px] lg:w-[174px] lg:h-[104px] flex items-center justify-center cursor-default p-2"
              >
                <div className={`relative ${marca.boxClass} brand-logo-zoom flex items-center justify-center`}>
                  <Image
                    src={marca.logo}
                    alt={`Logo de ${marca.nombre}`}
                    fill
                    className="object-contain"
                    sizes="(max-width: 640px) 110px, (max-width: 1024px) 140px, 180px"
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
