import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getAllVenues } from "@/lib/actions/venue.actions";
import { getAllCategories } from "@/lib/actions/category.actions";
import { getEventById } from "@/lib/actions/event.actions";
import { EventForm } from "@/app/dashboard/events/components/event-form";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";

export const metadata = {
  title: "Edit Event",
  description: "Edit an existing event",
};

export default async function EditEventPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();
  
  // Check if user is authenticated and has required role
  if (!session?.user || !(session.user.role === 'admin' || session.user.role === 'manager')) {
    redirect('/sign-in');
  }
  
  const eventId = parseInt(params.id, 10);
  
  if (isNaN(eventId)) {
    redirect('/dashboard/events');
  }
  
  // Fetch event, venues, and categories
  const [event, venues, categories] = await Promise.all([
    getEventById(eventId),
    getAllVenues(),
    getAllCategories(),
  ]);
  
  if (!event) {
    redirect('/dashboard/events');
  }
  
  // Transform the event object to match EventForm expected structure
  const formattedEvent = {
    id: event.id,
    title: event.title,
    description: event.description || "",
    venueId: event.venueId || 0,
    startDate: event.startDate,
    endDate: event.endDate,
    status: event.status || "draft",
    imageUrl: event.bannerImage || undefined,
    categories: event.categoryIds
      .map(id => categories.find(cat => cat.id === id))
      .filter((cat): cat is typeof categories[0] => cat !== undefined)
  };
  
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
          categories={categories} 
          initialData={formattedEvent}
        />
      </div>
    </div>
  );
} 