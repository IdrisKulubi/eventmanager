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
    <div className="w-full min-h-[80vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md bg-white/80 backdrop-blur-md shadow-xl border-0">
        <CardHeader className="space-y-6 pb-8">
          <div className="flex justify-center transition-transform duration-300 opacity-0 animate-fadeIn">
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

          <div className="space-y-2 text-center transition-opacity duration-500 ease-in-out opacity-0 animate-slideUp delay-200">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Create Your Account
            </h1>
            <p className="text-sm text-gray-600">
              Join our community and discover amazing deals
            </p>
          </div>

          {referralCode && (
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-3 rounded-lg text-center transition-opacity duration-500 ease-in-out opacity-0 animate-slideUp delay-300">
              <p className="text-sm font-medium text-gray-700">
                🎉 You were referred by a friend! Sign up to get started🤗🎁
              </p>
              <p className="text-xs text-gray-600 italic">
                Please use your Strathmore email address 📧 to ensure your
                referral bonus is applied
              </p>
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="transition-transform duration-500 ease-in-out transform translate-y-5 opacity-0 animate-slideUp delay-400">
            <GoogleSignUpForm />
          </div>

          <div className="space-y-4 transition-transform duration-500 ease-in-out transform translate-y-5 opacity-0 animate-slideUp delay-500">
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-pink-500"></div>
              <p className="text-sm font-medium text-gray-700">
                Get exclusive offers & rewards!
              </p>
            </div>

            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  href="/sign-in"
                  className="font-medium text-purple-600 hover:text-purple-500"
                >
                  Sign in
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
