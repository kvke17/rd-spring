import Link from 'next/link';
import { STORE_CONFIG } from '@/config/constants';

export default async function SuccessPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = await searchParams;
  const buyOrder = params.buyOrder as string;
  const amount = params.amount ? parseInt(params.amount as string) : 0;
  const authorizationCode = params.authorizationCode as string;

  if (!buyOrder) {
    return <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center"><p>Parámetros inválidos.</p></div>;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-28 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="w-20 h-20 bg-[#E88A5C]/20 text-[#E88A5C] rounded-full flex items-center justify-center mx-auto mb-8 text-4xl font-bold border border-[#E88A5C]/50">✓</div>
        <p className="text-xs uppercase tracking-[0.25em] text-[#E88A5C] font-mono mb-4">TRANSACCIÓN APROBADA</p>
        <h1 className="text-4xl font-bold uppercase tracking-tight mb-8">Pedido Confirmado</h1>
        <div className="border border-white/10 bg-[#121212] p-8 text-left mb-8">
          <h2 className="text-xs uppercase tracking-widest text-gray-400 mb-6 font-bold border-b border-white/10 pb-4">DETALLES DEL PAGO</h2>
          <div className="grid grid-cols-2 gap-y-4 font-mono text-sm">
            <div className="text-gray-500">Orden de Compra:</div><div className="text-white text-right">{buyOrder}</div>
            <div className="text-gray-500">Cód. Autorización:</div><div className="text-white text-right">{authorizationCode}</div>
            <div className="text-gray-500 pt-4 border-t border-white/10">Monto Total:</div>
            <div className="text-[#E88A5C] text-right font-bold pt-4 border-t border-white/10">{STORE_CONFIG.CURRENCY_FORMAT.format(amount)}</div>
          </div>
        </div>
        <p className="text-sm text-gray-400 mb-8 leading-relaxed max-w-lg mx-auto">
          Hemos enviado un comprobante a tu correo electrónico. Prepararemos tu pedido según los tiempos de entrega seleccionados.
        </p>
        <Link href="/catalogo" className="bg-transparent border border-white/20 text-white font-bold px-8 py-3 uppercase tracking-wider hover:bg-white/10 text-xs transition">VOLVER AL CATÁLOGO</Link>
      </div>
    </div>
  );
}
