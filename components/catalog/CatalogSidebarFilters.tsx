'use client';

import { Check, RotateCcw } from 'lucide-react';
import { CatalogOilProduct, FilterState } from './types';

export interface ApprovalOption {
  id: string;
  label: string;
  sublabel?: string;
}

export const KNOWN_APPROVALS: ApprovalOption[] = [
  { id: 'porsche', label: 'Porsche', sublabel: 'A40 · C30 · C40' },
  { id: 'bmw', label: 'BMW Longlife', sublabel: 'LL-04 · LL-01' },
  { id: 'mb', label: 'Mercedes-Benz MB', sublabel: '229.5 · 229.51 · 229.52' },
  { id: 'vw', label: 'VW / Audi', sublabel: '504 00 · 507 00 · 505 01' },
  { id: 'ford', label: 'Ford', sublabel: 'WSS-M2C913-D' },
  { id: 'gm', label: 'GM / Opel', sublabel: 'dexos1 · dexos2' },
  { id: 'racing', label: 'Competición / Racing', sublabel: 'Multi-Ester PAO' },
];

export const FORMAT_OPTIONS = [
  { id: '1LT', label: '1 Litro', code: '1LT' },
  { id: '4LT', label: '4 Litros', code: '4LT' },
  { id: '5LT', label: '5 Litros', code: '5LT' },
];

interface CatalogSidebarFiltersProps {
  products: CatalogOilProduct[];
  filterState: FilterState;
  onToggleViscosity: (v: string) => void;
  onToggleFormat: (f: string) => void;
  onToggleApproval: (a: string) => void;
  onResetFilters: () => void;
  availableViscosities: string[];
}

export default function CatalogSidebarFilters({
  products,
  filterState,
  onToggleViscosity,
  onToggleFormat,
  onToggleApproval,
  onResetFilters,
  availableViscosities,
}: CatalogSidebarFiltersProps) {
  const hasActiveFilters =
    filterState.viscosities.length > 0 ||
    filterState.formats.length > 0 ||
    filterState.approvals.length > 0 ||
    filterState.searchQuery.trim().length > 0;

  // Calculate counts for each option dynamically
  const getViscosityCount = (v: string) => {
    return products.filter((p) => p.viscosity === v).length;
  };

  const getFormatCount = (fmt: string) => {
    return products.filter((p) => p.formats?.some((f) => f.size === fmt)).length;
  };

  const getApprovalCount = (apprId: string) => {
    return products.filter((p) => p.approvals?.includes(apprId)).length;
  };

  return (
    <div className="space-y-6 text-neutral-900">
      {/* Header de Filtros */}
      <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
          Filtros
        </h3>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#b3131b] hover:text-[#8f0f15] hover:underline transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Limpiar filtros</span>
          </button>
        )}
      </div>

      {/* Dimensión 1: Viscosidad */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-700">
            Viscosidad
          </span>
          {filterState.viscosities.length > 0 && (
            <span className="text-[10px] font-mono font-bold text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded">
              {filterState.viscosities.length}
            </span>
          )}
        </div>

        <div className="space-y-1.5">
          {availableViscosities.map((visc) => {
            const isChecked = filterState.viscosities.includes(visc);
            const count = getViscosityCount(visc);

            return (
              <label
                key={visc}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl cursor-pointer text-sm transition-all select-none ${
                  isChecked
                    ? 'bg-neutral-100 text-neutral-950 font-bold'
                    : 'hover:bg-neutral-50 text-neutral-600 font-medium'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-4 h-4 rounded-md flex items-center justify-center border transition-all ${
                      isChecked
                        ? 'bg-neutral-900 border-neutral-900 text-white'
                        : 'border-neutral-300 bg-white hover:border-neutral-400'
                    }`}
                  >
                    {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span className="font-mono text-xs font-semibold">{visc}</span>
                </div>
                <span className="text-[11px] font-mono text-neutral-400">({count})</span>
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onToggleViscosity(visc)}
                  className="sr-only"
                />
              </label>
            );
          })}
        </div>
      </div>

      {/* Dimensión 2: Formato / Capacidad */}
      <div className="space-y-3 pt-3 border-t border-neutral-100">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-700">
            Formato / Capacidad
          </span>
          {filterState.formats.length > 0 && (
            <span className="text-[10px] font-mono font-bold text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded">
              {filterState.formats.length}
            </span>
          )}
        </div>

        <div className="space-y-1.5">
          {FORMAT_OPTIONS.map((opt) => {
            const isChecked = filterState.formats.includes(opt.code);
            const count = getFormatCount(opt.code);

            return (
              <label
                key={opt.code}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl cursor-pointer text-sm transition-all select-none ${
                  isChecked
                    ? 'bg-neutral-100 text-neutral-950 font-bold'
                    : 'hover:bg-neutral-50 text-neutral-600 font-medium'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-4 h-4 rounded-md flex items-center justify-center border transition-all ${
                      isChecked
                        ? 'bg-neutral-900 border-neutral-900 text-white'
                        : 'border-neutral-300 bg-white hover:border-neutral-400'
                    }`}
                  >
                    {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span className="text-xs">{opt.label}</span>
                </div>
                <span className="text-[11px] font-mono text-neutral-400">({count})</span>
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onToggleFormat(opt.code)}
                  className="sr-only"
                />
              </label>
            );
          })}
        </div>
      </div>

      {/* Dimensión 3: Homologaciones y Marcas */}
      <div className="space-y-3 pt-3 border-t border-neutral-100">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-700">
            Homologaciones / Marcas
          </span>
          {filterState.approvals.length > 0 && (
            <span className="text-[10px] font-mono font-bold text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded">
              {filterState.approvals.length}
            </span>
          )}
        </div>

        <div className="space-y-1.5">
          {KNOWN_APPROVALS.map((appr) => {
            const isChecked = filterState.approvals.includes(appr.id);
            const count = getApprovalCount(appr.id);

            // Skip showing approvals that have 0 products in current catalog
            if (count === 0 && !isChecked) return null;

            return (
              <label
                key={appr.id}
                className={`flex items-start justify-between px-2.5 py-1.5 rounded-xl cursor-pointer text-sm transition-all select-none ${
                  isChecked
                    ? 'bg-neutral-100 text-neutral-950 font-bold'
                    : 'hover:bg-neutral-50 text-neutral-600 font-medium'
                }`}
              >
                <div className="flex items-start gap-2.5 pt-0.5">
                  <div
                    className={`w-4 h-4 rounded-md flex items-center justify-center border shrink-0 transition-all mt-0.5 ${
                      isChecked
                        ? 'bg-neutral-900 border-neutral-900 text-white'
                        : 'border-neutral-300 bg-white hover:border-neutral-400'
                    }`}
                  >
                    {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <div>
                    <span className="text-xs block leading-tight">{appr.label}</span>
                    {appr.sublabel && (
                      <span className="text-[10px] text-neutral-400 block leading-tight mt-0.5 font-normal">
                        {appr.sublabel}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-[11px] font-mono text-neutral-400 pt-0.5">({count})</span>
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onToggleApproval(appr.id)}
                  className="sr-only"
                />
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
