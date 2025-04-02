import { getFeaturedEvents } from "@/lib/actions/event.actions";
import { FeaturedEvent } from "./featured-event";

interface Venue {
  id: number;
  name: string;
  address: string;
  city: string;
  capacity: number;
  description: string | null;
  imageUrl: string | null;
  contactInfo: string | null;
  coordinates: { lat: number; lng: number } | null;
  createdAt: Date;
  updatedAt: Date;
}

interface Event {
  id: number;
  title: string;
  description: string | null;
  startDate: Date;
  endDate: Date;
 
  venue: Venue | null;
  ticketCategories: Array<{
    id: number;
    name: string;
    price: number;
    quantity: number;
    availableFrom: Date;
    availableTo: Date;
    isEarlyBird: boolean;
    isVIP: boolean;
    maxPerOrder: number | null;
  }>;
  bannerImage: string | null;
  categories: Array<{
    id: number;
    name: string;
  }>;
  maxTickets: number | null;
}

export async function FeaturedEventWrapper() {
  try {
    const featuredEvents = await getFeaturedEvents() as unknown as Event[];
    
    if (!featuredEvents || featuredEvents.length === 0) {
      return null;
    }

    const event = featuredEvents[0];
    
    return (
      <FeaturedEvent
        event={{
          id: event.id,
          title: event.title,
          description: event.description,
          startDate: event.startDate,
          endDate: event.endDate,
          venue: event.venue ? {
            name: event.venue.name,
            address: event.venue.address,
          } : {
            name: "Venue TBA",
            address: "Location to be announced"
          },
          ticketCategories: event.ticketCategories || [],
          imageUrl: event.bannerImage,
          category: event.categories?.[0]?.name || "Uncategorized",
          attendees: event.maxTickets || 0,
        }}
      />
    );
  } catch (error) {
    console.error("Error in FeaturedEventWrapper:", error);
    return null;
  }
} 