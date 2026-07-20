import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/stripe/webhook',
  '/api/canva-setup',
  '/logo.svg',
  '/post-preview.png',
])

export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) return NextResponse.next()
  
  const { userId } = await auth()
  
  if (!userId) {
    return NextResponse.redirect(
      new URL('/sign-in', req.url)
    )
  }
  
  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next|static|favicon.ico|.*\\.(?:png|svg|jpg|jpeg|gif|webp)$).*)'],
}
