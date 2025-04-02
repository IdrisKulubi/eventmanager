import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getEventById } from "@/lib/actions/event.actions";
import { getTicketCategoryById } from "@/lib/actions/ticket.actions";
import { TicketCategoryForm } from "../../components/ticket-category-form";

export const dynamic = 'force-dynamic';

export default async function EditTicketCategoryPage({ 
  params 
}: { 
  params: { id: string; ticketId: string }
}) {
  // Check authorization
  const session = await auth();
  
  if (!session || !(session.user.role === 'admin' || session.user.role === 'manager')) {
    redirect('/auth/login?callbackUrl=/dashboard/events');
  }
  
  const eventId = parseInt(params.id);
  const ticketId = parseInt(params.ticketId);
  
  // Get event details
  const event = await getEventById(eventId);
  
  if (!event) {
    redirect('/dashboard/events');
  }
  
  // Get ticket category details
  const ticketCategory = await getTicketCategoryById(ticketId);
  
  if (!ticketCategory || ticketCategory.eventId !== eventId) {
    redirect(`/dashboard/events/${eventId}/tickets`);
  }
  
  // Transform the data to match the form's expected types
  const transformedData = {
    ...ticketCategory,
    price: parseFloat(ticketCategory.price),
    isEarlyBird: ticketCategory.isEarlyBird ?? false,
    isVIP: ticketCategory.isVIP ?? false,
  };
  
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold tracking-tight mb-8">
        {event.title} - Edit {ticketCategory.name}
      </h1>
      <div className="max-w-5xl mx-auto">
        <TicketCategoryForm 
          eventId={eventId} 
          initialData={transformedData} 
        />
      </div>
    </div>
  );
} 