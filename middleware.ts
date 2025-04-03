import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/sign-up',
    '/api/auth/callback/:path*',
    '/api/auth/signin/:path*'
  ],
};
