'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { eq, and, gte } from 'drizzle-orm';
import db from '@/db/drizzle';
import { ticketCategories, events } from '@/db/schema';
import { z } from 'zod';

interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: 'admin' | 'manager' | 'user';
}

// Authorization check for ticket management
async function checkTicketManagementPermission() {
  const session = await auth();
  if (!session) {
    return false;
  }

  // Only admin and manager roles can manage tickets
  const user = session?.user;
  return user.role === 'admin' || user.role === 'manager';
}

// Define the ticket category form schema
const TicketCategoryFormSchema = z.object({
  eventId: z.number().int().positive(),
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  price: z.number().positive("Price must be greater than 0"),
  quantity: z.number().int().positive("Quantity must be a positive integer"),
  availableFrom: z.date(),
  availableTo: z.date(),
  isEarlyBird: z.boolean().default(false),
  isVIP: z.boolean().default(false),
  maxPerOrder: z.number().int().positive("Maximum per order must be a positive integer").optional(),
});

type TicketCategoryFormData = z.infer<typeof TicketCategoryFormSchema>;

// Create a new ticket category
export async function createTicketCategory(formData: {
  eventId: number;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  availableFrom: Date;
  availableTo: Date;
  isEarlyBird: boolean;
  isVIP: boolean;
  maxPerOrder?: number;
}) {
  console.log("createTicketCategory called with data:", JSON.stringify(formData, null, 2));
  
  const hasPermission = await checkTicketManagementPermission();
  if (!hasPermission) {
    return {
      success: false,
      error: 'Unauthorized: You do not have permission to create ticket categories'
    };
  }
  
  try {
    // Validate the event exists
    const event = await db.select()
      .from(events)
      .where(eq(events.id, formData.eventId))
      .limit(1);
    
    if (!event.length) {
      return {
        success: false,
        error: 'Event not found'
      };
    }
    
    // Create the ticket category
    const [newTicketCategory] = await db.insert(ticketCategories)
      .values({
        eventId: formData.eventId,
        name: formData.name,
        description: formData.description || null,
        price: formData.price.toString(), // Store as string since it's a numeric in the DB
        quantity: formData.quantity,
        availableFrom: formData.availableFrom,
        availableTo: formData.availableTo,
        isEarlyBird: formData.isEarlyBird,
        isVIP: formData.isVIP,
        maxPerOrder: formData.maxPerOrder || null,
      })
      .returning();
    
    console.log("Created ticket category:", newTicketCategory);
    
    // Revalidate paths
    revalidatePath(`/dashboard/events/${formData.eventId}/tickets`);
    revalidatePath(`/events/${formData.eventId}`);
    
    return {
      success: true,
      ticketCategoryId: newTicketCategory.id,
      message: 'Ticket category created successfully'
    };
  } catch (error) {
    console.error('Error creating ticket category:', error);
    if (error instanceof Error) {
      return { 
        success: false, 
        error: `Failed to create ticket category: ${error.message}` 
      };
    }
    return { 
      success: false, 
      error: 'Failed to create ticket category due to an unknown error' 
    };
  }
}

// Update an existing ticket category
export async function updateTicketCategory(id: number, formData: {
  eventId: number;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  availableFrom: Date;
  availableTo: Date;
  isEarlyBird: boolean;
  isVIP: boolean;
  maxPerOrder?: number;
}) {
  console.log("updateTicketCategory called for id:", id, "with data:", JSON.stringify(formData, null, 2));
  
  const hasPermission = await checkTicketManagementPermission();
  if (!hasPermission) {
    return {
      success: false,
      error: 'Unauthorized: You do not have permission to update ticket categories'
    };
  }
  
  try {
    // Validate the ticket category exists
    const ticketCategory = await db.select()
      .from(ticketCategories)
      .where(eq(ticketCategories.id, id))
      .limit(1);
    
    if (!ticketCategory.length) {
      return {
        success: false,
        error: 'Ticket category not found'
      };
    }
    
    // Update the ticket category
    await db.update(ticketCategories)
      .set({
        name: formData.name,
        description: formData.description || null,
        price: formData.price.toString(), // Store as string since it's a numeric in the DB
        quantity: formData.quantity,
        availableFrom: formData.availableFrom,
        availableTo: formData.availableTo,
        isEarlyBird: formData.isEarlyBird,
        isVIP: formData.isVIP,
        maxPerOrder: formData.maxPerOrder || null,
        updatedAt: new Date(),
      })
      .where(eq(ticketCategories.id, id));
    
    // Revalidate paths
    revalidatePath(`/dashboard/events/${formData.eventId}/tickets`);
    revalidatePath(`/events/${formData.eventId}`);
    
    return {
      success: true,
      message: 'Ticket category updated successfully'
    };
  } catch (error) {
    console.error('Error updating ticket category:', error);
    if (error instanceof Error) {
      return { 
        success: false, 
        error: `Failed to update ticket category: ${error.message}` 
      };
    }
    return { 
      success: false, 
      error: 'Failed to update ticket category due to an unknown error' 
    };
  }
}

// Delete a ticket category
export async function deleteTicketCategory(id: number) {
  console.log("deleteTicketCategory called for id:", id);
  
  const hasPermission = await checkTicketManagementPermission();
  if (!hasPermission) {
    return {
      success: false,
      error: 'Unauthorized: You do not have permission to delete ticket categories'
    };
  }
  
  try {
    // Fetch the ticket category to get the event ID
    const ticketCategory = await db.select()
      .from(ticketCategories)
      .where(eq(ticketCategories.id, id))
      .limit(1);
    
    if (!ticketCategory.length) {
      return {
        success: false,
        error: 'Ticket category not found'
      };
    }
    
    const eventId = ticketCategory[0].eventId;
    
    // Delete the ticket category
    await db.delete(ticketCategories)
      .where(eq(ticketCategories.id, id));
    
    // Revalidate paths
    revalidatePath(`/dashboard/events/${eventId}/tickets`);
    revalidatePath(`/events/${eventId}`);
    
    return {
      success: true,
      message: 'Ticket category deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting ticket category:', error);
    if (error instanceof Error) {
      return { 
        success: false, 
        error: `Failed to delete ticket category: ${error.message}` 
      };
    }
    return { 
      success: false, 
      error: 'Failed to delete ticket category due to an unknown error' 
    };
  }
}

// Get all ticket categories for an event
export async function getTicketCategoriesByEventId(eventId: number | string) {
  const id = typeof eventId === 'string' ? parseInt(eventId, 10) : eventId;
  
  try {
    const ticketCategoriesList = await db.select()
      .from(ticketCategories)
      .where(eq(ticketCategories.eventId, id))
      .orderBy(ticketCategories.isVIP, ticketCategories.price);
    
    return ticketCategoriesList;
  } catch (error) {
    console.error('Error fetching ticket categories:', error);
    throw new Error('Failed to fetch ticket categories');
  }
}

// Get a single ticket category by ID
export async function getTicketCategoryById(id: number) {
  try {
    const ticketCategory = await db.select()
      .from(ticketCategories)
      .where(eq(ticketCategories.id, id))
      .limit(1);
    
    if (!ticketCategory.length) {
      return null;
    }
    
    return ticketCategory[0];
  } catch (error) {
    console.error('Error fetching ticket category:', error);
    throw new Error('Failed to fetch ticket category');
  }
}

// Get available ticket categories for an event (for public view)
export async function getAvailableTicketCategories(eventId: number | string) {
  const id = typeof eventId === 'string' ? parseInt(eventId, 10) : eventId;
  
  try {
    const now = new Date();
    
    const availableTickets = await db.select()
      .from(ticketCategories)
      .where(
        and(
          eq(ticketCategories.eventId, id),
          gte(ticketCategories.availableTo, now)
        )
      )
      .orderBy(ticketCategories.isVIP, ticketCategories.price);
    
    return availableTickets;
  } catch (error) {
    console.error('Error fetching available ticket categories:', error);
    return [];
  }
} 