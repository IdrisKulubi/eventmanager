'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { useInView } from 'react-intersection-observer';
import { Ticket } from 'lucide-react';

const CallToAction = () => {
  const { ref, inView } = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });
  
  const bgRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (inView && bgRef.current) {
      // Animate the background
      gsap.to(bgRef.current, {
        backgroundPosition: '200% 50%',
        duration: 20,
        repeat: -1,
        ease: 'linear',
      });
    }
  }, [inView]);

  return (
    <section className="py-20 md:py-32 relative z-10">
      <div 
        ref={bgRef}
        className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-fuchsia-900/20 to-purple-900/20 background-size-400 pointer-events-none"
        style={{ backgroundSize: '400% 100%' }}
        aria-hidden="true"
      />
      
      <div 
        className="absolute inset-0 bg-[url('/images/grid.svg')] bg-center opacity-10 pointer-events-none"
        aria-hidden="true"
      />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div 
          ref={ref} 
          className={`max-w-4xl mx-auto text-center transform transition-all duration-1000 ${
            inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="mb-6">
            <span className="inline-block animate-pulse-bright bg-gradient-to-r from-purple-400 to-fuchsia-400 text-transparent bg-clip-text text-sm font-medium tracking-wider uppercase">
              Limited Time Offer
            </span>
          </div>
          
          <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-fuchsia-300 to-pink-300">
            Experience the Future of Concert Management
          </h2>
          
          <p className="text-lg md:text-xl text-zinc-300 mb-10 max-w-3xl mx-auto">
            Sign up today and get exclusive VIP access to our premium features. 
            Don&apos;t miss out on the opportunity to revolutionize your concert experience.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link 
              href="/sign-up" 
              className="rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-600 px-8 py-4 text-lg font-semibold text-white shadow-lg hover:shadow-purple-500/30 transition-all duration-300 hover:scale-105 relative overflow-hidden group"
            >
              <span className="relative z-10">Get Started Free</span>
              <span className="absolute inset-0 bg-gradient-to-r from-fuchsia-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </Link>
            
            <Link 
              href="/events" 
              className="rounded-full bg-transparent border-2 border-purple-500 px-8 py-4 text-lg font-semibold text-white hover:bg-purple-500/10 transition-all duration-300 hover:shadow-purple-500/20 hover:shadow-lg flex items-center justify-center"
            >
              <Ticket className="w-5 h-5 mr-2 text-purple-400" />
              Browse Events
            </Link>
          </div>
          
          <div className="mt-12 flex items-center justify-center text-zinc-400">
            <p className="text-sm">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute -bottom-10 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent pointer-events-none" aria-hidden="true" />
    </section>
  );
};

export default CallToAction; 