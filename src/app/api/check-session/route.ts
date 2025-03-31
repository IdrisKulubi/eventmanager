import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();

  return NextResponse.json({
    isAuthenticated: !!session,
    user: session?.user ? {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      role: session.user.role
    } : null,
    session: session,
  });
} 