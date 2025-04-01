'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { eq, and, inArray, gte, like, desc, asc, count } from 'drizzle-orm';
import { z } from 'zod';
import db from '@/db/drizzle';
import { EventFormSchema } from '../validators';
import { events, eventToCategory, eventCategories, venues } from '@/db/schema';
import { getVenueNameById, mapCategoryIdsToCategories } from '@/lib/utils';
import { VENUES, EVENT_CATEGORIES } from '@/lib/constants';

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
    
    // Get category data for all events
    const eventIds = eventsList.map(event => event.id);
    const categoryRelations = eventIds.length > 0 
      ? await db
          .select({
            eventId: eventToCategory.eventId,
            categoryId: eventToCategory.categoryId,
          })
          .from(eventToCategory)
          .where(inArray(eventToCategory.eventId, eventIds))
      : [];
    
    // Map venue names from constants and add categories to events
    const eventsWithDetails = eventsList.map(event => {
      // Find venue from constants
      const venue = VENUES.find(v => v.id === event.venueId);
      
      // Get category IDs for this event
      const eventCategoryIds = categoryRelations
        .filter(rel => rel.eventId === event.id)
        .map(rel => rel.categoryId);
      
      // Map category IDs to full category objects from constants
      const eventCategories = EVENT_CATEGORIES
        .filter(cat => eventCategoryIds.includes(cat.id));
      
      return {
        ...event,
        venueName: venue ? venue.name : 'Unknown venue',
        categories: eventCategories,
      };
    });
    
    return { events: eventsWithDetails, count: total };
  } catch (error) {
    console.error('Error fetching events:', error);
    throw new Error('Failed to fetch events');
  }
}

export async function getEventById(id: number) {
  try {
    // Get the event with all its details
    const event = await db.select({
      id: events.id,
      title: events.title,
      description: events.description,
      bannerImage: events.bannerImage,
      venueId: events.venueId,
      startDate: events.startDate,
      endDate: events.endDate,
      status: events.status,
      isPublic: events.isPublic,
      isFeatured: events.isFeatured,
      ageRestriction: events.ageRestriction,
      maxTickets: events.maxTickets,
      createdAt: events.createdAt,
      updatedAt: events.updatedAt,
    })
    .from(events)
    .where(eq(events.id, id))
    .limit(1);
    
    if (!event.length) {
      return null;
    }
    
    // Get event categories with their names
    const categoryData = await db
      .select({
        categoryId: eventToCategory.categoryId,
      })
      .from(eventToCategory)
      .where(eq(eventToCategory.eventId, id));
    
    // Get venue name from constants
    const venueName = getVenueNameById(event[0].venueId);
    
    // Map category IDs to category objects from constants
    const categoryIds = categoryData.map(item => item.categoryId);
    const categories = EVENT_CATEGORIES.filter(cat => 
      categoryIds.includes(cat.id)
    );
    
    return {
      ...event[0],
      venueName,
      categories,
    };
  } catch (error) {
    console.error('Error fetching event:', error);
    throw new Error('Failed to fetch event');
  }
}

export async function createEvent(formData: EventFormData) {
  console.log("createEvent called with data:", JSON.stringify(formData, null, 2));
  
  const hasPermission = await checkEventManagementPermission();
  if (!hasPermission) {
    return {
      success: false,
      error: 'Unauthorized: You do not have permission to create events'
    };
  }
  
  try {
    const session = await auth();
    const { categoryIds, ...eventData } = formData;
    const user = session?.user;

    // Validate essential data
    if (!eventData.title || !eventData.startDate || !eventData.endDate || !eventData.venueId) {
      return { 
        success: false, 
        error: 'Missing required fields' 
      };
    }
    
    // Ensure the banner image is properly handled
    console.log("Banner image URL before saving:", eventData.bannerImage);
    
    // Start a transaction to ensure all operations succeed or fail together
    return await db.transaction(async (tx) => {
      try {
        // Explicitly create an object with all fields including bannerImage
        const eventToInsert = {
          title: eventData.title,
          description: eventData.description,
          bannerImage: eventData.bannerImage || null,
          venueId: eventData.venueId,
          startDate: eventData.startDate,
          endDate: eventData.endDate,
          status: eventData.status,
          isPublic: eventData.isPublic,
          isFeatured: eventData.isFeatured,
          ageRestriction: eventData.ageRestriction || null,
          maxTickets: eventData.maxTickets || null,
          createdById: user?.id,
        };
        
        console.log("Inserting event with data:", JSON.stringify(eventToInsert, null, 2));
        
        // 1. First create the event without categories
        const [newEvent] = await tx.insert(events)
          .values(eventToInsert)
          .returning();
        
        console.log("Created event with data:", newEvent);
        
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
            console.log("Created category relationships:", categoryRelations);
          }
          
          // Log warning if some categories were invalid
          if (validCategoryIds.length !== categoryIds.length) {
            console.warn(`Some category IDs were invalid and skipped: ${categoryIds.filter(id => !validCategoryIds.includes(id))}`);
          }
        }
        
        revalidatePath('/dashboard/events');
        return { 
          success: true, 
          eventId: newEvent.id,
          message: 'Event created successfully' 
        };
      } catch (txError) {
        // Transaction will automatically roll back on error
        console.error('Transaction error:', txError);
        throw txError;
      }
    });
  } catch (error) {
    console.error('Error creating event:', error);
    // Provide more specific error message based on the error type
    if (error instanceof Error) {
      return { 
        success: false, 
        error: `Failed to create event: ${error.message}` 
      };
    }
    return { 
      success: false, 
      error: 'Failed to create event due to an unknown error' 
    };
  }
}

export async function updateEvent(id: number, formData: EventFormData) {
  console.log("updateEvent called with id:", id, "and data:", JSON.stringify(formData, null, 2));
  
  const hasPermission = await checkEventManagementPermission();
  if (!hasPermission) {
    return {
      success: false,
      error: 'Unauthorized: You do not have permission to update events'
    };
  }
  
  try {
    const { categoryIds, ...eventData } = formData;
    
    // Validate essential data
    if (!eventData.title || !eventData.startDate || !eventData.endDate || !eventData.venueId) {
      return { 
        success: false, 
        error: 'Missing required fields' 
      };
    }
    
    // Ensure the banner image is properly handled
    console.log("Banner image URL before updating:", eventData.bannerImage);
    
    // Use a transaction for atomic updates
    return await db.transaction(async (tx) => {
      try {
        // Explicitly create an object with all fields including bannerImage
        const eventToUpdate = {
          title: eventData.title,
          description: eventData.description,
          bannerImage: eventData.bannerImage || null,
          venueId: eventData.venueId,
          startDate: eventData.startDate,
          endDate: eventData.endDate,
          status: eventData.status,
          isPublic: eventData.isPublic,
          isFeatured: eventData.isFeatured,
          ageRestriction: eventData.ageRestriction || null,
          maxTickets: eventData.maxTickets || null,
        };
        
        console.log("Updating event with data:", JSON.stringify(eventToUpdate, null, 2));
        
        // 1. Update the event data
        const updatedEvent = await tx.update(events)
          .set(eventToUpdate)
          .where(eq(events.id, id))
          .returning();
        
        console.log("Updated event with data:", updatedEvent);
        
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
              console.log("Updated category relationships:", categoryRelations);
            }
            
            // Log warning if some categories were invalid
            if (validCategoryIds.length !== categoryIds.length) {
              console.warn(`Some category IDs were invalid and skipped: ${categoryIds.filter(id => !validCategoryIds.includes(id))}`);
            }
          }
        }
        
        // Revalidate paths to update UI
        revalidatePath('/dashboard/events');
        revalidatePath(`/dashboard/events/${id}`);
        revalidatePath(`/events/${id}`);
        
        return { 
          success: true, 
          message: 'Event updated successfully'
        };
      } catch (txError) {
        // Transaction will automatically roll back on error
        console.error('Transaction error:', txError);
        throw txError;
      }
    });
  } catch (error) {
    console.error('Error updating event:', error);
    // Provide more specific error message based on the error type
    if (error instanceof Error) {
      return { 
        success: false, 
        error: `Failed to update event: ${error.message}` 
      };
    }
    return { 
      success: false, 
      error: 'Failed to update event due to an unknown error' 
    };
  }
}

export async function deleteEvent(id: number) {
  console.log("Attempting to delete event:", id);
  
  const hasPermission = await checkEventManagementPermission();
  if (!hasPermission) {
    return {
      success: false,
      error: 'Unauthorized: You do not have permission to delete events'
    };
  }
  
  try {
    // First check if the event exists
    const existingEvent = await db
      .select({ id: events.id })
      .from(events)
      .where(eq(events.id, id))
      .limit(1);
      
    if (!existingEvent.length) {
      return { 
        success: false, 
        error: 'Event not found' 
      };
    }
    
    // Use a transaction to ensure all related data is deleted properly
    return await db.transaction(async (tx) => {
      try {
        // 1. Delete event-to-category relationships
        await tx.delete(eventToCategory)
          .where(eq(eventToCategory.eventId, id));
          
        // 2. Delete the event itself
        await tx.delete(events)
          .where(eq(events.id, id));
        
        // Revalidate relevant paths
        revalidatePath('/dashboard/events');
        revalidatePath('/events');
        
        return { 
          success: true, 
          message: 'Event deleted successfully' 
        };
      } catch (txError) {
        console.error('Transaction error during event deletion:', txError);
        throw txError;
      }
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    if (error instanceof Error) {
      return { 
        success: false, 
        error: `Failed to delete event: ${error.message}` 
      };
    }
    return { 
      success: false, 
      error: 'Failed to delete event due to an unknown error' 
    };
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
    const upcomingEvents = await db
      .select()
      .from(events)
      .where(
        and(
          eq(events.status, 'published'),
          gte(events.startDate, now)
        )
      )
      .orderBy(asc(events.startDate))
      .limit(limit);
    
    // Get category data for all events
    const eventIds = upcomingEvents.map(event => event.id);
    const categoryRelations = eventIds.length > 0 
      ? await db
          .select({
            eventId: eventToCategory.eventId,
            categoryId: eventToCategory.categoryId,
          })
          .from(eventToCategory)
          .where(inArray(eventToCategory.eventId, eventIds))
      : [];
    
    // Map venue names from constants and add categories to events
    const eventsWithDetails = upcomingEvents.map(event => {
      // Find venue from constants
      const venue = VENUES.find(v => v.id === event.venueId);
      
      // Get category IDs for this event
      const eventCategoryIds = categoryRelations
        .filter(rel => rel.eventId === event.id)
        .map(rel => rel.categoryId);
      
      // Map category IDs to full category objects from constants
      const eventCategories = EVENT_CATEGORIES
        .filter(cat => eventCategoryIds.includes(cat.id));
      
      return {
        ...event,
        venueName: venue ? venue.name : 'Unknown venue',
        categories: eventCategories,
      };
    });
    
    return eventsWithDetails;
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    return [];
  }
}

export async function getFeaturedEvents(limit = 3) {
  try {
    const featuredEvents = await db
      .select()
      .from(events)
      .where(
        and(
          eq(events.status, 'published'),
          eq(events.isFeatured, true)
        )
      )
      .orderBy(desc(events.startDate))
      .limit(limit);
    
    // Get category data for all events
    const eventIds = featuredEvents.map(event => event.id);
    const categoryRelations = eventIds.length > 0 
      ? await db
          .select({
            eventId: eventToCategory.eventId,
            categoryId: eventToCategory.categoryId,
          })
          .from(eventToCategory)
          .where(inArray(eventToCategory.eventId, eventIds))
      : [];
    
    // Map venue names from constants and add categories to events
    const eventsWithDetails = featuredEvents.map(event => {
      // Find venue from constants
      const venue = VENUES.find(v => v.id === event.venueId);
      
      // Get category IDs for this event
      const eventCategoryIds = categoryRelations
        .filter(rel => rel.eventId === event.id)
        .map(rel => rel.categoryId);
      
      // Map category IDs to full category objects from constants
      const eventCategories = EVENT_CATEGORIES
        .filter(cat => eventCategoryIds.includes(cat.id));
      
      return {
        ...event,
        venueName: venue ? venue.name : 'Unknown venue',
        categories: eventCategories,
      };
    });
    
    return eventsWithDetails;
  } catch (error) {
    console.error('Error fetching featured events:', error);
    return [];
  }
} 