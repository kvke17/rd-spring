'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/lib/store';
import { formatRut, validateRut } from '@/lib/rut';
import { STORE_CONFIG } from '@/config/constants';

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
      <div className="min-h-screen bg-gray-50 text-black flex flex-col items-center justify-center p-6">
        <h1 className="text-2xl font-bold uppercase mb-4 tracking-wider">Tu carro está vacío</h1>
        <Link href="/catalogo" className="bg-black text-white font-bold px-8 py-4 uppercase tracking-widest hover:bg-gray-900 transition shadow-md">
          Explorar Catálogo
        </Link>
      </div>
    );
  }

  const calcularFlete = async () => {
    if (!formData.region || !formData.comuna) {
      alert("Por favor, selecciona tu Región y Comuna primero para calcular el envío.");
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
        alert("No se pudieron obtener las tarifas. Verifica la comuna o intenta de nuevo.");
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
      alert("Revisa los campos en rojo antes de continuar.");
      return;
    }

    if (!envioSeleccionado) {
      alert('Por favor, selecciona una opción de entrega antes de pagar.');
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
    <div className="min-h-screen bg-gray-50 text-black pt-28 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-12 border-b border-gray-300 pb-6">
          <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tight text-black">Finalizar compra</h1>
          <p className="text-gray-600 mt-2 text-sm">Completa tus datos de forma segura para procesar tu pedido.</p>
        </div>

        <form onSubmit={handlePayment} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          <div className="lg:col-span-7 space-y-8">
            
            {/* 01. SECCIÓN DOCUMENTO TRIBUTARIO */}
            <div className="bg-white border border-gray-200 p-8 shadow-sm">
              <h2 className="text-sm uppercase tracking-widest text-black mb-6 font-bold border-b border-gray-100 pb-4">01 · Tipo de Documento</h2>
              <div className="flex gap-4 mb-2">
                <button type="button" onClick={() => setDocType('BOLETA')} className={`flex-1 py-4 text-xs font-bold tracking-widest border transition-colors ${docType === 'BOLETA' ? 'bg-black text-white border-black' : 'bg-white text-black border-gray-300 hover:bg-gray-50'}`}>BOLETA</button>
                <button type="button" onClick={() => setDocType('FACTURA')} className={`flex-1 py-4 text-xs font-bold tracking-widest border transition-colors ${docType === 'FACTURA' ? 'bg-black text-white border-black' : 'bg-white text-black border-gray-300 hover:bg-gray-50'}`}>FACTURA (MANUAL)</button>
              </div>

              {docType === 'FACTURA' && (
                <div className="mt-8 pt-6 border-t border-gray-100 animate-in fade-in duration-300">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[11px] uppercase tracking-widest text-black mb-2 font-bold">RUT Empresa *</label>
                      <input type="text" name="rutFactura" required={docType === 'FACTURA'} value={formData.rutFactura} onChange={(e) => {
                        const formatted = formatRut(e.target.value);
                        setFormData({ ...formData, rutFactura: formatted });
                        if (errores.rutFactura) setErrores({ ...errores, rutFactura: '' });
                      }} className={`w-full bg-white border p-3 text-sm outline-none transition-colors ${errores.rutFactura ? 'border-red-500 bg-red-50 focus:border-red-500' : 'border-gray-300 focus:border-black'}`} />
                      {errores.rutFactura && <p className="text-xs text-red-500 mt-1">{errores.rutFactura}</p>}
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-widest text-black mb-2 font-bold">Razón Social *</label>
                      <input type="text" name="razonSocial" required={docType === 'FACTURA'} value={formData.razonSocial} onChange={handleChange} className="w-full bg-white border border-gray-300 p-3 text-sm focus:border-black outline-none transition-colors" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] uppercase tracking-widest text-black mb-2 font-bold">Giro Comercial *</label>
                      <input type="text" name="giro" required={docType === 'FACTURA'} value={formData.giro} onChange={handleChange} className="w-full bg-white border border-gray-300 p-3 text-sm focus:border-black outline-none transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-widest text-black mb-2 font-bold">Región *</label>
                      <select name="regionFactura" required={docType === 'FACTURA'} value={formData.regionFactura} onChange={(e) => setFormData({ ...formData, regionFactura: e.target.value, comunaFactura: '' })} className="w-full bg-white border border-gray-300 p-3 text-sm focus:border-black outline-none transition-colors cursor-pointer">
                        <option value="">Selecciona...</option>
                        {Object.keys(REGIONES_CHILE).map((reg) => (<option key={reg} value={reg}>{reg}</option>))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-widest text-black mb-2 font-bold">Comuna *</label>
                      <select name="comunaFactura" required={docType === 'FACTURA'} value={formData.comunaFactura} onChange={handleChange} disabled={!formData.regionFactura} className="w-full bg-white border border-gray-300 p-3 text-sm focus:border-black outline-none transition-colors cursor-pointer disabled:opacity-50">
                        <option value="">Selecciona...</option>
                        {formData.regionFactura && REGIONES_CHILE[formData.regionFactura].map((com) => (<option key={com} value={com}>{com}</option>))}
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] uppercase tracking-widest text-black mb-2 font-bold">Dirección Exacta *</label>
                      <input type="text" name="direccionFactura" required={docType === 'FACTURA'} value={formData.direccionFactura} onChange={handleChange} className="w-full bg-white border border-gray-300 p-3 text-sm focus:border-black outline-none transition-colors" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 02. DATOS DEL CLIENTE */}
            <div className="bg-white border border-gray-200 p-8 shadow-sm">
              <h2 className="text-sm uppercase tracking-widest text-black mb-6 font-bold border-b border-gray-100 pb-4">02 · Datos de Contacto</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] uppercase tracking-widest text-black mb-2 font-bold">Nombre Completo *</label>
                  <input type="text" name="fullName" required value={formData.fullName} onChange={handleChange} className="w-full bg-white border border-gray-300 p-3 text-sm focus:border-black outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-widest text-black mb-2 font-bold">RUT (Quien recibe) *</label>
                  <input type="text" name="rut" required value={formData.rut} onChange={(e) => {
                    const formatted = formatRut(e.target.value);
                    setFormData({ ...formData, rut: formatted });
                    if (errores.rut) setErrores({ ...errores, rut: '' });
                  }} className={`w-full bg-white border p-3 text-sm outline-none transition-colors ${errores.rut ? 'border-red-500 bg-red-50 focus:border-red-500' : 'border-gray-300 focus:border-black'}`} />
                  {errores.rut && <p className="text-xs text-red-500 mt-1">{errores.rut}</p>}
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-widest text-black mb-2 font-bold">Email *</label>
                  <input type="email" name="email" required value={formData.email} onChange={handleChange} className={`w-full bg-white border p-3 text-sm outline-none transition-colors ${errores.email ? 'border-red-500 bg-red-50 focus:border-red-500' : 'border-gray-300 focus:border-black'}`} />
                  {errores.email && <p className="text-xs text-red-500 mt-1">{errores.email}</p>}
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-widest text-black mb-2 font-bold">Teléfono *</label>
                  <input type="tel" name="phone" required placeholder="Ej: +56912345678" value={formData.phone} onChange={handleChange} className={`w-full bg-white border p-3 text-sm outline-none transition-colors ${errores.phone ? 'border-red-500 bg-red-50 focus:border-red-500' : 'border-gray-300 focus:border-black'}`} />
                  {errores.phone && <p className="text-xs text-red-500 mt-1">{errores.phone}</p>}
                </div>
              </div>
            </div>

            {/* 03. ENTREGA Y DESPACHO */}
            <div className="bg-white border border-gray-200 p-8 shadow-sm">
              <h2 className="text-sm uppercase tracking-widest text-black mb-6 font-bold border-b border-gray-100 pb-4">03 · Método de Entrega</h2>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <label className={`flex-1 border p-4 cursor-pointer transition-all ${metodoEntrega === 'despacho' ? 'border-black bg-gray-50 ring-1 ring-black' : 'border-gray-200 hover:border-gray-300'}`}>
                  <div className="flex items-center">
                    <input 
                      type="radio" 
                      name="metodo" 
                      checked={metodoEntrega === 'despacho'} 
                      onChange={() => {
                        setMetodoEntrega('despacho');
                        setEnvioSeleccionado(null);
                      }} 
                      className="h-4 w-4 text-black focus:ring-black border-gray-300"
                    />
                    <span className="ml-3 font-bold text-sm">Envío a Domicilio</span>
                  </div>
                </label>

                <label className={`flex-1 border p-4 cursor-pointer transition-all ${metodoEntrega === 'retiro' ? 'border-black bg-gray-50 ring-1 ring-black' : 'border-gray-200 hover:border-gray-300'}`}>
                  <div className="flex items-center">
                    <input 
                      type="radio" 
                      name="metodo" 
                      checked={metodoEntrega === 'retiro'} 
                      onChange={() => {
                        setMetodoEntrega('retiro');
                        setEnvioSeleccionado({
                          id: 'retiro-tienda',
                          carrier: 'RETIRO',
                          serviceName: 'En Tienda',
                          label: 'Retiro en Tienda',
                          cost: 0
                        });
                      }} 
                      className="h-4 w-4 text-black focus:ring-black border-gray-300"
                    />
                    <div className="ml-3">
                      <span className="font-bold text-sm block">Retiro en Tienda (Gratis)</span>
                      <span className="text-xs text-gray-500">Av. Las Condes 8550</span>
                    </div>
                  </div>
                </label>
              </div>

              {metodoEntrega === 'despacho' ? (
                <div className="animate-in fade-in duration-300">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
                    <div className="sm:col-span-3">
                      <label className="block text-[11px] uppercase tracking-widest text-black mb-2 font-bold">Dirección de Despacho *</label>
                      <input type="text" name="address" required={metodoEntrega === 'despacho'} value={formData.address} onChange={handleChange} className="w-full bg-white border border-gray-300 p-3 text-sm text-black focus:border-black outline-none transition-colors" placeholder="Calle y número, Depto / Oficina" />
                    </div>
                    
                    <div>
                      <label className="block text-[11px] uppercase tracking-widest text-black mb-2 font-bold">Región *</label>
                      <select name="region" required={metodoEntrega === 'despacho'} value={formData.region} onChange={(e) => {
                          setFormData({ ...formData, region: e.target.value, comuna: '' });
                          setEnvioSeleccionado(null);
                          setTarifasDinamicas([]);
                        }} className="w-full bg-white border border-gray-300 p-3 text-sm focus:border-black outline-none transition-colors cursor-pointer">
                        <option value="">Selecciona...</option>
                        {Object.keys(REGIONES_CHILE).map((reg) => (<option key={reg} value={reg}>{reg}</option>))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-widest text-black mb-2 font-bold">Comuna *</label>
                      <select name="comuna" required={metodoEntrega === 'despacho'} value={formData.comuna} onChange={(e) => {
                          setFormData({ ...formData, comuna: e.target.value });
                          setEnvioSeleccionado(null);
                          setTarifasDinamicas([]);
                        }} disabled={!formData.region} className="w-full bg-white border border-gray-300 p-3 text-sm focus:border-black outline-none transition-colors cursor-pointer disabled:opacity-50">
                        <option value="">Selecciona...</option>
                        {formData.region && REGIONES_CHILE[formData.region].map((com) => (<option key={com} value={com}>{com}</option>))}
                      </select>
                    </div>

                    <div className="flex items-end">
                      <button type="button" onClick={calcularFlete} disabled={cargandoEnvio || !formData.comuna} className="w-full bg-black text-white font-bold h-[46px] text-xs uppercase tracking-widest hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed">
                        {cargandoEnvio ? 'Calculando...' : 'Cotizar Envío'}
                      </button>
                    </div>
                  </div>

                  {tarifasDinamicas.length > 0 ? (
                    <div className="space-y-4 animate-in fade-in duration-300 border-t border-gray-100 pt-6">
                      <p className="text-[11px] uppercase tracking-widest text-gray-500 font-bold mb-4">Selecciona tu Envío a Domicilio</p>
                      {tarifasDinamicas.map((tarifa) => (
                        <label 
                          key={tarifa.id} 
                          onClick={() => setEnvioSeleccionado(tarifa)} 
                          className={`flex items-center justify-between p-5 cursor-pointer border transition-colors ${envioSeleccionado?.id === tarifa.id ? 'border-black bg-gray-50 text-black' : 'border-gray-200 bg-white text-black hover:border-gray-400'}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${envioSeleccionado?.id === tarifa.id ? 'border-black' : 'border-gray-300'}`}>
                              {envioSeleccionado?.id === tarifa.id && <div className="w-2 h-2 bg-black rounded-full" />}
                            </div>
                            <span className="text-sm font-bold">{tarifa.label}</span>
                          </div>
                          <span className="text-sm font-bold">{STORE_CONFIG.CURRENCY_FORMAT.format(tarifa.cost)}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 bg-gray-50 border border-gray-200 text-sm text-gray-600 text-center mt-6">
                      {formData.comuna ? 'Presiona "Cotizar Envío" para ver las opciones disponibles.' : 'Selecciona tu región y comuna para calcular el envío.'}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-5 bg-green-50 border border-green-200 animate-in fade-in duration-300">
                  <h4 className="text-sm font-bold text-green-900 mb-1">¡Excelente elección!</h4>
                  <p className="text-sm text-green-800">
                    Tu pedido estará disponible para retiro en <strong>Av. Las Condes 8550</strong>. 
                    Te enviaremos un correo apenas el estado cambie a "Listo para retiro".
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* RESUMEN DEL PEDIDO */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-gray-200 p-8 shadow-sm sticky top-28">
              <h2 className="text-sm uppercase tracking-widest text-black mb-6 font-bold border-b border-gray-100 pb-4">Resumen de tu Pedido</h2>
              
              <div className="divide-y divide-gray-100 mb-6 max-h-[40vh] overflow-y-auto pr-2">
                {items.map(({ product, quantity }) => (
                  <div key={product.id} className="py-4 flex gap-4 items-center">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-black leading-snug truncate">{product.name}</p>
                      <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">Cant: {quantity}</p>
                    </div>
                    <span className="text-sm font-bold text-black">{STORE_CONFIG.CURRENCY_FORMAT.format(product.price * quantity)}</span>
                  </div>
                ))}
              </div>
              
              <div className="space-y-4 pt-6 border-t border-gray-200 text-sm">
                <div className="flex justify-between text-black">
                  <span>Subtotal Repuestos</span>
                  <span className="font-bold">{STORE_CONFIG.CURRENCY_FORMAT.format(getCartSubtotal())}</span>
                </div>
                <div className="flex justify-between text-black">
                  <span>Despacho</span>
                  <span className="font-bold">
                    {metodoEntrega === 'retiro' 
                      ? 'Gratis' 
                      : (envioSeleccionado ? STORE_CONFIG.CURRENCY_FORMAT.format(envioSeleccionado.cost) : 'Por calcular')}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold text-black pt-6 border-t border-gray-200">
                  <span className="uppercase tracking-wider">Total a Pagar</span>
                  <span className="text-[#b91c1c]">{STORE_CONFIG.CURRENCY_FORMAT.format(totalFinal)}</span>
                </div>
              </div>

              {/* CHECKBOX TÉRMINOS Y CONDICIONES */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="flex items-center h-5">
                    <input
                      type="checkbox"
                      required
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="w-4 h-4 border border-gray-300 rounded-sm bg-white checked:bg-black checked:border-black focus:ring-black transition"
                    />
                  </div>
                  <div className="text-[11px] text-gray-500 leading-snug">
                    He leído y acepto los{' '}
                    <Link href="/terminos" target="_blank" className="font-bold text-gray-900 hover:text-[#b91c1c] underline transition">
                      Términos y Condiciones
                    </Link>{' '}
                    y la{' '}
                    <Link href="/terminos" target="_blank" className="font-bold text-gray-900 hover:text-[#b91c1c] underline transition">
                      Política de Privacidad
                    </Link>
                    . Entiendo que las compras están sujetas a la garantía legal de 6 meses en Chile.
                  </div>
                </label>
              </div>
              
              <button 
                type="submit" 
                disabled={loading || !envioSeleccionado || !acceptTerms} 
                className="w-full mt-6 bg-[#b91c1c] text-white font-bold py-5 uppercase tracking-widest hover:bg-red-800 transition shadow-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'CONECTANDO...' : 'PAGAR AHORA'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}