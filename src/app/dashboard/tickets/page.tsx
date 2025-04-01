import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getEvents } from "@/lib/actions/event.actions";
import { getAllTicketCategories } from "@/lib/actions/ticket.actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { format } from "date-fns";
import { PlusIcon, TicketIcon, CalendarIcon } from "@heroicons/react/24/outline";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EditTicketModal } from '../events/[id]/tickets/components/edit-ticket-modal';

export const dynamic = 'force-dynamic';

export default async function DashboardTicketsPage() {
  // Check authorization
  const session = await auth();
  
  if (!session || !(session.user.role === 'admin' || session.user.role === 'manager')) {
    redirect('/sign-in');
  }
  
  // Get all events and tickets
  const { events } = await getEvents({ status: 'published' });
  const allTickets = await getAllTicketCategories();
  
  // Group tickets by event
  const ticketsByEvent = allTickets.reduce((acc, ticket) => {
    const eventId = ticket.eventId;
    if (!acc[eventId]) {
      acc[eventId] = [];
    }
    acc[eventId].push(ticket);
    return acc;
  }, {} as Record<number, typeof allTickets>);

  return (
    <div className="container py-10 space-y-8">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ticket Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage ticket categories for all your events
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild>
            <Link href="/dashboard/events/new">
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Event
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/events">
              <CalendarIcon className="h-4 w-4 mr-2" />
              View Events
            </Link>
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Tickets</TabsTrigger>
          <TabsTrigger value="byEvent">By Event</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-6">
          {allTickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-6 mb-4">
                <TicketIcon className="h-12 w-12 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold mb-2">No Tickets Available</h2>
              <p className="text-muted-foreground max-w-md mb-6">
                There are no ticket categories created yet. Start by creating tickets for your events.
              </p>
              <Button asChild>
                <Link href="/dashboard/events">
                  Manage Events
                </Link>
              </Button>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>All Ticket Categories</CardTitle>
                <CardDescription>
                  Manage all ticket categories across all events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableCaption>A list of all ticket categories</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Available From</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allTickets.map((ticket) => (
                      <TableRow key={ticket.ticketCategory.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            {ticket.ticketCategory.name}
                            <div className="flex ml-2">
                              {ticket.ticketCategory.isVIP && (
                                <Badge variant="secondary" className="bg-purple-100 text-purple-800 mr-1">
                                  VIP
                                </Badge>
                              )}
                              {ticket.ticketCategory.isEarlyBird && (
                                <Badge variant="secondary" className="bg-green-100 text-green-800">
                                  Early Bird
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Link 
                            href={`/dashboard/events/${ticket.eventId}`}
                            className="text-blue-600 hover:underline"
                          >
                            {ticket.eventTitle}
                          </Link>
                        </TableCell>
                        <TableCell>${parseFloat(ticket.ticketCategory.price).toFixed(2)}</TableCell>
                        <TableCell>{ticket.ticketCategory.quantity}</TableCell>
                        <TableCell>
                          {format(new Date(ticket.ticketCategory.availableFrom), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>
                          {new Date(ticket.ticketCategory.availableTo) > new Date() ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                              Expired
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <EditTicketModal 
                            ticket={ticket.ticketCategory}
                            eventId={ticket.eventId}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="byEvent" className="space-y-6">
          {events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-6 mb-4">
                <CalendarIcon className="h-12 w-12 text-muted-foreground" />
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
              {events.map((event) => (
                <Card key={event.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-1">
                      <CardTitle className="text-xl line-clamp-1">{event.title}</CardTitle>
                      <Badge variant="default">
                        {event.status === 'published' ? 'Published' : 'Draft'}
                      </Badge>
                    </div>
                    <CardDescription>
                      {format(new Date(event.startDate), "MMM d, yyyy")} - {format(new Date(event.endDate), "MMM d, yyyy")}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="pb-0">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Ticket Categories:</span>
                        <span className="font-medium">
                          {ticketsByEvent[event.id]?.length || 0}
                        </span>
                      </div>
                      
                      {ticketsByEvent[event.id] && ticketsByEvent[event.id].length > 0 && (
                        <>
                          <Separator />
                          <div className="space-y-1 py-2">
                            {ticketsByEvent[event.id].slice(0, 3).map((ticket) => (
                              <div key={ticket.ticketCategory.id} className="flex justify-between items-center text-sm">
                                <div className="flex items-center">
                                  <span>{ticket.ticketCategory.name}</span>
                                  {ticket.ticketCategory.isVIP && (
                                    <Badge variant="secondary" className="ml-2 text-xs bg-purple-100 text-purple-800">
                                      VIP
                                    </Badge>
                                  )}
                                </div>
                                <span>${parseFloat(ticket.ticketCategory.price).toFixed(2)}</span>
                              </div>
                            ))}
                            
                            {ticketsByEvent[event.id].length > 3 && (
                              <div className="text-xs text-muted-foreground text-center pt-1">
                                +{ticketsByEvent[event.id].length - 3} more ticket categories
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                  
                  <CardFooter className="pt-6">
                    <Button className="w-full" asChild>
                      <Link href={`/dashboard/events/${event.id}/tickets`}>
                        Manage Tickets
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 