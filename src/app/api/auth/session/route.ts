import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const cookieStore = await cookies()
  const sessionCartId = await  cookieStore.get('sessionCartId')

  return NextResponse.json({
    sessionCartId: sessionCartId?.value
  })
} 