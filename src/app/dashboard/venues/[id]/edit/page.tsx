import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getVenueById } from '@/lib/actions/venue.actions';
import { VenueForm } from '../../components/venue-form';

interface EditVenuePageProps {
  params: {
    id: string;
  };
}

export default async function EditVenuePage({ params }: EditVenuePageProps) {
  // Check authorization
  const session = await auth();
  
  if (!session || !(session.user.role === 'admin' || session.user.role === 'manager')) {
    redirect('/sign-in');
  }
  
  // Await params to follow Next.js 15 best practices
  const awaitedParams = await params;
  
  // Get venue data
  const venueData = await getVenueById(parseInt(awaitedParams.id));

  if (!venueData) {
    redirect('/dashboard/venues');
  }

  // Transform venue data to match form expectations
  const venue = {
    id: venueData.id,
    name: venueData.name,
    address: venueData.address,
    capacity: venueData.capacity,
    description: venueData.description === null ? undefined : venueData.description
  };

  return (
    <div className="container py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Venue</h1>
        <p className="text-muted-foreground mt-2">
          Update venue details
        </p>
      </div>

      <div className="max-w-2xl">
        <VenueForm initialData={venue} />
      </div>
    </div>
  );
} 