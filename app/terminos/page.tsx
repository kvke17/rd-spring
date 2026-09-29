'use client';

import Link from 'next/link';
import { Scale, FileText, ShieldAlert, ArrowRight } from 'lucide-react';

const SECTIONS = [
  {
    id: 'cotizaciones',
    title: 'Consideraciones y Validez de Cotizaciones',
    body: 'El presente documento establece las condiciones de uso de la web de RD Spring / Chassis Prestige, rigiéndose por la Ley Nº 19.496. Los precios bajo la etiqueta "COTIZACIÓN" están sujetos a evaluación de VIN y stock disponible. La cotización formal enviada por correo electrónico tiene una validez de 5 días hábiles.',
  },
  {
    id: 'pagos',
    title: 'Pagos y Venta Online',
    body: 'Las compras realizadas a través de nuestra plataforma mediante Webpay Plus se consideran finales una vez emitido el comprobante bancario. Los precios publicados incluyen IVA y están expresados en pesos chilenos (CLP). Es responsabilidad del cliente proporcionar los datos tributarios exactos si requiere factura comercial.',
  },
  {
    id: 'retracto',
    title: 'Derecho a Retracto (Ley del Consumidor)',
    body: 'En compras realizadas a través de nuestra web, el consumidor cuenta con derecho a retracto dentro de un plazo de 10 días desde la recepción del producto, siempre y cuando este no haya sido utilizado, conserve sus sellos originales intactos y esté en perfectas condiciones estéticas y funcionales. Los costos logísticos de transporte por retracto corren por cuenta del comprador.',
  },
  {
    id: 'garantia',
    title: 'Garantía Legal',
    body: 'Si el producto presenta fallas o defectos de fabricación dentro de los 6 meses posteriores a la compra, el cliente tiene derecho a la Garantía Legal (reparación, cambio o devolución del dinero), previa evaluación técnica de nuestro equipo para descartar mala instalación, negligencia o intervención no calificada.',
  },
  {
    id: 'privacidad',
    title: 'Política de Privacidad y Manejo de Datos',
    body: 'Conforme a la Ley Nº 19.628 sobre Protección de la Vida Privada, garantizamos que los datos personales solicitados durante la compra (RUT, nombre, teléfono, dirección y correo electrónico) son utilizados exclusiva y estrictamente para el procesamiento de la venta, emisión de boletas/facturas y gestión de despacho. No comercializamos ni cedemos información a terceros.',
  },
  {
    id: 'propiedad',
    title: 'Marcas y Propiedad Intelectual',
    body: 'Todas las marcas de vehículos, logotipos y nombres de modelos mencionados en este sitio web (incluyendo Porsche, Audi, BMW, Mercedes-Benz, Land Rover, Volkswagen, entre otros) son marcas registradas de sus respectivos fabricantes y propietarios. RD Spring es una tienda independiente y no representa un concesionario oficial ni distribuidor autorizado de dichas marcas automotrices.',
  }
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50/50 text-gray-900 pt-28 sm:pt-32 pb-24 font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Encabezado */}
        <div className="mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-100 text-[#b3131b] text-[10px] font-mono font-bold uppercase tracking-wider mb-3">
            <Scale className="w-3.5 h-3.5" />
            <span>MARCO LEGAL Y CONDICIONES DE SERVICIO</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-gray-900">
            Términos y Condiciones
          </h1>
          <p className="text-sm text-slate-500 mt-2 max-w-2xl font-medium leading-relaxed">
            Al utilizar los servicios de RD Spring —ya sea para cotizar un repuesto bajo pedido o adquirir productos en línea— aceptas los siguientes términos de compraventa y garantía.
          </p>
        </div>

        {/* Índice rápido */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 mb-12 shadow-2xs">
          <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold mb-3 pl-2">Índice Legal</p>
          <div className="flex flex-wrap gap-2">
            {SECTIONS.map((s, idx) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="text-xs font-medium text-slate-600 hover:text-gray-900 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 px-3 py-1.5 rounded-lg transition-colors"
              >
                <span className="font-mono text-[#b3131b] font-bold mr-1.5">{String(idx + 1).padStart(2, '0')}</span>
                {s.title}
              </a>
            ))}
          </div>
        </div>

        {/* Lista de Secciones */}
        <div className="space-y-6">
          {SECTIONS.map((s, idx) => (
            <div 
              key={s.id} 
              id={s.id} 
              className="rounded-3xl border border-slate-200/80 bg-white p-7 sm:p-9 shadow-sm hover:shadow-md transition-shadow scroll-mt-32"
            >
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 text-[#b3131b] font-mono font-bold text-sm flex items-center justify-center shrink-0 shadow-2xs">
                  {String(idx + 1).padStart(2, '0')}
                </div>
                <div className="flex-1">
                  <h2 className="text-gray-900 text-base sm:text-lg font-bold uppercase tracking-tight mb-2">
                    {s.title}
                  </h2>
                  <p className="text-sm text-slate-600 leading-relaxed font-normal">
                    {s.body}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pie de Página de Términos */}
        <div className="mt-12 bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="text-xs text-slate-500 font-medium">
            Última actualización: Septiembre de 2026. Si tienes consultas técnicas o legales, no dudes en contactar a nuestro equipo.
          </p>
          <Link
            href="/soporte"
            className="flex items-center gap-2 bg-slate-900 hover:bg-black text-white font-bold px-6 py-3.5 rounded-xl uppercase tracking-wider text-xs transition-colors shadow-2xs shrink-0"
          >
            <span>Canal de Soporte</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}