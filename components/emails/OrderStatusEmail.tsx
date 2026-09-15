import { Html, Head, Body, Container, Section, Text, Hr } from '@react-email/components';
import * as React from 'react';

interface OrderStatusEmailProps {
  customerName: string;
  buyOrder: string;
  shippingStatus: string;
  isPickup?: boolean; // Agregamos esta variable para saber si es retiro
}

export default function OrderStatusEmail({
  customerName = 'Cliente',
  buyOrder = 'ORD-000',
  shippingStatus = 'CONFIRMADO',
  isPickup = false,
}: OrderStatusEmailProps) {
  
  // Líneas de tiempo dinámicas según el método de entrega
  const STAGES = isPickup 
    ? [
        { value: 'CONFIRMADO', label: 'Pedido confirmado' },
        { value: 'PREPARANDO', label: 'En preparación' },
        { value: 'LISTO_PARA_RETIRO', label: 'Listo para retiro' },
        { value: 'ENTREGADO', label: 'Entregado' },
      ]
    : [
        { value: 'CONFIRMADO', label: 'Pedido confirmado' },
        { value: 'PREPARANDO', label: 'En preparación' },
        { value: 'EN_CAMINO', label: 'En camino' },
        { value: 'ENTREGADO', label: 'Entregado' },
      ];

  const currentIndex = STAGES.findIndex(s => s.value === shippingStatus);
  const activeIndex = currentIndex === -1 ? 0 : currentIndex;

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Text style={logo}>RD SPRING</Text>
          <Text style={title}>ACTUALIZACIÓN DE TU PEDIDO</Text>
          
          <Section style={card}>
            <Text style={text}>
              Hola <strong style={{ color: '#fff' }}>{customerName}</strong>,
            </Text>
            <Text style={text}>
              El estado de tu pedido <strong style={{ color: '#fff', fontFamily: 'monospace' }}>{buyOrder}</strong> ha sido actualizado a <strong style={{ color: '#fff' }}>{STAGES[activeIndex]?.label || shippingStatus}</strong>.
            </Text>

            {/* Mensaje condicional súper destacado para el retiro */}
            {shippingStatus === 'LISTO_PARA_RETIRO' && (
              <Section style={alertBox}>
                <Text style={alertText}>
                  <strong style={{ color: '#fff', fontSize: '16px' }}>¡Tu pedido ya está listo! 🎉</strong><br /><br />
                  Te esperamos en nuestra tienda ubicada en <strong>Av. Las Condes 8550</strong> para hacer la entrega. Recuerda llevar tu número de orden o RUT para identificarte.
                </Text>
              </Section>
            )}

            <Hr style={divider} />

            {/* LÍNEA DE TIEMPO VERTICAL DINÁMICA */}
            <Section style={{ marginTop: '32px', marginBottom: '32px' }}>
              <table cellPadding={0} cellSpacing={0} border={0} width="100%">
                {STAGES.map((stage, index) => {
                  const isDone = index <= activeIndex;
                  const isLast = index === STAGES.length - 1;
                  
                  return (
                    <tr key={stage.value}>
                      <td width="50" align="center" valign="top">
                        <div style={{
                          width: '24px', height: '24px', borderRadius: '50%',
                          backgroundColor: isDone ? '#b3131b' : 'transparent',
                          border: isDone ? '1px solid #b3131b' : '1px solid #333',
                          color: isDone ? '#fff' : '#666',
                          textAlign: 'center', lineHeight: '24px', fontSize: '12px',
                          fontWeight: 'bold', fontFamily: 'monospace'
                        }}>
                          {isDone ? '✓' : (index + 1)}
                        </div>
                        
                        {!isLast && (
                          <div style={{
                            width: '2px', height: '40px',
                            backgroundColor: index < activeIndex ? '#b3131b' : '#333',
                            margin: '4px auto'
                          }} />
                        )}
                      </td>
                      
                      <td valign="top" style={{ paddingTop: '4px', paddingBottom: isLast ? '0' : '16px' }}>
                        <Text style={{
                          margin: 0, color: isDone ? '#fff' : '#666', fontSize: '14px',
                          fontWeight: 'bold', textTransform: 'uppercase',
                          letterSpacing: '1px', fontFamily: 'monospace'
                        }}>
                          {stage.label}
                        </Text>
                      </td>
                    </tr>
                  );
                })}
              </table>
            </Section>

            <Hr style={divider} />

            <Text style={footerText}>
              Puedes hacer el seguimiento detallado y revisar tu boleta en nuestra plataforma ingresando tu número de orden en la sección de Soporte.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Estilos
const main = { backgroundColor: '#0a0a0a', fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif', padding: '40px 0' };
const container = { margin: '0 auto', padding: '0 20px', maxWidth: '600px' };
const logo = { color: '#b3131b', fontSize: '12px', fontWeight: 'bold', letterSpacing: '4px', textAlign: 'center' as const, fontFamily: 'monospace', marginBottom: '12px' };
const title = { color: '#ffffff', fontSize: '20px', fontWeight: 'bold', textAlign: 'center' as const, textTransform: 'uppercase' as const, letterSpacing: '2px', marginBottom: '40px' };
const card = { backgroundColor: '#121212', border: '1px solid rgba(255,255,255,0.1)', padding: '32px', borderRadius: '4px' };
const text = { color: '#a3a3a3', fontSize: '14px', lineHeight: '24px', margin: '0 0 16px 0' };
const alertBox = { backgroundColor: 'rgba(6, 182, 212, 0.1)', border: '1px solid #06b6d4', padding: '20px', borderRadius: '6px', marginTop: '24px' };
const alertText = { color: '#cffafe', fontSize: '14px', lineHeight: '22px', margin: 0, textAlign: 'center' as const };
const divider = { borderColor: 'rgba(255,255,255,0.1)', margin: '24px 0' };
const footerText = { color: '#666666', fontSize: '11px', lineHeight: '20px', textAlign: 'center' as const, fontFamily: 'monospace', textTransform: 'uppercase' as const, letterSpacing: '1px' };