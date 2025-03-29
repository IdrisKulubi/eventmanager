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
