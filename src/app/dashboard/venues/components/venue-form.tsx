"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { toast } from 'sonner';
import { createVenue, updateVenue } from '@/lib/actions/venue.actions';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

// Define a complete schema that matches the database requirements
const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  address: z.string().min(5, {
    message: 'Address must be at least 5 characters.',
  }),
  city: z.string().default(''),
  capacity: z.coerce.number().min(1, {
    message: 'Capacity must be at least 1.',
  }),
  description: z.string().optional(),
});

type VenueFormValues = z.infer<typeof formSchema>;

interface VenueFormProps {
  initialData?: {
    id: number;
    name: string;
    address: string;
    capacity: number;
    description?: string;
    city?: string;
  };
  onSuccess?: () => void;
}

export function VenueForm({ initialData, onSuccess }: VenueFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formKey, setFormKey] = useState(`venue-${initialData?.id || 'new'}-${Date.now()}`);

  // Create the form
  const form = useForm<VenueFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      address: initialData?.address || '',
      city: initialData?.city || '',
      capacity: initialData?.capacity || 1,
      description: initialData?.description || '',
    },
  });

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        address: initialData.address,
        city: initialData.city || '',
        capacity: initialData.capacity,
        description: initialData.description || '',
      });
      setFormKey(`venue-${initialData.id}-${Date.now()}`);
    }
  }, [form, initialData]);

  // Check if any field has been modified
  const isDirty = form.formState.isDirty;

  async function onSubmit(data: VenueFormValues) {
    try {
      setIsSubmitting(true);
      
      if (initialData) {
        await updateVenue(initialData.id, {
          ...data,
          // Include any fields required by VenueFormData but not in our form
          coordinates: undefined,
          imageUrl: undefined,
          contactInfo: undefined,
        });
        toast.success('Venue updated successfully');
      } else {
        await createVenue({
          ...data,
          // Include any fields required by VenueFormData but not in our form
          coordinates: undefined,
          imageUrl: undefined,
          contactInfo: undefined,
        });
        toast.success('Venue created successfully');
      }
      
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/dashboard/venues');
        router.refresh();
      }
    } catch (error) {
      toast.error('Something went wrong');
      console.error('Error submitting venue form:', error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form} key={formKey}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter venue name" {...field} />
              </FormControl>
              <FormDescription>
                The name of the venue as it will appear in the system.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input placeholder="Enter venue address" {...field} />
              </FormControl>
              <FormDescription>
                The physical address of the venue.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>City</FormLabel>
              <FormControl>
                <Input placeholder="Enter city" {...field} />
              </FormControl>
              <FormDescription>
                The city where the venue is located.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="capacity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Capacity</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="Enter venue capacity" 
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  value={field.value}
                />
              </FormControl>
              <FormDescription>
                The maximum number of people the venue can accommodate.
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
                  placeholder="Enter venue description" 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Additional details about the venue (optional).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit"
          disabled={isSubmitting || (initialData && !isDirty)}
          className="w-full sm:w-auto"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {initialData ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            initialData ? 'Update Venue' : 'Create Venue'
          )}
        </Button>
      </form>
    </Form>
  );
} 