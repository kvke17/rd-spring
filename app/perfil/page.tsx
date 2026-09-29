import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { STORE_CONFIG } from "@/config/constants";
import ChangePasswordForm from "@/components/ChangePasswordForm";
import { User, Package, Calendar, ChevronRight, ShoppingBag, ShieldCheck, ArrowRight } from "lucide-react";

export default async function PerfilPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user?.email as string },
    include: {
      orders: {
        orderBy: { createdAt: 'desc' } 
      }
    }
  });

  if (!user) {
    redirect("/login");
  }

  const initials = (user.name || user.email || 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50/50 text-gray-900 pt-28 sm:pt-32 pb-24 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Encabezado */}
        <div className="mb-10 text-center sm:text-left flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200/80 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-100 text-[#b3131b] text-[10px] font-mono font-bold uppercase tracking-wider mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>CUENTA VERIFICADA</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-gray-900">
              Mi Perfil
            </h1>
            <p className="text-sm text-slate-500 mt-1 font-medium">
              Administra tus datos personales y revisa el historial y estado de tus compras.
            </p>
          </div>

          <Link
            href="/catalogo"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-gray-900 bg-white border border-slate-200/80 px-4 py-2.5 rounded-xl shadow-2xs transition-colors self-start sm:self-auto"
          >
            <ShoppingBag className="w-4 h-4 text-[#b3131b]" />
            <span>Ir a la Tienda</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Columna Izquierda: Datos del Usuario y Seguridad */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-7 shadow-sm">
              
              {/* Avatar + Info básica */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-lg shadow-sm">
                  {initials}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-gray-900 text-base truncate">{user.name || 'Cliente'}</h3>
                  <p className="text-xs text-slate-500 truncate font-mono">{user.email}</p>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div>
                  <span className="block text-[10px] font-mono uppercase tracking-wider text-slate-400">Nombre Completo</span>
                  <span className="text-sm font-bold text-slate-800">{user.name || 'Sin registrar'}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-mono uppercase tracking-wider text-slate-400">Email Asociado</span>
                  <span className="text-sm text-slate-800 font-medium">{user.email}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-mono uppercase tracking-wider text-slate-400">Total de Pedidos</span>
                  <span className="text-sm font-bold text-gray-900">{user.orders.length} pedidos realizados</span>
                </div>
              </div>

              {/* Formulario de cambio de contraseña */}
              <ChangePasswordForm email={user.email} />
            </div>
          </div>

          {/* Columna Derecha: Historial de Pedidos */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-7 sm:p-9 shadow-sm min-h-full">
              
              <div className="flex items-center justify-between pb-6 border-b border-slate-100 mb-6">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#b3131b]" />
                  <h2 className="text-base font-bold uppercase tracking-tight text-gray-900">
                    Historial de Pedidos
                  </h2>
                </div>
                <span className="text-xs font-mono text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                  {user.orders.length} {user.orders.length === 1 ? 'orden' : 'órdenes'}
                </span>
              </div>
              
              {user.orders.length === 0 ? (
                <div className="text-center py-16 bg-slate-50/50 rounded-2xl border border-slate-100 p-8">
                  <div className="w-14 h-14 bg-red-50 text-[#b3131b] rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Package className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-1">Aún no tienes pedidos registrados</h3>
                  <p className="text-xs text-slate-500 mb-6 max-w-sm mx-auto">
                    Cuando adquieras aceites, fluidos o repuestos en nuestra tienda, tus órdenes aparecerán aquí con seguimiento en tiempo real.
                  </p>
                  <Link 
                    href="/catalogo" 
                    className="inline-flex items-center gap-2 bg-[#b3131b] hover:bg-[#8f0f15] text-white font-bold px-6 py-3 rounded-xl uppercase tracking-wider text-xs transition-colors shadow-xs"
                  >
                    <span>Explorar Catálogo</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {user.orders.map((order) => {
                    const isDelivered = order.shippingStatus === 'ENTREGADO';
                    return (
                      <div 
                        key={order.id} 
                        className="rounded-2xl border border-slate-200/80 p-5 bg-white hover:border-slate-300 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-2xs"
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-sm font-black text-gray-900 font-mono">
                              #{order.buyOrder}
                            </span>
                            <span className={`text-[10px] font-mono uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-full border ${
                              isDelivered 
                                ? 'border-emerald-200 text-emerald-700 bg-emerald-50'
                                : 'border-red-200 text-[#b3131b] bg-red-50'
                            }`}>
                              {order.shippingStatus || 'EN PROCESO'}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>
                              {new Date(order.createdAt).toLocaleDateString('es-CL', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                          <div className="text-left sm:text-right">
                            <span className="block text-[10px] font-mono uppercase tracking-wider text-slate-400">Total</span>
                            <span className="text-base font-black text-gray-900">
                              {STORE_CONFIG.CURRENCY_FORMAT.format(order.amount)}
                            </span>
                          </div>

                          <Link
                            href={`/soporte?order=${order.buyOrder}`}
                            className="inline-flex items-center gap-1 text-xs font-bold text-[#b3131b] hover:text-[#8f0f15] bg-red-50 hover:bg-red-100/70 px-3 py-2 rounded-xl transition-colors shrink-0"
                          >
                            <span>Seguimiento</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}