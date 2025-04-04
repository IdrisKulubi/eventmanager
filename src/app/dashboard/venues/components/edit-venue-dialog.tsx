"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Pencil } from "lucide-react";
import { getVenueById } from "@/lib/actions/venue.actions";
import { VenueForm } from "./venue-form";
import { Venue } from "./columns";

interface EditVenueDialogProps {
  venueId: number;
}

export function EditVenueDialog({ venueId }: EditVenueDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [venue, setVenue] = useState<Venue | null>(null);
  const router = useRouter();
  
  useEffect(() => {
    if (!open) {
      const timer = setTimeout(() => {
        setVenue(null);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleOpen = async (isOpen: boolean) => {
    setOpen(isOpen);
    
    if (!isOpen) {
      return;
    }
    
    if (isOpen && !venue) {
      try {
        setLoading(true);
        const venueData = await getVenueById(venueId);
        
        if (!venueData) {
          toast.error("Venue not found");
          setOpen(false);
          return;
        }
        
        setVenue(venueData);
      } catch (error) {
        toast.error("Failed to load venue data");
        console.error(error);
        setOpen(false);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSuccess = () => {
    toast.success("Venue updated successfully");
    setOpen(false);
    router.refresh();
  };

  const getFormData = (venue: Venue) => {
    return {
      id: venue.id,
      name: venue.name,
      address: venue.address, 
      city: venue.city,
      capacity: venue.capacity,
      description: venue.description || undefined
    };
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <div className="flex items-center cursor-pointer w-full">
          <Pencil className="h-4 w-4 mr-2" />
          <span>Edit</span>
        </div>
      </DialogTrigger>
      <DialogContent className="w-[calc(100%-32px)] max-w-md sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="sticky top-0 bg-background pt-6 pb-4 z-10">
          <DialogTitle>Edit Venue</DialogTitle>
        </DialogHeader>
        <div className="px-1">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : venue ? (
            <VenueForm 
              initialData={getFormData(venue)} 
              onSuccess={handleSuccess} 
            />
          ) : (
            <div className="py-4 text-center text-muted-foreground">
              Failed to load venue data
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 