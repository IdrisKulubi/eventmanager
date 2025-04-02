import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

const handler = NextAuth(authConfig) as unknown as (request: Request) => Promise<Response>;

// Export the handler as a function that takes a Request object
export async function GET(request: Request) {
  return handler(request);
}

export async function POST(request: Request) {
  return handler(request);
}
