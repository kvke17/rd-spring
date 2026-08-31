import Link from 'next/link';
import Image from 'next/image';
import productsData from '@/data/products.json';
import { Product } from '@/types';
import { STORE_CONFIG } from '@/config/constants';

const featuredProducts = productsData as Product[];
const categories = [
  { id: 'amortiguadores', name: 'Amortiguadores', desc: 'Damping electrónico y coilovers regulables.', link: '/cotizacion' },
  { id: 'resortes', name: 'Resortes', desc: 'Acero al cromo-silicio templado en frío.', link: '/cotizacion' },
  { id: 'suspension-neumatica', name: 'Suspensión neumática', desc: 'Fuelles y compresores para SUV de altura variable.', link: '/cotizacion' },
  { id: 'bujes-brazos', name: 'Bujes y brazos', desc: 'Geometría recuperada con precisión de fábrica.', link: '/cotizacion' },
  { id: 'barras-estabilizadoras', name: 'Barras estabilizadoras', desc: 'Control de balanceo ajustable en pista y ciudad.', link: '/cotizacion' },
  { id: 'soportes-topes', name: 'Soportes y topes', desc: 'Rodamientos y topes mecanizados en aluminio.', link: '/cotizacion' },
  { id: 'aceites-lubricantes', name: 'Aceites y lubricantes', desc: 'Lubricación sintética de alto rendimiento para motor y tren motriz.', link: '/catalogo' },
];

export default function HomePage() {
  return (
    <div className="bg-[#0a0a0a] text-white min-h-screen">
      <section className="relative pt-28 pb-20 border-b border-white/10 overflow-hidden">
        {/* Video de fondo detrás de todo el Hero */}
        <video
          src="/videos/marcas-3d.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
        {/* Capa oscura encima del video para que el texto siga siendo legible */}
        <div className="absolute inset-0 bg-[#0a0a0a]/80 z-0" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-8">
              <p className="text-xs uppercase tracking-[0.25em] text-[#E88A5C] font-mono">CHASSIS PRESTIGE · SANTIAGO DE CHILE</p>
              <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white leading-[1.05]">La ingeniería que sostiene el lujo en movimiento.</h1>
              <p className="text-base sm:text-lg text-gray-400 max-w-2xl leading-relaxed">Amortiguadores, resortes y suspensión neumática original y de alto rendimiento para Porsche, BMW, Audi y Land Rover. Compatibilidad verificada por generación de chasis.</p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Link href="/cotizacion" className="bg-[#E88A5C] text-black font-bold px-8 py-4 uppercase text-xs tracking-widest hover:bg-opacity-90 transition">COTIZAR REPUESTO</Link>
                <Link href="/catalogo" className="border border-white/20 text-white font-bold px-8 py-4 uppercase text-xs tracking-widest hover:bg-white/10 transition">VER ACEITES</Link>
              </div>
              <div className="grid grid-cols-3 gap-8 pt-8 border-t border-white/10 max-w-lg">
                <div>
                  <span className="block text-3xl font-bold tracking-tight text-white font-sans">18</span>
                  <span className="text-[11px] text-gray-400 uppercase tracking-widest font-mono">AÑOS</span>
                </div>
                <div>
                  <span className="block text-3xl font-bold tracking-tight text-white font-sans">4</span>
                  <span className="text-[11px] text-gray-400 uppercase tracking-widest font-mono">MARCAS</span>
                </div>
                <div>
                  <span className="block text-3xl font-bold tracking-tight text-white font-sans">1 AÑO</span>
                  <span className="text-[11px] text-gray-400 uppercase tracking-widest font-mono">GARANTÍA</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs uppercase tracking-[0.25em] text-[#E88A5C] font-mono mb-2">COMPONENT ATELIER</p>
          <h2 className="text-3xl font-bold uppercase tracking-tight mb-12">Sistemas por especialidad</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/10 border border-white/10 overflow-hidden">
            {categories.map((cat, idx) => (
              <div
                key={cat.id}
                className={`bg-[#0d0d0d] p-8 flex flex-col justify-between h-64 group hover:bg-[#121212] transition ${
                  idx === categories.length - 1 ? 'md:col-span-2 lg:col-span-3' : ''
                }`}
              >
                <div>
                  <h3 className="text-xl font-bold uppercase tracking-tight text-white group-hover:text-[#E88A5C] transition">{cat.name}</h3>
                  <p className="text-xs text-gray-400 mt-2 font-mono leading-relaxed max-w-md">{cat.desc}</p>
                </div>
                <Link href={cat.link} className="text-xs uppercase tracking-widest text-[#E88A5C] font-mono flex items-center gap-2 group-hover:translate-x-1 transition-transform">EXPLORAR →</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-[#E88A5C] font-mono mb-2">VENTA ONLINE</p>
              <h2 className="text-3xl font-bold uppercase tracking-tight">Aceites y Lubricantes</h2>
            </div>
            <Link href="/catalogo" className="border border-white/20 text-xs font-mono uppercase tracking-widest px-4 py-2 hover:bg-white/10 text-white">VER TODOS</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl">
            {featuredProducts.slice(0, 4).map((p) => (
              <div key={p.id} className="border border-white/10 bg-[#121212] flex flex-col group">
                <div className="aspect-square relative p-6 bg-[#0a0a0a] flex items-center justify-center">
                  <span className={`absolute top-3 right-3 text-[9px] font-mono tracking-wider px-2 py-1 uppercase font-bold z-10 ${p.type === 'venta_online' ? 'bg-[#E88A5C] text-black' : 'border border-white/30 text-white bg-black/60 backdrop-blur-sm'}`}>
                    {p.type === 'venta_online' ? 'VENTA ONLINE' : 'COTIZACIÓN'}
                  </span>
                  <Image src={p.image} alt={p.name} width={200} height={200} className="object-contain max-h-full group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-[10px] uppercase font-mono tracking-widest text-[#E88A5C] mb-1">{p.brand} · {p.category}</p>
                    <Link href={`/producto/${p.slug}`}><h3 className="text-sm font-bold text-white line-clamp-2 hover:text-[#E88A5C] transition">{p.name}</h3></Link>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between font-mono">
                    <span className="text-sm font-bold text-white">{STORE_CONFIG.CURRENCY_FORMAT.format(p.price)}</span>
                    <span className="text-[10px] text-gray-500">{p.sku}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
