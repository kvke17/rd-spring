import Swal from 'sweetalert2';
import { Product } from '@/types';

export interface AddToCartAlertOptions {
  product: Product;
  quantity: number;
  totalQuantity: number;
  alreadyInCart: boolean;
}

export interface RemoveItemAlertOptions {
  productName: string;
  onConfirm: () => void;
}

export interface ClearCartAlertOptions {
  onConfirm: () => void;
}

/**
 * Shared modal base styling to maintain visual identity across all modals
 */
export const BASE_SWAL_CONFIG = {
  confirmButtonColor: '#b3131b',
  cancelButtonColor: '#64748b',
  scrollbarPadding: false,
  focusConfirm: true,
  allowEscapeKey: true,
  customClass: {
    popup: 'rounded-3xl border border-neutral-200/90 shadow-2xl backdrop-blur-xl p-6 sm:p-8',
    title: 'text-xl sm:text-2xl font-black text-gray-900 tracking-tight pt-2',
    htmlContainer: 'text-sm text-gray-600 my-2',
    actions: 'flex flex-col sm:flex-row gap-2.5 w-full justify-center px-2 mt-4',
    confirmButton: 'w-full sm:w-auto rounded-xl font-bold uppercase text-xs tracking-wider px-6 py-3.5 shadow-sm active:scale-95 transition-all cursor-pointer',
    cancelButton: 'w-full sm:w-auto rounded-xl font-bold uppercase text-xs tracking-wider px-6 py-3.5 active:scale-95 transition-all cursor-pointer',
    timerProgressBar: 'bg-[#b3131b] h-1 rounded-full',
  },
  didClose: () => {
    // Ensures scroll is restored and no overflow hidden remains on body
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
      document.body.classList.remove('swal2-shown', 'swal2-height-auto');
      document.documentElement.classList.remove('swal2-shown', 'swal2-height-auto');
    }
  },
};

/**
 * Alerta de éxito al agregar un producto al carrito
 */
export function showAddToCartAlert({
  product,
  quantity,
  totalQuantity,
  alreadyInCart,
}: AddToCartAlertOptions) {
  if (typeof window === 'undefined') return;

  const htmlContent = alreadyInCart
    ? `<div class="space-y-1.5 text-center">
         <p class="font-bold text-gray-900 text-base leading-snug">${product.name}</p>
         <p class="text-sm text-gray-600">Ahora tienes <span class="font-bold font-mono text-gray-900">${totalQuantity}</span> unidades en tu carro.</p>
       </div>`
    : `<div class="space-y-1.5 text-center">
         <p class="font-bold text-gray-900 text-base leading-snug">${product.name} × ${quantity}</p>
         <p class="text-sm text-gray-600">¡Agregado Al Carro!</p>
       </div>`;

  return Swal.fire({
    ...BASE_SWAL_CONFIG,
    title: '¡Producto agregado Correctamente!',
    html: htmlContent,
    icon: 'success',
    iconColor: '#22c55e',
    showCancelButton: true,
    confirmButtonText: 'IR AL CARRO',
    cancelButtonText: 'SEGUIR COMPRANDO',
    timer: 3000,
    timerProgressBar: true,
    didOpen: (popup) => {
      popup.onmouseenter = Swal.stopTimer;
      popup.onmouseleave = Swal.resumeTimer;
    },
  }).then((result) => {
    if (result.isConfirmed) {
      window.location.href = '/carro';
    }
  });
}

/**
 * Alerta de confirmación al eliminar un producto con el basurero o con "-" en cantidad 1
 */
export function showRemoveItemConfirmAlert({
  productName,
  onConfirm,
}: RemoveItemAlertOptions) {
  if (typeof window === 'undefined') return;

  return Swal.fire({
    ...BASE_SWAL_CONFIG,
    title: '¿Eliminar este producto?',
    html: `<div class="space-y-1.5 text-center">
             <p class="font-bold text-gray-900 text-base leading-snug">${productName}</p>
             <p class="text-sm text-gray-500">Se quitará de tu carro de compras.</p>
           </div>`,
    icon: 'warning',
    iconColor: '#f59e0b',
    showCancelButton: true,
    confirmButtonText: 'SÍ, ELIMINAR',
    cancelButtonText: 'CANCELAR',
  }).then((result) => {
    if (result.isConfirmed) {
      onConfirm();
    }
  });
}

/**
 * Toast discreto de confirmación: "Producto eliminado" (1.5 segundos)
 */
export function showItemRemovedToast() {
  if (typeof window === 'undefined') return;

  return Swal.fire({
    toast: true,
    position: 'bottom-end',
    icon: 'success',
    iconColor: '#22c55e',
    title: 'Producto eliminado',
    showConfirmButton: false,
    timer: 1500,
    timerProgressBar: false,
    customClass: {
      popup: 'rounded-2xl shadow-xl border border-neutral-200/90 bg-white/95 backdrop-blur-md px-4 py-3 text-xs font-semibold text-gray-900',
      title: 'text-xs font-bold text-gray-900 ml-1',
    },
    didClose: () => {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
        document.body.classList.remove('swal2-shown', 'swal2-height-auto');
        document.documentElement.classList.remove('swal2-shown', 'swal2-height-auto');
      }
    },
  });
}

/**
 * Alerta de confirmación para "Vaciar carro"
 */
export function showClearCartConfirmAlert({
  onConfirm,
}: ClearCartAlertOptions) {
  if (typeof window === 'undefined') return;

  return Swal.fire({
    ...BASE_SWAL_CONFIG,
    title: '¿Vaciar carro de compras?',
    text: 'Se eliminarán todos los productos que tienes seleccionados.',
    icon: 'warning',
    iconColor: '#f59e0b',
    showCancelButton: true,
    confirmButtonText: 'SÍ, VACIAR',
    cancelButtonText: 'CANCELAR',
  }).then((result) => {
    if (result.isConfirmed) {
      onConfirm();
    }
  });
}

export interface ProductCreatedAlertOptions {
  product: {
    name: string;
    sku?: string;
    brand?: string;
    category?: string;
    price?: number | string;
    image?: string;
    type?: string;
  };
  onViewProducts?: () => void;
  onCreateAnother?: () => void;
}

/**
 * Alerta premium tras crear un nuevo producto en el panel de administración
 */
export function showProductCreatedAlert({
  product,
  onViewProducts,
  onCreateAnother,
}: ProductCreatedAlertOptions) {
  if (typeof window === 'undefined') return;

  const formattedPrice =
    typeof product.price === 'number' || (product.price && !isNaN(Number(product.price)))
      ? new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(Number(product.price))
      : 'Solo Cotización';

  const htmlContent = `
    <div class="space-y-4 text-center">
      ${product.image ? `
        <div class="w-24 h-24 mx-auto rounded-2xl border border-neutral-200/80 bg-neutral-50 flex items-center justify-center p-2 shadow-xs overflow-hidden">
          <img src="${product.image}" alt="${product.name}" class="w-full h-full object-contain" />
        </div>
      ` : ''}

      <div>
        <p class="font-black text-gray-900 text-lg leading-snug">${product.name}</p>
        <div class="flex items-center justify-center gap-2 mt-2 flex-wrap">
          ${product.sku ? `<span class="text-[10px] font-mono font-bold bg-neutral-100 text-neutral-800 px-2.5 py-1 rounded-md border border-neutral-200">SKU: ${product.sku}</span>` : ''}
          ${product.brand ? `<span class="text-[10px] font-mono font-bold text-[#b3131b] bg-red-50 px-2.5 py-1 rounded-md border border-red-100 uppercase">${product.brand}</span>` : ''}
          ${product.category ? `<span class="text-[10px] font-mono text-neutral-600 bg-neutral-100 px-2.5 py-1 rounded-md">${product.category}</span>` : ''}
        </div>
      </div>

      <div class="py-2.5 px-4 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center justify-between text-xs max-w-xs mx-auto">
        <span class="text-neutral-500 font-medium">Precio Catálogo:</span>
        <span class="font-mono font-black text-gray-900 text-sm sm:text-base">${formattedPrice}</span>
      </div>

      <p class="text-xs text-neutral-500">
        El repuesto se ha registrado exitosamente en la base de datos de RD Spring.
      </p>
    </div>
  `;

  return Swal.fire({
    ...BASE_SWAL_CONFIG,
    title: '¡Producto Creado!',
    html: htmlContent,
    icon: 'success',
    iconColor: '#22c55e',
    showCancelButton: true,
    confirmButtonText: 'VER EN PRODUCTOS',
    cancelButtonText: 'CREAR OTRO',
    timer: 6000,
    timerProgressBar: true,
    didOpen: (popup) => {
      popup.onmouseenter = Swal.stopTimer;
      popup.onmouseleave = Swal.resumeTimer;
    },
  }).then((result) => {
    if (result.isConfirmed) {
      if (onViewProducts) {
        onViewProducts();
      } else {
        window.location.href = '/admin/productos';
      }
    } else if (result.dismiss === Swal.DismissReason.cancel) {
      if (onCreateAnother) {
        onCreateAnother();
      }
    }
  });
}

