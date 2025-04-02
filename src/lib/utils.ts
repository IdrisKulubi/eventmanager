import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"
import db from "@/db/drizzle"
import { venues, eventCategories } from "@/db/schema"
import { eq, inArray } from "drizzle-orm"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string) {
  const dateObject = typeof date === "string" ? new Date(date) : date;
  return format(dateObject, "MMMM do, yyyy");
}

export function formatDateTime(date: Date | string) {
  if (!date) return "";
  
  return format(new Date(date), "MMM d, yyyy 'at' h:mm a");
}

export function formatTime(date: Date | string) {
  const dateObject = typeof date === "string" ? new Date(date) : date;
  return format(dateObject, "h:mm a");
}

export function formatCurrency(amount: number, options = {}): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    ...options
  }).format(amount);
}

export function calculateQrCodeDimensions(maxWidth: number): {
  width: number;
  height: number;
} {
  const baseSize = 288;
  const size = Math.min(baseSize, maxWidth);
  return {
    width: size,
    height: size,
  };
}

/**
 * Get venue name by ID from database
 */
export async function getVenueNameById(venueId: number | null): Promise<string> {
  if (!venueId) return "No venue specified";
  
  try {
    const venue = await db.select({ name: venues.name })
      .from(venues)
      .where(eq(venues.id, venueId))
      .limit(1);
    
    return venue.length > 0 ? venue[0].name : `Unknown venue (ID: ${venueId})`;
  } catch (error) {
    console.error('Error fetching venue name:', error);
    return `Unknown venue (ID: ${venueId})`;
  }
}

/**
 * Get venue data by ID from database
 */
export async function getVenueById(venueId: number | null) {
  if (!venueId) return null;
  
  try {
    const venue = await db.select()
      .from(venues)
      .where(eq(venues.id, venueId))
      .limit(1);
    
    return venue.length > 0 ? venue[0] : null;
  } catch (error) {
    console.error('Error fetching venue:', error);
    return null;
  }
}

/**
 * Get category name by ID from database
 */
export async function getCategoryNameById(categoryId: number | null): Promise<string> {
  if (!categoryId) return "Uncategorized";
  
  try {
    const category = await db.select({ name: eventCategories.name })
      .from(eventCategories)
      .where(eq(eventCategories.id, categoryId))
      .limit(1);
    
    return category.length > 0 ? category[0].name : `Unknown category (ID: ${categoryId})`;
  } catch (error) {
    console.error('Error fetching category name:', error);
    return `Unknown category (ID: ${categoryId})`;
  }
}

/**
 * Get category data by ID from database
 */
export async function getCategoryById(categoryId: number | null) {
  if (!categoryId) return null;
  
  try {
    const category = await db.select()
      .from(eventCategories)
      .where(eq(eventCategories.id, categoryId))
      .limit(1);
    
    return category.length > 0 ? category[0] : null;
  } catch (error) {
    console.error('Error fetching category:', error);
    return null;
  }
}

/**
 * Map category IDs to category objects
 */
export async function mapCategoryIdsToCategories(categoryIds: number[] | undefined) {
  if (!categoryIds || !categoryIds.length) return [];
  
  try {
    const categories = await db.select()
      .from(eventCategories)
      .where(inArray(eventCategories.id, categoryIds));
    
    return categories;
  } catch (error) {
    console.error('Error mapping category IDs to categories:', error);
    return [];
  }
}
