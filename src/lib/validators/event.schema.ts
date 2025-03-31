import { z } from "zod";

export const eventFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  description: z.string().min(1, "Description is required").max(1000, "Description is too long"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  venueId: z.number().min(1, "Venue is required"),
  categoryId: z.number().min(1, "Category is required"),
  status: z.enum(["draft", "published", "cancelled", "completed"]),
  imageUrl: z.string().optional(),
  maxTickets: z.number().min(0, "Maximum tickets must be 0 or greater"),
  price: z.number().min(0, "Price must be 0 or greater"),
});

export type EventFormData = z.infer<typeof eventFormSchema>; 