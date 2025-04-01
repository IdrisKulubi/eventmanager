import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getEvents } from "@/lib/actions/event.actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = 'force-dynamic';

export default async function DashboardTicketsPage() {
  // Check authorization
  const session = await auth();
  
  if (!session || !(session.user.role === 'admin' || session.user.role === 'manager')) {
    redirect('/auth/login?callbackUrl=/dashboard/tickets');
  }
  
  // Get all events
  const events = await getEvents({ status: 'published' });
  
  // Filter for published events only for this listing
  const publishedEvents = events.filter((event: { status: string | null }) => event.status === 'published');
  
  return (
    <div className="container py-10">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ticket Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage ticket categories for all your events
          </p>
        </div>
        
        <Button asChild>
          <Link href="/dashboard/events">
            View All Events
          </Link>
        </Button>
      </div>
      
      {publishedEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-6 mb-4">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-12 w-12 text-muted-foreground"
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">No Events Available</h2>
          <p className="text-muted-foreground max-w-md mb-6">
            There are no published events available. Create and publish an event to manage tickets.
          </p>
          <Button asChild>
            <Link href="/dashboard/events/new">
              Create New Event
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publishedEvents.map((event) => (
            <Card key={event.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-1">
                  <CardTitle className="text-xl">{event.title}</CardTitle>
                  <Badge variant="default">
                    Published
                  </Badge>
                </div>
                <CardDescription>
                  {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <Button className="w-full" asChild>
                  <Link href={`/dashboard/events/${event.id}/tickets`}>
                    Manage Tickets
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 