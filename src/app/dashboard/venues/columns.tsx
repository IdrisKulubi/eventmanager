"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { deleteVenue } from "@/lib/actions/venue.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export type Venue = {
  id: number;
  name: string;
  address: string;
  capacity: number;
  description: string | null;
};

export const columns: ColumnDef<Venue>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "address",
    header: "Address",
  },
  {
    accessorKey: "capacity",
    header: "Capacity",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const venue = row.original;
      const router = useRouter();

      const handleDelete = async () => {
        try {
          await deleteVenue(venue.id);
          toast.success("Venue deleted successfully");
          router.refresh();
        } catch (error) {
          toast.error("Failed to delete venue");
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
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/venues/${venue.id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete}>
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
]; 