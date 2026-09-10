import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { STORE_CONFIG } from "@/config/constants";



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

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-28 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold uppercase tracking-tight mb-8">Mi Perfil</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Columna Izquierda: Datos del Usuario */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-[#121212] border border-white/10 p-6 rounded-lg">
              <p className="text-xs uppercase font-mono tracking-widest text-[#FF0000] mb-4">Datos de la Cuenta</p>
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] text-gray-500 font-mono uppercase">Nombre</p>
                  <p className="text-sm font-bold">{user.name}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 font-mono uppercase">Correo Electrónico</p>
                  <p className="text-sm">{user.email}</p>
                </div>
                {/* Bloque de "Rol de Cuenta" eliminado limpiamente */}
              </div>
            </div>
          </div>

          {/* Columna Derecha: Historial de Pedidos */}
          <div className="md:col-span-2">
            <div className="bg-[#121212] border border-white/10 p-6 rounded-lg min-h-full">
              <p className="text-xs uppercase font-mono tracking-widest text-[#FF0000] mb-6">Historial de Pedidos</p>
              
              {user.orders.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-sm font-mono text-gray-500 mb-4">Aún no tienes pedidos registrados.</p>
                  <Link href="/catalogo" className="text-xs font-mono uppercase tracking-widest text-[#FF0000] hover:text-white transition-colors border border-white/20 px-4 py-2 rounded">
                    Ir a la tienda
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {user.orders.map((order) => (
                    <div key={order.id} className="border border-white/10 p-4 rounded bg-[#0a0a0a] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <p className="text-xs font-mono text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString('es-CL')}
                        </p>
                        <p className="text-sm font-bold font-mono text-white mt-1">
                          Orden #{order.buyOrder}
                        </p>
                      </div>
                      
                      <div className="flex flex-col sm:items-end gap-2">
                        <p className="text-sm font-bold text-white font-mono">
                          {STORE_CONFIG.CURRENCY_FORMAT.format(order.amount)}
                        </p>
                        <span className={`text-[10px] font-mono uppercase tracking-widest px-2 py-1 rounded border ${
                          order.shippingStatus === 'ENTREGADO' 
                            ? 'border-emerald-500/30 text-emerald-500 bg-emerald-500/10'
                            : 'border-[#FF0000]/30 text-[#FF0000] bg-[#FF0000]/10'
                        }`}>
                          {order.shippingStatus}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}