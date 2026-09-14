import Link from 'next/link';
import { STORE_CONFIG } from '@/config/constants';

export default async function SuccessPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = await searchParams;
  const buyOrder = params.buyOrder as string;
  const amount = params.amount ? parseInt(params.amount as string) : 0;
  const authorizationCode = params.authorizationCode as string;

  if (!buyOrder) {
    return <div className="min-h-screen bg-white text-gray-900 flex items-center justify-center"><p>Parámetros inválidos.</p></div>;
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 pt-28 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="w-20 h-20 bg-[#b3131b]/20 text-[#b3131b] rounded-full flex items-center justify-center mx-auto mb-8 text-4xl font-bold border border-[#b3131b]/50">✓</div>
        <p className="text-xs uppercase tracking-[0.25em] text-[#b3131b]  mb-4">TRANSACCIÓN APROBADA</p>
        <h1 className="text-4xl font-bold uppercase tracking-tight mb-8">Pedido Confirmado</h1>
        <div className="border border-gray-200 bg-gray-50 p-8 text-left mb-8">
          <h2 className="text-xs uppercase tracking-widest text-gray-600 mb-6 font-bold border-b border-gray-200 pb-4">DETALLES DEL PAGO</h2>
          <div className="grid grid-cols-2 gap-y-4  text-sm">
            <div className="text-gray-500">Orden de Compra:</div><div className="text-gray-900 text-right">{buyOrder}</div>
            <div className="text-gray-500">Cód. Autorización:</div><div className="text-gray-900 text-right">{authorizationCode}</div>
            <div className="text-gray-500 pt-4 border-t border-gray-200">Monto Total:</div>
            <div className="text-[#b3131b] text-right font-bold pt-4 border-t border-gray-200">{STORE_CONFIG.CURRENCY_FORMAT.format(amount)}</div>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-8 leading-relaxed max-w-lg mx-auto">
          Hemos enviado un comprobante a tu correo electrónico. Prepararemos tu pedido según los tiempos de entrega seleccionados.
        </p>
        <Link href="/catalogo" className="bg-transparent border border-gray-300 text-gray-900 font-bold px-8 py-3 uppercase tracking-wider hover:bg-white/10 text-xs transition">VOLVER AL CATÁLOGO</Link>
      </div>
    </div>
  );
}
