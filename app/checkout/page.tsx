'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/lib/store';
import { formatRut, validateRut } from '@/lib/rut';
import { STORE_CONFIG } from '@/config/constants';
import { 
  ShieldCheck, 
  Truck, 
  MapPin, 
  CreditCard, 
  Lock, 
  Check, 
  AlertCircle, 
  Building2, 
  User, 
  FileText,
  ShoppingBag,
  ArrowRight,
  ChevronRight
} from 'lucide-react';

const REGIONES_CHILE: Record<string, string[]> = {
  "Metropolitana de Santiago": ["Cerrillos", "Cerro Navia", "Conchalí", "El Bosque", "Estación Central", "Huechuraba", "Independencia", "La Cisterna", "La Florida", "La Granja", "La Pintana", "La Reina", "Las Condes", "Lo Barnechea", "Lo Espejo", "Lo Prado", "Macul", "Maipú", "Ñuñoa", "Pedro Aguirre Cerda", "Peñalolén", "Providencia", "Pudahuel", "Quilicura", "Quinta Normal", "Recoleta", "Renca", "San Joaquín", "San Miguel", "San Ramón", "Santiago", "Vitacura", "Puente Alto", "Pirque", "San José de Maipo", "Colina", "Lampa", "Tiltil", "San Bernardo", "Buin", "Calera de Tango", "Paine", "Melipilla", "Alhué", "Curacaví", "María Pinto", "San Pedro", "Talagante", "El Monte", "Isla de Maipo", "Padre Hurtado", "Peñaflor"],
  "Arica y Parinacota": ["Arica", "Camarones", "Putre", "General Lagos"],
  "Tarapacá": ["Iquique", "Alto Hospicio", "Pozo Almonte", "Camiña", "Colchane", "Huara", "Pica"],
  "Antofagasta": ["Antofagasta", "Mejillones", "Sierra Gorda", "Taltal", "Calama", "Ollagüe", "San Pedro de Atacama", "Tocopilla", "María Elena"],
  "Atacama": ["Copiapó", "Caldera", "Tierra Amarilla", "Chañaral", "Diego de Almagro", "Vallenar", "Alto del Carmen", "Freirina", "Huasco"],
  "Coquimbo": ["La Serena", "Coquimbo", "Andacollo", "La Higuera", "Paihuano", "Vicuña", "Illapel", "Canela", "Los Vilos", "Salamanca", "Ovalle", "Combarbalá", "Monte Patria", "Punitaqui", "Río Hurtado"],
  "Valparaíso": ["Valparaíso", "Casablanca", "Concón", "Juan Fernández", "Puchuncaví", "Quintero", "Viña del Mar", "Isla de Pascua", "Los Andes", "Calle Larga", "Rinconada", "San Esteban", "La Ligua", "Cabildo", "Papudo", "Petorca", "Zapallar", "Quillota", "Calera", "Hijuelas", "La Cruz", "Nogales", "San Antonio", "Algarrobo", "Cartagena", "El Quisco", "El Tabo", "Santo Domingo", "San Felipe", "Catemu", "Llaillay", "Panquehue", "Putaendo", "Santa María", "Quilpué", "Limache", "Olmué", "Villa Alemana"],
  "Libertador Gral. Bernardo O'Higgins": ["Rancagua", "Codegua", "Coinco", "Coltauco", "Doñihue", "Graneros", "Las Cabras", "Machalí", "Malloa", "Mostazal", "Olivar", "Peumo", "Pichidegua", "Quinta de Tilcoco", "Rengo", "Requínoa", "San Vicente", "Pichilemu", "La Estrella", "Litueche", "Marchihue", "Navidad", "Paredones", "San Fernando", "Chépica", "Chimbarongo", "Lolol", "Nancagua", "Palmilla", "Peralillo", "Placilla", "Pumanque", "Santa Cruz"],
  "Maule": ["Talca", "Constitución", "Curepto", "Empedrado", "Maule", "Pelarco", "Pencahue", "Río Claro", "San Clemente", "San Rafael", "Cauquenes", "Chanco", "Pelluhue", "Curicó", "Hualañé", "Licantén", "Molina", "Rauco", "Romeral", "Sagrada Familia", "Teno", "Vichuquén", "Linares", "Colbún", "Longaví", "Parral", "Retiro", "San Javier", "Villa Alegre", "Yerbas Buenas"],
  "Ñuble": ["Cobquecura", "Coelemu", "Ninhue", "Portezuelo", "Quirihue", "Ránquil", "Treguaco", "Bulnes", "Chillán Viejo", "Chillán", "El Carmen", "Pemuco", "Pinto", "Quillón", "San Ignacio", "Yungay", "Coihueco", "Ñiquén", "San Carlos", "San Fabián", "San Nicolás"],
  "Biobío": ["Concepción", "Coronel", "Chiguayante", "Florida", "Hualqui", "Lota", "Penco", "San Pedro de la Paz", "Santa Juana", "Talcahuano", "Tomé", "Hualpén", "Lebu", "Arauco", "Cañete", "Contulmo", "Curanilahue", "Los Álamos", "Tirúa", "Los Ángeles", "Antuco", "Cabrero", "Laja", "Mulchén", "Nacimiento", "Negrete", "Quilaco", "Quilleco", "San Rosendo", "Santa Bárbara", "Tucapel", "Alto Biobío"],
  "La Araucanía": ["Temuco", "Carahue", "Cunco", "Curarrehue", "Freire", "Galvarino", "Gorbea", "Lautaro", "Loncoche", "Melipeuco", "Nueva Imperial", "Padre las Casas", "Perquenco", "Pitrufquén", "Pucón", "Saavedra", "Teodoro Schmidt", "Toltén", "Vilcún", "Villarrica", "Cholchol", "Angol", "Collipulli", "Curacautín", "Ercilla", "Lonquimay", "Los Sauces", "Lumaco", "Purén", "Renaico", "Traiguén", "Victoria"],
  "Los Ríos": ["Valdivia", "Corral", "Lanco", "Los Lagos", "Máfil", "Mariquina", "Paillaco", "Panguipulli", "La Unión", "Futrono", "Lago Ranco", "Río Bueno"],
  "Los Lagos": ["Puerto Montt", "Calbuco", "Cochamó", "Fresia", "Frutillar", "Los Muermos", "Llanquihue", "Maullín", "Puerto Varas", "Castro", "Ancud", "Chonchi", "Curaco de Vélez", "Dalcahue", "Puqueldón", "Queilén", "Quellón", "Quemchi", "Quinchao", "Osorno", "Puerto Octay", "Purranque", "Puyehue", "Río Negro", "San Juan de la Costa", "San Pablo", "Chaitén", "Futaleufú", "Hualaihué", "Palena"],
  "Aysén del Gral. Carlos Ibáñez del Campo": ["Coihaique", "Lago Verde", "Aysén", "Cisnes", "Guaitecas", "Cochrane", "O'Higgins", "Tortel", "Chile Chico", "Río Ibáñez"],
  "Magallanes y de la Antártica Chilena": ["Punta Arenas", "Laguna Blanca", "Río Verde", "San Gregorio", "Cabo de Hornos (Ex Navarino)", "Antártica", "Porvenir", "Primavera", "Timaukel", "Natales", "Torres del Paine"]
};

export default function CheckoutPage() {
  const [mounted, setMounted] = useState(false);
  const { items, getCartSubtotal } = useCartStore();

  const [formData, setFormData] = useState({ 
    fullName: '', email: '', phone: '', rut: '', vehicle: '', 
    address: '', comuna: '', region: '', 
    rutFactura: '', razonSocial: '', giro: '', regionFactura: '', comunaFactura: '', direccionFactura: '' 
  });
  
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [docType, setDocType] = useState('BOLETA');
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [metodoEntrega, setMetodoEntrega] = useState<'despacho' | 'retiro'>('despacho');
  const [tarifasDinamicas, setTarifasDinamicas] = useState<any[]>([]);
  const [cargandoEnvio, setCargandoEnvio] = useState(false);
  const [envioSeleccionado, setEnvioSeleccionado] = useState<any>(null);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md bg-white rounded-3xl border border-slate-200/80 p-10 shadow-sm">
          <div className="w-14 h-14 bg-red-50 text-[#b3131b] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black uppercase mb-2 tracking-tight text-gray-900">Tu carro está vacío</h1>
          <p className="text-xs text-slate-500 mb-6">No tienes productos en tu carro de compras para procesar el pago.</p>
          <Link 
            href="/catalogo" 
            className="inline-block bg-[#b3131b] hover:bg-[#8f0f15] text-white font-bold px-8 py-3.5 rounded-xl uppercase tracking-wider text-xs transition-colors shadow-xs"
          >
            Explorar Catálogo
          </Link>
        </div>
      </div>
    );
  }

  const calcularFlete = async () => {
    if (!formData.region || !formData.comuna) {
      alert("Por favor selecciona tu Región y Comuna primero para cotizar el envío.");
      return;
    }
    
    setCargandoEnvio(true);
    setEnvioSeleccionado(null);

    try {
      const res = await fetch('/api/envia/cotizar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ region: formData.region, comuna: formData.comuna, items }),
      });
      const data = await res.json();
      
      if (data.rates) {
        const tarifasAdaptadas = data.rates.map((rate: any, index: number) => ({
          id: `${rate.carrier}-${index}`,
          carrier: rate.carrier,
          serviceName: rate.serviceName,
          label: `${rate.carrier.toUpperCase()} - ${rate.serviceName} (${rate.deliveryEstimate})`,
          cost: rate.totalPrice
        }));
        setTarifasDinamicas(tarifasAdaptadas);
      } else {
        alert("No se pudieron obtener las tarifas en este momento. Verifica la comuna o intenta de nuevo.");
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión al calcular el envío.");
    } finally {
      setCargandoEnvio(false);
    }
  };

  const validarFormulario = () => {
    const nuevosErrores: Record<string, string> = {};
    if (!validateRut(formData.rut)) nuevosErrores.rut = 'El RUT ingresado no es válido.';
    if (docType === 'FACTURA' && !validateRut(formData.rutFactura)) {
      nuevosErrores.rutFactura = 'El RUT de empresa no es válido.';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) nuevosErrores.email = 'Ingresa un correo electrónico válido.';
    const phoneRegex = /^[0-9\+\-\s]{8,15}$/;
    if (!phoneRegex.test(formData.phone)) nuevosErrores.phone = 'Ingresa un número de teléfono válido.';

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!acceptTerms) {
      alert("Debes aceptar los Términos y Condiciones y la Política de Privacidad para continuar.");
      return;
    }

    if (!validarFormulario()) {
      alert("Revisa los campos destacados en rojo antes de continuar.");
      return;
    }

    if (!envioSeleccionado) {
      alert('Por favor selecciona una opción de entrega antes de pagar.');
      return;
    }

    setLoading(true);

    try {
      const buyOrder = `ORD-${Date.now().toString().slice(-6)}`;
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyOrder,
          sessionId: `SESS-${Math.floor(Math.random() * 100000)}`,
          returnUrl: `${window.location.origin}/api/checkout/confirm`,
          customer: formData,
          items,
          documentType: docType,
          shippingInfo: {
            ...envioSeleccionado,
            sucursalOficina: metodoEntrega === 'retiro' ? 'Retiro en Tienda - Av. Las Condes 8550' : 'Envío a domicilio'
          }
        }),
      });

      const data = await res.json();
      if (data.url && data.token) {
        const form = document.createElement('form');
        form.action = data.url;
        form.method = 'POST';
        const tokenInput = document.createElement('input');
        tokenInput.type = 'hidden';
        tokenInput.name = 'token_ws';
        tokenInput.value = data.token;
        form.appendChild(tokenInput);
        document.body.appendChild(form);
        form.submit();
      } else {
        alert('Error al conectar con la pasarela de pago');
        setLoading(false);
      }
    } catch (err) {
      alert('Error procesando la transacción');
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errores[e.target.name]) {
      setErrores({ ...errores, [e.target.name]: '' });
    }
  };

  const totalFinal = getCartSubtotal() + (envioSeleccionado ? envioSeleccionado.cost : 0);

  return (
    <div className="min-h-screen bg-slate-50/50 text-gray-900 pt-28 sm:pt-32 pb-24 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Encabezado Principal */}
        <div className="mb-10 text-center sm:text-left border-b border-slate-200/80 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-100 text-[#b3131b] text-[10px] font-mono font-bold uppercase tracking-wider mb-3">
            <Lock className="w-3.5 h-3.5" />
            <span>CHECKOUT CIFRADO SSL 256-BIT · WEBPAY PLUS</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-gray-900">
            Finalizar Compra
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Completa tus datos de facturación y despacho para procesar tu orden de forma segura.
          </p>
        </div>

        <form onSubmit={handlePayment} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          
          <div className="lg:col-span-7 space-y-6">
            
            {/* 01. SECCIÓN DOCUMENTO TRIBUTARIO */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-7 sm:p-9 shadow-sm">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                <FileText className="w-4 h-4 text-[#b3131b]" />
                <h2 className="text-xs font-mono uppercase tracking-wider text-gray-900 font-bold">
                  01 · Tipo de Documento Tributario
                </h2>
              </div>

              <div className="flex gap-3 mb-2">
                <button 
                  type="button" 
                  onClick={() => setDocType('BOLETA')} 
                  className={`flex-1 py-3.5 px-4 text-xs font-bold tracking-wider rounded-xl border transition-all ${
                    docType === 'BOLETA' 
                      ? 'bg-slate-900 text-white border-slate-900 shadow-2xs' 
                      : 'bg-slate-50/70 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  BOLETA ELECTRÓNICA
                </button>
                <button 
                  type="button" 
                  onClick={() => setDocType('FACTURA')} 
                  className={`flex-1 py-3.5 px-4 text-xs font-bold tracking-wider rounded-xl border transition-all ${
                    docType === 'FACTURA' 
                      ? 'bg-slate-900 text-white border-slate-900 shadow-2xs' 
                      : 'bg-slate-50/70 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  FACTURA EMPRESA
                </button>
              </div>

              {docType === 'FACTURA' && (
                <div className="mt-6 pt-6 border-t border-slate-100 animate-in fade-in duration-300">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-700 mb-1.5 font-bold">
                        RUT Empresa *
                      </label>
                      <input 
                        type="text" 
                        name="rutFactura" 
                        required={docType === 'FACTURA'} 
                        placeholder="76.123.456-7"
                        value={formData.rutFactura} 
                        onChange={(e) => {
                          const formatted = formatRut(e.target.value);
                          setFormData({ ...formData, rutFactura: formatted });
                          if (errores.rutFactura) setErrores({ ...errores, rutFactura: '' });
                        }} 
                        className={`w-full bg-slate-50/60 border rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 outline-none transition-all text-slate-900 ${
                          errores.rutFactura ? 'border-red-500 focus:ring-red-100' : 'border-slate-200 focus:border-[#b3131b] focus:ring-red-100'
                        }`} 
                      />
                      {errores.rutFactura && <p className="text-xs text-red-500 mt-1">{errores.rutFactura}</p>}
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-700 mb-1.5 font-bold">
                        Razón Social *
                      </label>
                      <input 
                        type="text" 
                        name="razonSocial" 
                        required={docType === 'FACTURA'} 
                        placeholder="Nombre de la empresa"
                        value={formData.razonSocial} 
                        onChange={handleChange} 
                        className="w-full bg-slate-50/60 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:border-[#b3131b] focus:bg-white focus:ring-2 focus:ring-red-100 outline-none transition-all" 
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-700 mb-1.5 font-bold">
                        Giro Comercial *
                      </label>
                      <input 
                        type="text" 
                        name="giro" 
                        required={docType === 'FACTURA'} 
                        placeholder="Ej: Servicios automotrices / Transporte"
                        value={formData.giro} 
                        onChange={handleChange} 
                        className="w-full bg-slate-50/60 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:border-[#b3131b] focus:bg-white focus:ring-2 focus:ring-red-100 outline-none transition-all" 
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-700 mb-1.5 font-bold">
                        Región Empresa *
                      </label>
                      <select 
                        name="regionFactura" 
                        required={docType === 'FACTURA'} 
                        value={formData.regionFactura} 
                        onChange={(e) => setFormData({ ...formData, regionFactura: e.target.value, comunaFactura: '' })} 
                        className="w-full bg-slate-50/60 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:border-[#b3131b] focus:bg-white focus:ring-2 focus:ring-red-100 outline-none transition-all cursor-pointer"
                      >
                        <option value="">Selecciona...</option>
                        {Object.keys(REGIONES_CHILE).map((reg) => (<option key={reg} value={reg}>{reg}</option>))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-700 mb-1.5 font-bold">
                        Comuna Empresa *
                      </label>
                      <select 
                        name="comunaFactura" 
                        required={docType === 'FACTURA'} 
                        value={formData.comunaFactura} 
                        onChange={handleChange} 
                        disabled={!formData.regionFactura} 
                        className="w-full bg-slate-50/60 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:border-[#b3131b] focus:bg-white focus:ring-2 focus:ring-red-100 outline-none transition-all cursor-pointer disabled:opacity-50"
                      >
                        <option value="">Selecciona...</option>
                        {formData.regionFactura && REGIONES_CHILE[formData.regionFactura].map((com) => (<option key={com} value={com}>{com}</option>))}
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-700 mb-1.5 font-bold">
                        Dirección Tributaria *
                      </label>
                      <input 
                        type="text" 
                        name="direccionFactura" 
                        required={docType === 'FACTURA'} 
                        placeholder="Calle, número, oficina"
                        value={formData.direccionFactura} 
                        onChange={handleChange} 
                        className="w-full bg-slate-50/60 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:border-[#b3131b] focus:bg-white focus:ring-2 focus:ring-red-100 outline-none transition-all" 
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 02. DATOS DEL CLIENTE */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-7 sm:p-9 shadow-sm">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                <User className="w-4 h-4 text-[#b3131b]" />
                <h2 className="text-xs font-mono uppercase tracking-wider text-gray-900 font-bold">
                  02 · Datos de Contacto y Receptor
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-700 mb-1.5 font-bold">
                    Nombre Completo *
                  </label>
                  <input 
                    type="text" 
                    name="fullName" 
                    required 
                    placeholder="Quien recibe la encomienda"
                    value={formData.fullName} 
                    onChange={handleChange} 
                    className="w-full bg-slate-50/60 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:border-[#b3131b] focus:bg-white focus:ring-2 focus:ring-red-100 outline-none transition-all" 
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-700 mb-1.5 font-bold">
                    RUT del Receptor *
                  </label>
                  <input 
                    type="text" 
                    name="rut" 
                    required 
                    placeholder="12.345.678-9"
                    value={formData.rut} 
                    onChange={(e) => {
                      const formatted = formatRut(e.target.value);
                      setFormData({ ...formData, rut: formatted });
                      if (errores.rut) setErrores({ ...errores, rut: '' });
                    }} 
                    className={`w-full bg-slate-50/60 border rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 outline-none transition-all text-slate-900 ${
                      errores.rut ? 'border-red-500 focus:ring-red-100' : 'border-slate-200 focus:border-[#b3131b] focus:ring-red-100'
                    }`} 
                  />
                  {errores.rut && <p className="text-xs text-red-500 mt-1">{errores.rut}</p>}
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-700 mb-1.5 font-bold">
                    Correo Electrónico *
                  </label>
                  <input 
                    type="email" 
                    name="email" 
                    required 
                    placeholder="tu@correo.com"
                    value={formData.email} 
                    onChange={handleChange} 
                    className={`w-full bg-slate-50/60 border rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 outline-none transition-all text-slate-900 ${
                      errores.email ? 'border-red-500 focus:ring-red-100' : 'border-slate-200 focus:border-[#b3131b] focus:ring-red-100'
                    }`} 
                  />
                  {errores.email && <p className="text-xs text-red-500 mt-1">{errores.email}</p>}
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-700 mb-1.5 font-bold">
                    Teléfono Móvil *
                  </label>
                  <input 
                    type="tel" 
                    name="phone" 
                    required 
                    placeholder="+56 9 1234 5678" 
                    value={formData.phone} 
                    onChange={handleChange} 
                    className={`w-full bg-slate-50/60 border rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 outline-none transition-all text-slate-900 ${
                      errores.phone ? 'border-red-500 focus:ring-red-100' : 'border-slate-200 focus:border-[#b3131b] focus:ring-red-100'
                    }`} 
                  />
                  {errores.phone && <p className="text-xs text-red-500 mt-1">{errores.phone}</p>}
                </div>
              </div>
            </div>

            {/* 03. ENTREGA Y DESPACHO */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-7 sm:p-9 shadow-sm">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                <Truck className="w-4 h-4 text-[#b3131b]" />
                <h2 className="text-xs font-mono uppercase tracking-wider text-gray-900 font-bold">
                  03 · Método de Entrega
                </h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {/* Despacho */}
                <label 
                  onClick={() => {
                    setMetodoEntrega('despacho');
                    setEnvioSeleccionado(null);
                  }}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-4 ${
                    metodoEntrega === 'despacho' 
                      ? 'border-[#b3131b] bg-red-50/20 shadow-xs' 
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                    metodoEntrega === 'despacho' ? 'border-[#b3131b]' : 'border-slate-300'
                  }`}>
                    {metodoEntrega === 'despacho' && <div className="w-2.5 h-2.5 bg-[#b3131b] rounded-full" />}
                  </div>
                  <div>
                    <span className="font-bold text-sm block text-gray-900">Envío a Domicilio</span>
                    <span className="text-xs text-slate-500">Starken, BlueExpress o Chilexpress</span>
                  </div>
                </label>

                {/* Retiro en Tienda */}
                <label 
                  onClick={() => {
                    setMetodoEntrega('retiro');
                    setEnvioSeleccionado({
                      id: 'retiro-tienda',
                      carrier: 'RETIRO',
                      serviceName: 'En Tienda',
                      label: 'Retiro en Tienda Las Condes',
                      cost: 0
                    });
                  }}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-4 ${
                    metodoEntrega === 'retiro' 
                      ? 'border-[#b3131b] bg-red-50/20 shadow-xs' 
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                    metodoEntrega === 'retiro' ? 'border-[#b3131b]' : 'border-slate-300'
                  }`}>
                    {metodoEntrega === 'retiro' && <div className="w-2.5 h-2.5 bg-[#b3131b] rounded-full" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-gray-900">Retiro en Tienda</span>
                      <span className="text-[10px] font-mono uppercase bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">Gratis</span>
                    </div>
                    <span className="text-xs text-slate-500">Av. Las Condes 8550</span>
                  </div>
                </label>
              </div>

              {metodoEntrega === 'despacho' ? (
                <div className="animate-in fade-in duration-300">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="sm:col-span-3">
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-700 mb-1.5 font-bold">
                        Dirección de Despacho *
                      </label>
                      <input 
                        type="text" 
                        name="address" 
                        required={metodoEntrega === 'despacho'} 
                        value={formData.address} 
                        onChange={handleChange} 
                        className="w-full bg-slate-50/60 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:border-[#b3131b] focus:bg-white focus:ring-2 focus:ring-red-100 outline-none transition-all" 
                        placeholder="Calle, número, departamento u oficina" 
                      />
                    </div>
                    
                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-700 mb-1.5 font-bold">
                        Región *
                      </label>
                      <select 
                        name="region" 
                        required={metodoEntrega === 'despacho'} 
                        value={formData.region} 
                        onChange={(e) => {
                          setFormData({ ...formData, region: e.target.value, comuna: '' });
                          setEnvioSeleccionado(null);
                          setTarifasDinamicas([]);
                        }} 
                        className="w-full bg-slate-50/60 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:border-[#b3131b] focus:bg-white focus:ring-2 focus:ring-red-100 outline-none transition-all cursor-pointer"
                      >
                        <option value="">Selecciona...</option>
                        {Object.keys(REGIONES_CHILE).map((reg) => (<option key={reg} value={reg}>{reg}</option>))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-700 mb-1.5 font-bold">
                        Comuna *
                      </label>
                      <select 
                        name="comuna" 
                        required={metodoEntrega === 'despacho'} 
                        value={formData.comuna} 
                        onChange={(e) => {
                          setFormData({ ...formData, comuna: e.target.value });
                          setEnvioSeleccionado(null);
                          setTarifasDinamicas([]);
                        }} 
                        disabled={!formData.region} 
                        className="w-full bg-slate-50/60 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:border-[#b3131b] focus:bg-white focus:ring-2 focus:ring-red-100 outline-none transition-all cursor-pointer disabled:opacity-50"
                      >
                        <option value="">Selecciona...</option>
                        {formData.region && REGIONES_CHILE[formData.region].map((com) => (<option key={com} value={com}>{com}</option>))}
                      </select>
                    </div>

                    <div className="flex items-end">
                      <button 
                        type="button" 
                        onClick={calcularFlete} 
                        disabled={cargandoEnvio || !formData.comuna} 
                        className="w-full bg-slate-900 hover:bg-black text-white font-bold h-[48px] rounded-xl text-xs uppercase tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
                      >
                        {cargandoEnvio ? 'Calculando...' : 'Cotizar Envío'}
                      </button>
                    </div>
                  </div>

                  {tarifasDinamicas.length > 0 ? (
                    <div className="space-y-3 animate-in fade-in duration-300 border-t border-slate-100 pt-6">
                      <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-bold mb-3">
                        Selecciona el courier de tu preferencia
                      </p>
                      {tarifasDinamicas.map((tarifa) => (
                        <label 
                          key={tarifa.id} 
                          onClick={() => setEnvioSeleccionado(tarifa)} 
                          className={`flex items-center justify-between p-4 rounded-xl cursor-pointer border-2 transition-all ${
                            envioSeleccionado?.id === tarifa.id 
                              ? 'border-[#b3131b] bg-red-50/20' 
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                              envioSeleccionado?.id === tarifa.id ? 'border-[#b3131b]' : 'border-slate-300'
                            }`}>
                              {envioSeleccionado?.id === tarifa.id && <div className="w-2 h-2 bg-[#b3131b] rounded-full" />}
                            </div>
                            <span className="text-xs font-bold text-gray-900">{tarifa.label}</span>
                          </div>
                          <span className="text-sm font-black text-gray-900 font-mono">
                            {STORE_CONFIG.CURRENCY_FORMAT.format(tarifa.cost)}
                          </span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 text-xs text-slate-500 text-center">
                      {formData.comuna ? 'Presiona "Cotizar Envío" para consultar las tarifas de courier disponibles.' : 'Selecciona tu región y comuna para calcular el costo del envío.'}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-200 animate-in fade-in duration-300">
                  <div className="flex items-center gap-2 mb-1">
                    <Check className="w-4 h-4 text-emerald-700" />
                    <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wide">Retiro Sin Costo</h4>
                  </div>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    Tu pedido estará listo para retiro en <strong className="font-semibold">Av. Las Condes 8550</strong>. Te avisaremos por correo una vez que tu compra se encuentre preparada.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* RESUMEN DEL PEDIDO */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-7 sm:p-9 shadow-sm sticky top-28">
              <div className="flex items-center gap-2 pb-4 border-b border-slate-100 mb-6">
                <ShoppingBag className="w-4 h-4 text-[#b3131b]" />
                <h2 className="text-xs font-mono uppercase tracking-wider text-gray-900 font-bold">
                  Resumen de tu Orden
                </h2>
              </div>
              
              <div className="divide-y divide-slate-100 mb-6 max-h-[35vh] overflow-y-auto pr-2">
                {items.map(({ product, quantity }) => (
                  <div key={product.id} className="py-3.5 flex gap-4 items-center">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-900 leading-snug truncate">{product.name}</p>
                      <p className="text-[10px] font-mono text-slate-400 mt-0.5">Cant: {quantity}</p>
                    </div>
                    <span className="text-xs font-black text-gray-900 font-mono">
                      {STORE_CONFIG.CURRENCY_FORMAT.format(product.price * quantity)}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="space-y-3 pt-4 border-t border-slate-100 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal Productos</span>
                  <span className="font-mono font-bold text-gray-900">{STORE_CONFIG.CURRENCY_FORMAT.format(getCartSubtotal())}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Costo de Despacho</span>
                  <span className="font-mono font-bold text-gray-900">
                    {metodoEntrega === 'retiro' 
                      ? 'Gratis' 
                      : (envioSeleccionado ? STORE_CONFIG.CURRENCY_FORMAT.format(envioSeleccionado.cost) : 'Por cotizar')}
                  </span>
                </div>
                <div className="flex justify-between text-base font-black text-gray-900 pt-4 border-t border-slate-100">
                  <span className="uppercase tracking-wider">Total a Pagar</span>
                  <span className="text-xl text-[#b3131b] font-mono">{STORE_CONFIG.CURRENCY_FORMAT.format(totalFinal)}</span>
                </div>
              </div>

              {/* CHECKBOX TÉRMINOS Y CONDICIONES */}
              <div className="mt-6 pt-4 border-t border-slate-100">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="flex items-center h-5">
                    <input
                      type="checkbox"
                      required
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="w-4 h-4 border border-slate-300 rounded text-[#b3131b] focus:ring-[#b3131b] cursor-pointer"
                    />
                  </div>
                  <div className="text-[11px] text-slate-500 leading-snug">
                    He leído y acepto los{' '}
                    <Link href="/terminos" target="_blank" className="font-bold text-gray-900 hover:text-[#b3131b] underline transition-colors">
                      Términos y Condiciones
                    </Link>{' '}
                    y la{' '}
                    <Link href="/terminos" target="_blank" className="font-bold text-gray-900 hover:text-[#b3131b] underline transition-colors">
                      Política de Privacidad
                    </Link>
                    .
                  </div>
                </label>
              </div>
              
              <button 
                type="submit" 
                disabled={loading || !envioSeleccionado || !acceptTerms} 
                className="w-full mt-6 bg-[#b3131b] hover:bg-[#8f0f15] text-white font-bold py-4 rounded-2xl uppercase tracking-wider text-xs transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                <Lock className="w-4 h-4" />
                <span>{loading ? 'CONECTANDO CON WEBPAY...' : 'PAGAR CON WEBPAY PLUS'}</span>
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-slate-400 font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Transacción segura y encriptada por Transbank</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}