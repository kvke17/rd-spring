import DashboardOverview from '@/components/admin/DashboardOverview';

export const metadata = {
  title: 'Panel / Resumen | RD SPRING Admin',
  description: 'Monitoreo en tiempo real de catálogo y pedidos de RD SPRING.',
};

export default function AdminDashboardPage() {
  return <DashboardOverview />;
}
