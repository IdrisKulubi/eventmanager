export const APP_NAME = "BlackConcert"
export const APP_DESCRIPTION = "BlackConcert is an event management platform"
export const APP_URL = "https://blackconcert.com"

export const APP_AUTHOR_URL = "https://blackconcert.com"


export const signInDefaultValues = {
    email: '',
    password: '',
  }
  
  export const signUpDefaultValues = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  }


  export const USER_ROLES = process.env.USER_ROLES
  ? process.env.USER_ROLES.split(', ')
  : ['admin', 'user','manager']

// Event related constants
export const EVENT_STATUSES = ['draft', 'published', 'cancelled', 'completed'] as const;
export const EVENT_CATEGORIES = [
  { id: 1, name: 'Concert', description: 'Live music performances' },
  { id: 2, name: 'Festival', description: 'Multi-day music festivals' },
  { id: 3, name: 'Theater', description: 'Theatrical performances' },
  { id: 4, name: 'Sports', description: 'Sports events and matches' },
  { id: 5, name: 'Conference', description: 'Business and professional conferences' },
  { id: 6, name: 'Exhibition', description: 'Art and trade exhibitions' },
  { id: 7, name: 'Workshop', description: 'Educational workshops and seminars' },
  { id: 8, name: 'Other', description: 'Other types of events' },
] as const;

// Venue related constants
export const VENUE_TYPES = [
  { id: 1, name: 'Indoor Arena', description: 'Large indoor sports and entertainment venues' },
  { id: 2, name: 'Outdoor Stadium', description: 'Open-air sports and concert venues' },
  { id: 3, name: 'Theater', description: 'Theatrical performance venues' },
  { id: 4, name: 'Concert Hall', description: 'Dedicated music performance venues' },
  { id: 5, name: 'Conference Center', description: 'Business and professional meeting spaces' },
  { id: 6, name: 'Exhibition Hall', description: 'Large spaces for exhibitions and trade shows' },
  { id: 7, name: 'Club', description: 'Smaller entertainment venues' },
  { id: 8, name: 'Other', description: 'Other types of venues' },
] as const;

// Image upload constants
export const MAX_IMAGE_SIZE = 4 * 1024 * 1024; // 4MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const MAX_IMAGE_DIMENSIONS = {
  width: 1920,
  height: 1080,
};
