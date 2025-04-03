"use client";
import { Button } from "@/components/ui/button";
import { SignInWithGoogle } from "@/lib/actions/user.actions";
import { useFormStatus } from "react-dom";
import Image from "next/image";

export default function GoogleSignInForm() {
  const SignInButton = () => {
    const { pending } = useFormStatus();
    return (
      <Button
        disabled={pending}
        className="w-full flex items-center justify-center gap-2"
        variant="outline"
        aria-label="sign in with google"
      >
        {!pending && (
          <Image
            src="/assets/icons/google.svg"
            alt="Google"
            width={20}
            height={20}
          />
        )}
        {pending ? "Redirecting..." : "Continue with Google"}
      </Button>
    );
  };
  return (
    <form action={SignInWithGoogle}>
      <SignInButton />
    </form>
  );
}
