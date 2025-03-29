'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  return (
    <div className="relative w-full min-h-screen bg-black overflow-hidden">
      {/* Concert backdrop with animated elements */}
      <div className="fixed inset-0 z-0">
        {/* Dynamic background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-[#1A0536] to-black"></div>
        
        {/* Animated stage lights */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            className="absolute top-[-20%] left-[10%] w-[40rem] h-[40rem] rounded-full bg-purple-700/10 mix-blend-soft-light blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
          <motion.div 
            className="absolute top-[40%] right-[5%] w-[30rem] h-[30rem] rounded-full bg-indigo-500/10 mix-blend-soft-light blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              repeatType: "reverse",
              delay: 0.5,
            }}
          />
          <motion.div 
            className="absolute bottom-[-10%] left-[30%] w-[25rem] h-[25rem] rounded-full bg-fuchsia-500/10 mix-blend-soft-light blur-3xl"
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              repeatType: "reverse",
              delay: 1,
            }}
          />
        </div>

        {/* Sound wave visualization effect */}
        <div className="absolute inset-x-0 bottom-0 h-32 opacity-30">
          <div className="flex justify-center items-end h-full space-x-1">
            {[...Array(40)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1 bg-gradient-to-t from-purple-600 to-purple-300 rounded-t-sm"
                animate={{
                  height: [
                    `${Math.random() * 40 + 10}%`,
                    `${Math.random() * 80 + 20}%`,
                    `${Math.random() * 40 + 10}%`,
                  ],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: "reverse",
                  delay: i * 0.05 % 0.5,
                }}
              />
            ))}
          </div>
        </div>

        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[url('/assets/grid.svg')] bg-center opacity-10"></div>
      </div>

      {/* Page content with transition */}
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="relative z-10 flex items-center justify-center w-full min-h-screen"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AuthLayout;
