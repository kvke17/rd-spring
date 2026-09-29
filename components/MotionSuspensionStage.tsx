'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ShieldCheck, Activity, Gauge, Zap, Wrench, RefreshCw } from 'lucide-react';

export default function MotionSuspensionStage() {
  const [activeView, setActiveView] = useState<'front' | 'rear' | 'workshop'>('front');
  const [activeHotspot, setActiveHotspot] = useState<number | null>(null);
  const [pasmMode, setPasmMode] = useState<'comfort' | 'sport' | 'sport_plus'>('sport');
  const [isCompressing, setIsCompressing] = useState(false);

  // 3D Card Perspective Tilt driven by mouse coordinates
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for 3D rotation
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), { stiffness: 220, damping: 25 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-12, 12]), { stiffness: 220, damping: 25 });
  const glareX = useTransform(mouseX, [-0.5, 0.5], ['0%', '100%']);
  const glareY = useTransform(mouseY, [-0.5, 0.5], ['0%', '100%']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setActiveHotspot(null);
  };

  const triggerCompression = () => {
    setIsCompressing(true);
    setTimeout(() => {
      setIsCompressing(false);
    }, 600);
  };

  const hotspots = [
    {
      id: 1,
      top: '25%',
      left: '48%',
      title: 'Cámara Neumática OE',
      spec: 'Presión: 7.2 Bar · Altura adaptativa por sensor óptico',
    },
    {
      id: 2,
      top: '52%',
      left: '53%',
      title: 'Válvula PASM Damptronic®',
      spec: 'Respuesta: < 8ms · Ajuste micrométrico de fluidez hidráulica',
    },
    {
      id: 3,
      top: '78%',
      left: '46%',
      title: 'Acero Cromo-Silicio Templado',
      spec: 'Tolerancia: 1.450 MPa · Tratamiento anticorrosión catódica',
    },
  ];

  return (
    <div className="relative w-full max-w-xl mx-auto lg:max-w-none [perspective:1400px]">
      
      {/* 3D Motion Container */}
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        className="relative rounded-3xl bg-gradient-to-b from-white via-slate-50/80 to-slate-100/90 border border-slate-200/90 shadow-[0_24px_60px_-15px_rgba(15,23,42,0.14)] p-4 sm:p-6 backdrop-blur-xl transition-shadow duration-300 group"
      >
        {/* Dynamic Specular Sheen (Light Glare) */}
        <motion.div
          className="absolute inset-0 rounded-3xl pointer-events-none opacity-0 group-hover:opacity-40 transition-opacity duration-500"
          style={{
            background: `radial-gradient(circle at ${glareX} ${glareY}, rgba(255,255,255,0.85) 0%, transparent 60%)`,
          }}
        />

        {/* Top Laboratory HUD Bar */}
        <div className="flex flex-wrap items-center justify-between border-b border-slate-200/80 pb-4 mb-4 gap-3 relative z-10">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#b3131b] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#b3131b]"></span>
            </span>
            <div>
              <p className="text-[10px] font-mono font-bold tracking-widest text-slate-800 uppercase flex items-center gap-1.5">
                <span>PORSCHE PASM 3D STUDIO</span>
                <span className="text-[#b3131b]">· 60FPS</span>
              </p>
            </div>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-xl">
            <button
              onClick={() => setActiveView('front')}
              className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all duration-200 ${
                activeView === 'front'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Delantero
            </button>
            <button
              onClick={() => setActiveView('rear')}
              className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all duration-200 ${
                activeView === 'rear'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Trasero
            </button>
            <button
              onClick={() => setActiveView('workshop')}
              className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all duration-200 ${
                activeView === 'workshop'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Montaje Taller
            </button>
          </div>
        </div>

        {/* 3D Visual Stage */}
        <div className="relative h-[380px] sm:h-[450px] w-full rounded-2xl bg-gradient-to-b from-white to-slate-50/70 border border-slate-100 overflow-hidden flex items-center justify-center [transform-style:preserve-3d]">
          
          {/* Radial depth light */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(241,245,249,0.95)_0%,transparent_75%)] pointer-events-none" />

          {/* Precision Grid Coordinates in background */}
          <div 
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          <AnimatePresence mode="wait">
            {activeView === 'workshop' ? (
              <motion.div
                key="workshop"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
                className="relative w-full h-full"
              >
                <Image
                  src="/images/suspension.jpg"
                  alt="Instalación técnica en taller de precisión"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent pointer-events-none" />
                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-[#b3131b] mb-1.5">
                    CALIBRACIÓN EN SANTIAGO
                  </span>
                  <p className="text-base font-black tracking-tight">Instalación certificada con torque original</p>
                  <p className="text-xs text-slate-300 mt-0.5">Montaje especializado según especificaciones Porsche AG.</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={activeView}
                initial={{ opacity: 0, scale: 0.93 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.93 }}
                transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
                className="relative w-full h-full flex items-center justify-center p-4 [transform-style:preserve-3d]"
              >
                {/* Suspension Strut Model with Real-Time Spring Compression Animation */}
                <motion.div
                  animate={isCompressing ? { scaleY: 0.88, y: 18 } : { scaleY: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 14 }}
                  className="relative w-full h-full max-h-[380px] flex items-center justify-center [transform:translateZ(40px)]"
                >
                  <Image
                    src={activeView === 'front' ? '/images/rowe/porsche-front.png' : '/images/rowe/porsche-back.png'}
                    alt="Puntal de suspensión Porsche PASM original"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.18)] transition-transform duration-500 group-hover:scale-105"
                  />
                </motion.div>

                {/* Interactive Technical Telemetry Hotspots */}
                {hotspots.map((hs) => (
                  <div
                    key={hs.id}
                    style={{ top: hs.top, left: hs.left }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-30 [transform:translateZ(60px)]"
                    onMouseEnter={() => setActiveHotspot(hs.id)}
                    onMouseLeave={() => setActiveHotspot(null)}
                  >
                    <button
                      className="relative flex items-center justify-center w-7 h-7 rounded-full bg-white/95 text-[#b3131b] border border-slate-300 shadow-lg hover:scale-125 active:scale-95 transition-all duration-200 cursor-pointer"
                      aria-label={hs.title}
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-[#b3131b] animate-pulse" />
                    </button>

                    {/* Dark Glassmorphic Telemetry Tooltip */}
                    <AnimatePresence>
                      {activeHotspot === hs.id && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.92 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.92 }}
                          transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
                          className="absolute left-1/2 -translate-x-1/2 bottom-9 w-60 p-3.5 rounded-xl bg-slate-950/95 text-white backdrop-blur-xl shadow-2xl border border-slate-800 pointer-events-none z-40"
                        >
                          <div className="flex items-center gap-1.5 mb-1 text-red-400">
                            <Activity className="w-3.5 h-3.5" />
                            <p className="text-[11px] font-bold uppercase tracking-wider">{hs.title}</p>
                          </div>
                          <p className="text-[10px] text-slate-300 leading-snug">{hs.spec}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Floating Compression Simulation Trigger Button */}
          {activeView !== 'workshop' && (
            <div className="absolute bottom-4 right-4 z-20">
              <button
                onClick={triggerCompression}
                className="btn-shine inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/95 hover:bg-white text-slate-900 border border-slate-200/90 text-[10px] font-bold uppercase tracking-wider shadow-lg active:scale-95 transition-all cursor-pointer backdrop-blur-md"
              >
                <Zap className="w-3.5 h-3.5 text-[#b3131b]" />
                <span>Simular Carga de Curva</span>
              </button>
            </div>
          )}
        </div>

        {/* Live PASM Dynamic Mode Selector Bar */}
        <div className="mt-4 pt-4 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-[#b3131b]" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold">
              MODO PASM ACTIVO:
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl w-full sm:w-auto justify-center">
            <button
              onClick={() => setPasmMode('comfort')}
              className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                pasmMode === 'comfort'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Comfort
            </button>
            <button
              onClick={() => setPasmMode('sport')}
              className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                pasmMode === 'sport'
                  ? 'bg-[#b3131b] text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Sport
            </button>
            <button
              onClick={() => setPasmMode('sport_plus')}
              className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                pasmMode === 'sport_plus'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Sport Plus
            </button>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
