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
import { deleteTicketCategory } from "@/lib/actions/ticket.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

export type TicketCategory = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  quantity: number;
  availableFrom: Date;
  availableTo: Date;
  isEarlyBird: boolean;
  isVIP: boolean;
  maxPerOrder: number | null;
};

function TicketCategoryActions({ category, eventId }: { category: TicketCategory; eventId: number }) {
  const router = useRouter();

  const handleDelete = async () => {
    try {
      await deleteTicketCategory(category.id);
      toast.success("Ticket category deleted successfully");
      router.refresh();
    } catch (error) {
      console.error("Error deleting ticket category:", error);
      toast.error("Failed to delete ticket category");
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
          <Link href={`/dashboard/events/${eventId}/tickets/${category.id}/edit`}>
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
}

export const columns: ColumnDef<TicketCategory>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("price"));
      return new Intl.NumberFormat("en-KE", {
        style: "currency",
        currency: "KES",
      }).format(price);
    },
  },
  {
    accessorKey: "quantity",
    header: "Quantity",
  },
  {
    accessorKey: "isVIP",
    header: "Type",
    cell: ({ row }) => {
      const isVIP = row.getValue("isVIP") as boolean;
      const isEarlyBird = row.original.isEarlyBird;
      
      return (
        <div className="flex gap-2">
          {isVIP && (
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              VIP
            </Badge>
          )}
          {isEarlyBird && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Early Bird
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "availableFrom",
    header: "Available From",
    cell: ({ row }) => {
      const date = new Date(row.getValue("availableFrom"));
      return date.toLocaleDateString();
    },
  },
  {
    accessorKey: "availableTo",
    header: "Available To",
    cell: ({ row }) => {
      const date = new Date(row.getValue("availableTo"));
      return date.toLocaleDateString();
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const category = row.original;
      return <TicketCategoryActions category={category} eventId={category.id} />;
    },
  },
]; 