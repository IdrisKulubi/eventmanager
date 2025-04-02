"use client";

import { useState } from "react";
import { toast } from "sonner";
import { TrashIcon } from "@heroicons/react/24/outline";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteTicketCategory } from "@/lib/actions/ticket.actions";
import { useRouter } from "next/navigation";

interface TicketDeleteButtonProps {
  id: number;
  name: string;
  eventId: number;
}

export function TicketDeleteButton({ id, name }: TicketDeleteButtonProps) {
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      
      const result = await deleteTicketCategory(id);
      
      if (result.success) {
        toast.success("Ticket category deleted successfully");
        router.refresh();
      } else {
        throw new Error( "Failed to delete ticket category");
      }
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Unknown error occurred";
      toast.error(`Failed to delete ticket category: ${errorMessage}`);
    } finally {
      setIsDeleting(false);
      setIsAlertOpen(false);
    }
  };

  return (
    <>
      <button 
        className="flex items-center text-destructive w-full px-2 py-1.5 text-sm"
        onClick={() => setIsAlertOpen(true)}
      >
        <TrashIcon className="mr-2 h-4 w-4" />
        Delete
      </button>
      
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the <span className="font-semibold">{name}</span> ticket category
              and cannot be undone. This may also affect any related ticket data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Ticket Category"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 