import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getSession } from '@auth0/nextjs-auth0/edge'

// Routes that require authentication
const protectedRoutes = ['/dashboard', '/add-workout', '/profile']

// API routes that require authentication
const protectedApiRoutes = ['/api/workouts', '/api/user']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the route requires authentication
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )
  
  const isProtectedApiRoute = protectedApiRoutes.some(route => 
    pathname.startsWith(route)
  )

  if (isProtectedRoute || isProtectedApiRoute) {
    try {
      const session = await getSession(request, NextResponse.next())
      
      if (!session?.user) {
        if (isProtectedApiRoute) {
          // Return JSON error for API routes
          return NextResponse.json(
            { error: 'Unauthorized', message: 'Authentication required' },
            { status: 401 }
          )
        } else {
          // Redirect to login for page routes
          const loginUrl = new URL('/api/auth/login', request.url)
          loginUrl.searchParams.set('returnTo', pathname)
          return NextResponse.redirect(loginUrl)
        }
      }
    } catch (error) {
      console.error('Auth middleware error:', error)
      
      if (isProtectedApiRoute) {
        return NextResponse.json(
          { error: 'Authentication Error', message: 'Failed to verify session' },
          { status: 500 }
        )
      } else {
        return NextResponse.redirect(new URL('/api/auth/login', request.url))
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Match all protected routes
    '/dashboard/:path*',
    '/add-workout/:path*',
    '/profile/:path*',
    // Match protected API routes
    '/api/workouts/:path*',
    '/api/user/:path*'
  ]
}