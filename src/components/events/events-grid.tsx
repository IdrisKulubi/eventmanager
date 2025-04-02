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
import { BellRing, ChevronLeft, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';

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

interface EventsGridProps {
  events: any[];
  total: number;
  page: number;
  pageSize: number;
  sortBy?: string;
  isLoading?: boolean;
  query?: string;
  categoryId?: string;
  locationId?: string;
  startDate?: string;
  endDate?: string;
  minPrice?: string;
  maxPrice?: string;
}

export function EventsGrid({
  events = [],
  total = 0,
  page = 1,
  pageSize = 9,
  sortBy = 'date',
  isLoading = false,
  query,
  categoryId,
  locationId,
  startDate,
  endDate,
  minPrice,
  maxPrice,
}: EventsGridProps) {
  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  
  // Generate pagination URL with all current filters
  const getPaginationUrl = (targetPage: number) => {
    const params = new URLSearchParams();
    
    if (query) params.set('query', query);
    if (categoryId) params.set('category', categoryId);
    if (locationId) params.set('location', locationId);
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (sortBy !== 'date') params.set('sortBy', sortBy);
    
    params.set('page', targetPage.toString());
    
    return `/events?${params.toString()}`;
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-9 w-36" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(pageSize).fill(0).map((_, index) => (
            <EventCardSkeleton key={index} />
          ))}
        </div>
        
        <div className="flex justify-center mt-8">
          <Skeleton className="h-10 w-96" />
        </div>
      </div>
    );
  }

  // Render empty state
  if (events.length === 0) {
    return (
      <div className="text-center py-12 px-4 rounded-xl bg-gradient-to-b from-zinc-900/80 to-purple-950/20 border border-purple-900/20">
        <BellRing className="mx-auto h-12 w-12 text-purple-400 mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No events found</h3>
        <p className="text-zinc-400 mb-6 max-w-md mx-auto">
          We couldn't find any events matching your criteria. Try adjusting your filters or search query.
        </p>
        <Button
          asChild
          variant="outline"
          className="border-purple-600/30 text-purple-400 hover:text-purple-300 hover:bg-purple-950/30"
        >
          <Link href="/events">Clear All Filters</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with result count and sort options */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <p className="text-zinc-400">
          Showing <span className="font-medium text-white">{events.length}</span> of{" "}
          <span className="font-medium text-white">{total}</span> events
        </p>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-zinc-400">Sort by:</span>
          <SortButton 
            currentSort={sortBy} 
            value="date" 
            label="Date"
            query={query}
            categoryId={categoryId}
            locationId={locationId}
            startDate={startDate}
            endDate={endDate}
            minPrice={minPrice}
            maxPrice={maxPrice}
            page={page}
          />
          <SortButton 
            currentSort={sortBy} 
            value="price_low" 
            label="Price: Low to High"
            query={query}
            categoryId={categoryId}
            locationId={locationId}
            startDate={startDate}
            endDate={endDate}
            minPrice={minPrice}
            maxPrice={maxPrice}
            page={page}
          />
          <SortButton 
            currentSort={sortBy} 
            value="price_high" 
            label="Price: High to Low"
            query={query}
            categoryId={categoryId}
            locationId={locationId}
            startDate={startDate}
            endDate={endDate}
            minPrice={minPrice}
            maxPrice={maxPrice}
            page={page}
          />
        </div>
      </div>
      
      {/* Events grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-12">
          <nav className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 border-purple-900/30 text-purple-300 hover:bg-purple-950/20 disabled:opacity-50"
              disabled={page <= 1}
              asChild
            >
              <Link href={getPaginationUrl(page - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Link>
            </Button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <Button
                key={pageNum}
                variant={pageNum === page ? "default" : "outline"}
                size="icon"
                className={
                  pageNum === page
                    ? "h-9 w-9 bg-purple-600 hover:bg-purple-700 text-white"
                    : "h-9 w-9 border-purple-900/30 text-purple-300 hover:bg-purple-950/20"
                }
                asChild
              >
                <Link href={getPaginationUrl(pageNum)}>
                  {pageNum}
                </Link>
              </Button>
            ))}
            
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 border-purple-900/30 text-purple-300 hover:bg-purple-950/20 disabled:opacity-50"
              disabled={page >= totalPages}
              asChild
            >
              <Link href={getPaginationUrl(page + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </nav>
        </div>
      )}
    </div>
  );
}

// Sort button component
function SortButton({
  currentSort,
  value,
  label,
  query,
  categoryId,
  locationId,
  startDate,
  endDate,
  minPrice,
  maxPrice,
  page,
}: {
  currentSort: string;
  value: string;
  label: string;
  query?: string;
  categoryId?: string;
  locationId?: string;
  startDate?: string;
  endDate?: string;
  minPrice?: string;
  maxPrice?: string;
  page: number;
}) {
  // Generate URL with sort parameter
  const getSortUrl = () => {
    const params = new URLSearchParams();
    
    if (query) params.set('query', query);
    if (categoryId) params.set('category', categoryId);
    if (locationId) params.set('location', locationId);
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (value !== 'date') params.set('sortBy', value);
    params.set('page', page.toString());
    
    return `/events?${params.toString()}`;
  };

  const isActive = currentSort === value;
  
  return (
    <Button
      variant={isActive ? "secondary" : "ghost"}
      size="sm"
      asChild
      className={
        isActive
          ? "bg-purple-900/50 text-purple-200 hover:bg-purple-900/70"
          : "text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800/50"
      }
    >
      <Link href={getSortUrl()}>
        {label}
      </Link>
    </Button>
  );
}

// Event card component
function EventCard({ event }: { event: any }) {
  return (
    <Link 
      href={`/events/${event.id}`}
      className="group block rounded-xl overflow-hidden bg-gradient-to-br from-zinc-900/90 to-purple-950/30 border border-purple-900/20 hover:border-purple-600/30 transition-all duration-300"
    >
      <div className="aspect-[16/9] relative overflow-hidden">
        <Image
          src={event.image || "/images/event-placeholder.jpg"}
          alt={event.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700"
        />
        
        {event.categories?.[0] && (
          <span className="absolute top-3 left-3 bg-purple-600/90 text-white px-2 py-1 rounded text-xs font-semibold">
            {event.categories[0]}
          </span>
        )}
        
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent py-4 px-4">
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-purple-300" />
            <p className="text-xs text-zinc-300">
              {new Date(event.startDate).toLocaleDateString()} | {event.time || '7:00 PM'}
            </p>
          </div>
        </div>
      </div>
      
      <div className="p-5">
        <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors">
          {event.title}
        </h3>
        
        <div className="flex items-start gap-3 mb-4">
          <MapPin className="h-4 w-4 text-zinc-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-zinc-400">
            {event.venueName || 'Venue TBA'}, {event.location || 'Location TBA'}
          </p>
        </div>
        
        <div className="flex items-center justify-between">
          <p className="font-medium text-white">
            {event.minPrice && event.maxPrice ? (
              <>
                {formatCurrency(event.minPrice)}
                {event.minPrice !== event.maxPrice && ` - ${formatCurrency(event.maxPrice)}`}
              </>
            ) : (
              'Price TBA'
            )}
          </p>
          
          <Button 
            size="sm" 
            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700"
          >
            View Details
          </Button>
        </div>
      </div>
    </Link>
  );
}

// Event card skeleton for loading state
function EventCardSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden bg-gradient-to-br from-zinc-900/90 to-purple-950/30 border border-purple-900/20">
      <Skeleton className="aspect-[16/9] w-full" />
      
      <div className="p-5 space-y-4">
        <Skeleton className="h-6 w-4/5" />
        <Skeleton className="h-4 w-full" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-9 w-28" />
        </div>
      </div>
    </div>
  );
} 