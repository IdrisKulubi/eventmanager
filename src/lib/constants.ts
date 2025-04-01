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

// Venue constants
export const VENUES = [
  { id: 1, name: 'Madison Square Garden', description: 'Iconic indoor arena in New York City' },
  { id: 2, name: 'O2 Arena', description: 'Major indoor arena in London' },
  { id: 3, name: 'Staples Center', description: 'Multi-purpose arena in Los Angeles' },
  { id: 4, name: 'Red Rocks Amphitheatre', description: 'Open-air amphitheatre in Colorado' },
  { id: 5, name: 'Royal Albert Hall', description: 'Historic concert hall in London' },
  { id: 6, name: 'Carnegie Hall', description: 'Historic concert venue in New York City' },
  { id: 7, name: 'Sydney Opera House', description: 'Multi-venue performing arts centre in Sydney' },
  { id: 8, name: 'Wembley Stadium', description: 'Major stadium in London' },
  { id: 9, name: 'Mercedes-Benz Arena', description: 'Multi-purpose arena in Berlin' },
  { id: 10, name: 'Tokyo Dome', description: 'Indoor stadium in Tokyo' },
] as const;

// Image upload constants
export const MAX_IMAGE_SIZE = 4 * 1024 * 1024; // 4MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const MAX_IMAGE_DIMENSIONS = {
  width: 1920,
  height: 1080,
};
