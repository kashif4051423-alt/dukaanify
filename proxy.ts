import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// Routes that don't require authentication
const PUBLIC_AUTH_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password']

// Routes that require authentication
const PROTECTED_PREFIXES = ['/dashboard']

// Admin-only routes
const ADMIN_PREFIXES = ['/admin']

// Fully public routes — never redirect
const PUBLIC_PREFIXES = ['/store']

export async function proxy(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request)
  const { pathname } = request.nextUrl

  const isAuthRoute = PUBLIC_AUTH_ROUTES.some((r) => pathname.startsWith(r))
  const isPublic = PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))
  const isAdmin = ADMIN_PREFIXES.some((p) => pathname.startsWith(p))
  const isProtected =
    !isPublic &&
    (PROTECTED_PREFIXES.some((p) => pathname.startsWith(p)) ||
    isAdmin ||
    // business-scoped routes: /<slug>/products|orders|customers|settings
    /^\/[^/]+\/(products|orders|customers|settings)/.test(pathname))

  // Unauthenticated → redirect to login
  if (!user && isProtected) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Authenticated → don't show auth pages (except reset-password which needs session)
  if (user && isAuthRoute && pathname !== '/reset-password') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/auth/callback|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
