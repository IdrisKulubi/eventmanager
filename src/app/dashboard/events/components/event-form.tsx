"use client";

import { useState, useEffect } from "react";
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
import { createEvent, updateEvent} from "@/lib/actions/event.actions";
import { venues as venuesSchema } from "@/db/schema";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE,  EVENT_STATUSES } from "@/lib/constants";
import Image from "next/image";
import { UploadButton } from "@/lib/uploadthing";
import { Switch } from "@/components/ui/switch";

type FormData = {
  title: string;
  description?: string;
  venueId: number;
  startDate: Date;
  endDate: Date;
  categoryIds?: number[];
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  bannerImage?: string;
  isPublic: boolean;
  isFeatured: boolean;
  ageRestriction?: number;
  maxTickets?: number;
};

type Venue = typeof venuesSchema.$inferSelect;

interface EventFormProps {
  venues: Venue[];
  categories: { id: number; name: string }[];
  initialData?: {
    id: number;
    title: string;
    description: string | null;
    venueId: number | null;
    startDate: string | Date;
    endDate: string | Date;
    status: 'draft' | 'published' | 'cancelled' | 'completed' | null;
    bannerImage?: string;
    categories: { id: number }[];
    isFeatured?: boolean;
    ageRestriction?: number;
    maxTickets?: number;
  };
}

interface UploadResponse {
  url: string;
  key: string;
  name: string;
  size: number;
}

export function EventForm({ venues, categories, initialData }: EventFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUploadComplete, setImageUploadComplete] = useState(false);
  
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
        isFeatured: initialData.isFeatured || false,
        ageRestriction: initialData.ageRestriction || undefined,
        maxTickets: initialData.maxTickets || undefined,
      }
    : {
        title: "",
        description: "",
        venueId: venues[0]?.id || 0,
        startDate: new Date(),
        endDate: new Date(new Date().setHours(new Date().getHours() + 2)),
        categoryIds: [],
        status: "draft" as const,
        bannerImage: "",
        isPublic: true,
        isFeatured: false,
        ageRestriction: undefined,
        maxTickets: undefined,
      };
  
  const form = useForm<FormData>({
    resolver: zodResolver(EventFormSchema),
    defaultValues,
  });
  
  const bannerImageValue = form.watch("bannerImage");
  
  useEffect(() => {
    console.log("Banner image changed:", bannerImageValue);
    if (bannerImageValue) {
      setImageUploadComplete(true);
    }
  }, [bannerImageValue]);
  
  const isDirty = form.formState.isDirty;

  const handleImageUpload = (res: UploadResponse[]) => {
    console.log("Image upload complete, received URL:", res[0].url);
    form.setValue("bannerImage", res[0].url);
    setImageUploadComplete(true);
    toast.success("Image uploaded successfully");
  };
  
  async function onSubmit(data: FormData) {
    try {
      console.log("Form submission data:", JSON.stringify(data, null, 2));
      console.log("Banner image URL from form:", data.bannerImage);
      setIsSubmitting(true);
      
      if (initialData) {
        const updateData = {
          ...data,
          venueId: Number(data.venueId),
          startDate: new Date(data.startDate),
          endDate: new Date(data.endDate),
          categoryIds: data.categoryIds || [],
          bannerImage: data.bannerImage || undefined // Use undefined instead of null
        };
        
        console.log("Update data being sent:", JSON.stringify(updateData, null, 2));
        
        const result = await updateEvent(initialData.id, updateData);
        
        if (result && result.success) {
          toast.success("Event updated successfully");
          setTimeout(() => {
            router.push("/dashboard/events");
            router.refresh();
          }, 500);
        } else {
          throw new Error("Failed to update event");
        }
      } else {
        const createData = {
          ...data,
          venueId: Number(data.venueId),
          startDate: new Date(data.startDate),
          endDate: new Date(data.endDate),
          categoryIds: data.categoryIds || [],
          bannerImage: data.bannerImage || undefined 
        };
        
        console.log("Create data being sent:", JSON.stringify(createData, null, 2));
        
        const result = await createEvent(createData);
        
        if (result && result.success) {
          toast.success("Event created successfully");
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
                      {venues.map((venue) => (
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
                    Choose a venue for your event
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bannerImage"
              render={() => (
                <FormItem>
                  <FormLabel>Event Banner</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      {bannerImageValue ? (
                        <div className="relative w-full h-48">
                          <Image
                            src={bannerImageValue}
                            alt="Event banner"
                            fill
                            className="object-cover rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => {
                              form.setValue("bannerImage", undefined);
                              setImageUploadComplete(false);
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed rounded-lg p-4 text-center">
                          <UploadButton
                            endpoint="imageUploader"
                            onClientUploadComplete={handleImageUpload}
                            onUploadError={(error: Error) => {
                              toast.error(`Upload failed: ${error.message}`);
                            }}
                            className="ut-button:bg-primary ut-button:text-white ut-button:hover:bg-primary/90"
                          />
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <div className="space-y-2">
                    <FormDescription>
                      Upload a banner image for your event (max {MAX_IMAGE_SIZE / (1024 * 1024)}MB).
                      Supported formats: {ALLOWED_IMAGE_TYPES.join(', ').replace(/image\//g, '')}.
                    </FormDescription>
                    {imageUploadComplete && (
                      <p className="text-sm text-green-600">
                        ✓ Image uploaded successfully
                      </p>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isFeatured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Featured Event</FormLabel>
                    <FormDescription>
                      Make this event appear in featured sections
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ageRestriction"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Age Restriction</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      placeholder="Enter minimum age (e.g., 18)"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormDescription>
                    Minimum age required to attend this event
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="maxTickets"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum Tickets per Person</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      placeholder="Enter maximum tickets per person"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormDescription>
                    Maximum number of tickets one person can purchase
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
                          {categories.map((category) => {
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
                : bannerImageValue
                  ? "Create Event"
                  : "Create Event (No Image)"
            }
          </Button>
        </div>
      </form>
    </Form>
  );
} 