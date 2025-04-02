import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getEventById } from "@/lib/actions/event.actions";
import { getTicketCategoriesByEventId } from "@/lib/actions/ticket.actions";
import { DataTable } from "@/components/ui/data-table";
import { columns, TicketCategory } from "./components/columns";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function EventTicketsPage({ 
  params 
}: { 
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params;
  
  // Check authorization
  const session = await auth();
  
  if (!session || !(session.user.role === 'admin' || session.user.role === 'manager')) {
    redirect('/sign-in');
  }
  
  const eventId = parseInt(resolvedParams.id);
  
  // Get event details
  const event = await getEventById(eventId);
  
  if (!event) {
    redirect('/dashboard/events');
  }
  
  // Get ticket categories
  const ticketCategories = await getTicketCategoriesByEventId(eventId);
  
  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{event.title} - Ticket Categories</h1>
        <Link href={`/dashboard/events/${eventId}/tickets/create`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Ticket Category
          </Button>
        </Link>
      </div>
      
      <div className="max-w-5xl mx-auto">
        <DataTable columns={columns} data={ticketCategories as unknown as TicketCategory[]} />
      </div>
    </div>
  );
} 