export interface CatalogFormat {
  size: string; // e.g. "1LT", "4LT", "5LT"
  sku: string;
  price: number;
  stock: number;
}

export interface CatalogOilProduct {
  id: string;
  sku: string;
  name: string;
  slug: string;
  brand: string;
  category: string;
  type: string;
  image: string;
  description: string;
  specs: Record<string, string> | null;
  compatibility: string[];
  formats: CatalogFormat[];
  viscosity: string; // e.g. "5W-30", "5W-40", "10W-40"
  approvals: string[]; // e.g. ["porsche", "bmw", "mb", "vw", "racing", "ford", "gm"]
  lowestPrice: number;
  highestPrice: number;
  isFeatured?: boolean;
}

export type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';

export interface FilterState {
  searchQuery: string;
  viscosities: string[];
  formats: string[];
  approvals: string[];
  sort: SortOption;
}
