import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { getEventById } from "@/lib/actions/event.actions";
import { getAllVenues } from "@/lib/actions/venue.actions";
import { EventForm } from "../../components/event-form";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";

export const metadata = {
  title: "Edit Event",
  description: "Edit an existing event",
};

// Force dynamic to prevent caching issues
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function EditEventPage({
  params: paramsPromise
}: {
  params: Promise<{ id: string }>;
}) {
  // Check authorization
  const session = await auth();
  
  if (!session || !(session.user.role === 'admin' || session.user.role === 'manager')) {
    redirect('/sign-in ');
  }

  const params = await paramsPromise;
  
  // Check if id is valid
  if (!params.id || isNaN(parseInt(params.id))) {
    notFound();
  }

  const eventId = parseInt(params.id);
  
  // Fetch event data
  try {
    // Use Promise.all to fetch data in parallel
    const [event, venues] = await Promise.all([
      getEventById(eventId),
      getAllVenues()
    ]);
    
    if (!event) {
      notFound();
    }
    
    // Convert null imageUrl to undefined to match the expected type
    const eventData = {
      ...event,
      bannerImage: event.bannerImage || undefined,
      isFeatured: event.isFeatured ?? undefined,
      ageRestriction: event.ageRestriction ?? undefined,
      maxTickets: event.maxTickets ?? undefined
    };
    
    // Add debugging info to ensure we have the correct data
    console.log(`Editing event: ${eventId}`, { 
      eventData: JSON.stringify(eventData, null, 2),
      venuesCount: venues.length 
    });
    
    return (
      <div className="container py-10">
        <Heading
          title="Edit Event"
          description="Modify an existing event"
        />
        <Separator className="my-6" />
        
        <div className="max-w-5xl mx-auto">
          <EventForm 
            venues={venues} 
            initialData={eventData} 
          />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching event:", error);
    return (
      <div className="container py-10">
        <Heading
          title="Error Loading Event"
          description="There was a problem loading this event"
        />
        <Separator className="my-6" />
        
        <div className="max-w-5xl mx-auto bg-red-50 p-6 rounded-lg border border-red-200">
          <h2 className="text-lg font-semibold text-red-700">Error Details</h2>
          <p className="mt-2">{error instanceof Error ? error.message : "Unknown error occurred"}</p>
          <button 
            onClick={() => window.location.href = "/dashboard/events"}
            className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          >
            Return to Events
          </button>
        </div>
      </div>
    );
  }
}