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
