import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { isOilOrLubricant, isSparePart } from "@/lib/product-classification";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;

    if (!session || userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // 1. Consultas a la base de datos Turso / SQLite
    let products: any[] = [];
    let paidOrders: any[] = [];

    try {
      [products, paidOrders] = await Promise.all([
        prisma.product.findMany({
          orderBy: { updatedAt: 'desc' },
        }),
        prisma.order.findMany({
          where: { status: { in: ['PAID', 'PAGADO'] } },
          orderBy: { createdAt: 'desc' },
        }),
      ]);
    } catch (dbErr) {
      console.warn('Advertencia consultando Turso en /api/admin/stats, usando fallback seguro:', dbErr);
    }

    // 2. Clasificación estricta: Repuestos (Inventario Propio) vs Aceites ROWE (Bajo Pedido)
    const repuestosProducts = products.filter((p) => isSparePart(p));
    const lubricantesProducts = products.filter((p) => isOilOrLubricant(p));

    // IMPORTANTE: Los aceites NO son stock físico propio de RD SPRING (se compran bajo pedido y se envían).
    // Por lo tanto, el inventario físico y la valorización corresponden EXCLUSIVAMENTE a los repuestos.
    const repuestosStock = repuestosProducts.reduce((sum, p) => sum + (p.stock || 0), 0);
    const totalUnits = repuestosStock;

    // Valorización real del inventario propio (solo repuestos físicos en stock)
    const inventoryValuation = repuestosProducts.reduce((acc, p) => {
      const price = Number(p.price) || 0;
      const stock = Number(p.stock) || 0;
      return acc + (price * stock);
    }, 0);

    // Alertas de Stock Bajo (repuestos con stock <= 2)
    const lowStockRepuestos = repuestosProducts
      .filter((p) => (p.stock ?? 0) <= 2)
      .sort((a, b) => (a.stock || 0) - (b.stock || 0))
      .map((p) => ({
        id: p.id,
        name: p.name,
        sku: p.sku || 'S/SKU',
        brand: p.brand || 'OEM',
        category: p.category || 'Repuesto',
        stock: p.stock ?? 0,
        price: p.price || 0,
        image: p.image || '/images/logo-rd.png',
      }));

    // Repuestos completamente agotados (stock === 0)
    const outOfStockRepuestos = repuestosProducts
      .filter((p) => (p.stock ?? 0) === 0)
      .map((p) => ({
        id: p.id,
        name: p.name,
        sku: p.sku || 'S/SKU',
        brand: p.brand || 'OEM',
        category: p.category || 'Repuesto',
        stock: 0,
        price: p.price || 0,
        image: p.image || '/images/logo-rd.png',
      }));

    // 3. Ventas reales del mes en curso
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const monthsNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    const currentMonthLabel = `${monthsNames[currentMonth]} ${currentYear}`;

    const currentMonthOrders = paidOrders.filter((o) => {
      const d = new Date(o.createdAt);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    });

    const currentMonthSales = currentMonthOrders.reduce((sum, o) => sum + (Number(o.amount) || 0), 0);
    const totalSales = paidOrders.reduce((sum, o) => sum + (Number(o.amount) || 0), 0);
    const ordersCount = paidOrders.length;

    // 4. Gráfico de Facturación vs Inventario (Estricto datos reales)
    const chartData = [
      {
        period: `${monthsNames[currentMonth].slice(0, 3)} ${currentYear.toString().slice(-2)}`,
        sales: currentMonthSales,
        stockValue: inventoryValuation,
        orders: currentMonthOrders.length,
      }
    ];

    // Órdenes pendientes de despacho
    const pendingOrdersCount = paidOrders.filter((o) =>
      ['CONFIRMADO', 'PREPARANDO', 'LISTO_PARA_RETIRO'].includes(o.shippingStatus)
    ).length;

    return NextResponse.json({
      adminName: session?.user?.name || 'Administrador',
      currentDate: new Date().toLocaleDateString('es-CL', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      kpis: {
        totalUnits,
        repuestosStock,
        repuestosCount: repuestosProducts.length,
        lubricantesCount: lubricantesProducts.length,
        totalProducts: products.length,
        inventoryValuation,
        lowStockCount: lowStockRepuestos.length,
        lowStockItems: lowStockRepuestos,
        outOfStockCount: outOfStockRepuestos.length,
        outOfStockItems: outOfStockRepuestos,
      },
      sales: {
        currentMonthSales,
        currentMonthOrdersCount: currentMonthOrders.length,
        currentMonthLabel,
        totalSales,
        totalOrdersCount: ordersCount,
        pendingOrdersCount,
      },
      chartData,
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas en /api/admin/stats:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
