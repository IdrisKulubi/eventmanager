"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";

const Hero = () => {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Create a timeline for sequential animations
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    // Title animation with character splitting
    if (titleRef.current) {
      // Split text into characters
      const chars = titleRef.current.textContent?.split("") || [];
      titleRef.current.innerHTML = "";

      // Add spans for each character
      chars.forEach((char) => {
        const span = document.createElement("span");
        span.textContent = char;
        span.style.display = "inline-block";
        span.style.opacity = "0";
        span.style.transform = "translateY(100%)";
        titleRef.current?.appendChild(span);
      });

      // Animate each character
      tl.to(titleRef.current.children, {
        opacity: 1,
        y: 0,
        stagger: 0.05,
        duration: 0.8,
      });
    }

    // Subtitle fade in
    tl.to(
      subtitleRef.current,
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
      },
      "-=0.4"
    );

    // CTA buttons animation
    if (ctaRef.current) {
      const children = Array.from(ctaRef.current.children);
      tl.to(
        children,
        {
          opacity: 1,
          y: 0,
          stagger: 0.2,
          duration: 0.5,
        },
        "-=0.4"
      );
    }
  }, []);

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <h1
            ref={titleRef}
            className="text-5xl md:text-6xl lg:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-fuchsia-300 to-pink-400 mb-6"
          >
            BlackConcert Experience
          </h1>

          <p
            ref={subtitleRef}
            className="text-xl md:text-2xl text-zinc-300 mb-10 max-w-3xl mx-auto opacity-0 transform translate-y-10"
          >
            Immerse yourself in the ultimate concert management platform. Find
            tickets, explore events, and experience music in a whole new
            dimension.
          </p>

          <div
            ref={ctaRef}
            className="flex flex-col sm:flex-row gap-6 justify-center"
          >
            <Link
              href="/events"
              className="opacity-0 transform translate-y-10 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-600 px-8 py-4 text-lg font-semibold text-white shadow-lg hover:shadow-purple-500/30 transition-all duration-300 hover:scale-105 relative overflow-hidden group"
            >
              <span className="relative z-10">Explore Events</span>
              <span className="absolute inset-0 bg-gradient-to-r from-fuchsia-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </Link>

            <Link
              href="/sign-up"
              className="opacity-0 transform translate-y-10 rounded-full bg-transparent border-2 border-purple-500 px-8 py-4 text-lg font-semibold text-white hover:bg-purple-500/10 transition-all duration-300 hover:shadow-purple-500/20 hover:shadow-lg"
            >
              Get Started
            </Link>
          </div>
        </div>

        {/* Music note decorations */}
        <div className="hidden md:block">
          <div className="absolute top-20 left-10 text-purple-500 opacity-20 text-6xl animate-float">
            ♪
          </div>
          <div className="absolute top-40 right-20 text-fuchsia-500 opacity-20 text-5xl animate-float-delay">
            ♫
          </div>
          <div className="absolute bottom-20 left-20 text-pink-500 opacity-20 text-7xl animate-float-delay-2">
            ♩
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
        <span className="text-zinc-400 text-sm mb-2">Scroll Down</span>
        <div className="w-0.5 h-10 bg-gradient-to-b from-purple-500 to-transparent animate-pulse"></div>
      </div>
    </section>
  );
};

export default Hero;
