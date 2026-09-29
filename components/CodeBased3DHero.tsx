'use client';

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShieldCheck, Activity, Gauge, Zap, ChevronRight, ArrowDown } from 'lucide-react';
import * as THREE from 'three';

// Parametric Helical Spring Curve
class HelicalSpringCurve extends THREE.Curve<THREE.Vector3> {
  turns: number;
  height: number;
  radius: number;

  constructor(turns = 6.2, height = 24, radius = 6.0) {
    super();
    this.turns = turns;
    this.height = height;
    this.radius = radius;
  }

  getPoint(t: number, optionalTarget = new THREE.Vector3()) {
    const angle = 2 * Math.PI * this.turns * t;
    const x = Math.cos(angle) * this.radius;
    const z = Math.sin(angle) * this.radius;
    const y = (t - 0.5) * this.height;
    return optionalTarget.set(x, y, z);
  }
}

export default function CodeBased3DHero() {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [pasmMode, setPasmMode] = useState<'comfort' | 'sport' | 'sport_plus'>('sport');
  const [telemetryValues, setTelemetryValues] = useState({
    pressure: '7.2 Bar',
    response: '8 ms',
    load: '380 kg',
    frequency: '1.4 Hz',
  });

  // Target compression reference for the 3D animation loop
  const targetCompressionRef = useRef(1.0);
  const currentCompressionRef = useRef(1.0);

  // Update telemetry and compression target when mode changes
  const handleModeChange = (mode: 'comfort' | 'sport' | 'sport_plus') => {
    setPasmMode(mode);
    if (mode === 'comfort') {
      targetCompressionRef.current = 1.08;
      setTelemetryValues({ pressure: '6.4 Bar', response: '12 ms', load: '320 kg', frequency: '1.1 Hz' });
    } else if (mode === 'sport') {
      targetCompressionRef.current = 0.95;
      setTelemetryValues({ pressure: '7.2 Bar', response: '8 ms', load: '410 kg', frequency: '1.4 Hz' });
    } else {
      targetCompressionRef.current = 0.86;
      setTelemetryValues({ pressure: '8.1 Bar', response: '4 ms', load: '490 kg', frequency: '1.8 Hz' });
    }
  };

  const handleSimulateBump = () => {
    targetCompressionRef.current = 0.76;
    setTimeout(() => {
      targetCompressionRef.current = pasmMode === 'comfort' ? 1.08 : pasmMode === 'sport' ? 0.95 : 0.86;
    }, 400);
  };

  useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container) return;

    // Check reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x060913, 0.012);

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 68);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    // 2. Lighting Architecture
    // Crimson Brand Accent Light
    const crimsonLight = new THREE.PointLight(0xb3131b, 85, 90);
    crimsonLight.position.set(22, 14, 25);
    scene.add(crimsonLight);

    // Secondary Crimson Fill Light
    const crimsonFill = new THREE.PointLight(0xb3131b, 35, 60);
    crimsonFill.position.set(-20, -15, 15);
    scene.add(crimsonFill);

    // Key White Rim Light
    const keyWhiteLight = new THREE.DirectionalLight(0xffffff, 2.5);
    keyWhiteLight.position.set(-25, 35, 30);
    scene.add(keyWhiteLight);

    // Soft Ambient
    const ambientLight = new THREE.AmbientLight(0x1e293b, 1.2);
    scene.add(ambientLight);

    // 3. Assemble 3D Suspension Strut (Code-based Geometry)
    const strutGroup = new THREE.Group();
    scene.add(strutGroup);

    // Spring Material: High-gloss German tempered steel with crimson specular sheen
    const springMaterial = new THREE.MeshStandardMaterial({
      color: 0x111827,
      metalness: 0.92,
      roughness: 0.18,
    });

    // Piston Chrome Material
    const chromeMaterial = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.98,
      roughness: 0.08,
    });

    // Damper Body Material (Anodized matte titanium)
    const damperMaterial = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.85,
      roughness: 0.35,
    });

    // Crimson Collar Material
    const collarMaterial = new THREE.MeshStandardMaterial({
      color: 0xb3131b,
      metalness: 0.8,
      roughness: 0.25,
    });

    // Outer Helical Spring Mesh
    const springCurve = new HelicalSpringCurve(6.2, 23, 6.2);
    const springGeometry = new THREE.TubeGeometry(springCurve, 160, 0.92, 16, false);
    const springMesh = new THREE.Mesh(springGeometry, springMaterial);
    strutGroup.add(springMesh);

    // Damper Shock Piston Rod (Center)
    const pistonGeo = new THREE.CylinderGeometry(1.6, 1.6, 32, 32);
    const pistonMesh = new THREE.Mesh(pistonGeo, chromeMaterial);
    pistonMesh.position.y = 2;
    strutGroup.add(pistonMesh);

    // Lower Damper Body Cylinder
    const lowerBodyGeo = new THREE.CylinderGeometry(3.6, 3.6, 16, 32);
    const lowerBodyMesh = new THREE.Mesh(lowerBodyGeo, damperMaterial);
    lowerBodyMesh.position.y = -10;
    strutGroup.add(lowerBodyMesh);

    // Lower Spring Perch / Adjustment Collar
    const collarGeo = new THREE.CylinderGeometry(6.6, 6.6, 2.2, 32);
    const collarMesh = new THREE.Mesh(collarGeo, collarMaterial);
    collarMesh.position.y = -2;
    strutGroup.add(collarMesh);

    // Top Mount Plate
    const topMountGeo = new THREE.CylinderGeometry(7.5, 7.5, 2.5, 32);
    const topMountMesh = new THREE.Mesh(topMountGeo, collarMaterial);
    topMountMesh.position.y = 12.5;
    strutGroup.add(topMountMesh);

    // Lower Eyelet Bushing Mount
    const eyeletGeo = new THREE.TorusGeometry(3.2, 1.2, 16, 32);
    const eyeletMesh = new THREE.Mesh(eyeletGeo, damperMaterial);
    eyeletMesh.position.y = -18;
    eyeletMesh.rotation.x = Math.PI / 2;
    strutGroup.add(eyeletMesh);

    // 4. Orbiting Technical Wireframe HUD Rings
    const ringGeo = new THREE.TorusGeometry(10.5, 0.08, 8, 64);
    const ringMat = new THREE.LineBasicMaterial({ color: 0x475569, transparent: true, opacity: 0.5 });
    const orbitRing1 = new THREE.Mesh(ringGeo, ringMat);
    orbitRing1.rotation.x = Math.PI / 3;
    strutGroup.add(orbitRing1);

    const orbitRing2 = new THREE.Mesh(ringGeo, ringMat);
    orbitRing2.rotation.y = Math.PI / 4;
    strutGroup.add(orbitRing2);

    // 5. Floating Particle Grid Network
    const particleCount = 200;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const colorSlate = new THREE.Color(0x64748b);
    const colorCrimson = new THREE.Color(0xb3131b);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 140;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 90;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 70;

      const isCrimson = Math.random() < 0.16;
      const c = isCrimson ? colorCrimson : colorSlate;
      particleColors[i * 3] = c.r;
      particleColors[i * 3 + 1] = c.g;
      particleColors[i * 3 + 2] = c.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 2.0,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Initial position offset: center-right for desktop balance
    const isMobile = window.innerWidth < 1024;
    strutGroup.position.set(isMobile ? 0 : 16, isMobile ? 1 : 0, 0);

    // 6. Smooth Mouse and Scroll Tracking Engine
    let mouseX = 0;
    let mouseY = 0;
    let targetRotY = 0;
    let targetRotX = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    let scrollProgress = 0;
    const handleScroll = () => {
      const maxScroll = window.innerHeight * 1.5;
      scrollProgress = Math.min(window.scrollY / maxScroll, 1);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Handle Resize
    const handleResize = () => {
      if (!container) return;
      const mobile = window.innerWidth < 1024;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
      strutGroup.position.set(mobile ? 0 : 16, mobile ? 1 : 0, 0);
    };

    window.addEventListener('resize', handleResize);

    // 7. Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      if (!prefersReducedMotion) {
        // Continuous smooth spring compression lerp
        currentCompressionRef.current += (targetCompressionRef.current - currentCompressionRef.current) * 0.12;
        springMesh.scale.y = currentCompressionRef.current;
        pistonMesh.position.y = 2 - (1 - currentCompressionRef.current) * 8;
        topMountMesh.position.y = 12.5 - (1 - currentCompressionRef.current) * 11;

        // Smooth mouse rotation with inertia
        targetRotY = mouseX * 0.65 + elapsed * 0.12 + scrollProgress * 1.2;
        targetRotX = -mouseY * 0.45 + Math.sin(elapsed * 0.5) * 0.05;

        strutGroup.rotation.y += (targetRotY - strutGroup.rotation.y) * 0.06;
        strutGroup.rotation.x += (targetRotX - strutGroup.rotation.x) * 0.06;
        strutGroup.position.y = (isMobile ? 1 : 0) + Math.sin(elapsed * 1.2) * 0.8;

        // Orbit wireframes
        orbitRing1.rotation.z = elapsed * 0.3;
        orbitRing2.rotation.z = -elapsed * 0.25;

        // Particles drift
        particles.rotation.y = elapsed * 0.025;
        particles.rotation.x = Math.sin(elapsed * 0.03) * 0.03;

        // Dynamic light pulsation
        crimsonLight.intensity = 80 + Math.sin(elapsed * 2.5) * 15;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);

      // Clean GPU memory
      springGeometry.dispose();
      springMaterial.dispose();
      pistonGeo.dispose();
      chromeMaterial.dispose();
      lowerBodyGeo.dispose();
      damperMaterial.dispose();
      collarGeo.dispose();
      collarMaterial.dispose();
      topMountGeo.dispose();
      eyeletGeo.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();

      if (container && renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [pasmMode]);

  return (
    <section className="relative w-full h-screen min-h-[720px] max-h-[1080px] bg-gradient-to-b from-[#060913] via-[#090d1a] to-[#04060c] text-white overflow-hidden flex items-center">
      
      {/* 3D WebGL Canvas Layer */}
      <div
        ref={canvasContainerRef}
        className="absolute inset-0 w-full h-full z-0 pointer-events-none"
        aria-hidden="true"
      />

      {/* Radial Depth Background Glow */}
      <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-[#b3131b]/15 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute top-1/3 right-1/4 w-[450px] h-[450px] bg-slate-500/10 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Precision Automotive Engineering Grid Overlay */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none z-0"
        style={{
          backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Main Foreground Hero Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10 pt-20 sm:pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Sharp Editorial Presentation (7 Columns) */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-7">
            
            {/* Live Laboratory Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/15 shadow-2xl">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#b3131b] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#b3131b]"></span>
              </span>
              <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-white font-mono font-bold">
                PORSCHE & GERMAN CHASSIS LAB · SANTIAGO
              </span>
            </div>

            {/* Editorial Title */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white leading-[1.06]">
              Ingeniería de Suspensión <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-[#b3131b]">
                de Ultra Alta Gama.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed font-light">
              Amortiguadores adaptativos, resortes helicoidales de alta tensión y suspensión neumática calibrada milimétricamente para Porsche, BMW M, Audi RS y Land Rover.
            </p>

            {/* Action CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              <Link
                href="/cotizacion"
                className="btn-shine bg-[#b3131b] hover:bg-[#8f0f15] text-white font-bold px-7 py-4 rounded-xl uppercase text-xs tracking-widest transition-all duration-200 shadow-xl shadow-red-950/60 active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <span>COTIZAR REPUESTO CON VIN</span>
                <ChevronRight className="w-4 h-4" />
              </Link>

              <Link
                href="/catalogo"
                className="btn-shine bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white font-bold px-6 py-4 rounded-xl uppercase text-xs tracking-widest transition-all duration-200 active:scale-95 cursor-pointer"
              >
                <span>VER ACEITES ROWE</span>
              </Link>

              <Link
                href="/repuestos"
                className="btn-shine bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white font-bold px-6 py-4 rounded-xl uppercase text-xs tracking-widest transition-all duration-200 active:scale-95 cursor-pointer"
              >
                <span>VER REPUESTOS OE</span>
              </Link>
            </div>

            {/* Verified Metrics Strip */}
            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-white/10 max-w-xl">
              <div className="p-3.5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
                <span className="block text-xl sm:text-2xl font-black text-white">100%</span>
                <span className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Compatibilidad OE</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
                <span className="block text-xl sm:text-2xl font-black text-white">1 Año</span>
                <span className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Garantía Escrita</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
                <span className="block text-xl sm:text-2xl font-black text-white">24H</span>
                <span className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Despacho Exprés</span>
              </div>
            </div>

          </div>

          {/* Right Column: Floating 3D Telemetry HUD Controls (5 Columns) */}
          <div className="lg:col-span-5 flex flex-col items-center lg:items-end justify-center pointer-events-auto mt-4 lg:mt-0">
            <div className="w-full max-w-md rounded-3xl bg-black/65 backdrop-blur-2xl border border-white/15 p-5 sm:p-6 shadow-2xl">
              
              {/* HUD Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#b3131b]" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                    TELEMETRÍA 3D EN VIVO
                  </span>
                </div>
                <span className="text-[9px] font-mono text-slate-400 bg-white/10 px-2 py-0.5 rounded border border-white/10">
                  PASM DAMPTRONIC®
                </span>
              </div>

              {/* Dynamic Live Spec Matrix */}
              <div className="grid grid-cols-2 gap-2.5 mb-5">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[9px] font-mono text-slate-400 uppercase block">Presión Hidráulica</span>
                  <p className="text-base font-black text-white mt-0.5">{telemetryValues.pressure}</p>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[9px] font-mono text-slate-400 uppercase block">Latencia Válvula</span>
                  <p className="text-base font-black text-white mt-0.5">{telemetryValues.response}</p>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[9px] font-mono text-slate-400 uppercase block">Carga Simulación</span>
                  <p className="text-base font-black text-white mt-0.5">{telemetryValues.load}</p>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[9px] font-mono text-slate-400 uppercase block">Frecuencia Resonancia</span>
                  <p className="text-base font-black text-white mt-0.5">{telemetryValues.frequency}</p>
                </div>
              </div>

              {/* Interactive Stiffness Mode Switcher */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                  <span>Modo de Rigidez Electrónica</span>
                  <Gauge className="w-3.5 h-3.5 text-[#b3131b]" />
                </div>

                <div className="grid grid-cols-3 gap-1.5 p-1 bg-white/10 rounded-xl">
                  <button
                    onClick={() => handleModeChange('comfort')}
                    className={`py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                      pasmMode === 'comfort'
                        ? 'bg-white text-slate-900 shadow-md'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Comfort
                  </button>
                  <button
                    onClick={() => handleModeChange('sport')}
                    className={`py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                      pasmMode === 'sport'
                        ? 'bg-[#b3131b] text-white shadow-md'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Sport
                  </button>
                  <button
                    onClick={() => handleModeChange('sport_plus')}
                    className={`py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                      pasmMode === 'sport_plus'
                        ? 'bg-slate-900 text-white shadow-md border border-white/20'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Sport Plus
                  </button>
                </div>
              </div>

              {/* Dynamic Compression Trigger */}
              <button
                onClick={handleSimulateBump}
                className="btn-shine w-full mt-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-[#b3131b]" />
                <span>Simular Carga de Curva 3D</span>
              </button>

            </div>
          </div>

        </div>
      </div>

      {/* Bottom Scroll Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-20 pointer-events-none opacity-80">
        <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-slate-400">
          EXPLORAR CATÁLOGO
        </span>
        <motion.div
          animate={{ y: [0, 4, 0] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
        >
          <ArrowDown className="w-3.5 h-3.5 text-[#b3131b]" />
        </motion.div>
      </div>

    </section>
  );
}
