'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createTicketCategory, updateTicketCategory, getTicketCategoryById } from '@/lib/actions/ticket.actions';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { CalendarIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

// Form validation schema
const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  description: z.string().optional(),
  price: z.coerce.number().positive({
    message: 'Price must be greater than 0.',
  }),
  quantity: z.coerce.number().int().positive({
    message: 'Quantity must be a positive integer.',
  }),
  availableFrom: z.date({
    required_error: 'Please select a start date.',
  }),
  availableTo: z.date({
    required_error: 'Please select an end date.',
  }),
  isEarlyBird: z.boolean().default(false),
  isVIP: z.boolean().default(false),
  maxPerOrder: z.coerce.number().int().positive({
    message: 'Maximum per order must be a positive integer.',
  }).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface TicketCategoryFormProps {
  eventId: number | string;
}

export default function TicketCategoryForm({ eventId }: TicketCategoryFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editCategoryId = searchParams.get('edit');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      quantity: 0,
      availableFrom: new Date(),
      availableTo: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      isEarlyBird: false,
      isVIP: false,
      maxPerOrder: undefined,
    },
  });

  // Fetch ticket category if in edit mode
  useEffect(() => {
    const fetchCategory = async () => {
      if (!editCategoryId) return;
      
      setIsLoading(true);
      setIsEditing(true);
      
      try {
        // Parse the edit id to a number
        const categoryId = parseInt(editCategoryId, 10);
        if (isNaN(categoryId)) return;
        
        const category = await getTicketCategoryById(categoryId);
        
        if (category) {
          form.reset({
            name: category.name,
            description: category.description || '',
            price: parseFloat(category.price),
            quantity: category.quantity,
            availableFrom: new Date(category.availableFrom),
            availableTo: new Date(category.availableTo),
            isEarlyBird: category.isEarlyBird,
            isVIP: category.isVIP,
            maxPerOrder: category.maxPerOrder || undefined,
          });
        }
      } catch (error) {
        console.error('Error fetching ticket category:', error);
        toast.error('Failed to load ticket category');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCategory();
  }, [editCategoryId, form]);

  // Form submission
  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    
    try {
      const result = isEditing
        ? await updateTicketCategory(parseInt(editCategoryId!, 10), { ...values, eventId: Number(eventId) })
        : await createTicketCategory({ ...values, eventId: Number(eventId) });
      
      if (result.success) {
        toast.success(isEditing ? 'Ticket category updated' : 'Ticket category created');
        form.reset();
        router.push(`/dashboard/events/${eventId}/tickets`);
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to save ticket category');
      }
    } catch (error) {
      console.error('Error saving ticket category:', error);
      toast.error('An error occurred while saving the ticket category');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="General Admission" {...field} />
                </FormControl>
                <FormDescription>
                  The name of the ticket category (e.g. General Admission, VIP).
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
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <span className="text-gray-500">$</span>
                    </div>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="29.99"
                      className="pl-7"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormDescription>
                  The price of this ticket type.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Describe what this ticket includes..." 
                    className="resize-none min-h-24"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity</FormLabel>
                <FormControl>
                  <Input type="number" min="1" step="1" {...field} />
                </FormControl>
                <FormDescription>
                  Total number of tickets available for sale.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="maxPerOrder"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max per order</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    step="1"
                    placeholder="10"
                    value={field.value || ''}
                    onChange={(e) => {
                      const value = e.target.value === '' ? undefined : parseInt(e.target.value, 10);
                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <FormDescription>
                  The maximum number of tickets a customer can buy in a single order (optional).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
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
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
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
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  When tickets will be available for purchase.
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
                <FormLabel>Available To</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
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
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  When ticket sales end.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="isVIP"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">VIP Ticket</FormLabel>
                    <FormDescription>
                      Mark as a VIP or premium ticket type.
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
              name="isEarlyBird"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Early Bird</FormLabel>
                    <FormDescription>
                      Special discounted early-access tickets.
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
          </div>
        </div>
        
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/dashboard/events/${eventId}/tickets`)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : isEditing ? 'Update Ticket Category' : 'Create Ticket Category'}
          </Button>
        </div>
      </form>
    </Form>
  );
} 