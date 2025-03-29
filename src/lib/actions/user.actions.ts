import { signOut } from "../../../auth"

export const SignInWithGoogle = async () => {
    throw new Error("This server action shouldn't be called directly from client components. Use the client-side signIn function from next-auth/react instead.")
  }
    
  export const SignOut = async () => {
    await signOut()
  }