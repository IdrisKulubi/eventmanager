'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';

interface SparkleProps {
  id: string;
  createdAt: number;
  color: string;
  size: number;
  style: React.CSSProperties;
}

interface SparklesCoreProps {
  id?: string;
  background?: string;
  minSize?: number;
  maxSize?: number;
  particleColor?: string;
  particleDensity?: number;
  speed?: number;
  particleCount?: number;
  className?: string;
}

const random = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1) + min);

const useRandomInterval = (
  callback: () => void,
  minDelay: number | null,
  maxDelay: number | null
) => {
  const timeoutId = useRef<number | null>(null);
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    const isEnabled = minDelay !== null && maxDelay !== null;
    if (isEnabled) {
      const handleTick = () => {
        const nextTickAt = random(minDelay, maxDelay);
        timeoutId.current = window.setTimeout(() => {
          savedCallback.current();
          handleTick();
        }, nextTickAt);
      };
      handleTick();
    }
    return () => {
      if (timeoutId.current) {
        window.clearTimeout(timeoutId.current);
      }
    };
  }, [minDelay, maxDelay]);

  const cancel = () => {
    if (timeoutId.current) {
      window.clearTimeout(timeoutId.current);
    }
  };

  return cancel;
};

const range = (start: number, end: number, step = 1) => {
  const output = [];
  for (let i = start; i < end; i += step) {
    output.push(i);
  }
  return output;
};

const PARTICLE_LIFETIME = 1500; // ms

const Sparkle = ({ id, createdAt, color, size, style }: SparkleProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const timeSinceCreation = Date.now() - createdAt;
  
  useEffect(() => {
    if (timeSinceCreation < PARTICLE_LIFETIME) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, PARTICLE_LIFETIME - timeSinceCreation);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [timeSinceCreation]);

  return isVisible ? (
    <div
      className="absolute animate-sparkle-spin pointer-events-none"
      id={id}
      style={{
        ...style,
        width: size,
        height: size,
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          filter: "brightness(1.2)",
        }}
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M50 0C50 27.6142 27.6142 50 0 50C27.6142 50 50 72.3858 50 100C50 72.3858 72.3858 50 100 50C72.3858 50 50 27.6142 50 0Z"
          fill={color}
        />
      </svg>
    </div>
  ) : null;
};

export const SparklesCore = ({
  id,
  background = "transparent",
  minSize = 0.4,
  maxSize = 1,
  particleColor = "#FFF",
  speed = 1,
  particleCount = 15,
  className,
}: SparklesCoreProps) => {
  const [sparkles, setSparkles] = useState<SparkleProps[]>([]);
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = 
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

  useEffect(() => {
    if (!prefersReducedMotion && containerRef.current) {
      const initialSparkles = range(0, particleCount).map(() => generateSparkle(containerRef.current));
      setSparkles(initialSparkles);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [particleCount]);

  const generateSparkle = (container: HTMLElement | null): SparkleProps => {
    const createdAt = Date.now();
    const id = String(createdAt);
    
    const size = random(minSize * 10, maxSize * 15);
    
    const containerWidth = container?.clientWidth || 400;
    const containerHeight = container?.clientHeight || 300;
    
    const left = random(0, containerWidth);
    const top = random(0, containerHeight);
    
    const color = particleColor || (theme === "dark" ? "#fff" : "#000");
    
    return {
      id,
      createdAt,
      color,
      size,
      style: {
        left: left + "px",
        top: top + "px",
      },
    };
  };

  useRandomInterval(
    () => {
      if (prefersReducedMotion || !containerRef.current) return;
      
      const newSparkle = generateSparkle(containerRef.current);
      
      const now = Date.now();
      const nextSparkles = sparkles.filter(sparkle => {
        return now - sparkle.createdAt < PARTICLE_LIFETIME;
      }).concat(newSparkle);
      
      setSparkles(nextSparkles);
    },
    prefersReducedMotion ? null : 100 / speed,
    prefersReducedMotion ? null : 200 / speed
  );

  return (
    <div
      ref={containerRef}
      id={id}
      className={cn("w-full h-full relative overflow-hidden", className)}
      style={{ background }}
    >
      {sparkles.map(sparkle => (
        <Sparkle
          key={sparkle.id}
          id={sparkle.id}
          createdAt={sparkle.createdAt}
          color={sparkle.color}
          size={sparkle.size}
          style={sparkle.style}
        />
      ))}
    </div>
  );
};

export default SparklesCore; 