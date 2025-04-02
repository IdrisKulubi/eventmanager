'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { deleteVenue } from '@/lib/actions/venue.actions';
import { EditVenueDialog } from './edit-venue-dialog';

export type Venue = {
  id: number;
  name: string;
  address: string;
  city: string;
  capacity: number;
  description: string | null;
  imageUrl: string | null;
  contactInfo: string | null;
  coordinates: { lat: number; lng: number } | null;
  createdAt: Date;
  updatedAt: Date;
  eventCount?: number;
};

export const columns: ColumnDef<Venue>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'address',
    header: 'Address',
  },
  {
    accessorKey: 'capacity',
    header: 'Capacity',
    cell: ({ row }) => {
      return <div>{row.original.capacity.toLocaleString()}</div>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const venue = row.original;

      const handleDelete = async () => {
        try {
          await deleteVenue(venue.id);
          toast.success('Venue deleted successfully');
          window.location.reload();
        } catch (error) {
          toast.error('Failed to delete venue');
          console.error('Error deleting venue:', error);
        }
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => e.preventDefault()}>
              <EditVenueDialog venueId={venue.id} />
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600"
              onClick={handleDelete}
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
]; 