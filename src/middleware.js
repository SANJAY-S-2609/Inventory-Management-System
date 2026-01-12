import { NextResponse } from 'next/server';

export function middleware(request) {
  // 1. Try to get the authentication cookie
  // Note: Replace 'isLoggedIn' with the name of the cookie you set during login
  const authToken = request.cookies.get('isLoggedIn')?.value;

  const { pathname } = request.nextUrl;

  // 2. Protect the dashboard routes
  // If the user is trying to go to /dashboard and is NOT logged in
  if (pathname.startsWith('/dashboard') && !authToken) {
    // Redirect them to the home page or login page
    // Assuming your login is at the root '/' or '/Login'
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// 3. Matcher tells Next.js exactly which routes to run this code on
export const config = {
  matcher: ['/dashboard/:path*'],
};