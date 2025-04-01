"use client";

import { useState } from 'react';
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
import { formSchema } from '@/lib/validators';
import { Loader2 } from 'lucide-react';

type VenueFormValues = z.infer<typeof formSchema>;

interface VenueFormProps {
  initialData?: {
    id: number;
    name: string;
    address: string;
    capacity: number;
    description?: string;
  };
  onSuccess?: () => void;
}

export function VenueForm({ initialData, onSuccess }: VenueFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<VenueFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: '',
      address: '',
      capacity: 1,
      description: '',
    },
  });

  // Check if the form has been modified
  const isDirty = form.formState.isDirty;

  async function onSubmit(data: VenueFormValues) {
    try {
      setIsSubmitting(true);
      
      if (initialData) {
        await updateVenue(initialData.id, data);
        toast.success('Venue updated successfully');
      } else {
        await createVenue(data);
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
    <Form {...form}>
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