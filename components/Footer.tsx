import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#121212] border-t border-white/10 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-1 font-bold text-xl tracking-tighter mb-4">
              <span className="text-[#FF0000]">RD</span><span className="text-white">SPRING</span>
            </Link>
            <p className="text-xs text-gray-400 font-mono leading-relaxed max-w-sm">
              La ingeniería que sostiene el lujo en movimiento. Componentes y fluidos de alto rendimiento en Santiago de Chile.
            </p>
          </div>
          <div>
            <h4 className="text-[10px] uppercase tracking-widest text-[#FF0000] font-mono mb-4">Repuestos</h4>
            <ul className="space-y-2 text-xs font-mono text-gray-400">
              <li><Link href="/cotizacion" className="hover:text-white">Cotizar repuesto</Link></li>
              <li><Link href="/catalogo" className="hover:text-white">Aceites y Lubricantes</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[10px] uppercase tracking-widest text-[#FF0000] font-mono mb-4">Atención al Cliente</h4>
            <ul className="space-y-2 text-xs font-mono text-gray-400">
              <li><Link href="/soporte" className="hover:text-white">Soporte y Contacto</Link></li>
              <li><Link href="/terminos" className="hover:text-white">Términos y Condiciones</Link></li>
              <li><Link href="/garantia" className="hover:text-white">Políticas de Garantía</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-8 text-center text-[10px] font-mono text-gray-600 uppercase tracking-widest">
          © {new Date().getFullYear()} RD Spring. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
