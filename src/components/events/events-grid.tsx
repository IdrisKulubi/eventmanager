'use client';

import React, { useState } from 'react';
import { ArrowUpDown, Calendar, Clock, MapPin, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Placeholder event data
const eventsData = [
  {
    id: '1',
    title: 'Electric Dreams Festival',
    date: 'June 15, 2023',
    time: '8:00 PM',
    location: 'Skylight Arena, New York',
    imageSrc: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1170&auto=format&fit=crop',
    category: 'Electronic',
    price: 89,
    featured: true,
  },
  {
    id: '2',
    title: 'Neon Nights: DJ Max Live',
    date: 'July 2, 2023',
    time: '10:00 PM',
    location: 'Wave Club, Los Angeles',
    imageSrc: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=1170&auto=format&fit=crop',
    category: 'DJ Set',
    price: 65,
    featured: false,
  },
  {
    id: '3',
    title: 'Symphony Under Stars',
    date: 'July 10, 2023',
    time: '7:30 PM',
    location: 'Central Park, New York',
    imageSrc: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1074&auto=format&fit=crop',
    category: 'Classical',
    price: 120,
    featured: false,
  },
  {
    id: '4',
    title: 'Cosmic Rock Experience',
    date: 'August 5, 2023',
    time: '9:00 PM',
    location: 'Stellar Stadium, Chicago',
    imageSrc: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?q=80&w=1170&auto=format&fit=crop',
    category: 'Rock',
    price: 95,
    featured: true,
  },
  {
    id: '5',
    title: 'Beats & Bass Festival',
    date: 'August 20, 2023',
    time: '8:00 PM',
    location: 'Echo Arena, Miami',
    imageSrc: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=1170&auto=format&fit=crop',
    category: 'Hip Hop',
    price: 75,
    featured: false,
  },
  {
    id: '6',
    title: 'Vocal Harmony Concert',
    date: 'September 12, 2023',
    time: '7:00 PM',
    location: 'Grand Hall, San Francisco',
    imageSrc: 'https://images.unsplash.com/photo-1619229666372-3c26c399a633?q=80&w=1173&auto=format&fit=crop',
    category: 'Vocal',
    price: 110,
    featured: false,
  },
];

type SortOption = 'date-asc' | 'date-desc' | 'price-asc' | 'price-desc' | 'popularity';

export function EventsGrid() {
  const [sortBy, setSortBy] = useState<SortOption>('date-asc');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Upcoming Events</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-zinc-400">Sort by:</span>
          <Select
            value={sortBy}
            onValueChange={(value) => setSortBy(value as SortOption)}
          >
            <SelectTrigger className="w-[180px] bg-zinc-900/80 border-purple-900/50 text-white">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-purple-900/50 text-white">
              <SelectItem value="date-asc">Date (Newest)</SelectItem>
              <SelectItem value="date-desc">Date (Oldest)</SelectItem>
              <SelectItem value="price-asc">Price (Low to High)</SelectItem>
              <SelectItem value="price-desc">Price (High to Low)</SelectItem>
              <SelectItem value="popularity">Popularity</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {eventsData.map((event) => (
          <Link 
            href={`/events/${event.id}`} 
            key={event.id}
            className="group relative flex flex-col overflow-hidden rounded-xl bg-zinc-900/50 border border-purple-900/20 transition-all duration-300 hover:border-purple-500/40 hover:shadow-lg hover:shadow-purple-900/20"
          >
            <div className="relative h-48 overflow-hidden">
              <Image
                src={event.imageSrc}
                alt={event.title}
                fill
                className="object-cover transition-all duration-500 group-hover:scale-110"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent opacity-60" />
              {event.featured && (
                <div className="absolute top-3 right-3">
                  <Badge className="bg-purple-500 text-white hover:bg-purple-600">
                    <Star className="w-3 h-3 mr-1 fill-white" /> Featured
                  </Badge>
                </div>
              )}
              <div className="absolute bottom-3 left-3">
                <Badge className="bg-zinc-800/90 text-purple-300 hover:bg-zinc-700">
                  {event.category}
                </Badge>
              </div>
            </div>
            
            <div className="flex flex-col flex-grow p-4 space-y-3">
              <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">
                {event.title}
              </h3>
              
              <div className="flex flex-col space-y-2 text-sm">
                <div className="flex items-center text-zinc-400">
                  <Calendar className="w-4 h-4 mr-2 text-purple-500" />
                  {event.date}
                </div>
                <div className="flex items-center text-zinc-400">
                  <Clock className="w-4 h-4 mr-2 text-purple-500" />
                  {event.time}
                </div>
                <div className="flex items-center text-zinc-400">
                  <MapPin className="w-4 h-4 mr-2 text-purple-500" />
                  {event.location}
                </div>
              </div>
            </div>
            
            <div className="p-4 pt-0 mt-auto flex items-center justify-between">
              <div className="text-lg font-bold text-white">
                ${event.price}
              </div>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                View Event
              </Button>
            </div>
            
            <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 to-black/10" />
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-violet-500" />
            </div>
          </Link>
        ))}
      </div>
      
      <div className="flex justify-center pt-8">
        <Button className="bg-transparent text-purple-400 hover:text-purple-300 border border-purple-600/40 hover:bg-purple-900/20 hover:border-purple-500/60">
          Load More Events
        </Button>
      </div>
    </div>
  );
} 