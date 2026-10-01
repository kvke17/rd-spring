'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { signOut } from 'next-auth/react';
import { STORE_CONFIG } from '@/config/constants';
import ChangePasswordForm from '@/components/ChangePasswordForm';
import TwoFactorManager from '@/components/TwoFactorManager';
import { 
  User, 
  ShieldCheck, 
  ShoppingBag, 
  Package, 
  Calendar, 
  ChevronRight, 
  ChevronDown, 
  LogOut, 
  Check, 
  Edit3, 
  Clock, 
  Truck, 
  CheckCircle2, 
  ExternalLink,
  Shield,
  ArrowRight,
  UserCheck,
  AlertCircle
} from 'lucide-react';

interface OrderItem {
  id?: string;
  name?: string;
  productId?: string;
  quantity: number;
  price: number;
}

interface UserOrder {
  id: string;
  buyOrder: string;
  amount: number;
  shippingStatus: string;
  createdAt: string;
  documentType: string;
  itemsSummary: string;
  items: OrderItem[];
}

interface ProfileUser {
  id: string;
  name: string;
  email: string;
  role: string;
  twoFactorEnabled: boolean;
  createdAt: string;
  phone?: string;
  rut?: string;
}

interface ProfileDashboardProps {
  user: ProfileUser;
  orders: UserOrder[];
}

type TabType = 'perfil' | 'seguridad' | 'pedidos';

const TABS: { id: TabType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'perfil', label: 'Perfil', icon: User },
  { id: 'seguridad', label: 'Seguridad', icon: ShieldCheck },
  { id: 'pedidos', label: 'Pedidos', icon: ShoppingBag },
];

const SHIPPING_STAGES = [
  { key: 'CONFIRMADO', label: 'Confirmado' },
  { key: 'PREPARANDO', label: 'En Preparación' },
  { key: 'LISTO_PARA_RETIRO', label: 'Listo para Retiro' },
  { key: 'EN_CAMINO', label: 'En Camino' },
  { key: 'ENTREGADO', label: 'Entregado' },
];

export default function ProfileDashboard({ user, orders }: ProfileDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('perfil');

  // Estado de edición de datos personales
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState(user.name || '');
  const [phoneInput, setPhoneInput] = useState(user.phone || '');
  const [rutInput, setRutInput] = useState(user.rut || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState(user.name || 'Cliente');

  // Estado de pedidos expandidos
  const [expandedOrders, setExpandedOrders] = useState<string[]>([]);

  const toggleExpandOrder = (buyOrder: string) => {
    setExpandedOrders(prev =>
      prev.includes(buyOrder) ? prev.filter(id => id !== buyOrder) : [...prev, buyOrder]
    );
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMessage(null);
    setProfileError(null);

    try {
      const res = await fetch('/api/perfil/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nameInput }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al actualizar datos');
      }

      setDisplayName(nameInput.trim());
      setIsEditing(false);
      setProfileMessage('Tus datos personales han sido actualizados con éxito.');
      setTimeout(() => setProfileMessage(null), 4000);
    } catch (err: any) {
      setProfileError(err.message || 'Error de conexión');
    } finally {
      setSavingProfile(false);
    }
  };

  const initials = (displayName || user.email || 'U')
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const formattedDate = new Date(user.createdAt).toLocaleDateString('es-CL', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const getShippingBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMADO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200/80">
            <Clock className="w-3 h-3 text-amber-600" />
            Confirmado
          </span>
        );
      case 'PREPARANDO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-orange-50 text-orange-800 border border-orange-200/80">
            <Package className="w-3 h-3 text-orange-600" />
            Preparando
          </span>
        );
      case 'LISTO_PARA_RETIRO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-50 text-sky-800 border border-sky-200/80">
            <UserCheck className="w-3 h-3 text-sky-600" />
            Listo para Retiro
          </span>
        );
      case 'EN_CAMINO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-800 border border-blue-200/80">
            <Truck className="w-3 h-3 text-blue-600" />
            En Camino
          </span>
        );
      case 'ENTREGADO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200/80">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Entregado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-900 pt-28 sm:pt-32 pb-24 font-sans selection:bg-[var(--brand-crimson)] selection:text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Encabezado Principal */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-black/[0.06] pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-100/80 text-[var(--brand-crimson)] text-[10px] font-mono font-bold uppercase tracking-wider mb-2.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>CUENTA VERIFICADA RD SPRING</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-slate-900">
              Mi Perfil
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
              Administra tu información personal, seguridad de acceso y pedidos de repuestos.
            </p>
          </div>

          <Link
            href="/catalogo"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 hover:text-slate-900 bg-white border border-black/[0.08] px-4 py-2.5 rounded-xl shadow-2xs hover:shadow-xs transition-all self-start sm:self-auto active:scale-95"
          >
            <ShoppingBag className="w-4 h-4 text-[var(--brand-crimson)]" />
            <span>Explorar Catálogo</span>
          </Link>
        </div>

        {/* Barra de Pestañas Móvil (< 768px) */}
        <div className="md:hidden flex items-center gap-1.5 p-1.5 bg-white/80 backdrop-blur-xl rounded-2xl border border-black/[0.08] mb-6 shadow-xs overflow-x-auto">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs uppercase font-bold tracking-wider transition-colors duration-150 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'text-slate-900 font-extrabold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="activeProfileTabMobile"
                    className="absolute inset-0 bg-white rounded-xl shadow-xs border border-black/[0.06] -z-10"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[var(--brand-crimson)]' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-crimson)] shadow-[0_0_6px_var(--brand-crimson)]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Layout en 2 Columnas para Desktop */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Columna Izquierda: Sidebar de Navegación */}
          <aside className="hidden md:block md:col-span-4 lg:col-span-3 sticky top-32">
            <div className="rounded-2xl border border-black/[0.08] bg-white/80 backdrop-blur-xl p-3 shadow-xs space-y-3">
              
              {/* Tarjeta de Identidad del Usuario */}
              <div className="p-3.5 rounded-xl bg-slate-50/90 border border-black/[0.04] flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-sm flex-shrink-0 shadow-inner">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 text-sm truncate leading-tight">
                    {displayName}
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono truncate mt-0.5">
                    {user.email}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[9px] font-mono uppercase font-bold text-slate-600">
                      {user.role === 'ADMIN' ? 'ADMINISTRADOR' : 'CLIENTE'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Menú de Pestañas con Indicador Deslizante (Framer Motion layoutId) */}
              <nav className="flex flex-col gap-1" role="tablist">
                {TABS.map((tab) => {
                  const isActive = activeTab === tab.id;
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setActiveTab(tab.id)}
                      className={`relative flex items-center justify-between px-3.5 py-3 rounded-xl text-xs uppercase font-bold tracking-wider transition-colors duration-150 cursor-pointer ${
                        isActive
                          ? 'text-slate-900 font-extrabold'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="activeProfileTab"
                          className="absolute inset-0 bg-white rounded-xl shadow-xs border border-black/[0.06] -z-10"
                          transition={{ type: "spring", stiffness: 450, damping: 35 }}
                        />
                      )}
                      
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-[var(--brand-crimson)]' : 'text-slate-400'}`} />
                        <span>{tab.label}</span>
                      </div>

                      {isActive ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-crimson)] shadow-[0_0_6px_var(--brand-crimson)]" />
                      ) : tab.id === 'pedidos' && orders.length > 0 ? (
                        <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                          {orders.length}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </nav>

              {/* Acciones Secundarias de la Barra Lateral */}
              <div className="pt-3 border-t border-black/[0.06] space-y-1">
                <Link
                  href="/catalogo"
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <ShoppingBag className="w-3.5 h-3.5 text-slate-400" />
                    <span>Ir a la Tienda</span>
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </Link>

                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer text-left"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>

            </div>
          </aside>

          {/* Columna Derecha: Contenido Dinámico con AnimatePresence */}
          <main className="md:col-span-8 lg:col-span-9 min-w-0">
            <AnimatePresence mode="wait">
              
              {/* ======================================================== */}
              {/* TAB 1: PERFIL */}
              {/* ======================================================== */}
              {activeTab === 'perfil' && (
                <motion.div
                  key="tab-perfil"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="space-y-6"
                >
                  {/* Tarjeta Principal de Información Personal */}
                  <div className="bg-white rounded-3xl border border-black/[0.08] p-6 sm:p-8 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <User className="w-4 h-4 text-[var(--brand-crimson)]" />
                          <h2 className="text-base font-bold uppercase tracking-tight text-slate-900">
                            Información de la Cuenta
                          </h2>
                        </div>
                        <p className="text-xs text-slate-500">
                          Tus datos de contacto registrados para compras y facturación
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(!isEditing);
                          setProfileError(null);
                        }}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer self-start sm:self-auto ${
                          isEditing
                            ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            : 'bg-slate-900 hover:bg-black text-white shadow-2xs'
                        }`}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>{isEditing ? 'Cancelar Edición' : 'Editar Datos'}</span>
                      </button>
                    </div>

                    {/* Mensaje de éxito / error tipo Toast */}
                    {profileMessage && (
                      <div className="mt-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-800 animate-in fade-in duration-200">
                        <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span className="font-medium">{profileMessage}</span>
                      </div>
                    )}

                    {profileError && (
                      <div className="mt-4 p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2.5 text-xs text-red-700 animate-in fade-in duration-200">
                        <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                        <span className="font-medium">{profileError}</span>
                      </div>
                    )}

                    {/* Formulario de Edición o Vista Editorial */}
                    {isEditing ? (
                      <form onSubmit={handleSaveProfile} className="mt-6 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-600 mb-1.5 font-bold">
                              Nombre Completo
                            </label>
                            <input
                              type="text"
                              required
                              value={nameInput}
                              onChange={(e) => setNameInput(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[var(--brand-crimson)] focus:bg-white focus:ring-2 focus:ring-red-100 transition-all font-medium"
                              placeholder="Tu nombre completo"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-600 mb-1.5 font-bold">
                              Correo Electrónico
                            </label>
                            <input
                              type="email"
                              disabled
                              value={user.email}
                              className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-500 font-mono cursor-not-allowed"
                              title="El correo principal no puede modificarse directamente"
                            />
                            <span className="text-[10px] text-slate-400 mt-1 block">Identificador principal de tu cuenta</span>
                          </div>

                          <div>
                            <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-600 mb-1.5 font-bold">
                              Teléfono de Contacto
                            </label>
                            <input
                              type="text"
                              value={phoneInput}
                              onChange={(e) => setPhoneInput(e.target.value)}
                              placeholder="+56 9 1234 5678"
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[var(--brand-crimson)] focus:bg-white focus:ring-2 focus:ring-red-100 transition-all font-medium"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-600 mb-1.5 font-bold">
                              RUT / Documento
                            </label>
                            <input
                              type="text"
                              value={rutInput}
                              onChange={(e) => setRutInput(e.target.value)}
                              placeholder="12.345.678-9"
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[var(--brand-crimson)] focus:bg-white focus:ring-2 focus:ring-red-100 transition-all font-medium"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                          >
                            Cancelar
                          </button>
                          <button
                            type="submit"
                            disabled={savingProfile}
                            className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-[var(--brand-crimson)] hover:brightness-110 text-white transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                          >
                            {savingProfile ? 'Guardando...' : 'Guardar Cambios'}
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        
                        {/* Tarjeta: Nombre */}
                        <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80">
                          <span className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold mb-1">
                            Nombre Completo
                          </span>
                          <span className="text-sm font-bold text-slate-900">
                            {displayName || 'Sin registrar'}
                          </span>
                        </div>

                        {/* Tarjeta: Correo */}
                        <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80">
                          <div className="flex items-center justify-between mb-1">
                            <span className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                              Email Asociado
                            </span>
                            <span className="text-[9px] font-mono uppercase font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.2 rounded-full">
                              Verificado
                            </span>
                          </div>
                          <span className="text-sm font-medium text-slate-900 font-mono">
                            {user.email}
                          </span>
                        </div>

                        {/* Tarjeta: Teléfono */}
                        <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80">
                          <span className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold mb-1">
                            Teléfono de Contacto
                          </span>
                          <span className="text-sm font-semibold text-slate-800">
                            {phoneInput || user.phone || 'No registrado en compras previas'}
                          </span>
                        </div>

                        {/* Tarjeta: RUT */}
                        <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80">
                          <span className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold mb-1">
                            RUT / Identificación
                          </span>
                          <span className="text-sm font-semibold text-slate-800 font-mono">
                            {rutInput || user.rut || 'No registrado'}
                          </span>
                        </div>

                        {/* Tarjeta: Rol & Membresía */}
                        <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80">
                          <span className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold mb-1">
                            Nivel de Cuenta
                          </span>
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800">
                            <span className="w-2 h-2 rounded-full bg-[var(--brand-crimson)]" />
                            {user.role === 'ADMIN' ? 'Administrador Oficial' : 'Cliente Registrado'}
                          </span>
                        </div>

                        {/* Tarjeta: Fecha de Registro */}
                        <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80">
                          <span className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold mb-1">
                            Miembro Desde
                          </span>
                          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{formattedDate}</span>
                          </div>
                        </div>

                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ======================================================== */}
              {/* TAB 2: SEGURIDAD */}
              {/* ======================================================== */}
              {activeTab === 'seguridad' && (
                <motion.div
                  key="tab-seguridad"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="space-y-6"
                >
                  <div className="bg-white rounded-3xl border border-black/[0.08] p-6 sm:p-8 shadow-xs space-y-8">
                    
                    {/* Header de Seguridad */}
                    <div className="pb-6 border-b border-slate-100 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Shield className="w-4 h-4 text-[var(--brand-crimson)]" />
                          <h2 className="text-base font-bold uppercase tracking-tight text-slate-900">
                            Seguridad & Autenticación
                          </h2>
                        </div>
                        <p className="text-xs text-slate-500">
                          Protección criptográfica y verificación en dos pasos para tu cuenta
                        </p>
                      </div>

                      <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-200/80 rounded-full text-[10px] font-mono font-bold text-slate-600 uppercase">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>NIST SP 800-63B</span>
                      </div>
                    </div>

                    {/* Sección 1: Formulario de Cambio de Contraseña */}
                    <div>
                      <ChangePasswordForm email={user.email} />
                    </div>

                    {/* Sección 2: Autenticación en Dos Pasos (2FA) */}
                    <div>
                      <TwoFactorManager initialEnabled={user.twoFactorEnabled} userEmail={user.email} />
                    </div>

                  </div>
                </motion.div>
              )}

              {/* ======================================================== */}
              {/* TAB 3: PEDIDOS */}
              {/* ======================================================== */}
              {activeTab === 'pedidos' && (
                <motion.div
                  key="tab-pedidos"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="space-y-6"
                >
                  <div className="bg-white rounded-3xl border border-black/[0.08] p-6 sm:p-8 shadow-xs">
                    
                    {/* Header de Pedidos */}
                    <div className="flex items-center justify-between pb-6 border-b border-slate-100 mb-6">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Package className="w-4 h-4 text-[var(--brand-crimson)]" />
                          <h2 className="text-base font-bold uppercase tracking-tight text-slate-900">
                            Historial de Compras
                          </h2>
                        </div>
                        <p className="text-xs text-slate-500">
                          Seguimiento logístico de tus órdenes y comprobantes electrónicos
                        </p>
                      </div>

                      <span className="text-xs font-mono font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                        {orders.length} {orders.length === 1 ? 'pedido' : 'pedidos'}
                      </span>
                    </div>

                    {/* Estado Vacío Elegante (Sin Pedidos) */}
                    {orders.length === 0 ? (
                      <div className="text-center py-16 px-4 bg-slate-50/60 rounded-3xl border border-dashed border-slate-200/90 my-2">
                        <div className="w-16 h-16 bg-red-50 text-[var(--brand-crimson)] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-100 shadow-xs">
                          <ShoppingBag className="w-8 h-8" />
                        </div>
                        <h3 className="text-base font-bold text-slate-900 mb-1.5 uppercase tracking-tight">
                          Aún no tienes pedidos registrados
                        </h3>
                        <p className="text-xs text-slate-500 mb-6 max-w-md mx-auto leading-relaxed">
                          Explora nuestro catálogo de ingeniería de suspensión y aceites de alto rendimiento para comenzar.
                        </p>
                        <Link
                          href="/catalogo"
                          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-black text-white font-bold px-7 py-3.5 rounded-full uppercase tracking-wider text-xs transition-all shadow-sm hover:shadow active:scale-95 cursor-pointer"
                        >
                          <span>Explorar Catálogo</span>
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    ) : (
                      /* Lista de Pedidos Existentes */
                      <div className="space-y-4">
                        {orders.map((order) => {
                          const isExpanded = expandedOrders.includes(order.buyOrder);
                          return (
                            <div
                              key={order.id}
                              className="rounded-2xl border border-black/[0.08] p-5 sm:p-6 bg-white hover:border-slate-300 transition-all duration-150 shadow-2xs space-y-4"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                  <div className="flex items-center gap-2.5 mb-1.5">
                                    <span className="text-sm font-black text-slate-900 font-mono">
                                      #{order.buyOrder}
                                    </span>
                                    {getShippingBadge(order.shippingStatus)}
                                    <span className="text-[10px] font-mono uppercase font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                                      {order.documentType || 'BOLETA'}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span>
                                      {new Date(order.createdAt).toLocaleDateString('es-CL', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric',
                                      })}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-4 justify-between sm:justify-end pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                                  <div className="text-left sm:text-right">
                                    <span className="block text-[10px] font-mono uppercase tracking-wider text-slate-400">Total</span>
                                    <span className="text-base font-black text-slate-900">
                                      {STORE_CONFIG.CURRENCY_FORMAT.format(order.amount)}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => toggleExpandOrder(order.buyOrder)}
                                      className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition-colors cursor-pointer"
                                    >
                                      <span>Detalle</span>
                                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                                    </button>

                                    <Link
                                      href={`/soporte?order=${order.buyOrder}`}
                                      className="inline-flex items-center gap-1 text-xs font-bold text-[var(--brand-crimson)] hover:text-[#8f0f15] bg-red-50 hover:bg-red-100 px-3 py-2 rounded-xl transition-colors shrink-0"
                                      title="Seguimiento de orden"
                                    >
                                      <span>Seguimiento</span>
                                      <ChevronRight className="w-3.5 h-3.5" />
                                    </Link>
                                  </div>
                                </div>
                              </div>

                              {/* Detalle Desplegable con Ítems y Barra de Etapas */}
                              {isExpanded && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="pt-4 border-t border-slate-100 space-y-4"
                                >
                                  {/* Resumen de Productos */}
                                  <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80">
                                    <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-slate-500 block mb-2">
                                      Ítems en este pedido:
                                    </span>
                                    {order.items && order.items.length > 0 ? (
                                      <div className="space-y-2">
                                        {order.items.map((item, idx) => (
                                          <div key={idx} className="flex justify-between items-center text-xs pb-1.5 border-b border-slate-200/60 last:border-0 last:pb-0">
                                            <span className="text-slate-800 font-medium">
                                              {item.quantity}x {item.name || item.productId || 'Repuesto'}
                                            </span>
                                            <span className="font-mono font-bold text-slate-900">
                                              {STORE_CONFIG.CURRENCY_FORMAT.format(item.price * item.quantity)}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-xs text-slate-700">{order.itemsSummary || 'Sin resumen de ítems disponible'}</p>
                                    )}
                                  </div>

                                  {/* Línea de tiempo visual de envío */}
                                  <div className="pt-2">
                                    <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-slate-400 block mb-3">
                                      Progreso logístico:
                                    </span>
                                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-[10px] font-mono">
                                      {SHIPPING_STAGES.map((stage, idx) => {
                                        const currentIdx = SHIPPING_STAGES.findIndex(s => s.key === order.shippingStatus);
                                        const isCompleted = idx <= (currentIdx >= 0 ? currentIdx : 0);
                                        return (
                                          <div
                                            key={stage.key}
                                            className={`p-2 rounded-xl border ${
                                              isCompleted
                                                ? 'bg-red-50 text-[var(--brand-crimson)] border-red-200 font-bold'
                                                : 'bg-slate-50 text-slate-400 border-slate-200'
                                            }`}
                                          >
                                            <span className="block truncate">{stage.label}</span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </main>

        </div>
      </div>
    </div>
  );
}
