import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/stripe/webhook',
  '/api/canva-setup',
  '/api/oauth(.*)',
  '/api/webhooks/clerk',
  '/sign-up/success',
  '/tarifs',
  '/pricing',
  '/privacy',
  '/terms',
  '/logo.svg',
  '/post-preview.png',
  '/mascot-404.mp4',
  '/mascot-404.png',
])

export default clerkMiddleware(async (auth, req) => {
  // 1. Redirection /pricing -> /tarifs
  if (req.nextUrl.pathname === '/pricing') {
    return NextResponse.redirect(new URL('/tarifs', req.url))
  }

  if (isPublicRoute(req)) {
    return NextResponse.next()
  }

  const { userId } = await auth()

  if (!userId) {
    return NextResponse.redirect(
      new URL('/sign-in', req.url)
    )
  }

  // 2. Transmettre le pathname actuel via un header x-pathname
  const requestHeaders = new Headers(req.headers)
  requestHeaders.set('x-pathname', req.nextUrl.pathname)

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
})

export const config = {
  matcher: ['/((?!_next|static|favicon.ico|.*\\.(?:png|svg|jpg|jpeg|gif|webp)$).*)'],
}
