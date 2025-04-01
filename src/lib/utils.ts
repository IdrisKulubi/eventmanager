import { VENUES, EVENT_CATEGORIES } from "@/lib/constants";
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string) {
  if (!date) return ""
  
  return format(new Date(date), "MMM d, yyyy")
}

export function formatDateTime(date: Date | string) {
  if (!date) return ""
  
  return format(new Date(date), "MMM d, yyyy 'at' h:mm a")
}

/**
 * Get venue name by ID from constants
 */
export function getVenueNameById(venueId: number | null): string {
  if (!venueId) return "No venue specified";
  
  const venue = VENUES.find(v => v.id === venueId);
  return venue ? venue.name : `Unknown venue (ID: ${venueId})`;
}

/**
 * Get venue data by ID from constants
 */
export function getVenueById(venueId: number | null) {
  if (!venueId) return null;
  
  return VENUES.find(v => v.id === venueId) || null;
}

/**
 * Get category name by ID from constants
 */
export function getCategoryNameById(categoryId: number | null): string {
  if (!categoryId) return "Uncategorized";
  
  const category = EVENT_CATEGORIES.find(c => c.id === categoryId);
  return category ? category.name : `Unknown category (ID: ${categoryId})`;
}

/**
 * Get category data by ID from constants
 */
export function getCategoryById(categoryId: number | null) {
  if (!categoryId) return null;
  
  return EVENT_CATEGORIES.find(c => c.id === categoryId) || null;
}

/**
 * Map category IDs to category objects
 */
export function mapCategoryIdsToCategories(categoryIds: number[] | undefined) {
  if (!categoryIds || !categoryIds.length) return [];
  
  return categoryIds
    .map(id => EVENT_CATEGORIES.find(c => c.id === id))
    .filter(Boolean) as typeof EVENT_CATEGORIES[number][];
}
