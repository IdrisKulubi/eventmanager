import { z } from "zod";

// User schemas
export const LoginFormSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const SignUpFormSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Venue schemas
export const VenueFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  address: z.string().optional(),
  city: z.string().optional(),
  capacity: z.number().int().nonnegative().optional(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  contactInfo: z.string().optional(),
  coordinates: z.object({
    lat: z.number().optional(),
    lng: z.number().optional(),
  }).optional(),
});


export const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  address: z.string().min(5, {
    message: 'Address must be at least 5 characters.',
  }),
  capacity: z.coerce.number().min(1, {
    message: 'Capacity must be at least 1.',
  }),
  description: z.string().optional(),
});

// Event schemas
export const EventFormSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().optional(),
  startDate: z.date({
    required_error: "Start date is required",
    invalid_type_error: "Start date must be a valid date",
  }),
  endDate: z.date({
    required_error: "End date is required",
    invalid_type_error: "End date must be a valid date",
  }),
  venueId: z.number().int().positive("Venue is required"),
  categoryIds: z.array(z.number().int().positive()).optional(),
  status: z.enum(["draft", "published", "cancelled", "completed"]),
  bannerImage: z.string().optional(),
  isPublic: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  ageRestriction: z.number().int().nonnegative().optional(),
  maxTickets: z.number().int().nonnegative().optional(),
}).refine(data => {
  if (data.endDate < data.startDate) {
    return false;
  }
  return true;
}, {
  message: "End date must be after start date",
  path: ["endDate"],
});

export type EventFormData = z.infer<typeof EventFormSchema>;

// Venue form schema
export type VenueFormData = z.infer<typeof VenueFormSchema>;

// Category form schema
export const CategoryFormSchema = z.object({
  name: z.string().min(3, { message: 'Name must be at least 3 characters' }),
  description: z.string().optional(),
});

export type CategoryFormData = z.infer<typeof CategoryFormSchema>;
