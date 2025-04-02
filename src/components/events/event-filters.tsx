'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/events/date-range-picker";
import { CategoryFilters } from "@/components/events/category-filters";
import { PriceRangeSlider } from "@/components/events/price-range-slider";
import { useEventCategories, useEventLocations } from '@/hooks/use-events';
import Image from 'next/image';
import Link from 'next/link';

interface EventFiltersProps {
  selectedCategory?: string;
  selectedLocation?: string;
  startDate?: string;
  endDate?: string;
  minPrice?: string;
  maxPrice?: string;
}

export function EventFilters({
  selectedCategory,
  selectedLocation,
  startDate,
  endDate,
  minPrice,
  maxPrice
}: EventFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: categories = [], isLoading: isCategoriesLoading } = useEventCategories();
  const { data: locations = [], isLoading: isLocationsLoading } = useEventLocations();

  // Local state for filters
  const [category, setCategory] = useState(selectedCategory || '');
  const [location, setLocation] = useState(selectedLocation || '');
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: startDate ? new Date(startDate) : undefined,
    to: endDate ? new Date(endDate) : undefined,
  });
  const [priceRange, setPriceRange] = useState<[number, number]>([
    minPrice ? parseInt(minPrice) : 0,
    maxPrice ? parseInt(maxPrice) : 1000,
  ]);

  // Handle applying filters
  const applyFilters = () => {
    // Start with current search params
    const params = new URLSearchParams(searchParams.toString());
    
    // Update category filter
    if (category) {
      params.set('category', category);
    } else {
      params.delete('category');
    }
    
    // Update location filter
    if (location) {
      params.set('location', location);
    } else {
      params.delete('location');
    }
    
    // Update date range filters
    if (dateRange.from) {
      params.set('startDate', dateRange.from.toISOString().split('T')[0]);
    } else {
      params.delete('startDate');
    }
    
    if (dateRange.to) {
      params.set('endDate', dateRange.to.toISOString().split('T')[0]);
    } else {
      params.delete('endDate');
    }
    
    // Update price range filters
    if (priceRange[0] > 0) {
      params.set('minPrice', priceRange[0].toString());
    } else {
      params.delete('minPrice');
    }
    
    if (priceRange[1] < 1000) {
      params.set('maxPrice', priceRange[1].toString());
    } else {
      params.delete('maxPrice');
    }
    
    // Reset to page 1 when filters change
    params.delete('page');
    
    // Navigate with updated filters
    router.push(`/events?${params.toString()}`);
  };

  // Clear all filters
  const clearFilters = () => {
    setCategory('');
    setLocation('');
    setDateRange({ from: undefined, to: undefined });
    setPriceRange([0, 1000]);
    
    // Remove all filter params from URL
    const params = new URLSearchParams();
    const query = searchParams.get('query');
    if (query) {
      params.set('query', query);
    }
    
    router.push(`/events?${params.toString()}`);
  };

  // Check if any filters are active
  const hasActiveFilters = 
    !!category || 
    !!location || 
    !!dateRange.from || 
    !!dateRange.to ||
    priceRange[0] > 0 ||
    priceRange[1] < 1000;

  // Ensure locations array has the expected structure with city property
  const locationOptions = Array.isArray(locations) 
    ? locations.map(loc => ({
        city: typeof loc === 'object' && loc !== null && 'city' in loc 
          ? String(loc.city) 
          : String(loc),
        count: typeof loc === 'object' && loc !== null && 'count' in loc 
          ? Number(loc.count) || 0 
          : 0
      }))
    : [];

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-xl bg-gradient-to-br from-zinc-900/70 to-purple-950/30 backdrop-blur-md border border-purple-900/30">
        <h2 className="text-xl font-semibold mb-4 text-white">Filters</h2>
        
        <div className="space-y-5">
          <div>
            <h3 className="text-sm font-medium text-zinc-300 mb-3">Date Range</h3>
            <DateRangePicker 
              value={dateRange} 
              onChange={setDateRange} 
            />
          </div>
          
          <Separator className="bg-purple-900/30" />
          
          <div>
            <h3 className="text-sm font-medium text-zinc-300 mb-3">Categories</h3>
            <CategoryFilters 
              categories={categories ?? []}
              selectedCategoryId={category}
              onSelectCategory={setCategory}
              isLoading={isCategoriesLoading}
            />
          </div>
          
          <Separator className="bg-purple-900/30" />
          
          <div>
            <h3 className="text-sm font-medium text-zinc-300 mb-3">Price Range</h3>
            <PriceRangeSlider 
              value={priceRange}
              onChange={setPriceRange}
            />
          </div>
          
          <Separator className="bg-purple-900/30" />
          
          <div>
            <h3 className="text-sm font-medium text-zinc-300 mb-3">Location</h3>
            <select 
              className="w-full rounded-md bg-zinc-900/70 border border-purple-900/50 text-white px-3 py-2 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            >
              <option value="">All Locations</option>
              {locationOptions.map((loc) => (
                <option key={loc.city} value={loc.city}>
                  {loc.city} {loc.count > 0 ? `(${loc.count})` : ''}
                </option>
              ))}
            </select>
          </div>
          
          <div className="pt-4 space-y-2">
            <Button 
              className="w-full py-2.5 rounded-md bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors"
              onClick={applyFilters}
            >
              Apply Filters
            </Button>
            
            {hasActiveFilters && (
              <Button 
                variant="outline" 
                className="w-full border-purple-700/30 text-purple-300 hover:bg-purple-950/20 hover:text-purple-200"
                onClick={clearFilters}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Featured event promo */}
      <div className="relative rounded-xl overflow-hidden h-[320px] group">
        <Image
          src="/images/featured-concert.jpg"
          alt="Featured Concert"
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-6">
          <span className="bg-purple-500 text-white px-2 py-1 rounded text-xs font-semibold uppercase mb-2 inline-block">
            Upcoming
          </span>
          <h3 className="text-xl font-bold text-white mb-1">Summer Festival 2024</h3>
          <p className="text-zinc-300 text-sm mb-4">July 15-18, 2024 • Miami Beach</p>
          <Link 
            href="/events/summer-festival-2024" 
            className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-colors"
          >
            Learn More
          </Link>
        </div>
      </div>
    </div>
  );
} 