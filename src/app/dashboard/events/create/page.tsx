import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getAllVenues } from "@/lib/actions/venue.actions";
import { EventForm } from "../components/event-form";

export const dynamic = 'force-dynamic';

export default async function CreateEventPage() {
  // Check authorization
  const session = await auth();
  
  if (!session || !(session.user.role === 'admin' || session.user.role === 'manager')) {
    redirect('/auth/login?callbackUrl=/dashboard/events/create');
  }
  
  // Fetch venues for the form
  const venues = await getAllVenues();
  
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Create Event</h1>
      <div className="max-w-5xl mx-auto">
        <EventForm venues={venues} />
      </div>
    </div>
  );
} 