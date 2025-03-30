'use server';

import { events, eventToCategory } from '@/db/schema';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { eq, and, inArray, gte, like, desc, asc, count } from 'drizzle-orm';
import { z } from 'zod';
import db from '@/db/drizzle';
import { EventFormSchema } from '../validators';

type EventFormData = z.infer<typeof EventFormSchema>;

// Authorization check for event management
async function checkEventManagementPermission() {
  const session = await auth();
  if (!session) {
    return false;
  }

  // Only admin and manager roles can manage events
  return session.user.role === 'admin' || session.user.role === 'manager';
}

export async function getEvents({
  page = 1,
  limit = 10,
  status,
  search,
  sortBy = 'startDate',
  sortOrder = 'desc',
  categoryId,
  venueId,
}: {
  page?: number;
  limit?: number;
  status?: 'draft' | 'published' | 'cancelled' | 'completed';
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  categoryId?: number;
  venueId?: number;
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
    
    if (venueId) {
      conditions.push(eq(events.venueId, venueId));
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
      categoryIds,
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
    
    // Insert event
    const [newEvent] = await db.insert(events).values({
      ...eventData,
      createdById: user?.id,
    }).returning();
    
    // Insert category relationships if provided
    if (categoryIds && categoryIds.length > 0) {
      const categoryRelations = categoryIds.map(categoryId => ({
        eventId: newEvent.id,
        categoryId,
      }));
      
      await db.insert(eventToCategory).values(categoryRelations);
    }
    
    revalidatePath('/dashboard/events');
    return { success: true, eventId: newEvent.id };
  } catch (error) {
    console.error('Error creating event:', error);
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
    
    // Update event
    await db.update(events)
      .set(eventData)
      .where(eq(events.id, id));
    
    // Update category relationships if provided
    if (categoryIds) {
      // Remove existing relationships
      await db.delete(eventToCategory)
        .where(eq(eventToCategory.eventId, id));
      
      // Insert new relationships
      if (categoryIds.length > 0) {
        const categoryRelations = categoryIds.map(categoryId => ({
          eventId: id,
          categoryId,
        }));
        
        await db.insert(eventToCategory).values(categoryRelations);
      }
    }
    
    revalidatePath('/dashboard/events');
    revalidatePath(`/dashboard/events/${id}`);
    revalidatePath(`/events/${id}`);
    return { success: true };
  } catch (error) {
    console.error('Error updating event:', error);
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
        eq(events.isPublic, true),
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
        eq(events.isPublic, true),
        eq(events.isFeatured, true),
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