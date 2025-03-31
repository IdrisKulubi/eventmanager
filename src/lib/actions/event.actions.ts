'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { eq, and, inArray, gte, like, desc, asc, count } from 'drizzle-orm';
import { z } from 'zod';
import db from '@/db/drizzle';
import { EventFormSchema } from '../validators';
import { events, eventToCategory, eventCategories } from '@/db/schema';

type EventFormData = z.infer<typeof EventFormSchema>;

//  User type with role property
interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: 'admin' | 'manager' | 'user';
}

// Authorization check for event management
async function checkEventManagementPermission() {
  const session = await auth();
  if (!session) {
    return false;
  }

  // Only admin and manager roles can manage events
  const user = session.user as User;
  return user.role === 'admin' || user.role === 'manager';
}

export async function getEvents({
  page = 1,
  limit = 10,
  search,
  status,
  categoryId,
  sortBy = 'startDate',
  sortOrder = 'desc',
}: {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'draft' | 'published' | 'cancelled' | 'completed';
  categoryId?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) {
  try {
    // For public listing, no auth check needed
    const offset = (page - 1) * limit;
    
    // Build conditions array
    const conditions = [];
    
    if (status) {
      conditions.push(eq(events.status, status));
    }
    
    if (search) {
      conditions.push(like(events.title, `%${search}%`));
    }
    
    // If filtering by category, need to join with eventToCategory
    if (categoryId) {
      const eventIds = await db
        .select({ eventId: eventToCategory.eventId })
        .from(eventToCategory)
        .where(eq(eventToCategory.categoryId, categoryId));
      
      if (eventIds.length > 0) {
        conditions.push(inArray(events.id, eventIds.map(e => e.eventId)));
      } else {
        return { events: [], count: 0 };
      }
    }
    
    // Get total count for pagination
    const totalEvents = await db.select({
      value: count()
    }).from(events);
    const total = totalEvents[0]?.value || 0;
    
    // Apply pagination
    const paginatedQuery = db.select().from(events)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(sortBy === 'startDate' 
        ? (sortOrder === 'desc' ? desc(events.startDate) : asc(events.startDate))
        : sortBy === 'title'
          ? (sortOrder === 'desc' ? desc(events.title) : asc(events.title))
          : asc(events.id))
      .limit(limit)
      .offset(offset);
    
    // Execute query
    const eventsList = await paginatedQuery;
    
    return { events: eventsList, count: total };
  } catch (error) {
    console.error('Error fetching events:', error);
    throw new Error('Failed to fetch events');
  }
}

export async function getEventById(id: number) {
  try {
    const event = await db.select().from(events).where(eq(events.id, id)).limit(1);
    
    if (!event.length) {
      return null;
    }
    
    // Get event categories
    const eventCategoryRelations = await db
      .select({
        categoryId: eventToCategory.categoryId,
      })
      .from(eventToCategory)
      .where(eq(eventToCategory.eventId, id));
    
    const categoryIds = eventCategoryRelations.map(relation => relation.categoryId);
    
    return {
      ...event[0],
      categories: categoryIds.map(id => ({ id })),
    };
  } catch (error) {
    console.error('Error fetching event:', error);
    throw new Error('Failed to fetch event');
  }
}

export async function createEvent(formData: EventFormData) {
  const hasPermission = await checkEventManagementPermission();
  if (!hasPermission) {
    throw new Error('Unauthorized: You do not have permission to create events');
  }
  
  try {
    const session = await auth();
    const { categoryIds, ...eventData } = formData;
    const user = session?.user;

    // Start a transaction to ensure all operations succeed or fail together
    return await db.transaction(async (tx) => {
      try {
        // 1. First create the event without categories
        const [newEvent] = await tx.insert(events).values({
          ...eventData,
          createdById: user?.id,
        }).returning();
        
        // 2. If categories are provided, validate and insert them
        if (categoryIds && categoryIds.length > 0) {
          // Validate that all category IDs exist before creating relationships
          const existingCategories = await tx
            .select({ id: eventCategories.id })
            .from(eventCategories)
            .where(inArray(eventCategories.id, categoryIds));
          
          // Get list of valid category IDs that actually exist
          const validCategoryIds = existingCategories.map(cat => cat.id);
          
          // Only create relationships for valid categories
          if (validCategoryIds.length > 0) {
            const categoryRelations = validCategoryIds.map(categoryId => ({
              eventId: newEvent.id,
              categoryId,
            }));
            
            await tx.insert(eventToCategory).values(categoryRelations);
          }
          
          // Log warning if some categories were invalid
          if (validCategoryIds.length !== categoryIds.length) {
            console.warn(`Some category IDs were invalid and skipped: ${categoryIds.filter(id => !validCategoryIds.includes(id))}`);
          }
        }
        
        revalidatePath('/dashboard/events');
        return { success: true, eventId: newEvent.id };
      } catch (error) {
        // Transaction will automatically roll back on error
        console.error('Transaction error:', error);
        throw error;
      }
    });
  } catch (error) {
    console.error('Error creating event:', error);
    // Provide more specific error message based on the error type
    if (error instanceof Error) {
      // Handle specific error types with custom messages
      if (error.message.includes('violates foreign key constraint')) {
        if (error.message.includes('category_id')) {
          throw new Error('Failed to create event: One or more selected categories do not exist');
        } else if (error.message.includes('venue_id')) {
          throw new Error('Failed to create event: The selected venue does not exist');
        }
      }
      throw new Error(`Failed to create event: ${error.message}`);
    }
    throw new Error('Failed to create event');
  }
}

export async function updateEvent(id: number, formData: EventFormData) {
  const hasPermission = await checkEventManagementPermission();
  if (!hasPermission) {
    throw new Error('Unauthorized: You do not have permission to update events');
  }
  
  try {
    const { categoryIds, ...eventData } = formData;
    
    // Use a transaction for atomic updates
    return await db.transaction(async (tx) => {
      try {
        // 1. Update the event data
        await tx.update(events)
          .set(eventData)
          .where(eq(events.id, id));
        
        // 2. Handle category relationships if provided
        if (categoryIds !== undefined) {
          // Remove existing relationships
          await tx.delete(eventToCategory)
            .where(eq(eventToCategory.eventId, id));
          
          // If new categories are provided, validate and insert them
          if (categoryIds && categoryIds.length > 0) {
            // Validate that all category IDs exist
            const existingCategories = await tx
              .select({ id: eventCategories.id })
              .from(eventCategories)
              .where(inArray(eventCategories.id, categoryIds));
            
            // Get list of valid category IDs that actually exist
            const validCategoryIds = existingCategories.map(cat => cat.id);
            
            // Only create relationships for valid categories
            if (validCategoryIds.length > 0) {
              const categoryRelations = validCategoryIds.map(categoryId => ({
                eventId: id,
                categoryId,
              }));
              
              await tx.insert(eventToCategory).values(categoryRelations);
            }
            
            // Log warning if some categories were invalid
            if (validCategoryIds.length !== categoryIds.length) {
              console.warn(`Some category IDs were invalid and skipped: ${categoryIds.filter(id => !validCategoryIds.includes(id))}`);
            }
          }
        }
        
        revalidatePath('/dashboard/events');
        revalidatePath(`/dashboard/events/${id}`);
        revalidatePath(`/events/${id}`);
        return { success: true };
      } catch (error) {
        // Transaction will automatically roll back on error
        console.error('Transaction error:', error);
        throw error;
      }
    });
  } catch (error) {
    console.error('Error updating event:', error);
    // Provide more specific error message based on the error type
    if (error instanceof Error) {
      // Handle specific error types with custom messages
      if (error.message.includes('violates foreign key constraint')) {
        if (error.message.includes('category_id')) {
          throw new Error('Failed to update event: One or more selected categories do not exist');
        } else if (error.message.includes('venue_id')) {
          throw new Error('Failed to update event: The selected venue does not exist');
        }
      }
      throw new Error(`Failed to update event: ${error.message}`);
    }
    throw new Error('Failed to update event');
  }
}

export async function deleteEvent(id: number) {
  const hasPermission = await checkEventManagementPermission();
  if (!hasPermission) {
    throw new Error('Unauthorized: You do not have permission to delete events');
  }
  
  try {
    // Delete the event
    await db.delete(events).where(eq(events.id, id));
    
    revalidatePath('/dashboard/events');
    return { success: true };
  } catch (error) {
    console.error('Error deleting event:', error);
    throw new Error('Failed to delete event');
  }
}

export async function publishEvent(id: number) {
  const hasPermission = await checkEventManagementPermission();
  if (!hasPermission) {
    throw new Error('Unauthorized: You do not have permission to publish events');
  }
  
  try {
    await db.update(events)
      .set({ status: 'published' })
      .where(eq(events.id, id));
    
    revalidatePath('/dashboard/events');
    revalidatePath(`/dashboard/events/${id}`);
    revalidatePath(`/events/${id}`);
    return { success: true };
  } catch (error) {
    console.error('Error publishing event:', error);
    throw new Error('Failed to publish event');
  }
}

export async function getUpcomingEvents(limit = 6) {
  try {
    const now = new Date();
    
    const upcomingEvents = await db.select()
      .from(events)
      .where(and(
        eq(events.status, 'published'),
        gte(events.startDate, now)
      ))
      .orderBy(asc(events.startDate))
      .limit(limit);
    
    return upcomingEvents;
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    throw new Error('Failed to fetch upcoming events');
  }
}

export async function getFeaturedEvents(limit = 3) {
  try {
    const now = new Date();
    
    const featuredEvents = await db.select()
      .from(events)
      .where(and(
        eq(events.status, 'published'),
        gte(events.startDate, now)
      ))
      .orderBy(asc(events.startDate))
      .limit(limit);
    
    return featuredEvents;
  } catch (error) {
    console.error('Error fetching featured events:', error);
    throw new Error('Failed to fetch featured events');
  }
} 