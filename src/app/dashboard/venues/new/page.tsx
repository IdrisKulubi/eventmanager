import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { VenueForm } from '../components/venue-form';

export default async function NewVenuePage() {
  // Check authorization
  const session = await auth();
  
  if (!session || !(session.user.role === 'admin' || session.user.role === 'manager')) {
    redirect('/sign-in');
  }

  return (
    <div className="container py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add New Venue</h1>
        <p className="text-muted-foreground mt-2">
          Create a new venue for your events
        </p>
      </div>

      <div className="max-w-2xl">
        <VenueForm />
      </div>
    </div>
  );
} 