'use client';

import React from 'react';
import { SparklesCore } from "@/components/ui/sparkles";
import { Button } from "@/components/ui/button";
import Link from "next/link";





export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-black">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Sparkles Background */}
        <div className="absolute inset-0 w-full h-full">
          <SparklesCore
            id="tsparticlesfullpage"
            background="transparent"
            minSize={0.6}
            maxSize={1.4}
            particleDensity={100}
            className="w-full h-full"
            particleColor="#8b5cf6"
          />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-purple-200 to-purple-400">
              Black Ticket Concert
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-purple-200 mb-4">
            23RD MAY • MAIN AUDITORIUM
          </p>
          
          <p className="text-lg md:text-xl text-purple-300 mb-8 max-w-2xl mx-auto">
            Experience an unforgettable night featuring Strathmore&apos;s finest artists and DJs in a spectacular showcase of talent
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 text-lg rounded-full"
            >
              <Link href="/events">
                Get Tickets Now
              </Link>
            </Button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg
            className="w-6 h-6 text-purple-400"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-purple-900/20 p-6 rounded-lg backdrop-blur-sm">
              <h3 className="text-xl font-semibold text-purple-200 mb-4">Live Performances</h3>
              <p className="text-purple-300">
                Experience electrifying performances from Strathmore&apos;s most talented artists
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-purple-900/20 p-6 rounded-lg backdrop-blur-sm">
              <h3 className="text-xl font-semibold text-purple-200 mb-4">DJ Showcase</h3>
              <p className="text-purple-300">
                Dance to the beats of Strathmore&apos;s finest DJs in the main auditorium
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-purple-900/20 p-6 rounded-lg backdrop-blur-sm">
              <h3 className="text-xl font-semibold text-purple-200 mb-4">Group Packages</h3>
              <p className="text-purple-300">
                Special rates available for groups - bring your friends and save!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-purple-900/20 to-black">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-purple-100 mb-6">
            Don&apos;t Miss This Epic Night
          </h2>
          <p className="text-purple-300 mb-8 text-lg">
            Limited tickets available. Book your spot now for an unforgettable experience.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 text-lg rounded-full"
          >
            <Link href="/events">
              Book Your Tickets
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
