import Link from 'next/link';
import { STORE_CONFIG } from '@/config/constants';
import { CheckCircle2, PackageCheck, ShoppingBag, ArrowRight, ShieldCheck, Truck, FileText } from 'lucide-react';

export default async function SuccessPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = await searchParams;
  const buyOrder = params.buyOrder as string;
  const amount = params.amount ? parseInt(params.amount as string) : 0;
  const authorizationCode = params.authorizationCode as string;

  if (!buyOrder) {
    return (
      <div className="min-h-screen bg-slate-50/50 text-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md bg-white rounded-3xl border border-slate-200/80 p-8 text-center shadow-sm">
          <p className="text-sm font-bold text-gray-900 mb-4">No se recibieron parámetros válidos de la transacción.</p>
          <Link href="/catalogo" className="bg-slate-900 hover:bg-black text-white text-xs font-bold px-6 py-3 rounded-xl uppercase tracking-wider">
            Ir al Catálogo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 text-gray-900 pt-28 sm:pt-32 pb-24 font-sans">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Sello de Aprobación */}
        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-emerald-200 shadow-sm ring-8 ring-emerald-50/50">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-mono font-bold uppercase tracking-wider mb-3">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>TRANSACCIÓN APROBADA POR WEBPAY</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-gray-900 mb-3">
          ¡Pedido Confirmado!
        </h1>
        <p className="text-sm text-slate-500 mb-8 max-w-md mx-auto font-medium">
          Hemos recibido tu pago con éxito. Te enviamos el comprobante y detalle de compra a tu correo electrónico.
        </p>

        {/* Ficha Resumen de Transacción */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-7 sm:p-9 text-left mb-8 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#b3131b]" />
              <h2 className="text-xs font-mono uppercase tracking-wider text-gray-900 font-bold">
                Comprobante Oficial de Pago
              </h2>
            </div>
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
              PAGADO
            </span>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex justify-between items-center text-slate-600">
              <span>Orden de Compra:</span>
              <span className="font-mono font-bold text-gray-900 text-sm">{buyOrder}</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>Código de Autorización:</span>
              <span className="font-mono font-bold text-gray-900">{authorizationCode || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>Medio de Pago:</span>
              <span className="font-medium text-gray-900">Webpay Plus (Débito / Crédito)</span>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-slate-100 text-sm">
              <span className="font-bold text-gray-900 uppercase">Monto Total Pagado:</span>
              <span className="text-xl font-black text-[#b3131b] font-mono">
                {STORE_CONFIG.CURRENCY_FORMAT.format(amount)}
              </span>
            </div>
          </div>
        </div>

        {/* Próximos pasos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 text-left">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-[#b3131b] flex items-center justify-center shrink-0">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide">Preparación</h4>
              <p className="text-xs text-slate-500 mt-1">Verificamos el empaque de fábrica y número de parte.</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-[#b3131b] flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide">Despacho</h4>
              <p className="text-xs text-slate-500 mt-1">Te notificaremos por correo apenas tu paquete vaya en camino.</p>
            </div>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link 
            href={`/soporte?order=${buyOrder}`}
            className="flex items-center justify-center gap-2 bg-[#b3131b] hover:bg-[#8f0f15] text-white font-bold px-7 py-3.5 rounded-xl uppercase tracking-wider text-xs transition-colors shadow-xs"
          >
            <span>Seguir mi Pedido</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link 
            href="/catalogo" 
            className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white font-bold px-7 py-3.5 rounded-xl uppercase tracking-wider text-xs transition-colors shadow-2xs"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Volver a la Tienda</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
