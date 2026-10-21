'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ChevronRight, Sparkles } from 'lucide-react';
import { STORE_CONFIG } from '@/config/constants';
import AddToCartButton from '@/components/AddToCartButton';
import { CatalogOilProduct } from './types';

interface CatalogProductCardProps {
  product: CatalogOilProduct;
}

export default function CatalogProductCard({ product }: CatalogProductCardProps) {
  const [selectedFormatIndex, setSelectedFormatIndex] = useState(0);

  const formats = product.formats || [];
  const hasMultipleFormats = formats.length > 1;
  const currentFormat = formats[selectedFormatIndex] || formats[0];

  // Image to display based on selected format
  const activeImgSrc = currentFormat?.sku
    ? `/images/rowe/${currentFormat.sku}.png`
    : product.image || '/images/logo-rd.png';

  // Hover image (show next format or last format if available)
  const hoverImgSrc = hasMultipleFormats && selectedFormatIndex === 0 && formats[formats.length - 1]?.sku
    ? `/images/rowe/${formats[formats.length - 1].sku}.png`
    : null;

  const currentPrice = currentFormat ? currentFormat.price : product.lowestPrice;

  // Cart payload for AddToCartButton
  const cartProduct = {
    id: currentFormat?.sku || product.id,
    sku: currentFormat?.sku || product.sku,
    name: hasMultipleFormats && currentFormat?.size
      ? `${product.name} (${currentFormat.size})`
      : product.name,
    price: currentPrice,
    type: 'venta_online',
    brand: product.brand || 'ROWE',
    category: product.category || 'Aceite de Motor',
    image: activeImgSrc,
    stock: 999,
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
      className="bg-white rounded-3xl border border-neutral-200/90 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden group cursor-pointer"
    >
      {/* Contenedor de Imagen con Tag y Badges */}
      <Link
        href={`/productos/${product.id}`}
        className="block relative aspect-square bg-neutral-50/80 overflow-hidden p-6 flex items-center justify-center border-b border-neutral-100"
      >
        {/* Badges superiores */}
        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-10 pointer-events-none">
          {product.isFeatured ? (
            <span className="inline-flex items-center gap-1 text-[10px] tracking-wider px-2.5 py-1 uppercase font-bold bg-neutral-900 text-white rounded-full shadow-xs">
              <Sparkles className="w-2.5 h-2.5 text-amber-400" />
              DESTACADO
            </span>
          ) : product.viscosity ? (
            <span className="text-[10px] font-mono font-bold px-2.5 py-1 uppercase tracking-wider bg-white/95 text-neutral-800 border border-neutral-200/80 rounded-full shadow-2xs">
              {product.viscosity}
            </span>
          ) : <span />}

          <span className="text-[10px] tracking-widest px-2.5 py-1 uppercase font-bold bg-[#b3131b] text-white rounded-full shadow-xs">
            VENTA ONLINE
          </span>
        </div>

        {/* Imagen principal */}
        <Image
          src={activeImgSrc}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className={`object-contain p-7 transition-all duration-500 ease-out ${
            hoverImgSrc ? 'group-hover:opacity-0 group-hover:scale-105' : 'group-hover:scale-105'
          }`}
        />

        {/* Imagen al hacer hover (si existe formato alternativo y estamos en el primero) */}
        {hoverImgSrc && (
          <Image
            src={hoverImgSrc}
            alt={`${product.name} formato mayor`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="absolute inset-0 object-contain p-7 opacity-0 transition-all duration-500 ease-out group-hover:opacity-100 group-hover:scale-105"
          />
        )}
      </Link>

      {/* Detalles del Producto */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
        <div>
          {/* Subtítulo: Marca y Formatos interactivos */}
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <p className="text-[10px] font-mono uppercase tracking-wider text-[#b3131b] font-bold">
              {product.brand} · {product.viscosity || product.category}
            </p>

            {/* Selector interactivo de formatos */}
            {hasMultipleFormats && (
              <div
                className="flex items-center gap-1 bg-neutral-100 p-0.5 rounded-lg border border-neutral-200/70"
                onClick={(e) => e.stopPropagation()}
              >
                {formats.map((f, idx) => {
                  const isSelected = idx === selectedFormatIndex;
                  return (
                    <button
                      key={f.size || idx}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedFormatIndex(idx);
                      }}
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-white text-neutral-900 shadow-2xs font-extrabold'
                          : 'text-neutral-500 hover:text-neutral-900'
                      }`}
                      title={`Formato ${f.size} - ${STORE_CONFIG.CURRENCY_FORMAT.format(f.price)}`}
                      aria-label={`Seleccionar formato ${f.size}`}
                    >
                      {f.size}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Título del producto */}
          <Link href={`/productos/${product.id}`}>
            <h3 className="text-base font-bold text-neutral-900 line-clamp-2 group-hover:text-[#b3131b] transition-colors leading-snug">
              {product.name}
            </h3>
          </Link>

          {/* Homologación destacada si existe */}
          {product.specs?.['Aprobaciones'] && (
            <p className="text-xs text-neutral-500 line-clamp-1 mt-1 font-normal">
              {product.specs['Aprobaciones'].split('\n')[0].replace(/\r/g, '').trim()}
            </p>
          )}
        </div>

        {/* Pie de Tarjeta: Precio y Acciones */}
        <div className="mt-5 pt-4 border-t border-neutral-100 flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] text-neutral-400 font-bold block uppercase tracking-wider">
              {hasMultipleFormats && selectedFormatIndex === 0 ? 'DESDE' : currentFormat?.size || 'PRECIO'}
            </span>
            <p className="text-lg font-black text-neutral-900 font-mono tracking-tight">
              {STORE_CONFIG.CURRENCY_FORMAT.format(currentPrice)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <AddToCartButton
              product={cartProduct as any}
              label="AGREGAR"
              className="px-3.5 py-2 text-[11px]"
            />
            <Link
              href={`/productos/${product.id}`}
              className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-neutral-700 hover:text-[#b3131b] bg-neutral-100 hover:bg-red-50 hover:border-red-100 border border-transparent px-3 py-2 rounded-xl transition-all"
              aria-label={`Ver detalles de ${product.name}`}
            >
              <span>VER</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
