'use client';
import { useState } from 'react';
import { Product } from '@/types';
import { formatRut, validateRut } from '@/lib/rut';

interface QuoteModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export default function QuoteModal({ product, isOpen, onClose }: QuoteModalProps) {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', rut: '', vehicle: '', message: '' });
  const [rutError, setRutError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleRutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatRut(e.target.value);
    setFormData({ ...formData, rut: formatted });
    if (formatted.length > 3 && !validateRut(formatted)) setRutError('RUT inválido');
    else setRutError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.rut && !validateRut(formData.rut)) {
      setRutError('Por favor ingresa un RUT válido');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, productName: product.name, productSku: product.sku }),
      });
      if (!res.ok) throw new Error('Falló el envío');
      setSuccess(true);
    } catch (err) {
      alert('Error enviando solicitud');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#121212] border border-white/10 w-full max-w-lg p-6 sm:p-8 relative text-white">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl font-bold">✕</button>
        <h2 className="text-xl font-bold tracking-tight uppercase mb-1">Cotizar por Email</h2>
        <p className="text-xs text-[#E88A5C] uppercase tracking-wider mb-6">{product.name} · SKU: {product.sku}</p>

        {success ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-[#E88A5C]/20 text-[#E88A5C] rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">✓</div>
            <h3 className="text-lg font-bold mb-2">¡Solicitud enviada con éxito!</h3>
            <p className="text-sm text-gray-400 mb-6">Hemos recibido tu consulta. Te responderemos a la brevedad.</p>
            <button onClick={onClose} className="bg-[#E88A5C] text-black font-bold px-6 py-2 uppercase tracking-wide hover:bg-opacity-90 text-sm">Cerrar</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Nombre Completo *</label>
              <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-[#0a0a0a] border border-white/10 p-3 text-sm focus:border-[#E88A5C] focus:outline-none text-white" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Email *</label>
                <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full bg-[#0a0a0a] border border-white/10 p-3 text-sm focus:border-[#E88A5C] focus:outline-none text-white" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Teléfono *</label>
                <input type="tel" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-[#0a0a0a] border border-white/10 p-3 text-sm focus:border-[#E88A5C] focus:outline-none text-white" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">RUT</label>
                <input type="text" value={formData.rut} onChange={handleRutChange} placeholder="12.345.678-9" className={`w-full bg-[#0a0a0a] border p-3 text-sm focus:outline-none text-white ${rutError ? 'border-red-500' : 'border-white/10 focus:border-[#E88A5C]'}`} />
                {rutError && <p className="text-xs text-red-500 mt-1">{rutError}</p>}
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Vehículo / Chasis</label>
                <input type="text" value={formData.vehicle} onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })} placeholder="Porsche 911 (991) 2018" className="w-full bg-[#0a0a0a] border border-white/10 p-3 text-sm focus:border-[#E88A5C] focus:outline-none text-white" />
              </div>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Observaciones</label>
              <textarea rows={3} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} className="w-full bg-[#0a0a0a] border border-white/10 p-3 text-sm focus:border-[#E88A5C] focus:outline-none text-white" />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-[#E88A5C] text-black font-bold py-3 uppercase tracking-wider hover:bg-opacity-90 text-sm disabled:opacity-50 mt-4">
              {loading ? 'Enviando...' : 'Enviar Cotización'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
