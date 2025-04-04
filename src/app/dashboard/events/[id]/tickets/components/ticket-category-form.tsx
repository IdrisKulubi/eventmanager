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
import { Switch } from "@/components/ui/switch";
import { CalendarIcon } from "@heroicons/react/24/outline";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { z } from "zod";
import { createTicketCategory, updateTicketCategory } from "@/lib/actions/ticket.actions";

const TicketCategorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  price: z.coerce.number().positive("Price must be greater than 0"),
  quantity: z.coerce.number().int().positive("Quantity must be a positive integer"),
  availableFrom: z.date(),
  availableTo: z.date(),
  isEarlyBird: z.boolean().default(false),
  isVIP: z.boolean().default(false),
  maxPerOrder: z.coerce.number().int().positive("Maximum per order must be a positive integer").optional(),
}).refine(data => {
  return data.availableTo > data.availableFrom;
}, {
  message: "End date must be after start date",
  path: ["availableTo"],
});

type TicketCategoryFormData = z.infer<typeof TicketCategorySchema>;

interface TicketCategoryFormProps {
  eventId: number;
  initialData?: {
    id: number;
    name: string;
    description: string | null;
    price: number ;
    quantity: number;
    availableFrom: Date | string;
    availableTo: Date | string;
    isEarlyBird: boolean;
    isVIP: boolean;
    maxPerOrder: number | null;
  };
}

export function TicketCategoryForm({ eventId, initialData }: TicketCategoryFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultValues = initialData
    ? {
        ...initialData,
        description: initialData.description || "",
        price: Number(initialData.price),
        quantity: Number(initialData.quantity),
        availableFrom: new Date(initialData.availableFrom),
        availableTo: new Date(initialData.availableTo),
        isEarlyBird: initialData.isEarlyBird || false,
        isVIP: initialData.isVIP || false,
        maxPerOrder: initialData.maxPerOrder ? Number(initialData.maxPerOrder) : undefined,
      }
    : {
        name: "",
        description: "",
        price: 0,
        quantity: 1,
        availableFrom: new Date(),
        availableTo: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        isEarlyBird: false,
        isVIP: false,
        maxPerOrder: undefined,
      };

  const form = useForm<TicketCategoryFormData>({
    resolver: zodResolver(TicketCategorySchema),
    defaultValues,
  });

  const isDirty = form.formState.isDirty;

  async function onSubmit(data: TicketCategoryFormData) {
    try {
      console.log("Form submission data:", JSON.stringify(data, null, 2));
      setIsSubmitting(true);

      if (initialData) {
        const result = await updateTicketCategory({
          id: initialData.id,
          ...data,
        });

        if (result && result.success) {
          toast.success("Ticket category updated successfully");
          setTimeout(() => {
            router.push(`/dashboard/events/${eventId}/tickets`);
            router.refresh();
          }, 500);
        } else {
          throw new Error("Failed to update ticket category");
        }
      } else {
        const result = await createTicketCategory({
          ...data,
          eventId,
        });

        if (result && result.success) {
          toast.success("Ticket category created successfully");
          setTimeout(() => {
            router.push(`/dashboard/events/${eventId}/tickets`);
            router.refresh();
          }, 500);
        } else {
          throw new Error("Failed to create ticket category");
        }
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Unknown error occurred";
      toast.error(`Failed to save ticket category: ${errorMessage}`);
      console.error("Form submission error:", error);
    } finally {
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ticket Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter ticket name" {...field} />
                  </FormControl>
                  <FormDescription>
                    A descriptive name for this ticket category (e.g., &quot;General Admission&quot;, &quot;VIP&quot;)
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
                      placeholder="Describe the benefits of this ticket type"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide details about what&apos;s included with this ticket type
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price (KES)</FormLabel>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <span className="text-gray-500">Ksh</span>
                    </div>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="29.99"
                      className="pl-12"
                      {...field}
                    />
                  </div>
                  <FormDescription>
                    The price of this ticket in KES
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity Available</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="1" 
                      step="1" 
                      placeholder="100" 
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    Total number of tickets available for sale
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-8">
            <FormField
              control={form.control}
              name="availableFrom"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Available From</FormLabel>
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
                    When tickets will be available for purchase
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="availableTo"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Available Until</FormLabel>
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
                    When ticket sales will end
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isEarlyBird"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Early Bird Ticket</FormLabel>
                    <FormDescription>
                      Mark this as an early bird ticket with special pricing
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
              name="isVIP"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">VIP Ticket</FormLabel>
                    <FormDescription>
                      Mark this as a VIP ticket with premium benefits
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
              name="maxPerOrder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum Per Order</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="1" 
                      step="1" 
                      placeholder="10" 
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormDescription>
                    Maximum number of tickets a customer can purchase in a single order
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
            onClick={() => router.push(`/dashboard/events/${eventId}/tickets`)}
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
                ? "Update Ticket Category" 
                : "Create Ticket Category"
            }
          </Button>
        </div>
      </form>
    </Form>
  );
} 