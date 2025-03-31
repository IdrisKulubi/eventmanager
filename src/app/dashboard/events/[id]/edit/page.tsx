import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getEventById } from "@/lib/actions/event.actions";
import { getAllVenues } from "@/lib/actions/venue.actions";
import { EventForm } from "../../components/event-form";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";

export const metadata = {
  title: "Edit Event",
  description: "Edit an existing event",
};

export const dynamic = 'force-dynamic';

export default async function EditEventPage({
  params,
}: {
  params: { id: string };
}) {
  // Check authorization
  const session = await auth();
  
  if (!session || !(session.user.role === 'admin' || session.user.role === 'manager')) {
    redirect('/auth/login?callbackUrl=/dashboard/events');
  }
  
  const eventId = parseInt(params.id);
  
  // Fetch event data
  const event = await getEventById(eventId);
  
  if (!event) {
    redirect('/dashboard/events');
  }
  
  // Fetch venues for the form
  const venues = await getAllVenues();
  
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
          initialData={event} 
        />
      </div>
    </div>
  );
} 