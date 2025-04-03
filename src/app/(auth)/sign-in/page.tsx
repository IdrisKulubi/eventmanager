import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { APP_NAME } from "@/lib/constants";
import GoogleSignInForm from "./google-signin-form";

interface SignInPageProps {
  searchParams: Promise<{
    callbackUrl?: string;
    error?: string;
    ref?: string;
  }>;
}

export const metadata: Metadata = {
  title: `Sign In - ${APP_NAME}`,
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const session = await auth();
  const params = await searchParams;
  const callbackUrl = params?.callbackUrl;

  if (session) {
    return redirect(callbackUrl || "/");
  }

  return (
    <div className="w-full min-h-[80vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md bg-white/80 backdrop-blur-md shadow-xl border-0 transition-transform transform hover:scale-105 duration-300 ease-in-out">
        <CardHeader className="space-y-6 pb-8">
          <div className="flex justify-center transition-opacity duration-300 ease-in-out opacity-0 animate-fadeIn">
            <Link href="/" className="relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full blur opacity-30"></div>
              <Image
                src="/assets/icons/logo.png"
                width={80}
                height={80}
                alt={APP_NAME}
                className="relative rounded-full"
              />
            </Link>
          </div>

          <div className="space-y-2 text-center transition-opacity duration-500 ease-in-out opacity-0 animate-fadeIn delay-200">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Welcome Back
            </h1>
            <p className="text-sm text-gray-600">
              Sign in to unlock exclusive offers and personalized experiences
            </p>
          </div>

         
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="transition-transform duration-500 ease-in-out transform translate-y-5 opacity-0 animate-slideUp delay-300">
            <GoogleSignInForm />
          </div>

          <div className="space-y-4 transition-transform duration-500 ease-in-out transform translate-y-5 opacity-0 animate-slideUp delay-400">
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-pink-500"></div>
              <p className="text-sm font-medium text-gray-700">
                New users get special offers
              </p>
            </div>

            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                Don&apos;t have an account?{" "}
                <Link
                  href="/sign-up"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Sign up
                </Link>
              </p>
              <p className="text-xs text-gray-500">
                By continuing, you agree to our{" "}
                <Link
                  href="/terms"
                  target="_blank"
                  className="font-medium text-blue-600 hover:text-blue-500"
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
