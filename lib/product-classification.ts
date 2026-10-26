/**
 * Utilidad centralizada de clasificación de productos RD SPRING.
 * Garantiza que jamás exista traslape entre Repuestos (stock físico propio)
 * y Aceites/Lubricantes ROWE (compra bajo pedido / on-demand).
 */

export interface ProductClassifierInput {
  category?: string | null;
  name?: string | null;
  sku?: string | null;
  brand?: string | null;
  description?: string | null;
}

/**
 * Determina si un producto es exclusivamente un Aceite o Lubricante ROWE.
 */
export function isOilOrLubricant(product: ProductClassifierInput): boolean {
  if (!product) return false;

  const cat = (product.category || '').toLowerCase().trim();
  const name = (product.name || '').toLowerCase().trim();
  const sku = (product.sku || '').trim();
  const brand = (product.brand || '').toLowerCase().trim();

  // 1. Categoría explícita de fluidos / aceites / lubricantes
  if (
    cat === 'lubricantes' ||
    cat === 'lubricante' ||
    cat === 'aceites' ||
    cat === 'aceite' ||
    cat === 'aceite de motor' ||
    cat.includes('lubricant') ||
    cat.includes('aceite') ||
    cat.includes('fluido')
  ) {
    return true;
  }

  // 2. Patrón de SKU oficial ROWE (ej: 20118-0010-99, 20001, 20058, etc.)
  if (/^20\d{3}/.test(sku)) {
    return true;
  }

  // 3. Marca ROWE con términos clave de fluidos en el nombre
  if (
    (brand === 'rowe' || brand.includes('rowe')) &&
    (name.includes('aceite') || name.includes('hightec') || name.includes('synt') || name.includes('sae') || name.includes('dpf'))
  ) {
    return true;
  }

  // 4. Nombre que comience inequívocamente con ACEITE
  if (name.startsWith('aceite')) {
    return true;
  }

  return false;
}

/**
 * Determina si un producto es un Repuesto físico (Suspensión, Motor, Frenos, Iluminación, Accesorios, etc.).
 */
export function isSparePart(product: ProductClassifierInput): boolean {
  return !isOilOrLubricant(product);
}
