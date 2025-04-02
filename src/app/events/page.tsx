import { Suspense } from 'react';
import { auth } from '@/auth';
import { SparklesCore } from '@/components/ui/sparkles';
import { EventFilters } from '@/components/events/event-filters';
import { EventSearchBar } from '@/components/events/event-search-bar';
import { EventsGrid } from '@/components/events/events-grid';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse Events | EventManager",
  description: "Discover and book tickets for concerts and events.",
};

interface EventsPageProps {
  searchParams: {
    query?: string;
    category?: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    minPrice?: string;
    maxPrice?: string;
    page?: string;
    pageSize?: string;
    sortBy?: string;
  };
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const session = await auth();
  const { query, category, location, startDate, endDate, minPrice, maxPrice } = searchParams;
  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  const pageSize = searchParams.pageSize ? parseInt(searchParams.pageSize) : 9;
  const sortBy = searchParams.sortBy || 'date';

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Hero section with animated sparkles background */}
      <div className="relative h-[340px] md:h-[400px] overflow-hidden bg-purple-950/20">
        {/* Sparkles animation in background */}
        <div className="absolute inset-0 w-full h-full">
          <SparklesCore
            id="tsparticlesfullpage"
            background="transparent"
            minSize={0.6}
            maxSize={1.4}
            particleDensity={70}
            className="w-full h-full"
            particleColor="#a855f7"
            speed={0.8}
          />
        </div>
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-950/30 via-purple-950/40 to-zinc-950"></div>
        
        <div className="relative z-10 container mx-auto px-4 py-16 md:py-20 flex flex-col items-center justify-center h-full">
          <h1 className="text-3xl md:text-5xl font-bold text-white text-center mb-6 drop-shadow-lg">
            Discover Amazing Events
          </h1>
          
          <p className="text-lg text-zinc-300 text-center max-w-2xl mb-8">
            Find and book tickets for concerts, festivals, and performances
          </p>
          
          {/* Search bar */}
          <div className="w-full max-w-3xl">
            <EventSearchBar initialQuery={query || ''} />
          </div>
        </div>
      </div>
      
      {/* Main content with filters and events grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar with filters */}
          <div className="w-full lg:w-1/4 lg:max-w-xs">
            <EventFilters
              selectedCategory={category}
              selectedLocation={location}
              startDate={startDate}
              endDate={endDate}
              minPrice={minPrice}
              maxPrice={maxPrice}
            />
          </div>
          
          {/* Events listing */}
          <div className="w-full lg:w-3/4">
            <Suspense fallback={<EventsGridSkeleton />}>
              <EventsList 
                query={query}
                category={category}
                location={location}
                startDate={startDate}
                endDate={endDate}
                minPrice={minPrice}
                maxPrice={maxPrice}
                page={page}
                pageSize={pageSize}
                sortBy={sortBy}
              />
            </Suspense>
          </div>
        </div>
      </div>
      
      {/* Call to action section */}
      {!session?.user && (
        <div className="bg-gradient-to-r from-purple-900/20 to-indigo-900/20 border-t border-purple-900/30">
          <div className="container mx-auto px-4 py-16 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
              Ready to create your own events?
            </h2>
            
            <p className="text-zinc-300 max-w-2xl mx-auto mb-8">
              Sign up to create, manage, and track your own events. Join our community of event creators and reach a wider audience.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                asChild 
                size="lg"
                className="bg-purple-600 hover:bg-purple-700 text-white font-medium"
              >
                <a href="/signup">Create an Account</a>
              </Button>
              
              <Button 
                asChild 
                variant="outline" 
                size="lg"
                className="border-purple-700/50 text-purple-300 hover:bg-purple-950/30"
              >
                <a href="/signin">Sign In</a>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Separate component for events list to allow for streaming
async function EventsList({
  query,
  category,
  location,
  startDate,
  endDate,
  minPrice,
  maxPrice,
  page,
  pageSize,
  sortBy,
}: {
  query?: string;
  category?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  minPrice?: string;
  maxPrice?: string;
  page: number;
  pageSize: number;
  sortBy: string;
}) {
  // Import here to avoid waterfall requests
  const { getEvents } = await import('@/lib/actions/event.actions');
  
  // Fetch events with all filters
  const { events, pagination } = await getEvents({
    page,
    limit: pageSize,
    search: query,
    categoryId: category ? parseInt(category) : undefined,
    locationId: location ? parseInt(location) : undefined,
    startDate: startDate ? new Date(startDate) : undefined,
    endDate: endDate ? new Date(endDate) : undefined,
    sortBy,
  });
  
  return (
    <EventsGrid
      events={events}
      total={pagination.totalEvents}
      page={page}
      pageSize={pageSize}
      sortBy={sortBy}
      query={query}
      categoryId={category}
      locationId={location}
      startDate={startDate}
      endDate={endDate}
      minPrice={minPrice}
      maxPrice={maxPrice}
    />
  );
}

// Loading skeleton for events grid
function EventsGridSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-9 w-36" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array(9).fill(0).map((_, index) => (
          <div key={index} className="rounded-xl overflow-hidden bg-gradient-to-br from-zinc-900/90 to-purple-950/30 border border-purple-900/20">
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
        ))}
      </div>
      
      <div className="flex justify-center mt-8">
        <Skeleton className="h-10 w-96" />
      </div>
    </div>
  );
} 