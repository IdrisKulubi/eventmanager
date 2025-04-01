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
import { QuickActionCard } from "./components/quick-action-card";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  // Check authorization
  const session = await auth();
  
  if (!session) {
    redirect('/sign-in');
  }
  
  // Get all events
  const { events, count } = await getEvents({});
  const publishedEvents = events.filter(event => event.status === 'published');
  const upcomingEvents = events.filter(
    event => new Date(event.startDate) > new Date()
  ).slice(0, 5);
  
  // Get all ticket categories
  let ticketStats = {
    total: 0,
    active: 0,
    totalQuantity: 0,
    soldQuantity: 0,
  };
  
  try {
    const ticketCategoriesData = await getAllTicketCategories();
    const now = new Date();
    
    ticketStats = {
      total: ticketCategoriesData.length,
      active: ticketCategoriesData.filter(t => {
        const availableTo = t.ticketCategory.availableTo ? new Date(t.ticketCategory.availableTo) : null;
        return availableTo && availableTo > now;
      }).length,
      totalQuantity: ticketCategoriesData.reduce((sum, t) => sum + Number(t.ticketCategory.quantity), 0),
      soldQuantity: 0, // This would need to be calculated from sales data
    };
  } catch (error) {
    console.error("Error fetching ticket stats:", error);
  }
  
  // Calculate stats
  const stats = [
    {
      name: "Total Events",
      value: count,
      icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>',
      color: "bg-blue-500",
      link: "/dashboard/events",
    },
    {
      name: "Published Events",
      value: publishedEvents.length,
      icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>',
      color: "bg-green-500",
      link: "/dashboard/events",
    },
    {
      name: "Ticket Categories",
      value: ticketStats.total,
      icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" /></svg>',
      color: "bg-purple-500",
      link: "/dashboard/tickets",
    },
    {
      name: "Active Tickets",
      value: ticketStats.active,
      icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" /></svg>',
      color: "bg-amber-500",
      link: "/dashboard/tickets",
    },
  ];

  return (
    <div className="container py-10 space-y-8">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back, {session.user?.name || 'User'}!
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild>
            <Link href="/dashboard/events/new">
              <span className="h-4 w-4 mr-2" dangerouslySetInnerHTML={{ __html: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>' }} />
              Create Event
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.name} className="overflow-hidden">
            <Link href={stat.link} className="block h-full hover:bg-muted/5 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-medium">{stat.name}</CardTitle>
                  <div className={`${stat.color} p-2 rounded-md text-white`}>
                    <span className="h-5 w-5" dangerouslySetInnerHTML={{ __html: stat.icon }} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>
      
      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickActionCard 
            title="Create Event" 
            description="Create a new event with tickets"
            icon='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>'
            href="/dashboard/events/new"
            color="bg-blue-100 text-blue-700"
          />
          <QuickActionCard 
            title="Manage Tickets" 
            description="View and manage all ticket categories"
            icon='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" /></svg>'
            href="/dashboard/tickets"
            color="bg-purple-100 text-purple-700"
          />
          <QuickActionCard 
            title="Analytics" 
            description="View event and ticket statistics"
            icon='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>'
            href="/dashboard/analytics"
            color="bg-emerald-100 text-emerald-700"
          />
          <QuickActionCard 
            title="Categories" 
            description="Manage event categories"
            icon='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" /><path stroke-linecap="round" stroke-linejoin="round" d="M6 6h.008v.008H6V6z" /></svg>'
            href="/dashboard/categories"
            color="bg-amber-100 text-amber-700"
          />
        </div>
      </div>
      
      {/* Upcoming Events */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Upcoming Events</h2>
        {upcomingEvents.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
              <span 
                className="h-12 w-12 text-muted-foreground mb-4"
                dangerouslySetInnerHTML={{ 
                  __html: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>' 
                }}
              />
              <h3 className="text-lg font-medium mb-2">No Upcoming Events</h3>
              <p className="text-muted-foreground mb-4">
                You don&apos;t have any upcoming events scheduled.
              </p>
              <Button asChild>
                <Link href="/dashboard/events/new">Create New Event</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {upcomingEvents.map((event) => (
              <Card key={event.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-medium truncate">
                      {event.title}
                    </CardTitle>
                    <Badge>
                      {event.status}
                    </Badge>
                  </div>
                  <CardDescription>
                    {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {event.description || "No description provided."}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between pt-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/dashboard/events/${event.id}`}>
                      View Details
                    </Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link href={`/dashboard/events/${event.id}/tickets`}>
                      Manage Tickets
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 