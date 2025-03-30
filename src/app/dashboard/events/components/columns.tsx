"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EllipsisVerticalIcon, PencilIcon, TrashIcon, EyeIcon } from "@heroicons/react/24/outline";
import { publishEvent } from "@/lib/actions/event.actions";
import { toast } from "sonner";

export type Event = {
  id: number;
  title: string;
  description: string;
  startDate: Date | string;
  endDate: Date | string;
  venueId: number;
  venueName: string;
  status: string;
  categories: { id: number; name: string }[];
  createdAt: Date | string;
  updatedAt: Date | string;
};

export const columns: ColumnDef<Event>[] = [
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => {
      const title: string = row.getValue("title");
      return (
        <div className="flex items-center">
          <span className="max-w-[300px] truncate font-medium">{title}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "venueName",
    header: "Venue",
    cell: ({ row }) => {
      const venueName: string = row.getValue("venueName");
      return <div className="truncate max-w-[150px]">{venueName}</div>;
    },
  },
  {
    accessorKey: "startDate",
    header: "Date",
    cell: ({ row }) => {
      const startDate: string = row.getValue("startDate");
      const endDate: string = row.original.endDate as string;
      
      return (
        <div className="text-sm">
          <div>{format(new Date(startDate), "MMM d, yyyy")}</div>
          <div className="text-muted-foreground">
            {format(new Date(startDate), "h:mm a")} - {format(new Date(endDate), "h:mm a")}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status: string = row.getValue("status");
      
      let color: "default" | "primary" | "secondary" | "success" | "warning" | "destructive";
      
      switch (status) {
        case "published":
          color = "success";
          break;
        case "draft":
          color = "secondary";
          break;
        case "cancelled":
          color = "destructive";
          break;
        default:
          color = "default";
      }
      
      return <Badge variant={color}>{status}</Badge>;
    },
  },
  {
    accessorKey: "categories",
    header: "Categories",
    cell: ({ row }) => {
      const categories = row.original.categories || [];
      return (
        <div className="flex flex-wrap gap-1">
          {categories.map((category) => (
            <Badge key={category.id} variant="outline" className="text-xs">
              {category.name}
            </Badge>
          ))}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const event = row.original;
      
      const handlePublish = async () => {
        try {
          await publishEvent(event.id);
          toast.success("Event published successfully");
        } catch (error) {
          toast.error("Failed to publish event");
          console.error(error);
        }
      };
      
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <EllipsisVerticalIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/events/${event.id}`} className="flex items-center cursor-pointer">
                <EyeIcon className="mr-2 h-4 w-4" />
                View
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/events/${event.id}/edit`} className="flex items-center cursor-pointer">
                <PencilIcon className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </DropdownMenuItem>
            {event.status === "draft" && (
              <DropdownMenuItem onClick={handlePublish} className="flex items-center">
                <EyeIcon className="mr-2 h-4 w-4" />
                Publish
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive focus:text-destructive flex items-center cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                if (window.confirm("Are you sure you want to delete this event?")) {
                  // Delete action happens through the DataTable component
                }
              }}
            >
              <TrashIcon className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
]; 