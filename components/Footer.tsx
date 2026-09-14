import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-16 text-gray-900 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          
          {/* Columna 1: RD Spring */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold tracking-tight text-[#b91c1c]">
              RD <span className="text-gray-900">SPRING</span>
            </h3>
            <p className="text-base font-medium text-gray-700 max-w-sm leading-relaxed">
              La ingeniería que sostiene el lujo en movimiento. Componentes y fluidos de alto rendimiento en Santiago de Chile.
            </p>
          </div>

          {/* Columna 2: Repuestos */}
          <div className="space-y-6">
            <h4 className="text-sm font-bold uppercase tracking-widest text-[#b91c1c]">Repuestos</h4>
            <ul className="space-y-4">
              <li>
                <Link href="/cotizacion" className="text-base font-semibold text-gray-700 hover:text-[#b91c1c] transition-colors">
                  Cotizar repuesto
                </Link>
              </li>
              <li>
                <Link href="/catalogo" className="text-base font-semibold text-gray-700 hover:text-[#b91c1c] transition-colors">
                  Aceites y Lubricantes
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 3: Atención al Cliente */}
          <div className="space-y-6">
            <h4 className="text-sm font-bold uppercase tracking-widest text-[#b91c1c]">Atención al Cliente</h4>
            <ul className="space-y-4">
              <li>
                <Link href="/contacto" className="text-base font-semibold text-gray-700 hover:text-[#b91c1c] transition-colors">
                  Soporte y Contacto
                </Link>
              </li>
              <li>
                <Link href="/terminos" className="text-base font-semibold text-gray-700 hover:text-[#b91c1c] transition-colors">
                  Términos y Condiciones
                </Link>
              </li>
              <li>
                <Link href="/garantia" className="text-base font-semibold text-gray-700 hover:text-[#b91c1c] transition-colors">
                  Políticas de Garantía
                </Link>
              </li>
              <li>
                <Link href="/garantia" className="text-base font-semibold text-gray-700 hover:text-[#b91c1c] transition-colors">
                  1 Año de Garantía
                </Link>
              </li>
            </ul>
          </div>
          
        </div>
      </div>
    </footer>
  );
}