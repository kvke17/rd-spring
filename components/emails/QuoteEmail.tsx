// components/emails/QuoteEmail.tsx
import * as React from 'react';

interface QuoteEmailProps {
  name: string;
  email: string;
  phone: string;
  rut?: string;
  vehicle?: string;
  partNeeded: string;
}

export const QuoteEmail: React.FC<Readonly<QuoteEmailProps>> = ({
  name,
  email,
  phone,
  rut,
  vehicle,
  partNeeded,
}) => (
  <div style={{ fontFamily: 'Arial, sans-serif', color: '#333', lineHeight: '1.6', padding: '20px' }}>
    <div style={{ maxWidth: '600px', margin: '0 auto', border: '1px solid #eaeaea', borderRadius: '8px', padding: '20px', backgroundColor: '#ffffff' }}>
      
      <h2 style={{ color: '#0056b3', borderBottom: '2px solid #eaeaea', paddingBottom: '10px' }}>
        Nueva Solicitud de Cotización
      </h2>
      
      <p style={{ fontSize: '16px', margin: '20px 0' }}>
        Se ha recibido una nueva solicitud de repuesto. A continuación, los detalles:
      </p>

      <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '6px', marginBottom: '20px' }}>
        <h3 style={{ marginTop: '0', color: '#333' }}>Repuesto Solicitado</h3>
        <p style={{ margin: '0', fontSize: '15px' }}>{partNeeded}</p>
      </div>

      <h3 style={{ color: '#333' }}>Datos del Cliente</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          <tr>
            <td style={{ padding: '8px 0', borderBottom: '1px solid #eaeaea' }}><strong>Nombre:</strong></td>
            <td style={{ padding: '8px 0', borderBottom: '1px solid #eaeaea' }}>{name}</td>
          </tr>
          <tr>
            <td style={{ padding: '8px 0', borderBottom: '1px solid #eaeaea' }}><strong>Email:</strong></td>
            <td style={{ padding: '8px 0', borderBottom: '1px solid #eaeaea' }}>{email}</td>
          </tr>
          <tr>
            <td style={{ padding: '8px 0', borderBottom: '1px solid #eaeaea' }}><strong>Teléfono:</strong></td>
            <td style={{ padding: '8px 0', borderBottom: '1px solid #eaeaea' }}>{phone}</td>
          </tr>
          <tr>
            <td style={{ padding: '8px 0', borderBottom: '1px solid #eaeaea' }}><strong>RUT:</strong></td>
            <td style={{ padding: '8px 0', borderBottom: '1px solid #eaeaea' }}>{rut || 'No especificado'}</td>
          </tr>
          <tr>
            <td style={{ padding: '8px 0', borderBottom: '1px solid #eaeaea' }}><strong>Vehículo:</strong></td>
            <td style={{ padding: '8px 0', borderBottom: '1px solid #eaeaea' }}>{vehicle || 'No especificado'}</td>
          </tr>
        </tbody>
      </table>

      <p style={{ fontSize: '12px', color: '#888', marginTop: '30px', textAlign: 'center' }}>
        Este es un correo automático generado desde el sitio web de RD Spring.
      </p>
    </div>
  </div>
);