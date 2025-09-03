import { NextResponse, NextRequest } from 'next/server';
import axios from 'axios';
import { API_BASE_URL } from '@/utils/constant';

export const config = {
  matcher: [
    '/dashboard/:path*', // Protect /dashboard and all sub-routes
    '/login',           // Protect login route
    '/create-account'   // Protect create-account route
  ],
};

export async function middleware(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  const { pathname } = request.nextUrl;

  // Handle login and create-account routes
  if (pathname === '/login' || pathname === '/create-account') {
    if (token) {
      try {
        // Validate token by calling /user/current
        const response = await axios.get(`${API_BASE_URL}/user/current`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 200) {
          // If user is authenticated, redirect to dashboard
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }
      } catch (error) {
        // If token is invalid, allow access to login or create-account
        return NextResponse.next();
      }
    }
    // If no token, allow access to login or create-account
    return NextResponse.next();
  }

  // Handle dashboard routes
  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      // If no token, redirect to login
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      // Validate token by calling /user/current
      const response = await axios.get(`${API_BASE_URL}/user/current`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        // Token is valid, allow request to proceed
        return NextResponse.next();
      }
      return NextResponse.redirect(new URL('/login', request.url));
    } catch (error) {
      // Token validation failed
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Allow all other routes
  return NextResponse.next();
}