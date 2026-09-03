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
    <div id={id} className="border border-white/10 bg-[#121212] p-6 sm:p-8 scroll-mt-28">
      <div className="flex items-start gap-5">
        <div className="w-10 h-10 border border-[#FF0000] text-[#FF0000] font-mono font-bold text-sm flex items-center justify-center flex-shrink-0">
          {number}
        </div>
        <div className="flex-1">
          <h3 className="text-white text-base font-bold uppercase tracking-widest mb-3">{title}</h3>
          <p className="text-sm text-gray-400 font-mono leading-relaxed">{body}</p>
          {bullets && (
            <ul className="mt-4 space-y-2">
              {bullets.map((b, i) => (
                <li key={i} className="flex gap-3 text-sm text-gray-400 font-mono leading-relaxed">
                  <span className="text-[#FF0000] flex-shrink-0">—</span>
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
  const allIds = [...GARANTIA_SECTIONS, ...CAMBIOS_SECTIONS].map((s) => s.id);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-xs uppercase tracking-[0.25em] text-[#FF0000] font-mono mb-2">RESPALDO TÉCNICO</p>
        <h1 className="text-4xl font-bold uppercase tracking-tight mb-6">Garantía, Cambios y Devoluciones</h1>
        <p className="text-sm text-gray-400 font-mono leading-relaxed mb-10 max-w-2xl">
          En RD Spring nuestro objetivo es que tu vehículo recupere su rendimiento óptimo. Aquí encuentras el detalle completo de nuestra garantía y de las condiciones para cambios o devoluciones.
        </p>

        {/* Índice rápido */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-white/10 py-4 mb-12">
          {[...GARANTIA_SECTIONS, ...CAMBIOS_SECTIONS].map((s, idx) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="text-[10px] font-mono uppercase tracking-widest text-gray-400 hover:text-[#FF0000] transition"
            >
              {String(idx + 1).padStart(2, '0')} · {s.title}
            </a>
          ))}
        </div>

        {/* BLOQUE 1: GARANTÍA */}
        <p className="text-xs uppercase tracking-[0.25em] text-[#FF0000] font-mono mb-4">01 · POLÍTICA DE GARANTÍA (1 AÑO)</p>
        <div className="space-y-6 mb-16">
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

        {/* BLOQUE 2: CAMBIOS Y DEVOLUCIONES */}
        <p className="text-xs uppercase tracking-[0.25em] text-[#FF0000] font-mono mb-2">02 · CAMBIOS Y DEVOLUCIONES</p>
        <p className="text-sm text-gray-400 font-mono leading-relaxed mb-6 max-w-2xl">
          Si cometiste un error en la selección de tu repuesto, te ofrecemos una ventana de 15 días corridos desde la recepción del producto para solicitar un cambio o la devolución de tu dinero, bajo las siguientes condiciones:
        </p>
        <div className="space-y-6">
          {CAMBIOS_SECTIONS.map((s, idx) => (
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

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-xs text-gray-500 font-mono">Última actualización: agosto de 2026.</p>
          <a
            href="/soporte"
            className="inline-block bg-[#FF0000] text-black font-bold px-6 py-3 uppercase tracking-widest text-xs hover:bg-opacity-90 transition text-center"
          >
            Solicitar garantía o devolución
          </a>
        </div>
      </div>
    </div>
  );
}
