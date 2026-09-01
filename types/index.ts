export type ProductType = 'cotizacion' | 'venta_online';

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  brand: string;
  category: string;
  type: string;
  price: number;
  image: string;
  imageHover?: string;
  vehicleBrands: string[];
}
  // Marcas de auto donde este repuesto es compatible (ej. ["BMW"], ["Audi"]).
  // Distinto de `brand`, que es el fabricante del repuesto (ej. "BILSTEIN", "TRW").
  vehicleBrands: string[];
  category: string;
  description: string;
  compatibility: string[];
  specs: Record<string, string>;
}
