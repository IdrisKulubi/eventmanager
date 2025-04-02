import { auth } from "@/auth";
import { notFound } from "next/navigation";
import { getEventById } from "@/lib/actions/event.actions";
import { EventForm } from "../../components/event-form";
import { getEventCategories } from "@/lib/actions/event.actions";
import { getVenues } from "@/lib/actions/venue.actions";

export const metadata = {
  title: "Edit Event",
  description: "Edit an existing event",
};

// Force dynamic to prevent caching issues
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const session = await auth();
  if (!session?.user) {
    return notFound();
  }

  const eventId = parseInt(resolvedParams.id);
  if (isNaN(eventId)) {
    return notFound();
  }

  const [eventData, categories, venuesData] = await Promise.all([
    getEventById(eventId),
    getEventCategories(),
    getVenues({ page: 1, limit: 100 }),
  ]);

  const venues = venuesData.venues;
  
  if (!eventData) {
    return notFound();
  }

  // Transform the event data to match the expected format
  const event = {
    id: eventData.id,
    title: eventData.title,
    description: eventData.description,
    venueId: eventData.venueId,
    startDate: eventData.startDate,
    endDate: eventData.endDate,
    status: eventData.status || 'draft',
    bannerImage: eventData.bannerImage === null ? undefined : eventData.bannerImage,
    categories: eventData.categories || [],
    isFeatured: eventData.isFeatured === null ? undefined : eventData.isFeatured,
    ageRestriction: eventData.ageRestriction === null ? undefined : eventData.ageRestriction,
    maxTickets: eventData.maxTickets === null ? undefined : eventData.maxTickets
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Edit Event</h1>
      <EventForm venues={venues} categories={categories} initialData={event} />
    </div>
  );
}