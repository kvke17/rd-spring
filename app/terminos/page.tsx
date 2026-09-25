'use client';

const SECTIONS = [
  {
    id: 'cotizaciones',
    title: 'Consideraciones y Validez de Cotizaciones',
    body: 'El presente documento establece las condiciones de uso de la web de RD Spring / Chassis Prestige, rigiéndose por la Ley Nº 19.496. Los precios bajo la etiqueta "COTIZACIÓN" están sujetos a evaluación de VIN y stock. La cotización formal enviada por correo electrónico tiene una validez de 5 días hábiles.',
  },
  {
    id: 'pagos',
    title: 'Pagos y Venta Online',
    body: 'Las compras realizadas a través de nuestra plataforma con Webpay Plus se consideran finales una vez emitido el comprobante. Los precios publicados incluyen IVA y están expresados en pesos chilenos (CLP). Es responsabilidad del cliente proporcionar los datos correctos si requiere factura comercial.',
  },
  {
    id: 'retracto',
    title: 'Derecho a Retracto (Ley del Consumidor)',
    body: 'En compras realizadas a través de nuestra web, el consumidor SÍ cuenta con el derecho a retracto dentro de un plazo de 10 días desde la recepción del producto, siempre y cuando este no haya sido utilizado, tenga sus sellos originales y esté en perfectas condiciones. Los costos de envío por devoluciones corren por cuenta del comprador.',
  },
  {
    id: 'garantia',
    title: 'Garantía Legal',
    body: 'Si el producto presenta fallas o defectos de fábrica dentro de los 6 meses posteriores a la compra, el cliente tiene derecho a la Garantía Legal (reparación, cambio o devolución del dinero), previa evaluación técnica de nuestro equipo para descartar mala instalación o negligencia.',
  },
  {
    id: 'privacidad',
    title: 'Política de Privacidad de Datos',
    body: 'Conforme a la Ley Nº 19.628 de Protección de la Vida Privada, garantizamos que los datos personales solicitados durante la compra (RUT, nombre, teléfono, dirección y correo electrónico) serán utilizados única y exclusivamente para el procesamiento de la venta, emisión de documentos tributarios y gestión de despacho. No vendemos su información a terceros.',
  },
  {
    id: 'propiedad',
    title: 'Marcas y Propiedad Intelectual',
    body: 'Todas las marcas de vehículos, logotipos y nombres de modelos mencionados en este sitio web (incluyendo Porsche, Audi, BMW, Mercedes-Benz, Land Rover, Volkswagen, Jaguar, entre otros) son marcas registradas de sus respectivos fabricantes y propietarios. RD Spring es una tienda independiente y NO es un concesionario oficial ni distribuidor autorizado de dichas marcas automotrices.',
  }
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 pt-28 pb-20 font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-xs uppercase tracking-[0.25em] text-[#b3131b] mb-2 font-bold">MARCO LEGAL</p>
        <h1 className="text-4xl font-black uppercase tracking-tight mb-6">Términos y Condiciones</h1>
        <p className="text-sm text-gray-600 leading-relaxed mb-10 max-w-2xl">
          Al utilizar los servicios de RD Spring —ya sea para cotizar un repuesto o comprar en línea— usted acepta los siguientes términos.
        </p>

        {/* Índice rápido */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-gray-200 py-4 mb-12">
          {SECTIONS.map((s, idx) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="text-[10px] uppercase tracking-widest text-gray-600 hover:text-[#b3131b] transition font-bold"
            >
              {String(idx + 1).padStart(2, '0')} · {s.title}
            </a>
          ))}
        </div>

        <div className="space-y-6">
          {SECTIONS.map((s, idx) => (
            <div key={s.id} id={s.id} className="border border-gray-200 bg-gray-50 p-6 sm:p-8 scroll-mt-28">
              <div className="flex items-start gap-5">
                <div className="w-10 h-10 border border-[#b3131b] text-[#b3131b] font-bold text-sm flex items-center justify-center flex-shrink-0 bg-white">
                  {String(idx + 1).padStart(2, '0')}
                </div>
                <div>
                  <h2 className="text-gray-900 text-sm md:text-base font-bold uppercase tracking-widest mb-3">{s.title}</h2>
                  <p className="text-sm text-gray-600 leading-relaxed">{s.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-500 mt-12 pt-8 border-t border-gray-200">
          Última actualización: Septiembre de 2026. Ante dudas sobre estos términos, contáctanos desde la sección{' '}
          <a href="/soporte" className="text-[#b3131b] hover:underline font-bold">Soporte</a>.
        </p>
      </div>
    </div>
  );
}