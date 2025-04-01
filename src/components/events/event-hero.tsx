"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";

interface EventHeroProps {
  title: string;
  imageUrl: string;
  status: string;
}

export function EventHero({ title, imageUrl, status }: EventHeroProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div ref={ref} className="relative h-[80vh] w-full overflow-hidden">
      <motion.div
        style={{ y, opacity }}
        className="absolute inset-0 w-full"
      >
        <Image
          src={imageUrl}
          alt={title}
          fill
          sizes="100vw"
          quality={90}
          className="object-cover object-center w-full h-full"
          priority
          style={{
            objectPosition: "center 25%"
          }}
        />
        <div 
          className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/50 to-black"
          style={{
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        />
      </motion.div>
      
      <div className="relative h-full flex items-end">
        <div className="container mx-auto px-4 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-block px-4 py-2 rounded-full bg-purple-600/80 backdrop-blur-sm text-white mb-4"
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl md:text-6xl font-bold text-white mb-6"
            >
              {title}
            </motion.h1>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 