'use client';

import { useState } from 'react';
import { deleteTicketCategory } from '@/lib/actions/ticket.actions';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { TrashIcon } from '@heroicons/react/24/outline';

interface DeleteTicketCategoryButtonProps {
  categoryId: number;
  eventId: string | number;
}

export default function DeleteTicketCategoryButton({ categoryId, eventId }: DeleteTicketCategoryButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    
    try {
      const result = await deleteTicketCategory(categoryId);
      
      if (result.success) {
        toast.success('Ticket category deleted successfully');
        setIsOpen(false);
      } else {
        toast.error(result.error || 'Failed to delete ticket category');
      }
    } catch (error) {
      toast.error('An error occurred while deleting the ticket category');
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1 bg-red-50 border-red-200 text-red-600 hover:bg-red-100 hover:text-red-700 focus:ring-red-500"
        >
          <TrashIcon className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete this ticket category. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isDeleting}
            className="bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 