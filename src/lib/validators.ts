import { z } from "zod";

// Event form schema
export const EventFormSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters' }),
  description: z.string().optional(),
  bannerImage: z.string().optional(),
  venueId: z.number(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  status: z.enum(['draft', 'published', 'cancelled', 'completed']),
  isPublic: z.boolean().default(true),
  ageRestriction: z.number().optional(),
  maxTickets: z.number().optional(),
  isFeatured: z.boolean().default(false),
  categoryIds: z.array(z.number()).optional(),
});

export type EventFormData = z.infer<typeof EventFormSchema>;

// Venue form schema
export const VenueFormSchema = z.object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
    address: z.string().optional(),
    city: z.string().optional(),
    capacity: z.coerce.number().optional(),
    description: z.string().optional(),
    imageUrl: z.string().optional(),
    contactInfo: z.string().optional(),
    coordinates: z.object({
      lat: z.number().optional(),
      lng: z.number().optional(),
    }).optional(),
  });
  
    export  type VenueFormData = z.infer<typeof VenueFormSchema>;

// Category form schema
export const CategoryFormSchema = z.object({
  name: z.string().min(3, { message: 'Name must be at least 3 characters' }),
  description: z.string().optional(),
});

export type CategoryFormData = z.infer<typeof CategoryFormSchema>;
