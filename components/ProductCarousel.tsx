'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { STORE_CONFIG } from '@/config/constants';

export default function ProductCarousel({ products }: { products: any[] }) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const [hasDragged, setHasDragged] = useState(false); // <-- Nuevo: detecta si moviste el mouse
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Mueve la barra el equivalente a todo el ancho visible (4 tarjetas)
  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { current } = scrollContainerRef;
      current.scrollLeft += direction === 'left' ? -current.offsetWidth : current.offsetWidth;
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setHasDragged(false); // Reseteamos el estado al hacer clic
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
    
    // Si el mouse se movió más de 5 píxeles, lo consideramos un "arrastre" y no un clic
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
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 bg-white border border-gray-200 shadow-lg rounded-full p-3 text-gray-800 hover:bg-gray-50 hover:text-[#b3131b] transition opacity-0 group-hover:opacity-100 hidden sm:block"
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
        {products.map((p: any) => {
          const hasFormats = p.formats && p.formats.length > 0;
          p.formats.sort((a: any, b: any) => (a.size === '1LT' ? -1 : 1));

          const imgSrc = hasFormats ? `/images/rowe/${p.formats[0].sku}.png` : '/images/logo-rd.png';
          let hoverSrc = hasFormats && p.formats.length > 1 ? `/images/rowe/${p.formats[p.formats.length - 1].sku}.png` : null;
          const lowestPrice = hasFormats ? Math.min(...p.formats.map((f: any) => f.price)) : 0;

          return (
            <div 
              key={p.id} 
              className="flex-none w-[85vw] sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] border border-gray-200 bg-white flex flex-col group/card hover:shadow-lg transition"
            >
              {/* ENVOLVEMOS TODA LA TARJETA EN EL LINK */}
              <Link 
                href={`/productos/${p.id}`} 
                draggable={false}
                onClick={(e) => {
                  // Si el usuario arrastró el mouse, bloqueamos el clic para que no cambie de página
                  if (hasDragged) {
                    e.preventDefault();
                  }
                }}
                className="flex flex-col h-full cursor-pointer"
              >
                <div className="aspect-square relative bg-white overflow-hidden pointer-events-none">
                  <span className="absolute top-3 right-3 text-[9px] tracking-wider px-2 py-1 uppercase font-bold z-10 bg-[#b3131b] text-white">
                    VENTA ONLINE
                  </span>
                  
                  <Image 
                    src={imgSrc} 
                    alt={p.name} 
                    fill
                    draggable={false}
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className={`object-cover transition-all duration-500 ease-in-out ${hoverSrc ? 'group-hover/card:opacity-0' : 'group-hover/card:scale-105'}`} 
                  />

                  {hoverSrc && (
                    <Image 
                      src={hoverSrc} 
                      alt={`${p.name} formato mayor`} 
                      fill
                      draggable={false}
                      sizes="(max-width: 768px) 100vw, 25vw"
                      className="absolute inset-0 object-cover opacity-0 transition-opacity duration-500 ease-in-out group-hover/card:opacity-100" 
                    />
                  )}
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-[#b3131b] mb-1 font-bold">{p.brand} · {p.category}</p>
                    <h3 className="text-sm font-bold text-gray-900 line-clamp-2 group-hover/card:text-[#b3131b] transition">{p.name}</h3>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                    <p className="text-sm font-bold text-gray-900">
                      <span className="text-[10px] text-gray-500 mr-2 font-normal">DESDE</span>
                      {STORE_CONFIG.CURRENCY_FORMAT.format(lowestPrice)}
                    </p>
                    <span className="text-[10px] text-gray-500">
                      {hasFormats ? p.formats[0].sku : ''}
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>

      {/* Botón Derecha */}
      <button 
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 bg-white border border-gray-200 shadow-lg rounded-full p-3 text-gray-800 hover:bg-gray-50 hover:text-[#b3131b] transition opacity-0 group-hover:opacity-100 hidden sm:block"
        aria-label="Siguiente"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>
    </div>
  );
}