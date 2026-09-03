import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';
import { STORE_CONFIG } from '@/config/constants';

interface ReceiptEmailProps {
  customerName: string;
  buyOrder: string;
  amount: number;
  itemsSummary: string;
}

export default function ReceiptEmail({
  customerName = 'Cliente',
  buyOrder = '000000',
  amount = 0,
  itemsSummary = 'Productos de prueba',
}: ReceiptEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Tu comprobante de compra en RD Spring</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>RD SPRING</Heading>
          <Text style={subtitle}>CHASSIS PRESTIGE</Text>
          <Hr style={hr} />
          
          <Text style={text}>Hola {customerName},</Text>
          <Text style={text}>
            Hemos recibido tu pago con éxito. Tu pedido ya está en nuestro sistema y comenzaremos a prepararlo pronto.
          </Text>

          <Section style={receiptBox}>
            <Text style={receiptHeading}>DETALLES DEL PEDIDO</Text>
            <Text style={receiptText}><strong>Orden:</strong> #{buyOrder}</Text>
            <Text style={receiptText}><strong>Artículos:</strong> {itemsSummary}</Text>
            <Text style={receiptText}>
              <strong>Total pagado:</strong> {STORE_CONFIG.CURRENCY_FORMAT.format(amount)}
            </Text>
          </Section>

          <Text style={text}>
            Puedes hacerle seguimiento al estado de tu envío ingresando a tu perfil en nuestra tienda.
          </Text>
          
          <Hr style={hr} />
          <Text style={footer}>
            © {new Date().getFullYear()} RD Spring. Todos los derechos reservados.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// Estilos seguros para clientes de correo (CSS en JS)
const main = { backgroundColor: '#f6f9fc', fontFamily: 'Arial, sans-serif' };
const container = { backgroundColor: '#121212', margin: '0 auto', padding: '40px 20px', borderRadius: '5px', maxWidth: '600px' };
const h1 = { color: '#0a0a0a', fontSize: '24px', fontWeight: 'bold', margin: '0', textAlign: 'center' as const };
const subtitle = { color: '#FF0000', fontSize: '12px', letterSpacing: '2px', textAlign: 'center' as const, marginTop: '4px' };
const text = { color: '#333', fontSize: '14px', lineHeight: '24px' };
const hr = { borderColor: '#e6ebf1', margin: '20px 0' };
const receiptBox = { backgroundColor: '#f9f9f9', border: '1px solid #eee', padding: '20px', borderRadius: '4px', margin: '20px 0' };
const receiptHeading = { color: '#FF0000', fontSize: '12px', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '12px' };
const receiptText = { color: '#333', fontSize: '14px', margin: '4px 0' };
const footer = { color: '#8898aa', fontSize: '12px', textAlign: 'center' as const };