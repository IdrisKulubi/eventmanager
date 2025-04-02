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
  searchParams: Promise<{
    page?: string;
    limit?: string;
    search?: string;
    status?: string;
    category?: string;
    sort?: string;
  }>;
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const session = await auth();
  const params = await searchParams;
  
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
    redirect('/auth/login?callbackUrl=/dashboard/events');
  }
  
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 10;
  const search = params.search || '';
  const status = params.status || '';
  const categoryId = params.category ? Number(params.category) : undefined;
  const sort = params.sort || 'startDate-desc';
  
  const [sortField, sortOrder] = sort.split('-');
  
  const { events, pagination } = await getEvents({
    page,
    limit,
    search,
    status: status as 'draft' | 'published' | 'cancelled' | 'completed' | undefined,
    categoryId,
    sortBy: sortField as string,
    sortOrder: sortOrder as 'asc' | 'desc',
  });
  
  const categories = await getAllCategories();
  const totalPages = Math.ceil(pagination.totalEvents / limit);
  
  return (
    <div className="container py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Events</h1>
        <div className="flex space-x-4">
          <Button variant="outline" asChild>
            <Link href="/dashboard/tickets">
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
              Ticket Management
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/events/create">
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Event
            </Link>
          </Button>
        </div>
      </div>
      
      <Suspense fallback={<div>Loading stats...</div>}>
        <EventsStatCards />
      </Suspense>
      
      <div className="mt-6">
        <EventFilters categories={categories} />
        
        <div className="mt-4 rounded-md border">
          <DataTable 
          /* eslint-disable @typescript-eslint/no-explicit-any */

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
                    href={page > 1 ? `/dashboard/events?page=${page - 1}&limit=${limit}&search=${search}&status=${status}&category=${params.category || ''}&sort=${sort}` : '#'} 
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
                    href={page < totalPages ? `/dashboard/events?page=${page + 1}&limit=${limit}&search=${search}&status=${status}&category=${params.category || ''}&sort=${sort}` : '#'} 
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