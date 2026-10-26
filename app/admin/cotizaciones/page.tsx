import React from 'react';
import Link from 'next/link';
import { FileText, MessageCircle, ExternalLink, ShieldCheck, Mail, Phone, Calendar, ArrowUpRight } from 'lucide-react';
import { STORE_CONFIG } from '@/config/constants';

export const metadata = {
  title: 'Cotizaciones con VIN | RD SPRING Admin',
  description: 'Gestión y verificación de compatibilidad de repuestos para Porsche, BMW, Audi y Land Rover.',
};

export default function AdminCotizacionesPage() {
  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white border border-neutral-200/90 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-[#b3131b] text-white text-[10px] font-mono font-bold uppercase tracking-wider">
              Soporte Técnico
            </span>
            <span className="text-xs text-neutral-500 font-mono">
              Verificación de Compatibilidad por VIN
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
            Cotizaciones de Repuestos con VIN
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 mt-1">
            Revisión de número de chasis (VIN) y compatibilidad OEM antes de confirmación de compra
          </p>
        </div>

        <a
          href={`https://wa.me/${STORE_CONFIG.WHATSAPP_NUMBER}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm cursor-pointer self-start sm:self-auto"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Abrir WhatsApp Business</span>
        </a>
      </div>

      {/* Guía Operativa & Canal de Cotización */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white border border-neutral-200/90 rounded-2xl p-6 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-[#b3131b] flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-neutral-900 text-sm">Formulario Web Público</h3>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Las solicitudes ingresadas por clientes desde <Link href="/cotizacion" className="text-[#b3131b] underline font-semibold">/cotizacion</Link> llegan directamente al correo oficial de contacto (<span className="font-mono text-neutral-700">{STORE_CONFIG.CONTACT_EMAIL}</span>).
          </p>
        </div>

        <div className="bg-white border border-neutral-200/90 rounded-2xl p-6 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <MessageCircle className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-neutral-900 text-sm">Canal WhatsApp Oficial</h3>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Atención prioritaria y cotización rápida para Porsche, BMW, Audi y Land Rover con ficha de compatibilidad técnica.
          </p>
          <div className="pt-1">
            <span className="font-mono text-xs font-bold text-neutral-900">+{STORE_CONFIG.WHATSAPP_NUMBER}</span>
          </div>
        </div>

        <div className="bg-white border border-neutral-200/90 rounded-2xl p-6 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-neutral-100 text-neutral-700 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-neutral-900 text-sm">Garantía de Compatibilidad</h3>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Cada cotización confirmada cuenta con 1 año de garantía y verificación previa de números OEM en despiece oficial.
          </p>
        </div>
      </div>

      {/* Lista de Solicitudes Recientes */}
      <div className="bg-white border border-neutral-200/90 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-neutral-900 tracking-tight">
            Flujo de Atención de Cotizaciones
          </h2>
          <span className="text-xs font-mono text-neutral-500">
            Respuesta promedio: &lt; 2 horas
          </span>
        </div>

        <div className="p-8 text-center border border-dashed border-neutral-200 rounded-xl text-neutral-500 text-xs space-y-2">
          <FileText className="w-8 h-8 mx-auto text-neutral-400" />
          <p className="font-semibold text-neutral-700">Sin cotizaciones pendientes en cola</p>
          <p className="text-neutral-400 max-w-sm mx-auto">
            Todas las solicitudes recibidas vía correo o WhatsApp han sido procesadas por el equipo técnico.
          </p>
        </div>
      </div>
    </div>
  );
}
