'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function WhatsAppButton() {
  // Número oficial (reemplazable por variable de entorno o fallback oficial de RD Spring)
  const rawPhone =
    process.env.NEXT_PUBLIC_WHATSAPP_PHONE ||
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ||
    '56942081583';
  const phone = rawPhone.replace(/[^0-9]/g, '');

  const defaultMessage = encodeURIComponent(
    'Hola RD Spring, me gustaría consultar por repuestos de suspensión y aceites para mi vehículo.'
  );
  const whatsappUrl = `https://wa.me/${phone}?text=${defaultMessage}`;

  return (
    <aside
      aria-label="Contacto directo por WhatsApp"
      className="group fixed bottom-6 right-6 z-[9999] flex items-center pointer-events-auto select-none"
    >
      {/* Tooltip flotante al pasar el mouse */}
      <span className="hidden sm:inline-block mr-3 px-3.5 py-1.5 text-xs font-medium text-neutral-800 bg-white border border-neutral-200/90 rounded-full shadow-lg opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 pointer-events-none">
        ¿Consultas? Escríbenos a WhatsApp
      </span>

      {/* Botón flotante interactivo */}
      <motion.a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contactar por WhatsApp"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        className="relative flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-2xl hover:bg-[#20ba59] transition-colors focus:outline-none focus:ring-4 focus:ring-[#25D366]/40"
      >
        {/* Onda de pulso sutil continua */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-30 pointer-events-none" />

        {/* Ícono oficial SVG de WhatsApp */}
        <svg
          className="w-7 h-7 fill-current relative z-10"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824zm-3.423-14.416c-6.627 0-12 5.373-12 12 0 2.155.57 4.182 1.571 5.938l-1.571 5.89 6.079-1.595c1.701.928 3.655 1.467 5.728 1.467 6.627 0 12-5.373 12-12 0-6.627-5.373-12-12-12z" />
        </svg>
      </motion.a>
    </aside>
  );
}
