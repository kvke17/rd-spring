import Fuse, { type IFuseOptions } from 'fuse.js';

/**
 * Normaliza consultas automotrices para búsqueda tolerante:
 * - Elimina acentos/diacríticos y unifica a minúsculas
 * - Normaliza errores ortográficos comunes de marcas (ej: "porshe" -> "porsche", "mercede" -> "mercedes")
 * - Estandariza variantes de viscosidad (ej: "5 30", "5-30", "5w30" -> "5w-30")
 * - Limpia palabras de relleno ("aceite", "lubricante", "líquido", etc.) sin vaciar la consulta
 */
export function normalizeAutomotiveQuery(rawQuery: string): string {
  if (!rawQuery) return '';

  // 1. Quitar acentos/diacríticos y caracteres especiales
  let clean = rawQuery
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

  // 2. Normalización de viscosidades con regex
  // "5 30", "5 - 30", "5-30", "0 20", "10 40", "15 40", "5 40" -> "5w-30", etc.
  clean = clean.replace(/\b([0-9]{1,2})\s*[- ]\s*([0-9]{2})\b/gi, '$1w-$2');

  // "5w30" -> "5w-30", "0w20" -> "0w-20", "5w40" -> "5w-40", "10w40" -> "10w-40"
  clean = clean.replace(/\b([0-9]{1,2})w([0-9]{2})\b/gi, '$1w-$2');

  // 3. Estandarización de errores tipográficos en marcas de autos y lubricantes
  const brandReplacements: [RegExp, string][] = [
    [/\b(porshe|porche|prosche|porsh)\b/gi, 'porsche'],
    [/\b(mercedez-benz|mercedez benz|mercedes benz|mercedez|mercede)\b/gi, 'mercedes-benz'],
    [/\b(volskwagen|volkwagen|volksvagen|volkswagon|vw)\b/gi, 'volkswagen'],
    [/\b(bm|bwm|beamer)\b/gi, 'bmw'],
    [/\b(row|rowe oil|rowee)\b/gi, 'rowe'],
    [/\b(landrover|land-rover)\b/gi, 'land rover'],
  ];

  for (const [regex, replacement] of brandReplacements) {
    clean = clean.replace(regex, replacement);
  }

  // 4. Limpieza de sinónimos genéricos de aceites y palabras de relleno
  // Eliminamos: aceite, aceites, acete, acetes, liquido, liquidos, lubricante, lubricantes
  const fillerRegex = /\b(aceite|aceites|acete|acetes|liquido|liquidos|lubricante|lubricantes|para|de|del|el|la|los|las)\b/gi;
  const stripped = clean.replace(fillerRegex, ' ').replace(/\s+/g, ' ').trim();

  // Si al quitar las palabras de relleno quedó algo útil (ej: "5w-30" o "rowe"), usamos eso.
  // Si la búsqueda era SOLO "aceite", dejamos "aceite".
  return stripped.length > 0 ? stripped : clean;
}

/**
 * Extrae la viscosidad normalizada si está presente en la consulta (ej. "5w-30", "0w-20")
 */
export function extractViscosityFromQuery(query: string): string | null {
  const normalized = normalizeAutomotiveQuery(query);
  const match = normalized.match(/\b([0-9]{1,2}w-[0-9]{2})\b/i);
  return match ? match[1].toUpperCase() : null;
}

/**
 * Detecta si una consulta corresponde a repuestos / suspensión en lugar de lubricantes
 */
export function isSuspensionQuery(query: string): boolean {
  if (!query) return false;
  const clean = normalizeAutomotiveQuery(query);

  const suspensionKeywords = [
    'amortiguador',
    'amortiguadores',
    'fuelle',
    'fuelles',
    'balon',
    'balones',
    'compresor',
    'compresores',
    'suspension',
    'suspensiones',
    'neumatica',
    'chasis',
    'chassis',
    'coilover',
    'coilovers',
    'resorte',
    'resortes',
    'espiral',
    'espirales',
    'brazo',
    'brazos',
    'parrilla',
    'parrillas',
    'bieleta',
    'bieletas',
    'rotula',
    'rotulas',
    'freno',
    'frenos',
    'pastilla',
    'pastillas',
    'disco',
    'discos',
    'strut',
  ];

  return suspensionKeywords.some((kw) => clean.includes(kw));
}

/**
 * Motor de búsqueda difusa (Fuzzy Search) configurado con Fuse.js
 * Threshold 0.35 para balancear tolerancia a errores ortográficos sin falsos positivos.
 */
export function createProductSearchEngine<T>(
  products: T[],
  keys: (keyof T | string)[] = [
    'name',
    'slug',
    'viscosity',
    'brand',
    'approvals',
    'description',
    'sku',
    'category',
  ],
  options: Partial<IFuseOptions<T>> = {}
): Fuse<T> {
  const defaultOptions: IFuseOptions<T> = {
    threshold: 0.35,
    ignoreLocation: true,
    minMatchCharLength: 2,
    keys: keys as string[],
    ...options,
  };

  return new Fuse(products, defaultOptions);
}
