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
  stock?: number; // Agregado para que Zustand no arroje errores en el carrito
  image: string;
  imageHover?: string;
  
  // Marcas de auto donde este repuesto es compatible (ej. ["BMW"], ["Audi"]).
  // Distinto de `brand`, que es el fabricante del repuesto (ej. "BILSTEIN", "TRW").
  vehicleBrands: string[];
  
  description: string;
  compatibility: string[];
  specs: Record<string, string>;
}