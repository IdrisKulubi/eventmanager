import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getAllVenues } from "@/lib/actions/venue.actions";
import { getAllCategories } from "@/lib/actions/category.actions";
import { EventForm } from "@/app/dashboard/events/components/event-form";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";

export const metadata = {
  title: "Create Event",
  description: "Create a new event",
};

export default async function CreateEventPage() {
  const session = await auth();
  
  // Check if user is authenticated and has required role
  if (!session || !(session.user.role === 'admin' || session.user.role === 'manager')) {
    redirect('/sign-in');
  }
  
  // Fetch venues and categories for the form
  const venues = await getAllVenues();
  const categories = await getAllCategories();
  
  return (
    <div className="container py-10">
      <Heading
        title="Create Event"
        description="Add a new event to your platform"
      />
      <Separator className="my-6" />
      
      <div className="max-w-5xl mx-auto">
        <EventForm venues={venues} categories={categories} />
      </div>
    </div>
  );
} 