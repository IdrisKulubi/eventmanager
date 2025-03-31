"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { format } from "date-fns";
import { CalendarIcon, CheckIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";
import { EventFormSchema } from "@/lib/validators";
import { createEvent, updateEvent } from "@/lib/actions/event.actions";
import { venues as venuesSchema } from "@/db/schema";
import { ImageUploadField } from "@/components/ui/image-upload-field";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE, EVENT_CATEGORIES, EVENT_STATUSES, VENUE_TYPES } from "@/lib/constants";

type FormData = {
  title: string;
  description?: string;
  venueId: number;
  startDate: Date;
  endDate: Date;
  categoryIds?: number[];
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  bannerImage?: string;
  imageUrl?: string;
  isPublic: boolean;
  isFeatured: boolean;
  ageRestriction?: number;
  maxTickets?: number;
};

// Define types based on the schema
type Venue = typeof venuesSchema.$inferSelect;

interface EventFormProps {
  venues: Venue[];
  initialData?: {
    id: number;
    title: string;
    description: string | null;
    venueId: number | null;
    startDate: string | Date;
    endDate: string | Date;
    status: 'draft' | 'published' | 'cancelled' | 'completed' | null;
    imageUrl?: string;
    categories: { id: number }[];
  };
}

export function EventForm({ venues, initialData }: EventFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Parse initial data for the form
  const defaultValues = initialData
    ? {
        ...initialData,
        description: initialData.description || "",
        venueId: initialData.venueId || venues[0]?.id || 0,
        status: initialData.status || "draft",
        startDate: new Date(initialData.startDate),
        endDate: new Date(initialData.endDate),
        categoryIds: initialData.categories.map((c) => c.id),
        isPublic: true,
        isFeatured: false,
      }
    : {
        title: "",
        description:"",
        venueId: venues[0]?.id || 0,
        startDate: new Date(),
        endDate: new Date(new Date().setHours(new Date().getHours() + 2)),
        categoryIds: [],
        status: "draft" as const,
        imageUrl: "",
        isPublic: true,
        isFeatured: false,
      };
  
  const form = useForm<FormData>({
    resolver: zodResolver(EventFormSchema),
    defaultValues,
  });
  
  // Track if the form has been modified
  const isDirty = form.formState.isDirty;
  
  async function onSubmit(data: FormData) {
    try {
      setIsSubmitting(true);
      
      if (initialData) {
        // Update existing event with explicit parsing of values
        const result = await updateEvent(initialData.id, {
          ...data,
          venueId: Number(data.venueId),
          startDate: new Date(data.startDate),
          endDate: new Date(data.endDate),
          categoryIds: data.categoryIds || [],
        });
        
        if (result && result.success) {
          toast.success("Event updated successfully");
          // Use setTimeout to ensure the toast appears before navigation
          setTimeout(() => {
            router.push("/dashboard/events");
            router.refresh();
          }, 500);
        } else {
          throw new Error("Failed to update event");
        }
      } else {
        // Create new event
        const result = await createEvent(data);
        
        if (result && result.success) {
          toast.success("Event created successfully");
          // Use setTimeout to ensure the toast appears before navigation
          setTimeout(() => {
            router.push("/dashboard/events");
            router.refresh();
          }, 500);
        } else {
          throw new Error("Failed to create event");
        }
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Unknown error occurred";
      toast.error(`Failed to save event: ${errorMessage}`);
      console.error("Form submission error:", error);
      setIsSubmitting(false);
    }
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="space-y-8">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter event title" {...field} />
                  </FormControl>
                  <FormDescription>
                    A descriptive name for your event.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your event"
                      className="min-h-[150px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide details about your event.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="venueId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Venue</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    defaultValue={field.value.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a venue" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {VENUE_TYPES.map((venue) => (
                        <SelectItem
                          key={venue.id}
                          value={venue.id.toString()}
                        >
                          {venue.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose a venue for your event. Available venue types: {VENUE_TYPES.map(t => t.name).join(', ')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Poster</FormLabel>
                  <FormControl>
                    <ImageUploadField
                      value={field.value}
                      onChange={field.onChange}
                      label="Upload Event Poster"
                      error={form.formState.errors.imageUrl?.message}
                    />
                  </FormControl>
                  <FormDescription>
                    Upload a poster image for your event (max {MAX_IMAGE_SIZE / (1024 * 1024)}MB).
                    Supported formats: {ALLOWED_IMAGE_TYPES.join(', ').replace(/image\//g, '')}.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="space-y-8">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Start Date & Time</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP p")
                          ) : (
                            <span>Pick a date and time</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                      <div className="p-3 border-t">
                        <Input
                          type="time"
                          value={field.value ? format(field.value, "HH:mm") : ""}
                          onChange={(e) => {
                            const [hours, minutes] = e.target.value.split(":");
                            const newDate = new Date(field.value);
                            newDate.setHours(parseInt(hours));
                            newDate.setMinutes(parseInt(minutes));
                            field.onChange(newDate);
                          }}
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    When your event begins.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>End Date & Time</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP p")
                          ) : (
                            <span>Pick a date and time</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                      <div className="p-3 border-t">
                        <Input
                          type="time"
                          value={field.value ? format(field.value, "HH:mm") : ""}
                          onChange={(e) => {
                            const [hours, minutes] = e.target.value.split(":");
                            const newDate = new Date(field.value);
                            newDate.setHours(parseInt(hours));
                            newDate.setMinutes(parseInt(minutes));
                            field.onChange(newDate);
                          }}
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    When your event ends.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="categoryIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categories</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className="w-full justify-between"
                        >
                          {field.value?.length && field.value.length > 0
                            ? `${field.value.length} categories selected`
                            : "Select categories"}
                          <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search categories..." />
                        <CommandEmpty>No category found.</CommandEmpty>
                        <CommandGroup className="max-h-60 overflow-auto">
                          {EVENT_CATEGORIES.map((category) => {
                            const isSelected = field.value?.includes(category.id);
                            return (
                              <CommandItem
                                key={category.id}
                                value={category.name}
                                onSelect={() => {
                                  const newValue = isSelected
                                    ? field.value?.filter((id) => id !== category.id)
                                    : [...(field.value || []), category.id];
                                  field.onChange(newValue);
                                }}
                              >
                                {category.name}
                                <CheckIcon
                                  className={cn(
                                    "ml-auto h-4 w-4",
                                    isSelected ? "opacity-100" : "opacity-0"
                                  )}
                                />
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Categorize your event for better discoverability.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {EVENT_STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Set the current status of your event.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <div className="flex gap-4 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/events")}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting || (initialData && !isDirty)}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            {isSubmitting 
              ? "Saving..." 
              : initialData 
                ? "Update Event" 
                : "Create Event"
            }
          </Button>
        </div>
      </form>
    </Form>
  );
} 