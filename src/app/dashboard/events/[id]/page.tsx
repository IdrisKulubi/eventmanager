import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { getEventById } from "@/lib/actions/event.actions";
import { PencilIcon, CalendarIcon, MapPinIcon, TagIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const dynamic = 'force-dynamic';

export default async function EventDetailsPage({ 
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

  // Default image if none provided
  const imageUrl = event.bannerImage || "/placeholder-event.jpg";
  
  return (
    <div className="container py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{event.title}</h1>
        
        <div className="flex gap-4">
          <Button
            variant="outline"
            asChild
          >
            <Link href="/dashboard/events">
              Back to Events
            </Link>
          </Button>
          
          <Button asChild variant="outline">
            <Link href={`/dashboard/events/${event.id}/edit`}>
              <PencilIcon className="h-4 w-4 mr-2" />
              Edit Event
            </Link>
          </Button>
          
          <Button asChild>
            <Link href={`/dashboard/events/${event.id}/tickets`}>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4 mr-2" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
              Manage Tickets
            </Link>
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardDescription>Event Details</CardDescription>
            <CardHeader className="pb-3">
              <CardTitle>Event Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Banner Image */}
              <div className="relative w-full h-64 mb-6 rounded-md overflow-hidden">
                <Image
                  src={imageUrl}
                  alt={event.title}
                  fill
                  className="object-cover"
                />
              </div>
              
              {/* Status Badge */}
              <div className="flex items-center">
                <span className="text-muted-foreground mr-2">Status:</span>
                <Badge className={
                  event.status === 'published' ? 'bg-emerald-500' : 
                  event.status === 'draft' ? 'bg-yellow-500' : 
                  event.status === 'cancelled' ? 'bg-red-500' : 
                  'bg-gray-500'
                }>
                  {event.status ? event.status.charAt(0).toUpperCase() + event.status.slice(1) : 'Unknown'}
                </Badge>
                
                {event.isFeatured && (
                  <Badge className="ml-2 bg-purple-500">Featured</Badge>
                )}
              </div>
              
              {/* Event Time */}
              <div className="flex items-start gap-3">
                <CalendarIcon className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <div className="font-medium">Date & Time</div>
                  <div className="text-muted-foreground">
                    {format(new Date(event.startDate), "MMMM d, yyyy")} at {format(new Date(event.startDate), "h:mm a")} - 
                    {new Date(event.startDate).toDateString() === new Date(event.endDate).toDateString() 
                      ? format(new Date(event.endDate), " h:mm a")
                      : format(new Date(event.endDate), " MMMM d, yyyy 'at' h:mm a")
                    }
                  </div>
                </div>
              </div>
              
              {/* Venue */}
              <div className="flex items-start gap-3">
                <MapPinIcon className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <div className="font-medium">Venue</div>
                  <div className="text-muted-foreground">
                    {event.venueName || "No venue specified"}
                  </div>
                </div>
              </div>
              
              {/* Categories */}
              {event.categories && event.categories.length > 0 && (
                <div className="flex items-start gap-3">
                  <TagIcon className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <div className="font-medium">Categories</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {event.categories.map(category => (
                        <Badge key={category.id} variant="outline">
                          {category.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Additional Details */}
              {(event.ageRestriction || event.maxTickets) && (
                <div className="pt-4 border-t">
                  <h3 className="font-medium mb-2">Additional Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {event.ageRestriction && (
                      <div>
                        <span className="text-muted-foreground">Age Restriction:</span>{" "}
                        <span className="font-medium">{event.ageRestriction}+</span>
                      </div>
                    )}
                    {event.maxTickets && (
                      <div>
                        <span className="text-muted-foreground">Maximum Tickets per Person:</span>{" "}
                        <span className="font-medium">{event.maxTickets}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Description */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                {event.description || "No description provided."}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Meta Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Event Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Event ID */}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Event ID:</span>
                <span className="font-mono">{event.id}</span>
              </div>
              
              {/* Creation Date */}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created:</span>
                <span>{format(new Date(event.createdAt), "MMM d, yyyy")}</span>
              </div>
              
              {/* Last Updated */}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Updated:</span>
                <span>{format(new Date(event.updatedAt), "MMM d, yyyy")}</span>
              </div>
              
              {/* Public/Private */}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Visibility:</span>
                <span>{event.isPublic ? "Public" : "Private"}</span>
              </div>
            </CardContent>
          </Card>
          
          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button asChild className="w-full">
                <Link href={`/dashboard/events/${event.id}/tickets`}>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-4 w-4 mr-2" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor" 
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                  Manage Tickets
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="w-full">
                <Link href={`/events/${event.id}`} target="_blank">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-4 w-4 mr-2" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor" 
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View Public Page
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="w-full">
                <Link href={`/dashboard/events/${event.id}/edit`}>
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Edit Event
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 