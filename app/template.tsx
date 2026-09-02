'use client';

import { motion } from 'framer-motion';

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ x: 80, opacity: 0, filter: 'blur(10px)' }}
      animate={{ x: 0, opacity: 1, filter: 'blur(0px)' }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 20,
      }}
    >
      {children}
    </motion.div>
  );
}