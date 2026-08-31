export type ProductType = 'cotizacion' | 'venta_online';

export interface Product {
  id: string;
  slug: string;
  name: string;
  sku: string;
  price: number;
  type: ProductType;
  stock?: number;
  image: string;
  brand: string;
  // Marcas de auto donde este repuesto es compatible (ej. ["BMW"], ["Audi"]).
  // Distinto de `brand`, que es el fabricante del repuesto (ej. "BILSTEIN", "TRW").
  vehicleBrands: string[];
  category: string;
  description: string;
  compatibility: string[];
  specs: Record<string, string>;
}
