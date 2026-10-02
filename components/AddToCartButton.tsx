'use client';

import { useState } from 'react';
import { ShoppingBag, Check } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { Product } from '@/types';

interface AddToCartButtonProps {
  product: Product;
  quantity?: number;
  className?: string;
  label?: string;
  showIconOnly?: boolean;
}

export default function AddToCartButton({
  product,
  quantity = 1,
  className = '',
  label = 'AGREGAR',
  showIconOnly = false,
}: AddToCartButtonProps) {
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addItem(product, quantity);

    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <button
      onClick={handleClick}
      type="button"
      aria-label={`Agregar ${product.name} al carro`}
      className={`inline-flex items-center justify-center gap-1.5 rounded-xl font-bold uppercase tracking-wider text-xs transition-all duration-200 active:scale-95 cursor-pointer shadow-sm ${
        added
          ? 'bg-emerald-600 text-white'
          : 'bg-[#b3131b] hover:bg-[#8f0f15] text-white hover:shadow-md'
      } ${className}`}
    >
      {added ? (
        <>
          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
          {!showIconOnly && <span>AGREGADO</span>}
        </>
      ) : (
        <>
          <ShoppingBag className="w-3.5 h-3.5 stroke-[2]" />
          {!showIconOnly && <span>{label}</span>}
        </>
      )}
    </button>
  );
}
