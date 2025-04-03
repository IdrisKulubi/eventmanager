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
        className="w-full flex items-center justify-center gap-3 h-14 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg shadow-purple-500/30 rounded-xl border border-purple-500/30 transition-all duration-300 transform hover:scale-[1.01] hover:shadow-purple-500/40"
        variant="default" 
        aria-label='sign up with google'
      >
        {!pending && (
          <div className="relative bg-white p-1.5 rounded-full">
            <Image
              src="/assets/icons/google.svg"
              alt="Google"
              width={20}
              height={20}
              className="relative z-10"
            />
          </div>
        )}
        <span className="font-medium text-sm">
          {pending ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white/80 rounded-full animate-spin"></div>
              <span>Connecting...</span>
            </div>
          ) : (
            "Continue with Google"
          )}
        </span>
      </Button>
    )
  }
  return (
    <form action={SignInWithGoogle}>
      <SignUpButton />
    </form>
  )
} 