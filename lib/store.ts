import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Product } from '@/types';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface ShippingOption {
  id: string;
  label: string;
  cost: number;
  timeframe: string;
}

export const SHIPPING_OPTIONS: ShippingOption[] = [
  { id: 'pickup', label: 'Retiro en taller - Vitacura', cost: 0, timeframe: 'Sin costo' },
  { id: 'santiago', label: 'Despacho Santiago 24-48 h', cost: 12000, timeframe: '24-48 hrs' },
  { id: 'regional', label: 'Despacho regiones 3-5 días', cost: 19900, timeframe: '3-5 días' },
];

interface CartStore {
  items: CartItem[];
  selectedShippingId: string;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setShippingOption: (shippingId: string) => void;
  getCartSubtotal: () => number;
  getShippingCost: () => number;
  getCartTotal: () => number;
  getCartCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      selectedShippingId: 'santiago',

      addItem: (product: Product, quantity = 1) => {
        if (product.type !== 'venta_online') return;
        set((state) => {
          const existingIndex = state.items.findIndex((item) => item.product.id === product.id);
          if (existingIndex > -1) {
            const updatedItems = [...state.items];
            const currentQty = updatedItems[existingIndex].quantity;
            const newQty = Math.min(currentQty + quantity, (product as any).stock ?? 99);
            updatedItems[existingIndex] = { ...updatedItems[existingIndex], quantity: newQty };
            return { items: updatedItems };
          }
          return { items: [...state.items, { product, quantity }] };
        });
      },
      removeItem: (productId: string) => {
        set((state) => ({ items: state.items.filter((item) => item.product.id !== productId) }));
      },
      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((item) => item.product.id === productId ? { ...item, quantity } : item),
        }));
      },
      clearCart: () => set({ items: [] }),
      setShippingOption: (shippingId: string) => set({ selectedShippingId: shippingId }),
      getCartSubtotal: () => get().items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
      getShippingCost: () => {
        const option = SHIPPING_OPTIONS.find((opt) => opt.id === get().selectedShippingId);
        return option ? option.cost : 0;
      },
      getCartTotal: () => get().getCartSubtotal() + get().getShippingCost(),
      getCartCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    {
      name: 'rdspring-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items, selectedShippingId: state.selectedShippingId }),
    }
  )
);
