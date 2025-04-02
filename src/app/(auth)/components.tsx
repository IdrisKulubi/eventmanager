'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

// Animated input field with label
export const AnimatedFormField = ({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay: delay,
        ease: [0.22, 1, 0.36, 1]
      }}
    >
      {children}
    </motion.div>
  );
};

// Animated logo component
export const AnimatedLogo = ({ 
  src, 
  alt, 
  size = 64 
}: { 
  src: string; 
  alt: string; 
  size?: number;
}) => {
  return (
    <motion.div
      className="relative flex items-center justify-center"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ 
        type: "spring", 
        stiffness: 260, 
        damping: 20,
        delay: 0.1 
      }}
    >
      <div className="absolute -inset-6 bg-gradient-to-r from-[#8A2BE2]/20 to-purple-500/20 rounded-full blur-md opacity-75 group-hover:opacity-100 transition duration-500" />
      <div className="relative flex items-center justify-center w-20 h-20 bg-gradient-to-r from-[#8A2BE2] to-purple-600 rounded-full overflow-hidden border-2 border-white/20">
        <motion.img
          src={src}
          alt={alt}
          width={size}
          height={size}
          className="relative transform transition-all duration-300 group-hover:scale-110"
          whileHover={{ scale: 1.1 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        />
      </div>
    </motion.div>
  );
};

// Music note particles effect
export const MusicNotes = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className={`absolute text-[${i % 2 === 0 ? 'purple' : 'fuchsia'}-${300 + (i % 3) * 100}/20] text-xl sm:text-2xl`}
          initial={{ 
            x: Math.random() * 100 - 50 + '%', 
            y: '110%',
            rotate: Math.random() * 180 - 90,
            opacity: 0.3 + Math.random() * 0.5
          }}
          animate={{ 
            y: '-110%',
            opacity: 0
          }}
          transition={{
            duration: 10 + Math.random() * 15,
            ease: "linear",
            repeat: Infinity,
            delay: Math.random() * 20
          }}
        >
          {i % 3 === 0 ? '♪' : i % 3 === 1 ? '♫' : '♬'}
        </motion.div>
      ))}
    </div>
  );
};

// Pulsing button effect
export const PulsingButton = ({ 
  children,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof motion.button> & {
  children: React.ReactNode;
}) => {
  return (
    <motion.button
      className={`relative overflow-hidden rounded-lg px-6 py-3 font-medium text-white ${className}`}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        y: { type: "spring", stiffness: 400, damping: 17 },
        default: { duration: 0.3 }
      }}
      {...props}
    >
      <span className="relative z-10">{children}</span>
      <span className="absolute inset-0 bg-gradient-to-r from-[#8A2BE2] to-purple-600" />
      <span className="absolute inset-0 opacity-0 hover:opacity-20 bg-white transition-opacity" />
      <motion.span 
        className="absolute inset-0 bg-gradient-to-r from-[#8A2BE2] to-purple-600"
        animate={{ 
          boxShadow: ["0 0 0px rgba(138, 43, 226, 0.5)", "0 0 20px rgba(138, 43, 226, 0.8)", "0 0 0px rgba(138, 43, 226, 0.5)"]
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />
    </motion.button>
  );
};

// Page transition link
export const TransitionLink = ({ 
  href, 
  children, 
  className 
}: { 
  href: string; 
  children: React.ReactNode; 
  className?: string; 
}) => {
  return (
    <Link href={href} passHref>
      <motion.span
        className={`inline-block ${className}`}
        whileHover={{ 
          color: "#8A2BE2",
          textShadow: "0 0 8px rgba(138, 43, 226, 0.5)"
        }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.span>
    </Link>
  );
};

// Card container with glassmorphism
export const GlassmorphicCard = ({ 
  children,
  className
}: { 
  children: React.ReactNode; 
  className?: string;
}) => {
  return (
    <motion.div
      className={`w-full max-w-md bg-black/40 backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden z-10 ${className}`}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5,
        type: "spring",
        stiffness: 100
      }}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#8A2BE2] via-purple-500 to-fuchsia-500"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 to-black/30 pointer-events-none"></div>
      {children}
    </motion.div>
  );
}; 