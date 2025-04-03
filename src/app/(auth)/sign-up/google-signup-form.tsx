'use client'
import { Button } from '@/components/ui/button'
import { SignInWithGoogle } from '@/lib/actions/user.actions'
import { useFormStatus } from 'react-dom'
import Image from 'next/image'

export default function GoogleSignUpForm() {
  const SignUpButton = () => {
    const { pending } = useFormStatus()
    return (
      <Button 
        disabled={pending} 
        className="w-full flex items-center justify-center gap-2 h-12 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200" 
        variant="outline" 
        aria-label='sign up with google'
      >
        {!pending && (
          <Image
            src="/assets/icons/google.svg"
            alt="Google"
            width={20}
            height={20}
          />
        )}
        {pending ? 'Redirecting...' : 'Continue with Google'}
      </Button>
    )
  }
  return (
    <form action={SignInWithGoogle}>
      <SignUpButton />
    </form>
  )
} 