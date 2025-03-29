import { Metadata } from "next";
import { redirect } from "next/navigation";
import { APP_NAME } from "@/lib/constants";
import { Session } from "next-auth";
import { auth } from "../../../../auth";

// Client component wrapper
import SignUpClientWrapper from "./sign-up-client";

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

  return <SignUpClientWrapper appName={APP_NAME} referralCode={referralCode} />;
}
