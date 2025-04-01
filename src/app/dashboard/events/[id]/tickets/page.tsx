import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getEventById } from "@/lib/actions/event.actions";
import { getTicketCategoriesByEventId } from "@/lib/actions/ticket.actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import TicketCategoryForm from "../../components/ticket-category-form";
import DeleteTicketCategoryButton from "../../components/delete-ticket-category-button";

export const dynamic = 'force-dynamic';

export default async function EventTicketsPage({ params }: { params: { id: string } }) {
  // Check authorization
  const session = await auth();
  
  if (!session || !(session.user.role === 'admin' || session.user.role === 'manager')) {
    redirect('/auth/login?callbackUrl=/dashboard/events');
  }
  
  // Await params before accessing properties
  const { id } = await params;
  const eventId = parseInt(id, 10); // Explicitly convert to number with base 10
  
  // Get event and ticket categories
  const event = await getEventById(eventId);
  
  if (!event) {
    redirect('/dashboard/events');
  }
  
  const ticketCategories = await getTicketCategoriesByEventId(eventId);
  
  // Format dates for display
  const formattedStartDate = format(new Date(event.startDate), "MMMM d, yyyy");
  const formattedEndDate = format(new Date(event.endDate), "MMMM d, yyyy");
  
  return (
    <div className="container py-10">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">{event.title}</h1>
            <Badge variant={event.status === 'published' ? 'default' : 'outline'}>
              {event.status === 'published' ? 'Published' : 'Draft'}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-2">
            {formattedStartDate} - {formattedEndDate}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            asChild
          >
            <Link href="/dashboard/tickets">
              All Tickets
            </Link>
          </Button>
          <Button
            variant="outline"
            asChild
          >
            <Link href="/dashboard/events">
              All Events
            </Link>
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="categories" className="space-y-6">
        <TabsList>
          <TabsTrigger value="categories">Ticket Categories</TabsTrigger>
          <TabsTrigger value="add" className="bg-primary/10">Add New Category</TabsTrigger>
        </TabsList>
        
        <TabsContent value="categories">
          {ticketCategories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-6 mb-4">
                <AlertTriangle className="h-10 w-10 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold mb-2">No Ticket Categories</h2>
              <p className="text-muted-foreground max-w-md mb-6">
                This event doesn&apos;t have any ticket categories yet. Add a new category to start selling tickets.
              </p>
              <Button asChild>
                <Link href={`/dashboard/events/${eventId}/tickets?tab=add`}>
                  Add Ticket Category
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ticketCategories.map((category) => (
                <Card key={category.id} className="overflow-hidden flex flex-col">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-1">
                      <CardTitle className="text-xl">{category.name}</CardTitle>
                      <div className="flex gap-1">
                        {category.isVIP && (
                          <Badge variant="secondary" className="bg-purple-100 text-purple-800 hover:bg-purple-100">
                            VIP
                          </Badge>
                        )}
                        {category.isEarlyBird && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
                            Early Bird
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardDescription>
                      ${parseFloat(category.price).toFixed(2)}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="pb-4 flex-grow">
                    <div className="flex flex-col gap-3">
                      <div className="text-sm">
                        {category.description || "No description provided"}
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Quantity:</span>
                        <span className="font-medium">{category.quantity}</span>
                      </div>
                      
                      {category.availableFrom && category.availableTo && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Sale Period:</span>
                          <span className="font-medium">
                            {format(new Date(category.availableFrom), "MMM d")} - {format(new Date(category.availableTo), "MMM d, yyyy")}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  
                  <CardFooter className="pt-0 border-t flex justify-between gap-2">
                   
                    <DeleteTicketCategoryButton
                      categoryId={category.id}
                      eventId={eventId}
                    />
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle>Add New Ticket Category</CardTitle>
              <CardDescription>
                Create a new ticket category for your event
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TicketCategoryForm eventId={eventId} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 