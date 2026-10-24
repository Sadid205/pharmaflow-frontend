import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;
  const { pathname } = request.nextUrl;

  const isAuthPage =
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/forgot-password' ||
    pathname === '/reset-password';

  const isProtectedRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/medicines') ||
    pathname.startsWith('/pharmacy') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/categories') ||
    pathname.startsWith('/suppliers') ||
    pathname.startsWith('/pos');

  // If trying to access protected route without token, redirect to login
  if (!token && isProtectedRoute) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If already authenticated and visits login/register, redirect to dashboard
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/medicines/:path*',
    '/pharmacy/:path*',
    '/admin/:path*',
    '/categories/:path*',
    '/suppliers/:path*',
    '/pos/:path*',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
  ],
};
