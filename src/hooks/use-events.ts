'use client';

import { useQuery } from '@tanstack/react-query';
import { 
  getEvents, 
  getEventById, 
  getEventCategories, 
  getEventLocations, 
  getFeaturedEvent 
} from '@/lib/actions/event.actions';

export function useEvents({
  query,
  category,
  location,
  startDate,
  endDate,
  minPrice,
  maxPrice,
  page = 1,
  pageSize = 9,
  sortBy = 'date',
}: {
  query?: string;
  category?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  minPrice?: string;
  maxPrice?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
}) {
  return useQuery({
    queryKey: ['events', query, category, location, startDate, endDate, minPrice, maxPrice, page, pageSize, sortBy],
    queryFn: () => getEvents({
      search: query,
      categoryId: category ? parseInt(category) : undefined,
      locationId: location ? parseInt(location) : undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      page,
      limit: pageSize,
      sortBy,
    }),
  });
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: ['event', id],
    queryFn: () => getEventById(Number(id)),
    enabled: !!id,
  });
}

export function useEventCategories() {
  return useQuery({
    queryKey: ['eventCategories'],
    queryFn: getEventCategories,
  });
}

export function useEventLocations() {
  return useQuery({
    queryKey: ['eventLocations'],
    queryFn: getEventLocations,
  });
}

export function useFeaturedEvent() {
  return useQuery({
    queryKey: ['featuredEvent'],
    queryFn: getFeaturedEvent,
  });
} 