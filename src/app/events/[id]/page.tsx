import { getEventById } from "@/lib/actions/event.actions";
import { notFound } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
import { CalendarIcon, MapPinIcon, TicketIcon, ClockIcon, TagIcon } from "@heroicons/react/24/outline";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const paramsPromise = params;
  const eventId = parseInt((await paramsPromise).id);
  const event = await getEventById(eventId);
  
  if (!event) {
    return {
      title: "Event Not Found",
      description: "The requested event could not be found"
    };
  }
  
  return {
    title: event.title,
    description: event.description || "Event details"
  };
}

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const paramsPromise = params;
  const eventId = parseInt((await paramsPromise).id);
  const event = await getEventById(eventId);
  
  if (!event) {
    notFound();
  }
  
  // Format dates for display
  const formattedStartDate = format(new Date(event.startDate), "EEEE, MMMM d, yyyy");
  const formattedStartTime = format(new Date(event.startDate), "h:mm a");
  const formattedEndTime = format(new Date(event.endDate), "h:mm a");
  
  // Default image if none provided
  const imageUrl = event.bannerImage || "/placeholder-event.jpg";
  
  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Event Image */}
        <div className="lg:col-span-2">
          <div className="relative w-full h-[400px] rounded-lg overflow-hidden">
            <Image
              src={imageUrl}
              alt={event.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
        
        {/* Event Info */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="space-y-4">
            {event.status && (
              <Badge 
                className={`${
                  event.status === 'published' ? 'bg-green-100 text-green-800' : 
                  event.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}
              >
                {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
              </Badge>
            )}
            
            <h1 className="text-3xl font-bold">{event.title}</h1>
            
            <div className="flex items-center text-gray-600">
              <CalendarIcon className="h-5 w-5 mr-2" />
              <span>{formattedStartDate}</span>
            </div>
            
            <div className="flex items-center text-gray-600">
              <ClockIcon className="h-5 w-5 mr-2" />
              <span>{formattedStartTime} - {formattedEndTime}</span>
            </div>
            
            <div className="flex items-center text-gray-600">
              <MapPinIcon className="h-5 w-5 mr-2" />
              <span>{event.venueName || "Venue information not available"}</span>
            </div>
            
            {event.categories && event.categories.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <TagIcon className="h-5 w-5 text-gray-600" />
                {event.categories.map((category) => (
                  <Badge key={category.id} variant="outline">
                    {category.name}
                  </Badge>
                ))}
              </div>
            )}
            
            <Button className="w-full mt-4" size="lg">
              <TicketIcon className="h-5 w-5 mr-2" />
              Buy Tickets
            </Button>
          </div>
        </div>
      </div>
      
      {/* Event Description */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">About This Event</h2>
        <Separator className="mb-6" />
        <div className="prose max-w-none">
          {event.description ? (
            <p className="whitespace-pre-line">{event.description}</p>
          ) : (
            <p className="text-gray-500 italic">No description provided</p>
          )}
        </div>
      </div>
      
      {/* Additional Info */}
      {(event.ageRestriction || event.maxTickets) && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4">Additional Information</h2>
          <Separator className="mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {event.ageRestriction && (
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-semibold text-lg mb-2">Age Restriction</h3>
                <p>{event.ageRestriction}+</p>
              </div>
            )}
            {event.maxTickets && (
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-semibold text-lg mb-2">Maximum Tickets</h3>
                <p>{event.maxTickets} per person</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 