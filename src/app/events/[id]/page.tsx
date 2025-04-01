import { getEventById } from "@/lib/actions/event.actions";
import { notFound } from "next/navigation";
import { EventHero } from "@/components/events/event-hero";
import { EventDetails } from "@/components/events/event-details";
import { TicketSidebar } from "@/components/events/ticket-sidebar";
import { AnimatedBackground } from "@/components/ui/animated-background";

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const paramsPromise = params;
  const eventId = parseInt((await paramsPromise).id);
  const event = await getEventById(eventId);
  
  if (!event) {
    return {
      title: "Event Not Found",
      description: "The requested event could not be found"
    };
  }
  
  return {
    title: event.title,
    description: event.description || "Event details"
  };
}

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const paramsPromise = params;
  const eventId = parseInt((await paramsPromise).id);
  const event = await getEventById(eventId);
  
  if (!event) {
    notFound();
  }
  
  // Default image if none provided
  const imageUrl = event.bannerImage || "/placeholder-event.jpg";
  
  return (
    <div className="min-h-screen bg-gray-900 relative">
      {/* Animated Background */}
      <AnimatedBackground />
      
      {/* Hero Section */}
      <EventHero
        title={event.title}
        imageUrl={imageUrl}
        status={event.status || "published"}
      />
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Event Details */}
          <div className="lg:col-span-2">
            <EventDetails
              startDate={event.startDate.toISOString()}
              endDate={event.endDate.toISOString()}
              venueName={event.venueName || "Venue information not available"}
              categories={event.categories || []}
              ageRestriction={event.ageRestriction || undefined}
              maxTickets={event.maxTickets || undefined}
              description={event.description || ""}
            />
          </div>
          
          {/* Ticket Sidebar */}
          <div className="lg:col-span-1">
            <TicketSidebar
              maxTickets={event.maxTickets || undefined}
              price={49.99} // TODO: Add price to event model
             
            />
          </div>
        </div>
      </div>
    </div>
  );
} 