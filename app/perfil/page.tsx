import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import ProfileDashboard from "@/components/profile/ProfileDashboard";

export const dynamic = 'force-dynamic';

export default async function PerfilPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user?.email) {
    redirect("/login?callbackUrl=/perfil");
  }

  const cleanEmail = session.user.email.toLowerCase().trim();

  const user = await prisma.user.findUnique({
    where: { email: cleanEmail },
    include: {
      orders: {
        where: { status: { in: ['PAID', 'PAGADO'] } },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  // Extraer teléfono y RUT de compras previas si existen
  let latestPhone = '';
  let latestRut = '';
  
  if (user.orders && user.orders.length > 0) {
    for (const o of user.orders) {
      try {
        const cust = typeof o.customer === 'string' ? JSON.parse(o.customer) : o.customer;
        if (cust?.phone && !latestPhone) latestPhone = cust.phone;
        if (cust?.rut && !latestRut) latestRut = cust.rut;
      } catch {}
    }
  }

  // Formatear órdenes pagadas
  const formattedOrders = user.orders.map((order) => {
    let itemsData: any[] = [];
    try {
      itemsData = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []);
    } catch {
      itemsData = [];
    }

    return {
      id: order.id,
      buyOrder: order.buyOrder,
      amount: order.amount,
      shippingStatus: order.shippingStatus,
      createdAt: order.createdAt.toISOString(),
      documentType: order.documentType || 'BOLETA',
      itemsSummary: itemsData.map((i: any) => `${i.quantity}x ${i.product?.name || i.name || i.productId}`).join(', '),
      items: itemsData.map((i: any) => ({
        id: i.id || i.productId,
        name: i.product?.name || i.name || i.productId,
        quantity: i.quantity || 1,
        price: i.price || (i.product?.price ?? 0),
      })),
    };
  });

  const userData = {
    id: user.id,
    name: user.name || 'Cliente',
    email: user.email,
    role: user.role || 'CUSTOMER',
    twoFactorEnabled: !!user.twoFactorEnabled,
    createdAt: user.createdAt.toISOString(),
    phone: latestPhone,
    rut: latestRut,
  };

  return <ProfileDashboard user={userData} orders={formattedOrders} />;
}