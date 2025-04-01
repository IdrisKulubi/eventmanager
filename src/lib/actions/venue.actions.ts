'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { eq, like, desc, asc, count, inArray } from 'drizzle-orm';
import { venues, events } from '@/db/schema';
import db from '@/db/drizzle';
import { VenueFormData } from '../validators';

// Define User type with role property
interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: 'admin' | 'manager' | 'user';
}


// Authorization check for venue management
async function checkVenueManagementPermission() {
  const session = await auth();
  if (!session) {
    return false;
  }

  // Only admin and manager roles can manage venues
  const user = session.user as User;
  return user.role === 'admin' || user.role === 'manager';
}

export async function getVenues({
  page = 1,
  limit = 10,
  search,
  sortBy = 'name',
  sortOrder = 'asc',
}: {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) {
  try {
    const offset = (page - 1) * limit;
    
    // Get total count for pagination
    const totalVenues = await db.select({
      value: count()
    }).from(venues);
    const total = totalVenues[0]?.value || 0;
    
    // Apply pagination and sorting in the final query
    const paginatedQuery = db.select().from(venues)
      .where(search ? like(venues.name, `%${search}%`) : undefined)
      .orderBy(
        sortBy === 'name' 
          ? (sortOrder === 'desc' ? desc(venues.name) : asc(venues.name))
          : sortBy === 'capacity'
            ? (sortOrder === 'desc' ? desc(venues.capacity) : asc(venues.capacity))
            : sortBy === 'city'
              ? (sortOrder === 'desc' ? desc(venues.city) : asc(venues.city))
              : asc(venues.id)
      )
      .limit(limit)
      .offset(offset);
    
    // Execute query to get venues
    const venuesList = await paginatedQuery;
    
    // Get event counts for each venue
    const venueIds = venuesList.map(venue => venue.id);
    const eventCounts = venueIds.length > 0
      ? await db.select({
          venueId: events.venueId,
          count: count()
        })
        .from(events)
        .where(venueIds.length === 1 
          ? eq(events.venueId, venueIds[0])
          : inArray(events.venueId, venueIds)
        )
        .groupBy(events.venueId)
      : [];
    
    // Create a map of venue IDs to counts
    const countMap = new Map(eventCounts.map(ec => [ec.venueId, ec.count]));
    
    // Add event count to each venue
    const venuesWithCounts = venuesList.map(venue => ({
      ...venue,
      eventCount: countMap.get(venue.id) || 0
    }));
    
    return { venues: venuesWithCounts, count: total };
  } catch (error) {
    console.error('Error fetching venues:', error);
    throw new Error('Failed to fetch venues');
  }
}

export async function getAllVenues() {
  try {
    const venuesList = await db.select().from(venues).orderBy(asc(venues.name));
    return venuesList;
  } catch (error) {
    console.error('Error fetching all venues:', error);
    throw new Error('Failed to fetch venues');
  }
}

export async function getVenueById(id: number) {
  try {
    const venue = await db.select().from(venues).where(eq(venues.id, id)).limit(1);
    
    if (!venue.length) {
      return null;
    }
    
    return venue[0];
  } catch (error) {
    console.error('Error fetching venue:', error);
    throw new Error('Failed to fetch venue');
  }
}

export async function createVenue(formData: VenueFormData) {
  const hasPermission = await checkVenueManagementPermission();
  if (!hasPermission) {
    throw new Error('Unauthorized: You do not have permission to create venues');
  }
  
  try {
    // Transform the data to match the database schema
    const dataToInsert = { 
      name: formData.name,
      address: formData.address || '',
      city: formData.city || '',
      capacity: formData.capacity || 0,
      description: formData.description || '',
      imageUrl: formData.imageUrl || '',
      contactInfo: formData.contactInfo || '',
      coordinates: formData.coordinates && formData.coordinates.lat && formData.coordinates.lng 
        ? { 
            lat: formData.coordinates.lat, 
            lng: formData.coordinates.lng 
          } 
        : null
    };

    const [newVenue] = await db.insert(venues)
      .values(dataToInsert)
      .returning();
    
    revalidatePath('/dashboard/venues');
    return { success: true, venueId: newVenue.id };
  } catch (error) {
    console.error('Error creating venue:', error);
    throw new Error('Failed to create venue');
  }
}

export async function updateVenue(id: number, formData: VenueFormData) {
  const hasPermission = await checkVenueManagementPermission();
  if (!hasPermission) {
    throw new Error('Unauthorized: You do not have permission to update venues');
  }
  
  try {
    // Transform the data to match the database schema
    const dataToUpdate = { 
      name: formData.name,
      address: formData.address || '',
      city: formData.city || '',
      capacity: formData.capacity || 0,
      description: formData.description || '',
      imageUrl: formData.imageUrl || '',
      contactInfo: formData.contactInfo || '',
      coordinates: formData.coordinates && formData.coordinates.lat && formData.coordinates.lng 
        ? { 
            lat: formData.coordinates.lat, 
            lng: formData.coordinates.lng 
          } 
        : null
    };

    await db.update(venues)
      .set(dataToUpdate)
      .where(eq(venues.id, id));
    
    revalidatePath('/dashboard/venues');
    revalidatePath(`/dashboard/venues/${id}`);
    return { success: true };
  } catch (error) {
    console.error('Error updating venue:', error);
    throw new Error('Failed to update venue');
  }
}

export async function deleteVenue(id: number) {
  const hasPermission = await checkVenueManagementPermission();
  if (!hasPermission) {
    throw new Error('Unauthorized: You do not have permission to delete venues');
  }
  
  try {
    // Check if the venue has any associated events
    const venueEvents = await db.select({ id: events.id })
      .from(events)
      .where(eq(events.venueId, id))
      .limit(1);
    
    if (venueEvents.length > 0) {
      throw new Error('Cannot delete venue with associated events');
    }
    
    // Delete the venue
    await db.delete(venues).where(eq(venues.id, id));
    
    revalidatePath('/dashboard/venues');
    return { success: true };
  } catch (error) {
    console.error('Error deleting venue:', error);
    throw error;
  }
} 