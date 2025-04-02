import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { EventSearch } from "@/components/events/event-search";
import { CategoryFilters } from "@/components/events/category-filters";
import { DateRangePicker } from "@/components/events/date-range-picker";
import { PriceRangeSlider } from "@/components/events/price-range-slider";
import { EventsGrid } from "@/components/events/events-grid";
import { FeaturedEvent } from "@/components/events/featured-event";
import { SparklesCore } from "@/components/ui/sparkles";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Browse Events | EventManager",
  description: "Discover and book tickets for the hottest concerts and events",
};

export default function EventsPage() {
  return (
    <div className="space-y-10">
      {/* Hero section */}
      <section className="relative -mt-8 h-[50vh] min-h-[400px] w-full overflow-hidden rounded-xl">
        {/* Animated background */}
        <div className="absolute inset-0 w-full h-full">
          <SparklesCore
            background="transparent"
            minSize={0.6}
            maxSize={1.4}
            particleDensity={100}
            className="w-full h-full"
            particleColor="#8B5CF6"
          />
        </div>
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/80 to-fuchsia-900/80" />
        
        {/* Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white">
            Discover Amazing 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300">
              {" "}Concerts & Events
            </span>
          </h1>
          <p className="text-zinc-300 text-lg md:text-xl max-w-2xl mb-8">
            Find and book tickets for the hottest concerts, festivals, and performances happening near you.
          </p>
          
          {/* Search bar */}
          <div className="w-full max-w-3xl">
            <EventSearch />
          </div>
        </div>
      </section>
      
      {/* Main content section */}
      <section className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
        {/* Filters sidebar */}
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-gradient-to-br from-zinc-900/70 to-purple-950/30 backdrop-blur-md border border-purple-900/30">
            <h2 className="text-xl font-semibold mb-4 text-white">Filters</h2>
            
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-medium text-zinc-300 mb-3">Date Range</h3>
                <DateRangePicker />
              </div>
              
              <Separator className="bg-purple-900/30" />
              
              <div>
                <h3 className="text-sm font-medium text-zinc-300 mb-3">Categories</h3>
                <CategoryFilters />
              </div>
              
              <Separator className="bg-purple-900/30" />
              
              <div>
                <h3 className="text-sm font-medium text-zinc-300 mb-3">Price Range</h3>
                <PriceRangeSlider />
              </div>
              
              <Separator className="bg-purple-900/30" />
              
              <div>
                <h3 className="text-sm font-medium text-zinc-300 mb-3">Location</h3>
                <select className="w-full rounded-md bg-zinc-900/70 border border-purple-900/50 text-white px-3 py-2 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500">
                  <option value="all">All Locations</option>
                  <option value="newyork">New York</option>
                  <option value="losangeles">Los Angeles</option>
                  <option value="miami">Miami</option>
                  <option value="chicago">Chicago</option>
                </select>
              </div>
              
              <div className="pt-4">
                <button className="w-full py-2.5 rounded-md bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors">
                  Apply Filters
                </button>
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
                Featured
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
        
        {/* Events grid */}
        <div>
          <div className="mb-8">
            <FeaturedEvent />
          </div>
          
          <Suspense fallback={<EventSkeleton />}>
            <EventsGrid />
          </Suspense>
        </div>
      </section>
      
      {/* Call to action section */}
      <section className="mt-16 relative rounded-xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900 to-fuchsia-900 opacity-90"></div>
        <div className="absolute inset-0 bg-[url('/images/grid.svg')] bg-center opacity-30"></div>
        
        <div className="relative z-10 px-6 py-16 sm:px-12 md:py-20 lg:py-24 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Experience the Music?
          </h2>
          <p className="text-lg text-purple-100 max-w-2xl mx-auto mb-8">
            Sign up now and never miss your favorite artist&apos;s concert. Get first access to early bird tickets and exclusive offers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-white text-purple-900 font-semibold hover:bg-purple-100 transition-colors shadow-lg hover:shadow-white/20"
            >
              Create Account
            </Link>
            <Link
              href="/sign-in"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-transparent border-2 border-white text-white font-semibold hover:bg-white/10 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function EventSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="bg-zinc-900/60 border border-purple-900/30 rounded-xl overflow-hidden">
          <Skeleton className="w-full h-48 bg-zinc-800/50" />
          <div className="p-4 space-y-3">
            <Skeleton className="w-3/4 h-6 bg-zinc-800/50" />
            <Skeleton className="w-1/2 h-4 bg-zinc-800/50" />
            <Skeleton className="w-2/3 h-4 bg-zinc-800/50" />
            <div className="pt-2">
              <Skeleton className="w-full h-10 bg-zinc-800/50" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 