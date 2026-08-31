# RD Spring

Tienda de repuestos de suspensión (cotización por WhatsApp/email) y aceites (venta online con Webpay Plus).

## Instalación

```bash
npm install
cp .env.example .env        # completa RESEND_API_KEY como mínimo para probar cotizaciones/emails
npx prisma db push          # crea la base de datos SQLite local
npm run seed                # carga el stock inicial de los aceites en la base de datos
npm run dev
```

Abre http://localhost:3000

## Notas importantes (corregidas respecto al script original)

1. **`next.config.js`**: se agregó `remotePatterns` para `placehold.co`. Sin este archivo, las imágenes de producto se rompen (Next.js bloquea imágenes externas no autorizadas).
2. **Versiones estables**: el `package.json` original apuntaba a release candidates (`next@15.0.0-rc.0`, `react@19.0.0-rc-...`) que pueden no estar disponibles en npm. Se cambiaron a rangos estables (`^15.0.0`, `^19.0.0`). Si `npm install` falla por alguna versión específica, corre `npm install next@latest react@latest react-dom@latest` para tomar las últimas estables.
3. **`prisma/seed.ts`**: no existía. Sin este script, la tabla `Product` en la base de datos queda vacía y el descuento de stock en `/api/confirm` nunca tiene efecto (actualiza 0 filas). Ejecuta `npm run seed` después de `prisma db push`.
4. **Credenciales de Transbank en producción**: `app/api/checkout/route.ts` y `app/api/confirm/route.ts` ahora leen `TBK_COMMERCE_CODE` y `TBK_API_KEY` desde variables de entorno. Si no las defines, usan automáticamente el sandbox de integración (pagos de prueba, sin cobro real).
5. **SQLite en producción**: en Vercel el sistema de archivos es efímero — la base de datos SQLite se resetea en cada despliegue. Para producción real, cambia el `datasource` en `prisma/schema.prisma` de `sqlite` a `postgresql` y usa un proveedor como Vercel Postgres, Supabase o Neon.
6. **Guard de hidratación en checkout**: se agregó el mismo patrón `mounted` que ya tenía `/carro`, para evitar errores de hidratación de Next.js con Zustand + localStorage.
7. **Imágenes**: el catálogo usa `placehold.co` como placeholder. Reemplaza las URLs en `data/products.json` por tus fotos reales antes de publicar.
8. **WhatsApp y correo de contacto**: edita `config/constants.ts` o las variables `NEXT_PUBLIC_WHATSAPP_NUMBER` / `CONTACT_EMAIL` en `.env`.

## Pendiente para producción real

- Afiliación comercial real con Transbank (las credenciales de integración no cobran dinero real).
- Verificar tu dominio de envío en Resend para que los correos no caigan en spam.
- Migrar la base de datos de SQLite a Postgres si despliegas en Vercel.
- Reemplazar imágenes placeholder por fotos reales de producto.
