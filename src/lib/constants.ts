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


// Image upload constants
export const MAX_IMAGE_SIZE = 4 * 1024 * 1024; // 4MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const MAX_IMAGE_DIMENSIONS = {
  width: 1920,
  height: 1080,
};
