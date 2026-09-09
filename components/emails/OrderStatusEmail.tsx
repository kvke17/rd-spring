import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface OrderStatusEmailProps {
  customerName: string;
  buyOrder: string;
  shippingStatus: string;
}

export default function OrderStatusEmail({
  customerName = 'Cliente',
  buyOrder = '000000',
  shippingStatus = 'CONFIRMADO',
}: OrderStatusEmailProps) {
  
  // Diccionario para generar mensajes amigables según el estado exacto
  const statusMessages: Record<string, string> = {
    'PREPARANDO': 'Estamos preparando tu pedido en nuestra bodega. Pronto será despachado.',
    'ENVIADO': '¡Buenas noticias! Tu pedido ya fue entregado a la empresa de transporte y va en camino.',
    'ENTREGADO': 'Tu pedido ha sido marcado como entregado. ¡Esperamos que lo disfrutes!',
  };

  const message = statusMessages[shippingStatus] || `El estado de tu pedido ha sido actualizado a: ${shippingStatus}.`;

  return (
    <Html>
      <Head />
      <Preview>Actualización de tu pedido #{buyOrder}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Actualización de Envío</Heading>
          <Text style={subtitle}>RD SPRING</Text>
          <Hr style={hr} />
          
          <Text style={text}>Hola {customerName},</Text>
          <Text style={text}>{message}</Text>
          
          <Text style={receiptText}><strong>Orden:</strong> #{buyOrder}</Text>
          <Text style={receiptText}><strong>Estado actual:</strong> {shippingStatus}</Text>

          <Hr style={hr} />
          <Text style={text}>
            Puedes hacerle seguimiento en cualquier momento ingresando a tu perfil.
          </Text>
          <Text style={footer}>
            © {new Date().getFullYear()} RD Spring. Todos los derechos reservados.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// Estilos
const main = { backgroundColor: '#f6f9fc', fontFamily: 'Arial, sans-serif' };
const container = { backgroundColor: '#ffffff', margin: '0 auto', padding: '40px 20px', borderRadius: '5px', maxWidth: '600px', border: '1px solid #eee' };
const h1 = { color: '#121212', fontSize: '24px', fontWeight: 'bold', margin: '0', textAlign: 'center' as const };
const subtitle = { color: '#FF0000', fontSize: '12px', letterSpacing: '2px', textAlign: 'center' as const, marginTop: '4px' };
const text = { color: '#333', fontSize: '14px', lineHeight: '24px' };
const hr = { borderColor: '#e6ebf1', margin: '20px 0' };
const receiptText = { color: '#333', fontSize: '14px', margin: '4px 0' };
const footer = { color: '#8898aa', fontSize: '12px', textAlign: 'center' as const };