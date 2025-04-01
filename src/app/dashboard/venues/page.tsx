import { Suspense } from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getVenues } from '@/lib/actions/venue.actions';
import { columns } from './components/columns';
import { DataTable } from './components/data-table';
import { CreateVenueDialog } from './components/create-venue-dialog';

export const dynamic = 'force-dynamic';

export default async function VenuesPage() {
  // Check authorization
  const session = await auth();
  
  if (!session || !(session.user.role === 'admin' || session.user.role === 'manager')) {
    redirect('/sign-in');
  }
  
  // Get all venues with pagination parameters
  const { venues } = await getVenues({ 
    page: 1, 
    limit: 100, 
    sortBy: 'name', 
    sortOrder: 'asc' 
  });

  return (
    <div className="container py-10 space-y-8">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Venue Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage venues for your events
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <CreateVenueDialog />
        </div>
      </div>
      
      <Suspense fallback={<div>Loading venues...</div>}>
        <DataTable columns={columns} data={venues} />
      </Suspense>
    </div>
  );
} 