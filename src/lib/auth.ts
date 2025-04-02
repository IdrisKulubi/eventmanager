import { auth } from "@/auth";

/**
 * Returns the authenticated session, throwing an error if no session is found.
 * Use this when you need to guarantee a user is authenticated.
 * 
 * @throws Error if no session is found
 * @returns The authenticated session
 */
export async function getRequiredAuthSession() {
  const session = await auth();
  
  if (!session || !session.user) {
    throw new Error("Authentication required");
  }
  
  return session;
} 