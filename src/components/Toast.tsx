'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toast } = useApp();

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.9 }}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-[14px] border border-purple-500/40 bg-[#18181B] px-4 py-3 text-xs font-semibold text-[#FAFAFA] shadow-purple shadow-2xl"
        >
          <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
          <span>{toast}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
