import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { auth } from '../../../../../auth'

export async function GET() {
  const cookieStore = await cookies()
  const session = await auth()
  const sessionCartId = await cookieStore.get('sessionCartId')

  return NextResponse.json({
    // Return user session data based on role requirements
    user: session?.user ? {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      image: session.user.image
    } : null,
    // Cart data for ticket purchases
    sessionCartId: sessionCartId?.value,
    // Include auth status
    isAuthenticated: !!session
  })
}