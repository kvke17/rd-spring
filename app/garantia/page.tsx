import Link from 'next/link';
import { ShieldCheck, RefreshCw, CheckCircle2, ChevronRight, FileText, ArrowRight } from 'lucide-react';

const GARANTIA_SECTIONS = [
  {
    id: 'garantia-limitada',
    title: 'Garantía Limitada',
    body: 'Todos nuestros productos cuentan con una garantía de un año contra defectos de fabricación. Esta garantía entra en vigor a partir de la fecha de recepción del producto.',
  },
  {
    id: 'condiciones-validacion',
    title: 'Condiciones de Validación',
    body: 'Para que la garantía sea efectiva, el repuesto deberá haber sido instalado por un profesional. La garantía no cubre daños por:',
    bullets: [
      'Instalación incorrecta o negligente.',
      'Uso del vehículo en condiciones extremas o competencias.',
      'Modificaciones posteriores a la pieza.',
      'Desgaste natural por el uso.',
    ],
  },
];

const CAMBIOS_SECTIONS = [
  {
    id: 'requisitos-producto',
    title: 'Requisitos del Producto',
    body: 'Para que el cambio o la devolución sea aceptada, el repuesto debe cumplir estrictamente con lo siguiente:',
    bullets: [
      'Estado Impecable: el producto debe estar nuevo, sin uso y sellado en su empaque original.',
      'Sin Huellas de Instalación: no se aceptarán piezas con manchas de grasa, marcas de herramientas, golpes o suciedad.',
      'Integridad del Empaque: la caja original es parte del producto; debe venir sin roturas excesivas, rayones o etiquetas de transporte pegadas directamente sobre el cartón original.',
    ],
  },
  {
    id: 'proceso-validacion',
    title: 'Proceso de Validación Obligatorio',
    body: 'Antes de realizar cualquier envío de regreso, el cliente deberá enviar fotografías nítidas del producto y de los sellos del empaque a nuestro canal de atención (contacto@rdspring.cl). Una vez recibidas las fotos, emitiremos una autorización de retorno. Al recibir el producto en nuestra oficina, nuestro equipo técnico realizará una inspección final: si el producto llega en mal estado, presenta señales de haber sido instalado o el empaque está destruido, la devolución o cambio no será efectiva y el producto será devuelto al cliente por pagar.',
  },
  {
    id: 'cambio-compatibilidad',
    title: 'Cambios por Error de Selección (Compatibilidad)',
    body: 'Entendemos que la precisión técnica es vital. Si el cliente se equivoca al seleccionar el repuesto, ofrecemos la posibilidad de realizar un cambio físico, sujeto a las siguientes condiciones:',
    bullets: [
      'Estado del Producto: el repuesto debe estar completamente sellado, en su empaque original, sin rastro de haber sido instalado (manchas de grasa, marcas de herramientas) y en perfecto estado estético y funcional.',
      'Plazo: el cliente tendrá un plazo de 15 días hábiles desde la recepción para solicitar el cambio.',
    ],
  },
  {
    id: 'ajuste-precio',
    title: 'Ajuste de Diferencias de Precio',
    body: 'En caso de que el nuevo producto solicitado tenga un valor distinto al original:',
    bullets: [
      'Diferencia a favor de la empresa: si el nuevo repuesto es de mayor valor, el cliente deberá cancelar la diferencia antes del despacho del nuevo producto.',
      'Diferencia a favor del cliente: si el nuevo repuesto es de menor valor, RD Spring reembolsará la diferencia a través del mismo método de pago original o transferencia bancaria en un plazo de 15 días hábiles.',
    ],
  },
  {
    id: 'costos-envio',
    title: 'Costos de Envío',
    body: 'Los costos de envío por concepto de cambios o devoluciones derivadas de un error en la selección por parte del cliente serán de cargo exclusivo del comprador, a menos que el cambio se deba a un error de despacho por nuestra parte.',
  },
];

function NumberedCard({
  id,
  number,
  title,
  body,
  bullets,
}: {
  id: string;
  number: string;
  title: string;
  body: string;
  bullets?: string[];
}) {
  return (
    <div id={id} className="rounded-3xl border border-slate-200/80 bg-white p-7 sm:p-9 shadow-sm hover:shadow-md transition-shadow scroll-mt-32">
      <div className="flex items-start gap-5">
        <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 text-[#b3131b] font-mono font-bold text-sm flex items-center justify-center shrink-0 shadow-2xs">
          {number}
        </div>
        <div className="flex-1">
          <h3 className="text-gray-900 text-base sm:text-lg font-bold uppercase tracking-tight mb-2">{title}</h3>
          <p className="text-sm text-slate-600 leading-relaxed font-normal">{body}</p>
          {bullets && (
            <ul className="mt-4 space-y-2.5 pt-2 border-t border-slate-100">
              {bullets.map((b, i) => (
                <li key={i} className="flex gap-3 text-sm text-slate-600 leading-relaxed">
                  <span className="text-[#b3131b] font-bold shrink-0">•</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default function WarrantyPage() {
  return (
    <div className="min-h-screen bg-slate-50/50 text-gray-900 pt-28 sm:pt-32 pb-24 font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Encabezado */}
        <div className="mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-100 text-[#b3131b] text-[10px] font-mono font-bold uppercase tracking-wider mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>RESPALDO TÉCNICO Y POLÍTICAS OFICIALES</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-gray-900">
            Garantía y Devoluciones
          </h1>
          <p className="text-sm text-slate-500 mt-2 max-w-2xl font-medium leading-relaxed">
            En RD Spring garantizamos la autenticidad y funcionamiento óptimo de cada pieza importada. Conoce los detalles de cobertura y procedimientos de cambio.
          </p>
        </div>

        {/* Índice rápido */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 mb-12 shadow-2xs">
          <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold mb-3 pl-2">Índice de Secciones</p>
          <div className="flex flex-wrap gap-2">
            {[...GARANTIA_SECTIONS, ...CAMBIOS_SECTIONS].map((s, idx) => (
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

        {/* BLOQUE 1: GARANTÍA */}
        <div className="mb-14">
          <div className="flex items-center gap-2 mb-6">
            <ShieldCheck className="w-5 h-5 text-[#b3131b]" />
            <h2 className="text-xs font-mono uppercase tracking-widest text-[#b3131b] font-bold">
              01 · POLÍTICA DE GARANTÍA (1 AÑO)
            </h2>
          </div>
          <div className="space-y-6">
            {GARANTIA_SECTIONS.map((s, idx) => (
              <NumberedCard
                key={s.id}
                id={s.id}
                number={String(idx + 1).padStart(2, '0')}
                title={s.title}
                body={s.body}
                bullets={'bullets' in s ? s.bullets : undefined}
              />
            ))}
          </div>
        </div>

        {/* BLOQUE 2: CAMBIOS Y DEVOLUCIONES */}
        <div className="mb-14">
          <div className="flex items-center gap-2 mb-2">
            <RefreshCw className="w-5 h-5 text-[#b3131b]" />
            <h2 className="text-xs font-mono uppercase tracking-widest text-[#b3131b] font-bold">
              02 · CAMBIOS Y DEVOLUCIONES
            </h2>
          </div>
          <p className="text-sm text-slate-500 font-medium mb-6">
            Si requieres un cambio por compatibilidad, dispones de una ventana de 15 días hábiles desde la recepción física del pedido:
          </p>
          <div className="space-y-6">
            {CAMBIOS_SECTIONS.map((s, idx) => (
              <NumberedCard
                key={s.id}
                id={s.id}
                number={String(GARANTIA_SECTIONS.length + idx + 1).padStart(2, '0')}
                title={s.title}
                body={s.body}
                bullets={'bullets' in s ? s.bullets : undefined}
              />
            ))}
          </div>
        </div>

        {/* Banner CTA inferior */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h4 className="text-base font-bold text-gray-900">¿Necesitas gestionar una garantía o devolución?</h4>
            <p className="text-xs text-slate-500 mt-1">Escríbenos a través de nuestro centro de soporte y te guiaremos paso a paso.</p>
          </div>
          <Link
            href="/soporte"
            className="flex items-center gap-2 bg-[#b3131b] hover:bg-[#8f0f15] text-white font-bold px-6 py-3.5 rounded-xl uppercase tracking-wider text-xs transition-colors shadow-xs shrink-0"
          >
            <span>Ir a Soporte</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}
