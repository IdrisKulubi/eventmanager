import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getEventById } from "@/lib/actions/event.actions";
import { TicketCategoryForm } from "../components/ticket-category-form";

export const dynamic = 'force-dynamic';

export default async function CreateTicketCategoryPage({ 
  params 
}: { 
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params;

  const session = await auth();
  
  if (!session || !(session.user.role === 'admin' || session.user.role === 'manager')) {
    redirect('/sign-in');
  }
  
  const eventId = parseInt(resolvedParams.id);
  
  const event = await getEventById(eventId);
  
  if (!event) {
    redirect('/dashboard/events');
  }
  
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold tracking-tight mb-8">{event.title} - Create Ticket Category</h1>
      <div className="max-w-5xl mx-auto">
        <TicketCategoryForm eventId={eventId} />
      </div>
    </div>
  );
} 