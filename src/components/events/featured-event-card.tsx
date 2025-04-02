/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar,  MapPin, Tag, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/utils';
import { motion } from 'framer-motion';

export function FeaturedEventCard({ event }: { event: any }) {
  const [isHovered, setIsHovered] = useState(false);
  
  if (!event) return null;
  
  const { 
    id, 
    title, 
    description, 
    bannerImage, 
    startDate, 
    venueName,
    venue,
    categories,
    lowestPrice,
    highestPrice 
  } = event;
  
  const startDateFormatted = format(new Date(startDate), 'EEE, MMM d, yyyy');
  const startTimeFormatted = format(new Date(startDate), 'h:mm a');
  
  return (
    <motion.div 
      className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border border-purple-900/30"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className="grid md:grid-cols-2 gap-6">
        {/* Image section */}
        <div className="relative h-[240px] md:h-full min-h-[200px] overflow-hidden">
          <Image
            src={bannerImage || '/images/featured-event-placeholder.jpg'}
            alt={title}
            fill
            className="object-cover transition-transform duration-700"
            style={{ transform: isHovered ? 'scale(1.05)' : 'scale(1)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent md:bg-gradient-to-t opacity-60"></div>
          
          {/* Featured badge */}
          <Badge className="absolute top-4 left-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 border-0 uppercase font-bold py-1.5">
            Featured Event
          </Badge>
          
          {/* Mobile view title - visible on small screens */}
          <div className="block md:hidden absolute bottom-0 left-0 p-4 w-full">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-1">
              {title}
            </h2>
            <div className="flex items-center gap-1 text-sm text-white/80">
              <Calendar className="h-3.5 w-3.5" />
              <span>{startDateFormatted}</span>
            </div>
          </div>
        </div>
        
        {/* Content section */}
        <div className="p-6 md:py-8 flex flex-col">
          {/* Desktop title - hidden on small screens */}
          <div className="hidden md:block">
            <h2 className="text-2xl font-bold text-white mb-2">
              {title}
            </h2>
            
            {categories?.length > 0 && (
              <div className="flex gap-2 mb-4">
                {categories.slice(0, 3).map((category: any) => (
                  <Badge 
                    key={category.id} 
                    variant="outline" 
                    className="border-purple-500/40 text-purple-300 bg-purple-900/20"
                  >
                    {category.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          
          {/* Event details */}
          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-white">{startDateFormatted}</p>
                <p className="text-zinc-400 text-sm">{startTimeFormatted}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-white">{venueName}</p>
                <p className="text-zinc-400 text-sm">{venue?.city || 'Location TBA'}</p>
              </div>
            </div>
            
            {(lowestPrice !== undefined || highestPrice !== undefined) && (
              <div className="flex items-start gap-3">
                <Tag className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-white font-medium">
                    {lowestPrice === highestPrice
                      ? formatCurrency(lowestPrice)
                      : `${formatCurrency(lowestPrice)} - ${formatCurrency(highestPrice)}`}
                  </p>
                  <p className="text-zinc-400 text-sm">Per ticket</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Description - desktop only */}
          <p className="hidden md:block text-zinc-300 text-sm line-clamp-2 mb-6">
            {description || 'Join us for this amazing featured event. Book your tickets now!'}
          </p>
          
          {/* Call to action */}
          <div className="mt-auto">
            <Button 
              asChild
              className="relative w-full justify-between group bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 border-0"
            >
              <Link href={`/events/${id}`}>
                View Event Details
                <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                <span className="absolute inset-0"></span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
} 