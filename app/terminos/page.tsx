const SECTIONS = [
  {
    id: 'cotizaciones',
    title: 'Validez de Cotizaciones',
    body: 'Los precios referenciales indicados bajo la etiqueta "COTIZACIÓN" están sujetos a evaluación de número de chasis (VIN) y stock del fabricante. La cotización formal enviada por correo electrónico o WhatsApp tiene una validez de 5 días hábiles desde su emisión.',
  },
  {
    id: 'pagos',
    title: 'Pagos y Venta Online',
    body: 'Las compras realizadas a través de nuestra plataforma con Webpay Plus (Transbank) se consideran finales una vez emitido el comprobante electrónico. Los precios publicados incluyen IVA y están expresados en pesos chilenos (CLP).',
  },
  {
    id: 'despacho',
    title: 'Despacho y Entrega',
    body: 'Los plazos de despacho informados en el checkout (retiro en taller, Santiago o regiones) son estimativos y comienzan a contar una vez confirmado el pago. RD Spring no se hace responsable por atrasos atribuibles a la empresa de transporte externa.',
  },
  {
    id: 'devoluciones',
    title: 'Devoluciones y Cambios',
    body: 'Los productos de venta online pueden cambiarse o devolverse bajo las condiciones detalladas en nuestra página de Garantía, Cambios y Devoluciones, incluyendo plazos, estado requerido del producto y proceso de validación.',
  },
  {
    id: 'modificaciones',
    title: 'Modificaciones a estos Términos',
    body: 'RD Spring podrá actualizar estos términos en cualquier momento para reflejar cambios en nuestros procesos, precios o normativa vigente. La versión aplicable será siempre la publicada en esta página al momento de la compra o cotización.',
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-xs uppercase tracking-[0.25em] text-[#FF0000] font-mono mb-2">MARCO LEGAL</p>
        <h1 className="text-4xl font-bold uppercase tracking-tight mb-6">Términos y Condiciones</h1>
        <p className="text-sm text-gray-400 font-mono leading-relaxed mb-10 max-w-2xl">
          Al utilizar los servicios de RD Spring —ya sea para cotizar un repuesto o comprar en línea— usted acepta los siguientes términos.
        </p>

        {/* Índice rápido */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-white/10 py-4 mb-12">
          {SECTIONS.map((s, idx) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="text-[10px] font-mono uppercase tracking-widest text-gray-400 hover:text-[#FF0000] transition"
            >
              {String(idx + 1).padStart(2, '0')} · {s.title}
            </a>
          ))}
        </div>

        <div className="space-y-6">
          {SECTIONS.map((s, idx) => (
            <div key={s.id} id={s.id} className="border border-white/10 bg-[#121212] p-6 sm:p-8 scroll-mt-28">
              <div className="flex items-start gap-5">
                <div className="w-10 h-10 border border-[#FF0000] text-[#FF0000] font-mono font-bold text-sm flex items-center justify-center flex-shrink-0">
                  {String(idx + 1).padStart(2, '0')}
                </div>
                <div>
                  <h2 className="text-white text-base font-bold uppercase tracking-widest mb-3">{s.title}</h2>
                  <p className="text-sm text-gray-400 font-mono leading-relaxed">{s.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-500 font-mono mt-12 pt-8 border-t border-white/10">
          Última actualización: agosto de 2026. Ante dudas sobre estos términos, contáctanos desde la sección{' '}
          <a href="/soporte" className="text-[#FF0000] hover:underline">Soporte</a>.
        </p>
      </div>
    </div>
  );
}
