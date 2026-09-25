import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* COLUMNA 1: Logo y Descripción */}
          <div className="flex flex-col">
            <Link href="/">
              {/* Recuerda poner la ruta real de tu logo (ej: /images/logo.png) */}
              <Image 
                src="/images/logo-rd.png" 
                alt="Logo RD Spring" 
                width={180} 
                height={60} 
                className="mb-4 object-contain"
              />
            </Link>
            <p className="text-gray-700 text-sm leading-relaxed mt-2">
              La ingeniería que sostiene el lujo en movimiento.<br/>
              Componentes y fluidos de alto rendimiento en<br/>
              Santiago de Chile.
            </p>
          </div>

          {/* COLUMNA 2: Repuestos y Oficina */}
          <div className="flex flex-col">
            <h3 className="text-[#b3131b] font-bold text-xs uppercase tracking-widest mb-4">
              Repuestos
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/cotizacion" className="text-gray-800 text-sm font-medium hover:text-[#b3131b] transition">
                  Cotizar repuesto
                </Link>
              </li>
              <li>
                <Link href="/catalogo" className="text-gray-800 text-sm font-medium hover:text-[#b3131b] transition">
                  Aceites y Lubricantes
                </Link>
              </li>
              <li>
                <Link href="/repuestos" className="text-gray-800 text-sm font-medium hover:text-[#b3131b] transition">
                  Repuestos De Calidad
                </Link>
              </li>
            </ul>

            {/* NUEVA SECCIÓN: Oficina con enlace a Google Maps */}
            <div className="mt-8">
              <p className="text-[#b3131b] font-bold text-xs uppercase tracking-widest mb-1">
                Oficina
              </p>
              <a 
                href="https://www.google.com/maps/search/?api=1&query=Las+Condes+8550,+Santiago,+Chile" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block text-gray-800 text-sm font-medium hover:text-[#b3131b] transition underline decoration-gray-300 hover:decoration-[#b3131b] underline-offset-4"
              >
                Av. Las Condes 8550, Las Condes, Región Metropolitana
              </a>
            </div>
          </div>

          {/* COLUMNA 3: Atención al Cliente */}
          <div className="flex flex-col">
            <h3 className="text-[#b3131b] font-bold text-xs uppercase tracking-widest mb-4">
              Atención al Cliente
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/contacto" className="text-gray-800 text-sm font-medium hover:text-[#b3131b] transition">
                  Soporte y Contacto
                </Link>
              </li>
              <li>
                <Link href="/terminos" className="text-gray-800 text-sm font-medium hover:text-[#b3131b] transition">
                  Términos y Condiciones
                </Link>
              </li>
              <li>
                <Link href="/garantia" className="text-gray-800 text-sm font-medium hover:text-[#b3131b] transition">
                  Políticas de Garantía
                </Link>
              </li>
              <li>
                <span className="text-gray-800 text-sm font-medium">
                  1 Año de Garantía
                </span>
              </li>
            </ul>

            {/* Firma del Desarrollador */}
            <div className="mt-8 border-t border-gray-200 pt-6 pb-2 flex flex-col items-center">
              <p className="text-[10px] text-gray-400 uppercase tracking-widest text-center">
                Diseño y desarrollo por{' '}
                <a 
                  href="https://www.instagram.com/kvkestudio/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="font-bold text-gray-500 hover:text-[#b3131b] transition-colors"
                >
                  Kvke Studio
                </a>
              </p>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}