'use client'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import Image from 'next/image'
import { signIn } from "next-auth/react";

export default function GoogleSignUpForm() {
  const [isPending, setIsPending] = useState(false)
  const [hasError, setHasError] = useState(false);

  const handleGoogleSignUp = async () => {
    try {
      console.log("[CLIENT] Starting Google sign-up from client component");
      setIsPending(true)
      setHasError(false);
      
      // Use the client-side signIn function directly
      // This is the recommended approach from NextAuth.js docs
      await signIn("google", { 
        callbackUrl: "/" 
      });
      
      // Note: The code below will not execute because signIn causes a redirect
      console.log("[CLIENT] Sign-up completed (unlikely to see this due to redirect)");
    } catch (error) {
      console.error("[CLIENT] Unexpected error during sign-up:", error);
      setHasError(true);
      setIsPending(false);
    }
  }

  return (
    <div className="space-y-3">
      <Button 
        onClick={handleGoogleSignUp}
        disabled={isPending} 
        className="w-full flex items-center justify-center gap-2 h-12 bg-white hover:bg-gray-50 text-black
         cursor-pointer r-pointer p-2 border border-gray-200" 
        variant="outline" 
        aria-label='sign up with google'
      >
        {!isPending && (
          <Image
            src="/assets/icons/google.svg"
            alt="Google"
            width={20}
            height={20}
          />
        )}
        {isPending ? 'Redirecting...' : 'Continue with Google'}
      </Button>
      
      {hasError && (
        <p className="text-red-500 text-sm text-center">
          There was an error with Google sign-up. Please try again.
        </p>
      )}
    </div>
  )
} 