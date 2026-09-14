import Link from 'next/link';

export default function NosotrosPage() {
  return (
    <div className="min-h-screen bg-gray-50 text-black pt-28 pb-20 font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Encabezado Estilo Soporte / Institucional */}
        <div className="mb-12 border-b border-gray-300 pb-6">
          <p className="text-xs uppercase tracking-[0.25em] text-[#b3131b] mb-2 font-bold">
            Nuestra Historia
          </p>
          <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tight text-black">
            ¿Quiénes Somos?
          </h1>
        </div>

        {/* Tarjeta Contenedora Principal */}
        <div className="bg-white border border-gray-200 p-8 md:p-12 shadow-sm space-y-8 text-gray-700 leading-relaxed text-sm md:text-base">
          
          <p className="font-bold text-black text-lg">
            Somos Raimundo y Dominga, los hermanos detrás de <span className="text-[#b3131b]">RDSpring</span>. Creamos este proyecto con el compromiso de brindarte repuestos de suspensión de calidad original a precios competitivos.
          </p>

          <p>
            Nos especializamos en la importación de marcas líderes OEM europeas como <strong className="text-black">Lemförder, TRW, Meyle, Bilstein y Sachs</strong>. A través de nuestra tienda, buscamos darte una alternativa confiable y transparente: nos encargamos de importar directamente tus repuestos y, a la vez, estamos construyendo paso a paso nuestro inventario físico para ofrecerte cada vez mayor disponibilidad inmediata.
          </p>

          <p>
            En <strong className="text-black">RDSpring</strong> no solo vendemos repuestos: te ofrecemos seguridad, respaldo y la confianza que tu vehículo merece.
          </p>

          {/* Bloque de Pilares */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-gray-100">
            <div className="p-4 bg-gray-50 border border-gray-200">
              <h3 className="text-black font-bold uppercase text-xs tracking-widest mb-2">Calidad OEM</h3>
              <p className="text-xs text-gray-600">Componentes originales de fabricantes europeos con altos estándares de durabilidad.</p>
            </div>
            <div className="p-4 bg-gray-50 border border-gray-200">
              <h3 className="text-black font-bold uppercase text-xs tracking-widest mb-2">Importación Directa</h3>
              <p className="text-xs text-gray-600">Alternativa transparente y competitiva para traer justo lo que tu auto de alta gama necesita.</p>
            </div>
            <div className="p-4 bg-gray-50 border border-gray-200">
              <h3 className="text-black font-bold uppercase text-xs tracking-widest mb-2">Respaldo Cercano</h3>
              <p className="text-xs text-gray-600">Atención directa de entusiastas del motor enfocados en darte la mejor asesoría.</p>
            </div>
          </div>

        </div>

        {/* Botón de Acción */}
        <div className="mt-8">
          <Link 
            href="/catalogo" 
            className="inline-block bg-[#b91c1c] text-white font-bold px-8 py-4 uppercase tracking-widest hover:bg-red-800 transition shadow-sm text-xs"
          >
            Explorar Catálogo
          </Link>
        </div>

      </div>
    </div>
  );
}