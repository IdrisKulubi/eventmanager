"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@heroicons/react/24/outline";
import { VenueForm } from "./venue-form";

export function CreateVenueDialog() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleSuccess = () => {
    setOpen(false);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Venue
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[calc(100%-32px)] max-w-md sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="sticky top-0 bg-background pt-6 pb-4 z-10">
          <DialogTitle>Create New Venue</DialogTitle>
        </DialogHeader>
        <div className="px-1">
          <VenueForm onSuccess={handleSuccess} />
        </div>
      </DialogContent>
    </Dialog>
  );
} 