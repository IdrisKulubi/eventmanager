import { SparklesCore } from '@/components/ui/sparkles';
import { TicketSection } from '@/components/events/ticket-section';
import { Button } from '@/components/ui/button';
import { Metadata } from "next";
import Image from "next/image";
import db from '@/db/drizzle';
import { ticketCategories } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const metadata: Metadata = {
  title: "Black Ticket Concert | Strathmore University",
  description: "Experience the incredible energy of Strathmore's finest artists at the Black Ticket Concert",
};

async function getTicketCategories() {
  const categories = await db.query.ticketCategories.findMany({
    where: eq(ticketCategories.eventId, 1), // Assuming 1 is the Black Concert event ID
    orderBy: (categories, { asc }) => [asc(categories.price)],
  });

  // Transform the categories to match the expected type
  return categories.map(category => ({
    ...category,
    price: category.price ? parseFloat(category.price) : null,
    isEarlyBird: category.isEarlyBird ?? false,
    isVIP: category.isVIP ?? false,
    maxPerOrder: category.maxPerOrder ?? 1,
  }));
}

export default async function EventsPage() {
  const categories = await getTicketCategories();

  return (
    <main className="min-h-screen bg-black/95">
      {/* Hero Section with Sparkles */}
      <div className="relative h-[60vh] w-full flex items-center justify-center overflow-hidden">
        <div className="w-full absolute inset-0 h-full">
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
        
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-purple-200 mb-4">
            Black Ticket Concert
          </h1>
          <p className="text-purple-200 text-lg md:text-xl mb-6">
            Experience the incredible energy of Strathmore&apos;s finest artists
          </p>
          <p className="text-purple-300 text-base md:text-lg mb-8">
            23RD MAY • MAIN AUDITORIUM • STRATHMORE UNIVERSITY
          </p>
          <Button 
            asChild
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 rounded-full text-lg"
          >
            <a href="#tickets">
              Get Your Tickets Now
            </a>
          </Button>
        </div>
      </div>

      {/* Event Details Section */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Event Poster */}
          <div className="relative aspect-[3/4] w-full max-w-md mx-auto">
            <div className="absolute inset-0 bg-purple-500/20 rounded-lg backdrop-blur-sm"></div>
            <Image
              src="/images/black-concert-poster.jpg"
              alt="Black Concert Poster"
              fill
              className="object-cover rounded-lg"
              priority
            />
          </div>

          {/* Event Information */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold text-purple-100">
                Featuring
              </h2>
              <div className="space-y-2">
                <p className="text-purple-200">• Strathmore Artists</p>
                <p className="text-purple-200">• Strathmore DJs</p>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold text-purple-100">
                Event Details
              </h2>
              <div className="space-y-2">
                <p className="text-purple-200">• Date: May 23rd, 2024</p>
                <p className="text-purple-200">• Time: 6:00 PM - 11:00 PM</p>
                <p className="text-purple-200">• Venue: Main Auditorium</p>
                <p className="text-purple-200">• Location: Strathmore University</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ticket Section */}
      <TicketSection categories={categories} eventId={1} />
    </main>
  );
} 