'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { setMonthlySalesTarget } from '@/lib/actions/analytics.actions';

const formSchema = z.object({
  date: z.date({
    required_error: 'Please select a month and year',
  }),
  target: z.string().refine(
    (val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0;
    },
    {
      message: 'Target must be a positive number',
    }
  ),
});

type FormValues = z.infer<typeof formSchema>;

interface TargetFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  defaultYear?: number;
  defaultMonth?: number;
  defaultTarget?: number;
}

export function TargetForm({
  onSuccess,
  onCancel,
  defaultYear = new Date().getFullYear(),
  defaultMonth = new Date().getMonth(),
  defaultTarget,
}: TargetFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultDate = new Date(defaultYear, defaultMonth, 1);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: defaultDate,
      target: defaultTarget ? defaultTarget.toString() : '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      
      const year = values.date.getFullYear();
      const month = values.date.getMonth() + 1; // JavaScript months are 0-indexed
      const target = parseFloat(values.target);
      
      await setMonthlySalesTarget({
        year,
        month,
        target,
      });
      
      toast.success('Sales target updated successfully');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error setting sales target:', error);
      toast.error('Failed to update sales target');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 p-2">
      <div className="text-xl font-semibold">Set Monthly Sales Target</div>
      <p className="text-muted-foreground text-sm">
        Set or update the sales target for a specific month
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Month</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value ? (
                          format(field.value, 'MMMM yyyy')
                        ) : (
                          <span>Select month</span>
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
                      disabled={(date) => 
                        date > new Date() || date < new Date(new Date().getFullYear() - 5, 0)
                      }
                      captionLayout="dropdown-buttons"
                      fromYear={new Date().getFullYear() - 5}
                      toYear={new Date().getFullYear() + 5}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="target"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target Amount</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                      $
                    </span>
                    <Input {...field} className="pl-8" placeholder="25000" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Target'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
} 