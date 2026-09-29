import Link from 'next/link';
import { ShieldCheck, Plane, Users, ChevronRight, Sparkles, Award, CheckCircle2 } from 'lucide-react';

export default function NosotrosPage() {
  return (
    <div className="min-h-screen bg-slate-50/50 text-gray-900 pt-28 sm:pt-32 pb-24 font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Encabezado Principal */}
        <div className="mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-100 text-[#b3131b] text-[10px] font-mono font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>NUESTRA HISTORIA Y COMPROMISO</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-gray-900">
            ¿Quiénes Somos?
          </h1>
          <p className="text-sm text-slate-500 mt-2 max-w-xl font-medium">
            Pasión automotriz y repuestos de suspensión OEM con respaldo transparente y asesoría técnica especializada.
          </p>
        </div>

        {/* Tarjeta Contenedora Principal */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 shadow-sm space-y-8">
          
          <div className="border-l-4 border-[#b3131b] pl-5 py-1">
            <p className="font-bold text-gray-900 text-lg sm:text-xl leading-relaxed">
              Somos Raimundo y Dominga, los hermanos detrás de <span className="text-[#b3131b]">RD Spring</span>. Creamos este proyecto con el compromiso de brindarte repuestos de suspensión y componentes de alta calidad original a precios competitivos.
            </p>
          </div>

          <div className="space-y-4 text-slate-600 leading-relaxed text-sm sm:text-base font-normal">
            <p>
              Nos especializamos en la importación directa de marcas líderes OEM europeas como <strong className="text-gray-900 font-semibold">Lemförder, TRW, Meyle, Bilstein y Sachs</strong>. A través de nuestra tienda, buscamos darte una alternativa confiable, honesta y transparente: nos encargamos de importar tus repuestos y, a la vez, estamos construyendo día a día nuestro inventario físico para ofrecerte mayor disponibilidad inmediata en Santiago y todo Chile.
            </p>
            <p>
              En <strong className="text-gray-900 font-semibold">RD Spring</strong> no solo vendemos repuestos: te ofrecemos seguridad, precisión técnica por número de chasis (VIN) y la tranquilidad que tu vehículo de alta gama merece.
            </p>
          </div>

          {/* Métricas / Credenciales */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-y border-slate-100">
            <div>
              <p className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">100%</p>
              <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mt-1">Calidad OEM</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-[#b3131b] tracking-tight">1 Año</p>
              <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mt-1">Garantía Escrita</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">+5 Marcas</p>
              <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mt-1">Líderes de la UE</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Directo</p>
              <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mt-1">Sin Intermediarios</p>
            </div>
          </div>

          {/* Bloque de Pilares */}
          <div>
            <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400 font-bold mb-4">
              NUESTROS PILARES FUNDAMENTALES
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-slate-300 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-[#b3131b] flex items-center justify-center mb-4">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="text-gray-900 font-bold uppercase text-xs tracking-wider mb-2">Calidad OEM</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Componentes de los mismos fabricantes que ensamblan en fábrica las marcas alemanas y británicas más exigentes.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-slate-300 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-[#b3131b] flex items-center justify-center mb-4">
                  <Plane className="w-5 h-5" />
                </div>
                <h4 className="text-gray-900 font-bold uppercase text-xs tracking-wider mb-2">Importación Directa</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Cadena logística transparente y competitiva para traer exactamente el código original que tu auto necesita.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-slate-300 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-[#b3131b] flex items-center justify-center mb-4">
                  <Users className="w-5 h-5" />
                </div>
                <h4 className="text-gray-900 font-bold uppercase text-xs tracking-wider mb-2">Respaldo Cercano</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Atención directa de los propios fundadores. Te asesoramos técnicamente antes de que tomes cualquier decisión.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Botones de Acción */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center justify-between bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
          <div>
            <h4 className="text-sm font-bold text-gray-900">¿Buscas repuestos para tu vehículo?</h4>
            <p className="text-xs text-slate-500 mt-0.5">Explora nuestro catálogo en línea o solicita una cotización personalizada.</p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <Link 
              href="/catalogo" 
              className="flex-1 sm:flex-none text-center bg-slate-900 hover:bg-black text-white font-bold px-6 py-3 rounded-xl uppercase tracking-wider transition-colors text-xs shadow-2xs"
            >
              Ver Catálogo
            </Link>
            <Link 
              href="/cotizacion" 
              className="flex-1 sm:flex-none text-center bg-[#b3131b] hover:bg-[#8f0f15] text-white font-bold px-6 py-3 rounded-xl uppercase tracking-wider transition-colors text-xs shadow-xs"
            >
              Cotizar con VIN
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}