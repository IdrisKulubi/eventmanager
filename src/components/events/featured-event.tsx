'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Clock, MapPin, Star, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

// Sample featured event data
const featuredEvent = {
  id: 'cosmic-soundscape',
  title: 'Cosmic Soundscape 2023',
  description: 'Experience the ultimate fusion of electronic music and visual art in this immersive concert featuring top international DJs and stunning light shows.',
  date: 'December 15, 2023',
  time: '8:00 PM - 2:00 AM',
  location: 'Nebula Arena, Las Vegas',
  imageSrc: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1170&auto=format&fit=crop',
  price: 149,
  attendees: 2500,
  category: 'Electronic Music',
};

export function FeaturedEvent() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-purple-900/30 bg-gradient-to-br from-zinc-900 via-zinc-800 to-purple-900/30 mb-12">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute top-0 left-0 w-64 h-64 bg-purple-600 rounded-full filter blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-600 rounded-full filter blur-3xl translate-x-1/3 translate-y-1/3"></div>
      </div>
      
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
        <div className="relative h-[300px] md:h-full rounded-xl overflow-hidden">
          <Image
            src={featuredEvent.imageSrc}
            alt={featuredEvent.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-zinc-900/90" />
          
          <div className="absolute top-4 left-4 flex items-center space-x-2">
            <Badge className="bg-purple-600/90 text-white border-0 px-3 py-1">
              <Star className="w-3.5 h-3.5 mr-1.5 fill-white" /> Featured Event
            </Badge>
          </div>
          
          <div className="absolute bottom-4 left-4 right-4">
            <Badge className="bg-zinc-800/90 text-purple-300 border-0">
              {featuredEvent.category}
            </Badge>
          </div>
        </div>
        
        <div className="flex flex-col justify-between py-2">
          <div className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              {featuredEvent.title}
            </h2>
            
            <p className="text-zinc-300 leading-relaxed">
              {featuredEvent.description}
            </p>
            
            <div className="grid grid-cols-1 gap-3 mt-4">
              <div className="flex items-center text-zinc-300">
                <Calendar className="w-5 h-5 mr-3 text-purple-400" />
                {featuredEvent.date}
              </div>
              <div className="flex items-center text-zinc-300">
                <Clock className="w-5 h-5 mr-3 text-purple-400" />
                {featuredEvent.time}
              </div>
              <div className="flex items-center text-zinc-300">
                <MapPin className="w-5 h-5 mr-3 text-purple-400" />
                {featuredEvent.location}
              </div>
              <div className="flex items-center text-zinc-300">
                <Users className="w-5 h-5 mr-3 text-purple-400" />
                {featuredEvent.attendees}+ attending
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-6 gap-4">
            <div className="flex flex-col">
              <span className="text-zinc-400 text-sm">Starting from</span>
              <span className="text-2xl font-bold text-white">${featuredEvent.price}</span>
            </div>
            
            <div className="flex space-x-3 w-full sm:w-auto">
              <Button className="flex-1 sm:flex-initial bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700">
                Add to Calendar
              </Button>
              <Button className="flex-1 sm:flex-initial bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white border-0">
                Get Tickets
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Pulsing effect elements */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-500"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <motion.div
          className="w-[500px] h-[500px] rounded-full border border-purple-500/20"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
    </div>
  );
} 