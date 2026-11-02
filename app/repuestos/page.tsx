import type { Metadata } from 'next';
import RepuestosClient from '@/components/repuestos/RepuestosClient';

export const metadata: Metadata = {
  title: 'Catálogo de Suspensión y Repuestos Porsche, BMW y Audi',
  description:
    'Amortiguadores, fuelles de suspensión neumática y compresores OEM para Porsche (Macan, Cayenne, 911), BMW y Mercedes-Benz. Envíos a todo Chile y asesoría técnica con VIN.',
  alternates: {
    canonical: 'https://www.rdspring.cl/repuestos',
  },
  openGraph: {
    title: 'Catálogo de Suspensión y Repuestos Porsche, BMW y Audi | RD Spring',
    description:
      'Amortiguadores, fuelles de suspensión neumática y compresores OEM para Porsche (Macan, Cayenne, 911), BMW y Mercedes-Benz. Envíos a todo Chile y asesoría técnica con VIN.',
    url: 'https://www.rdspring.cl/repuestos',
    siteName: 'RD Spring Chile',
    locale: 'es_CL',
    type: 'website',
  },
};

export default function RepuestosPage() {
  return <RepuestosClient />;
}
