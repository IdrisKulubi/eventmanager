'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { eq, and, inArray, gte, like, desc, asc, count } from 'drizzle-orm';
import { z } from 'zod';
import db from '@/db/drizzle';
import { EventFormSchema } from '../validators';
import { events, eventToCategory, eventCategories, venues } from '@/db/schema';

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
  locationId,
  startDate,
  endDate,
  sortBy = 'startDate',
  sortOrder = 'desc',
}: {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'draft' | 'published' | 'cancelled' | 'completed';
  categoryId?: number;
  locationId?: number;
  startDate?: Date;
  endDate?: Date;
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
    } else {
      // Default to published events for public listing
      conditions.push(eq(events.status, 'published'));
    }
    
    if (search) {
      conditions.push(like(events.title, `%${search}%`));
    }
    
    // Filter by location (venue)
    if (locationId) {
      conditions.push(eq(events.venueId, locationId));
    }
    
    // Filter by date range
    if (startDate) {
      conditions.push(gte(events.startDate, startDate));
    }
    
    if (endDate) {
      conditions.push(gte(events.endDate, endDate));
    }
    
    // If filtering by category, fetch eligible event IDs
    let eligibleEventIds: number[] | undefined;
    if (categoryId) {
      const eventIdsResult = await db
        .select({ eventId: eventToCategory.eventId })
        .from(eventToCategory)
        .where(eq(eventToCategory.categoryId, categoryId))
        .execute()
        .catch(err => {
          console.error('Error fetching category event IDs:', err);
          return [];
        });
      
      if (eventIdsResult.length > 0) {
        eligibleEventIds = eventIdsResult.map(e => e.eventId);
        conditions.push(inArray(events.id, eligibleEventIds));
      } else {
        // No events in this category, return empty result early
        return { 
          events: [], 
          pagination: { 
            totalEvents: 0, 
            totalPages: 0, 
            currentPage: page, 
            pageSize: limit 
          } 
        };
      }
    }
    
    // Create the AND condition if we have any conditions
    const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;
    
    // Run count query with timeout handling
    const countPromise = db.select({
      value: count()
    })
    .from(events)
    .where(whereCondition)
    .execute()
    .catch(err => {
      console.error('Error counting events:', err);
      return [{ value: 0 }];
    });
    
    // Run main query with timeout handling
    const eventsPromise = db.select()
      .from(events)
      .where(whereCondition)
      .orderBy(sortBy === 'startDate' 
        ? (sortOrder === 'desc' ? desc(events.startDate) : asc(events.startDate))
        : sortBy === 'title'
          ? (sortOrder === 'desc' ? desc(events.title) : asc(events.title))
          : asc(events.id))
      .limit(limit)
      .offset(offset)
      .execute()
      .catch(err => {
        console.error('Error fetching events list:', err);
        return [];
      });
    
    // Execute both queries in parallel
    const [totalEventsResult, eventsList] = await Promise.all([countPromise, eventsPromise]);
    
    // Get total count for pagination
    const total = totalEventsResult[0]?.value || 0;
    
    // Calculate total pages
    const totalPages = Math.ceil(total / limit);
    
    // If no events found, return early
    if (eventsList.length === 0) {
      return { 
        events: [], 
        pagination: { 
          totalEvents: total, 
          totalPages, 
          currentPage: page, 
          pageSize: limit 
        } 
      };
    }
    
    // Get event IDs for related data queries
    const eventIds = eventsList.map(event => event.id);
    
    // Execute all related data queries in parallel to improve performance
    const [categoryRelations, venueList] = await Promise.all([
      // Get category relations
      db.select({
        eventId: eventToCategory.eventId,
        categoryId: eventToCategory.categoryId,
      })
      .from(eventToCategory)
      .where(inArray(eventToCategory.eventId, eventIds))
      .execute()
      .catch(err => {
        console.error('Error fetching category relations:', err);
        return [];
      }),
      
      // Get venues data
      db.select()
        .from(venues)
        .where(inArray(venues.id, eventsList.map(e => e.venueId).filter(Boolean) as number[]))
        .execute()
        .catch(err => {
          console.error('Error fetching venues:', err);
          return [];
        })
    ]);
    
    // Group category IDs by event ID for faster lookups
    const categoryIdsByEvent = categoryRelations.reduce((acc, rel) => {
      if (!acc[rel.eventId]) {
        acc[rel.eventId] = [];
      }
      acc[rel.eventId].push(rel.categoryId);
      return acc;
    }, {} as Record<number, number[]>);
    
    // Create venue lookup map for faster access
    const venueMap = venueList.reduce((acc, venue) => {
      acc[venue.id] = venue;
      return acc;
    }, {} as Record<number, typeof venueList[number]>);
    
    // Fetch all needed categories in a single query
    const uniqueCategoryIds = [...new Set(categoryRelations.map(rel => rel.categoryId))];
    const categoriesData = uniqueCategoryIds.length > 0
      ? await db
          .select()
          .from(eventCategories)
          .where(inArray(eventCategories.id, uniqueCategoryIds))
          .execute()
          .catch(err => {
            console.error('Error fetching categories:', err);
            return [];
          })
      : [];
    
    // Create category lookup map for faster access
    const categoryMap = categoriesData.reduce((acc, category) => {
      acc[category.id] = category;
      return acc;
    }, {} as Record<number, typeof categoriesData[number]>);
    
    // Map events with their related data
    const eventsWithDetails = eventsList.map(event => {
      // Get venue from map
      const venue = event.venueId ? venueMap[event.venueId] : null;
      
      // Get category IDs for this event
      const eventCategoryIds = categoryIdsByEvent[event.id] || [];
      
      // Map category IDs to full category objects
      const eventCategories = eventCategoryIds
        .map(id => categoryMap[id])
        .filter(Boolean);
      
      return {
        ...event,
        venueName: venue ? venue.name : 'Unknown venue',
        venue,
        categories: eventCategories,
      };
    });
    
    return { 
      events: eventsWithDetails, 
      pagination: {
        totalEvents: total,
        totalPages,
        currentPage: page,
        pageSize: limit
      }
    };
  } catch (error) {
    console.error('Error fetching events:', error);
    // Return empty result with error flag instead of throwing
    return { 
      events: [], 
      pagination: { 
        totalEvents: 0, 
        totalPages: 0, 
        currentPage: page, 
        pageSize: limit 
      },
      error: 'Failed to fetch events. Please try again later.'
    };
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
    
    // Get venue from database instead of constants
    const venueData = event[0].venueId ? await db
      .select()
      .from(venues)
      .where(eq(venues.id, event[0].venueId))
      .limit(1) : [];
    
    const venueName = venueData.length > 0 ? venueData[0].name : 'Unknown venue';
    
    // Get categories from database 
    const categoryIds = categoryData.map(item => item.categoryId);
    const categories = categoryIds.length > 0
      ? await db
          .select()
          .from(eventCategories)
          .where(inArray(eventCategories.id, categoryIds))
      : [];
    
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
    
    // Get all venue IDs to fetch in a single query
    const venueIds = upcomingEvents.map(event => event.venueId).filter(Boolean);
    const venueList = venueIds.length > 0 
      ? await db
          .select()
          .from(venues)
          .where(inArray(venues.id, venueIds as number[]))
      : [];
    
    // Map venue names from database and add categories to events
    const eventsWithDetails = await Promise.all(upcomingEvents.map(async (event) => {
      // Find venue from database
      const venue = venueList.find(v => v.id === event.venueId);
      
      // Get category IDs for this event
      const eventCategoryIds = categoryRelations
        .filter(rel => rel.eventId === event.id)
        .map(rel => rel.categoryId);
      
      // Get categories from database
      const eventCats = await db
        .select()
        .from(eventCategories)
        .where(inArray(eventCategories.id, eventCategoryIds));
      
      return {
        ...event,
        venueName: venue ? venue.name : 'Unknown venue',
        categories: eventCats,
      };
    }));
    
    return eventsWithDetails;
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    return [];
  }
}

export async function getFeaturedEvents() {
  try {
    const featuredEvents = await db.query.events.findMany({
      where: (events, { eq }) => eq(events.isFeatured, true),
      orderBy: (events, { desc }) => [desc(events.createdAt)],
      limit: 1,
      with: {
        venue: true,
        ticketCategories: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          orderBy: (ticketCategories: any, { asc }: { asc: (column: any) => any }) => [asc(ticketCategories.price)],
          limit: 1,
        },
      },
    });

    return featuredEvents;
  } catch (error) {
    console.error("Error fetching featured events:", error);
    throw new Error("Failed to fetch featured events");
  }
}

export async function getEventCategories() {
  try {
    // Fetch categories from the database instead of using constants
    const categories = await db.select().from(eventCategories).orderBy(asc(eventCategories.name));
    return categories;
  } catch (error) {
    console.error('Error fetching event categories:', error);
    return [];
  }
}

export async function getEventLocations() {
  try {
    // Fetch venues from the database instead of using constants
    const locations = await db.select({
      id: venues.id,
      name: venues.name,
      address: venues.address,
      city: venues.city,
      capacity: venues.capacity,
      description: venues.description,
      imageUrl: venues.imageUrl
    })
    .from(venues)
    .orderBy(asc(venues.name));
    
    return locations;
  } catch (error) {
    console.error('Error fetching event locations:', error);
    return [];
  }
}

export async function getFeaturedEvent() {
  try {
    // Get a single featured event
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
      .limit(1);
    
    if (!featuredEvents.length) {
      return null;
    }
    
    const event = featuredEvents[0];
    
    // Get event categories
    const categoryData = await db
      .select({
        categoryId: eventToCategory.categoryId,
      })
      .from(eventToCategory)
      .where(eq(eventToCategory.eventId, event.id));
    
    // Get venue from database instead of constants
    const venueData = event.venueId ? await db
      .select()
      .from(venues)
      .where(eq(venues.id, event.venueId))
      .limit(1) : [];
    
    const venueName = venueData.length > 0 ? venueData[0].name : 'Unknown venue';
    
    // Get categories from database instead of constants
    const categoryIds = categoryData.map(item => item.categoryId);
    
    const categories = categoryIds.length > 0
      ? await db
          .select()
          .from(eventCategories)
          .where(inArray(eventCategories.id, categoryIds))
      : [];
    
    return {
      ...event,
      venueName,
      venue: venueData.length > 0 ? venueData[0] : null,
      categories
    };
  } catch (error) {
    console.error('Error fetching featured event:', error);
    return null;
  }
} 