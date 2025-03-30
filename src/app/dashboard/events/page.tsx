import { Suspense } from 'react';
import Link from 'next/link';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getEvents } from '@/lib/actions/event.actions';
import { getAllCategories } from '@/lib/actions/category.actions';
import { PlusIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';
import { DataTable } from './components/data-table';
import { columns } from './components/columns';
import EventFilters from './components/event-filters';
import EventsStatCards from './components/events-stat-cards';
import { ColumnDef } from '@tanstack/react-table';

// Define the Event type based on what's returned from the getEvents function

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface EventsPageProps {
  searchParams: {
    page?: string;
    limit?: string;
    search?: string;
    status?: string;
    category?: string;
    sort?: string;
  };
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const session = await auth();
  
  // Debug logs for session
  console.log("Session:", JSON.stringify({
    isAuthenticated: !!session,
    user: session?.user ? {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      role: session.user.role
    } : null
  }, null, 2));
  
  // Check if user is authenticated and has required role
  // More detailed log about authorization check
  const user = session?.user;
  console.log("Authorization check:", {
    hasSession: !!session,
    userRole: user?.role,
    isAdmin: user?.role === 'admin',
    isManager: user?.role === 'manager',
    hasRequiredRole: user?.role === 'admin' || user?.role === 'manager'
  });

  if (!session || !(session.user.role === 'admin' || session.user.role === 'manager')) {
    console.log("Redirecting to auth/login due to unauthorized access");
    redirect('/sign-in');
  }
  
  const page = Number(searchParams.page) || 1;
  const limit = Number(searchParams.limit) || 10;
  const search = searchParams.search || '';
  const status = searchParams.status || '';
  const categoryId = searchParams.category ? Number(searchParams.category) : undefined;
  const sort = searchParams.sort || 'startDate-desc';
  
  const [sortField, sortOrder] = sort.split('-');
  
  const { events, count } = await getEvents({
    page,
    limit,
    search,
    status: status as 'draft' | 'published' | 'cancelled' | 'completed' | undefined,
    categoryId,
    sortBy: sortField as string,
    sortOrder: sortOrder as 'asc' | 'desc',
  });
  
  const categories = await getAllCategories();
  const totalPages = Math.ceil(count / limit);
  
  return (
    <div className="container py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Events</h1>
        <Link href="/dashboard/events/create">
          <Button>
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        </Link>
      </div>
      
      <Suspense fallback={<div>Loading stats...</div>}>
        <EventsStatCards />
      </Suspense>
      
      <div className="mt-6">
        <EventFilters categories={categories} />
        
        <div className="mt-4 rounded-md border">
          <DataTable 
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            columns={columns as ColumnDef<Record<string, any>, unknown>[]} 
            data={events} 
          />
        </div>
        
        {totalPages > 1 && (
          <div className="mt-4 flex justify-end">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    href={page > 1 ? `/dashboard/events?page=${page - 1}&limit=${limit}&search=${search}&status=${status}&category=${searchParams.category || ''}&sort=${sort}` : '#'} 
                    aria-disabled={page <= 1}
                    className={page <= 1 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
                <PaginationItem className="flex items-center px-4">
                  <span>
                    Page {page} of {totalPages}
                  </span>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext 
                    href={page < totalPages ? `/dashboard/events?page=${page + 1}&limit=${limit}&search=${search}&status=${status}&category=${searchParams.category || ''}&sort=${sort}` : '#'} 
                    aria-disabled={page >= totalPages}
                    className={page >= totalPages ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
} 