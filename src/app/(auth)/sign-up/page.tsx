import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { APP_NAME } from "@/lib/constants";
import GoogleSignUpForm from "./google-signup-form";
import { Session } from "next-auth";

interface SignUpPageProps {
  searchParams: Promise<{
    callbackUrl?: string;
    error?: string;
    ref?: string;
  }>;
}

export const metadata: Metadata = {
  title: `Sign Up - ${APP_NAME}`,
};

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const session = (await auth()) as Session | null;
  const params = await searchParams;
  const callbackUrl = params?.callbackUrl;
  const referralCode = params?.ref;

  if (session) {
    return redirect(callbackUrl || "/");
  }

  return (
    <div className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-black via-purple-950 to-black">
      {/* Animated Musical Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Musical notes floating elements */}
        <div className="absolute top-1/5 right-1/4 w-7 h-7 opacity-40 animate-float-slow">
          <Image src="/assets/icons/music-note-1.svg" alt="Music note" width={28} height={28} className="text-purple-300" />
        </div>
        <div className="absolute top-1/2 left-1/4 w-9 h-9 opacity-30 animate-float-medium">
          <Image src="/assets/icons/music-note-2.svg" alt="Music note" width={36} height={36} className="text-pink-300" />
        </div>
        <div className="absolute bottom-1/3 right-1/3 w-6 h-6 opacity-20 animate-float-fast">
          <Image src="/assets/icons/music-note-3.svg" alt="Music note" width={24} height={24} className="text-indigo-300" />
        </div>
        <div className="absolute top-2/3 left-1/3 w-8 h-8 opacity-25 animate-float-medium">
          <Image src="/assets/icons/headphones.svg" alt="Headphones" width={32} height={32} className="text-purple-200" />
        </div>
        
        {/* Animated Gradient Orbs */}
        <div className="absolute top-1/5 left-1/4 w-48 h-48 rounded-full bg-purple-500/10 blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/6 w-72 h-72 rounded-full bg-indigo-600/10 blur-3xl animate-pulse-medium"></div>
        <div className="absolute top-20 right-1/3 w-40 h-40 rounded-full bg-pink-600/10 blur-3xl animate-pulse-fast"></div>
      </div>
      
      <Card className="w-full max-w-md bg-black/40 backdrop-blur-xl border border-purple-500/20 shadow-[0_0_35px_rgba(139,92,246,0.3)] rounded-xl overflow-hidden z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/5 to-purple-800/10 pointer-events-none"></div>
        
        <CardHeader className="space-y-6 pb-6 relative z-10">
          <div className="flex justify-center">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur-md opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse-slow"></div>
              <Link href="/" className="relative block rounded-full p-1 bg-black bg-gradient-to-r from-black to-purple-950 ring-1 ring-purple-500/50">
                <Image
                  src="/assets/icons/logo.png"
                  width={70}
                  height={70}
                  alt={APP_NAME}
                  className="rounded-full transform transition-all duration-500 hover:scale-105"
                />
              </Link>
            </div>
          </div>

          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent pb-1 animate-gradient">
              Join the Community
            </h1>
            <p className="text-sm text-purple-100/70">
              Create your account to unlock VIP concert experiences
            </p>
          </div>

          {referralCode && (
            <div className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 p-4 rounded-xl border border-purple-500/20 text-center shadow-lg transform transition-all hover:scale-102 duration-500">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-lg blur-sm"></div>
                <div className="relative">
                  <p className="text-sm font-medium text-purple-100">
                    <span className="inline-block animate-bounce-soft mr-1">🎉</span> You were referred by a friend! <span className="inline-block animate-bounce-soft ml-1">🎁</span>
                  </p>
                  <p className="text-xs text-purple-200/60 italic mt-1">
                    Sign up with your email to claim your special VIP benefits
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-8 relative z-10 pb-8">
          <div className="transition-all duration-500 hover:scale-102">
            <GoogleSignUpForm />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3">
              <div className="w-3 h-3 rounded-full bg-purple-500 animate-pulse"></div>
              <p className="text-sm font-medium text-purple-100/80">
                Get VIP concert access & rewards
              </p>
              <div className="w-3 h-3 rounded-full bg-pink-500 animate-pulse delay-300"></div>
            </div>

            <div className="text-center space-y-3 mt-6">
              <p className="text-sm text-purple-100/70">
                Already have an account?{" "}
                <Link
                  href="/sign-in"
                  className="font-medium text-purple-400 hover:text-purple-300 transition-colors duration-300"
                >
                  Sign in
                </Link>
              </p>
              <p className="text-xs text-purple-200/50">
                By continuing, you agree to our{" "}
                <Link
                  href="/terms"
                  target="_blank"
                  className="font-medium text-purple-400 hover:text-purple-300 transition-colors duration-300"
                >
                  Terms & Privacy Policy
                </Link>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
