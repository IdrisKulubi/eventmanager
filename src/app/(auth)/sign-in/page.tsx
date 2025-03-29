import { Metadata } from "next";
import { redirect } from "next/navigation";
import { APP_NAME } from "@/lib/constants";
import { auth } from "../../../../auth";

// Client component wrapper
import SignInClientWrapper from "./sign-in-client";

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

  return <SignInClientWrapper appName={APP_NAME} />;
}
