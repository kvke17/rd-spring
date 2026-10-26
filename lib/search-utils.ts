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
 * Detecta si una consulta corresponde inequívocamente a aceites, fluidos o lubricantes ROWE.
 */
export function isOilSearchQuery(rawQuery: string): boolean {
  if (!rawQuery) return false;
  const clean = rawQuery
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

  // 1. Términos directos de aceites y lubricantes
  const oilKeywords = [
    'aceite',
    'aceites',
    'acete',
    'acetes',
    'lubricante',
    'lubricantes',
    'lubricacion',
    'fluido',
    'fluidos',
    'rowe',
    'hightec',
    'synt',
    'multi formula',
    'multiformula',
    'formula',
    'viscosidad',
    'viscosidades',
    'motoroil',
    'motor oil',
    'aditivo',
    'aditivos',
    'refrigerante',
    'anticongelante',
    'atf',
    'valvulina',
    'dot4',
    'dot 4',
    'dot 5',
    'dot5',
    'liquido freno',
    'dpf',
    'dls',
    'hc-o',
    'hc-synthese',
    'synthese',
  ];

  if (oilKeywords.some((kw) => clean.includes(kw))) {
    return true;
  }

  // 2. Patrones de viscosidades: "5w-30", "5w30", "0w-20", "10w-40", "15w40", "5 30", etc.
  if (/\b\d{1,2}\s?w[- ]?\d{2}\b/i.test(clean)) {
    return true;
  }
  const matchTwoNumbers = clean.match(/\b([0-9]{1,2})\s*[- ]\s*([0-9]{2})\b/);
  if (matchTwoNumbers) {
    const n1 = parseInt(matchTwoNumbers[1], 10);
    const n2 = parseInt(matchTwoNumbers[2], 10);
    if ([0, 5, 10, 15, 20].includes(n1) && [16, 20, 30, 40, 50, 60].includes(n2)) {
      return true;
    }
  }

  // 3. Homologaciones de lubricantes conocidas
  if (/\b(longlife|ll-01|ll-04|ll01|ll04|dexos|rn0700|rn0710|504\s?00|507\s?00|229\.[135]\b)/i.test(clean)) {
    return true;
  }

  // 4. SKU oficial de ROWE (ej: 20118, 20125, 20xxx)
  if (/\b20\d{3}(?:-\d{4}-\d{2})?\b/.test(clean)) {
    return true;
  }

  return false;
}

/**
 * Detecta si una consulta corresponde a repuestos automotrices (refrigeración, iluminación, vidrios, carrocería, suspensión, frenos, motor).
 */
export function isSparePartSearchQuery(rawQuery: string): boolean {
  if (!rawQuery) return false;
  const clean = rawQuery
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

  // 1. Términos mecánicos, componentes y partes de vehículo
  const sparePartKeywords = [
    // Refrigeración y motor
    'radiador',
    'radiadores',
    'intercooler',
    'condensador',
    'electroventilador',
    'ventilador',
    'termostato',
    'bomba de agua',
    'deposito',
    'manguera',
    'manguito',
    'enfriador',
    // Iluminación y ópticas
    'foco',
    'focos',
    'faro',
    'faros',
    'optica',
    'opticas',
    'intermitente',
    'intermitentes',
    'neblinero',
    'neblineros',
    'luz',
    'luces',
    'xenon',
    'led',
    'calavera',
    'calaveras',
    'ampolleta',
    'ampolletas',
    // Vidrios, cristales y carrocería
    'luneta',
    'lunetas',
    'parabrisas',
    'espejo',
    'espejos',
    'retrovisor',
    'retrovisores',
    'cristal',
    'cristales',
    'vidrio',
    'vidrios',
    'alzacristal',
    'alzacristales',
    'paragolpe',
    'paragolpes',
    'parachoque',
    'parachoques',
    'capot',
    'capo',
    'maleta',
    'porton',
    'guardabarro',
    'guardabarros',
    'tapabarro',
    'tapabarros',
    'spoiler',
    'aleron',
    'moldura',
    'molduras',
    'rejilla',
    'grilla',
    'manilla',
    'manillas',
    'manija',
    'chapa',
    'cerradura',
    // Suspensión y chasis
    'amortiguador',
    'amortiguadores',
    'fuelle',
    'fuelles',
    'balon',
    'balones',
    'bolsa de aire',
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
    'barra estabilizadora',
    'buje',
    'bujes',
    'strut',
    'cuna',
    'soporte',
    // Frenos
    'freno',
    'frenos',
    'pastilla',
    'pastillas',
    'disco',
    'discos',
    'caliper',
    'calipers',
    'balata',
    'balatas',
    'servo',
    // Transmisión y dirección
    'cremallera',
    'direccion',
    'homocinetica',
    'semieje',
    'semi-eje',
    'eje',
    'cardan',
    'diferencial',
    'caja de cambios',
    'transmision',
    'embrague',
    'clutch',
    'bimasa',
    // Motor y escape
    'turbo',
    'turbocompresor',
    'multiple',
    'escape',
    'catalizador',
    'silenciador',
    'valvula',
    'valvulas',
    'egr',
    'inyector',
    'inyectores',
    'bujia',
    'bujias',
    'bobina',
    'bobinas',
    'alternador',
    'arranque',
    'motor de arranque',
    'correa',
    'distribucion',
    'tensor',
    'tensores',
    'polea',
    'poleas',
    'culata',
    'piston',
    'biela',
    'carter',
    // Sensores y electrónica
    'sensor',
    'sensores',
    'sonda lambda',
    'caudalimetro',
    'maf',
    'map',
    'modulo',
    'ecu',
    'relay',
    'fusible',
    // Términos generales de repuestos
    'repuesto',
    'repuestos',
    'pieza',
    'piezas',
    'recambio',
    'recambios',
    'parte',
    'partes',
    'oem',
    'vin',
    // Modelos de autos específicos en RD Spring
    'macan',
    'cayenne',
    'panamera',
    'boxster',
    'cayman',
    '911',
    '991',
    '992',
    '997',
    '996',
    '987',
    '981',
    '718',
    'taycan',
    'evoque',
    'velar',
    'discovery',
    'defender',
    'range rover',
  ];

  if (sparePartKeywords.some((kw) => clean.includes(kw))) {
    return true;
  }

  // 2. Patrón de código OEM Porsche / Europeo (ej: 95B121251, 9P0945095B, 9Y0845052R)
  if (/^9[a-z0-9]{8,11}$/i.test(clean) || /\b[0-9]{3}[a-z0-9]{6,8}\b/i.test(clean)) {
    return true;
  }

  // 3. Marcas de vehículos cuando no se menciona explícitamente lubricante/aceite
  const carBrands = ['porsche', 'audi', 'land rover', 'mercedes-benz', 'mercedes', 'volkswagen', 'bmw'];
  if (carBrands.some((brand) => clean.includes(brand))) {
    return true;
  }

  return false;
}

/**
 * Determina de forma inteligente el catálogo de destino para cualquier búsqueda global:
 * - Si busca repuestos (radiador, focos, amortiguador, luneta, frenos, macan, etc.) -> '/repuestos'
 * - Si busca aceites/lubricantes (5w-30, aceite, rowe, synt, viscosidad, etc.) -> '/catalogo'
 * - Maneja de forma inteligente consultas mixtas (ej: "aceite porsche" -> /catalogo, "radiador porsche" -> /repuestos).
 */
export function resolveSearchCatalog(rawQuery: string): {
  targetPath: '/repuestos' | '/catalogo';
  cleanQuery: string;
} {
  const clean = normalizeAutomotiveQuery(rawQuery);
  const isOil = isOilSearchQuery(rawQuery);
  const isSpare = isSparePartSearchQuery(rawQuery);

  // Si tiene términos explícitos de aceite y NO es una pieza mecánica específica (ej: "aceite porsche", "5w30 bmw")
  if (isOil) {
    // Si la única razón por la que dio true en repuestos fue una marca de auto o modelo, va a /catalogo
    const mechanicalSpareKeywords = [
      'radiador', 'intercooler', 'foco', 'faro', 'optica', 'luneta', 'parabrisas',
      'amortiguador', 'fuelle', 'balon', 'compresor', 'suspension', 'freno', 'pastilla',
      'disco', 'brazo', 'parrilla', 'bieleta', 'rotula', 'turbo', 'multiple', 'cremallera'
    ];
    const hasSpecificMechanicalPart = mechanicalSpareKeywords.some((kw) =>
      rawQuery.toLowerCase().includes(kw)
    );

    if (!hasSpecificMechanicalPart) {
      return { targetPath: '/catalogo', cleanQuery: clean };
    }
  }

  // Si tiene términos de repuesto (radiador, focos, luneta, amortiguadores, etc.)
  if (isSpare) {
    return { targetPath: '/repuestos', cleanQuery: clean };
  }

  // Si tiene algún indicador de aceite
  if (isOil) {
    return { targetPath: '/catalogo', cleanQuery: clean };
  }

  // En RD Spring el foco principal son los repuestos de suspensión y carrocería
  return { targetPath: '/repuestos', cleanQuery: clean };
}

/**
 * Helper legacy de compatibilidad
 */
export function isSuspensionQuery(query: string): boolean {
  return isSparePartSearchQuery(query);
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
