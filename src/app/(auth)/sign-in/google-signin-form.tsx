"use client";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Image from "next/image";
import { signIn } from "next-auth/react";

export default function GoogleSignInForm() {
  const [isPending, setIsPending] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      console.log("[CLIENT] Starting Google sign-in from client component");
      setIsPending(true);
      setHasError(false);
     
      await signIn("google", { 
        callbackUrl: "/" 
      });
      
      console.log("[CLIENT] Sign-in completed (unlikely to see this due to redirect)");
    } catch (error) {
      console.error("[CLIENT] Unexpected error during sign-in:", error);
      setHasError(true);
      setIsPending(false);
    }
  };

  return (
    <div className="space-y-3">
      <Button
        onClick={handleGoogleSignIn}
        disabled={isPending}
        className="w-full flex items-center justify-center gap-2 h-12 bg-black/60  text-white border border-gray-700 cursor-pointer p-2"
        variant="outline"
        aria-label="sign in with google"
      >
        {!isPending && (
          <Image
            src="/assets/icons/google.svg"
            alt="Google"
            width={20}
            height={20}
          />
        )}
        {isPending ? "Redirecting..." : "Continue with Google"}
      </Button>
      
      {hasError && (
        <p className="text-red-500 text-sm text-center">
          There was an error with Google sign-in. Please try again.
        </p>
      )}
    </div>
  );
}
