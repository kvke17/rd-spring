import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, MapPin, ArrowUpRight } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white text-gray-900 border-t border-slate-200 pt-16 pb-12 relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-14">
          
          {/* COLUMNA 1: Logo y Descripción (Sin parches de fondo, integración pura) */}
          <div className="flex flex-col">
            <Link 
              href="/" 
              className="inline-block mb-5 self-start group cursor-pointer"
              aria-label="Ir a la página principal de RD Spring"
            >
              <Image 
                src="/images/logo-rd.png" 
                alt="Logo RD Spring" 
                width={180} 
                height={26} 
                className="object-contain h-7 sm:h-8 w-auto transition-transform duration-200 group-hover:scale-[1.02]"
              />
            </Link>
            
            <p className="text-slate-600 text-sm leading-relaxed max-w-sm font-normal">
              La ingeniería que sostiene el lujo en movimiento.<br />
              Componentes y fluidos de alto rendimiento en<br />
              Santiago de Chile.
            </p>
          </div>

          {/* COLUMNA 2: Repuestos y Oficina */}
          <div className="flex flex-col">
            <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-[#b3131b] mb-4">
              Repuestos
            </h3>
            <ul className="space-y-1">
              <li>
                <Link 
                  href="/cotizacion" 
                  className="min-h-[44px] flex items-center text-slate-700 hover:text-[#b3131b] transition-colors duration-200 text-sm font-medium group"
                >
                  <span className="group-hover:translate-x-1 transition-transform duration-200">
                    Cotizar repuesto
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[#b3131b]" />
                </Link>
              </li>
              <li>
                <Link 
                  href="/catalogo" 
                  className="min-h-[44px] flex items-center text-slate-700 hover:text-[#b3131b] transition-colors duration-200 text-sm font-medium group"
                >
                  <span className="group-hover:translate-x-1 transition-transform duration-200">
                    Aceites y Lubricantes
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[#b3131b]" />
                </Link>
              </li>
              <li>
                <Link 
                  href="/repuestos" 
                  className="min-h-[44px] flex items-center text-slate-700 hover:text-[#b3131b] transition-colors duration-200 text-sm font-medium group"
                >
                  <span className="group-hover:translate-x-1 transition-transform duration-200">
                    Repuestos De Calidad
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[#b3131b]" />
                </Link>
              </li>
            </ul>

            {/* SECCIÓN: Oficina con enlace a Google Maps */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <p className="text-xs uppercase tracking-[0.2em] font-bold text-[#b3131b] mb-2">
                Oficina
              </p>
              <a 
                href="https://www.google.com/maps/search/?api=1&query=Las+Condes+8550,+Santiago,+Chile" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="min-h-[44px] flex items-center gap-2 text-slate-700 hover:text-[#b3131b] transition-colors duration-200 text-sm font-normal underline decoration-slate-300 hover:decoration-[#b3131b] underline-offset-4"
              >
                <MapPin className="w-4 h-4 text-[#b3131b] shrink-0" />
                <span>Av. Las Condes 8550, Las Condes, Región Metropolitana</span>
              </a>
            </div>
          </div>

          {/* COLUMNA 3: Atención al Cliente */}
          <div className="flex flex-col">
            <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-[#b3131b] mb-4">
              Atención al Cliente
            </h3>
            <ul className="space-y-1">
              <li>
                <Link 
                  href="/contacto" 
                  className="min-h-[44px] flex items-center text-slate-700 hover:text-[#b3131b] transition-colors duration-200 text-sm font-medium group"
                >
                  <span className="group-hover:translate-x-1 transition-transform duration-200">
                    Soporte y Contacto
                  </span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/terminos" 
                  className="min-h-[44px] flex items-center text-slate-700 hover:text-[#b3131b] transition-colors duration-200 text-sm font-medium group"
                >
                  <span className="group-hover:translate-x-1 transition-transform duration-200">
                    Términos y Condiciones
                  </span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/garantia" 
                  className="min-h-[44px] flex items-center text-slate-700 hover:text-[#b3131b] transition-colors duration-200 text-sm font-medium group"
                >
                  <span className="group-hover:translate-x-1 transition-transform duration-200">
                    Políticas de Garantía
                  </span>
                </Link>
              </li>
              <li className="pt-2">
                {/* Badge con microinteracción (Sin la palabra Oficial) */}
                <Link
                  href="/garantia"
                  className="group/badge inline-flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-[#b3131b]/50 hover:bg-slate-100 transition-all duration-300 cursor-pointer min-h-[44px] active:scale-[0.98] w-full sm:w-auto"
                >
                  <ShieldCheck className="w-4 h-4 text-[#b3131b] group-hover/badge:scale-110 transition-transform duration-200 shrink-0" />
                  <span className="text-sm font-medium text-slate-800 group-hover/badge:text-gray-900 transition-colors">
                    1 Año de Garantía
                  </span>
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* BARRA INFERIOR SEPARADA: Copyright + Crédito Kvke Studio */}
        <div className="mt-14 pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500 font-normal">
            © {currentYear} RD Spring. Todos los derechos reservados.
          </p>

          <p className="text-xs text-slate-500 tracking-wider flex items-center min-h-[44px]">
            Diseño y desarrollo por{' '}
            <a 
              href="https://www.instagram.com/kvkestudio/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="ml-1.5 font-bold text-slate-700 hover:text-[#b3131b] hover:underline transition-colors min-h-[44px] inline-flex items-center px-1"
            >
              Kvke Studio
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}