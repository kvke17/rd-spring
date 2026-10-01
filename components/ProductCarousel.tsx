'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { STORE_CONFIG } from '@/config/constants';

export default function ProductCarousel({ products }: { products: any[] }) {
  const shouldReduceMotion = useReducedMotion();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const [hasDragged, setHasDragged] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Mueve la barra el equivalente a todo el ancho visible
  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { current } = scrollContainerRef;
      current.scrollLeft += direction === 'left' ? -current.offsetWidth : current.offsetWidth;
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setHasDragged(false);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; 
    
    if (Math.abs(walk) > 5) {
      setHasDragged(true);
    }
    
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <div className="relative group">
      {/* Botón Izquierda */}
      <button 
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 bg-white/95 backdrop-blur-md border border-gray-200 shadow-xl rounded-full p-3.5 text-gray-800 hover:bg-white hover:text-[#b3131b] transition-all duration-200 hover:scale-105 active:scale-95 opacity-0 group-hover:opacity-100 hidden sm:flex items-center justify-center cursor-pointer"
        aria-label="Anterior"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>

      {/* Contenedor Scrolleable */}
      <div 
        ref={scrollContainerRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onDragStart={(e) => e.preventDefault()}
        className={`flex overflow-x-auto gap-6 pb-8 pt-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden select-none ${
          isDragging ? 'cursor-grabbing scroll-auto' : 'cursor-grab scroll-smooth'
        }`}
      >
        {products.map((p: any, idx: number) => {
          const hasFormats = p.formats && p.formats.length > 0;
          p.formats.sort((a: any, b: any) => (a.size === '1LT' ? -1 : 1));

          const imgSrc = hasFormats ? `/images/rowe/${p.formats[0].sku}.png` : '/images/logo-rd.png';
          let hoverSrc = hasFormats && p.formats.length > 1 ? `/images/rowe/${p.formats[p.formats.length - 1].sku}.png` : null;
          const lowestPrice = hasFormats ? Math.min(...p.formats.map((f: any) => f.price)) : 0;

          return (
            <motion.div 
              key={p.id} 
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 14, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-20px' }}
              transition={{
                duration: shouldReduceMotion ? 0.2 : 0.45,
                delay: shouldReduceMotion ? 0 : Math.min(idx * 0.05, 0.3),
                ease: [0.23, 1, 0.32, 1],
              }}
              className="flex-none w-[85vw] sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] rounded-2xl overflow-hidden border border-gray-200/80 bg-white flex flex-col group/card gpu-shadow-hover hover:border-gray-300 hover:scale-[1.02] hover:-translate-y-1 transition-transform duration-300 ease-out transform-gpu"
            >
              {/* ENVOLVEMOS TODA LA TARJETA EN EL LINK */}
              <Link 
                href={`/productos/${p.id}`} 
                draggable={false}
                onClick={(e) => {
                  if (hasDragged) {
                    e.preventDefault();
                  }
                }}
                className="flex flex-col h-full cursor-pointer"
              >
                <div className="aspect-square relative bg-slate-50/60 overflow-hidden pointer-events-none p-4 flex items-center justify-center">
                  <span className="absolute top-3 right-3 text-[9px] tracking-wider px-2.5 py-1 uppercase font-bold z-10 bg-[#b3131b] text-white rounded-full shadow-sm">
                    VENTA ONLINE
                  </span>
                  
                  <Image 
                    src={imgSrc} 
                    alt={p.name} 
                    fill
                    draggable={false}
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className={`object-contain p-4 transition-all duration-500 ease-in-out ${hoverSrc ? 'group-hover/card:opacity-0' : 'group-hover/card:scale-105'}`} 
                  />

                  {hoverSrc && (
                    <Image 
                      src={hoverSrc} 
                      alt={`${p.name} formato mayor`} 
                      fill
                      draggable={false}
                      sizes="(max-width: 768px) 100vw, 25vw"
                      className="absolute inset-0 object-contain p-4 opacity-0 transition-opacity duration-500 ease-in-out group-hover/card:opacity-100" 
                    />
                  )}
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between bg-white">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-[#b3131b] mb-1.5 font-bold">{p.brand} · {p.category}</p>
                    <h3 className="text-sm font-bold text-gray-900 line-clamp-2 group-hover/card:text-[#b3131b] transition-colors">{p.name}</h3>
                  </div>
                  
                  <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-gray-400 block font-medium uppercase tracking-wider">Precio</span>
                      <p className="text-base font-black text-gray-900">
                        {STORE_CONFIG.CURRENCY_FORMAT.format(lowestPrice)}
                      </p>
                    </div>
                    <span className="text-[10px] font-mono font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                      {hasFormats ? p.formats[0].sku : ''}
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Botón Derecha */}
      <button 
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 bg-white/95 backdrop-blur-md border border-gray-200 shadow-xl rounded-full p-3.5 text-gray-800 hover:bg-white hover:text-[#b3131b] transition-all duration-200 hover:scale-105 active:scale-95 opacity-0 group-hover:opacity-100 hidden sm:flex items-center justify-center cursor-pointer"
        aria-label="Siguiente"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>
    </div>
  );
}