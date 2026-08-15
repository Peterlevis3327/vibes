import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const session = request.cookies.get('__session');
  
  // The secret key mechanism
  // If trying to access ANY /plmhrauth route
  if (request.nextUrl.pathname.startsWith('/plmhrauth')) {
    // Check if they have the secret cookie or the url parameter
    const secretKey = request.nextUrl.searchParams.get('key');
    const hasSecretCookie = request.cookies.has('admin_access_granted');

    if (secretKey === 'open_sesame' || hasSecretCookie) {
      // NOW we do the standard auth check
      let response: NextResponse;
      
      if (!request.nextUrl.pathname.startsWith('/plmhrauth/login') && !session) {
         response = NextResponse.redirect(new URL('/plmhrauth/login', request.url));
      } else if (request.nextUrl.pathname.startsWith('/plmhrauth/login') && session) {
         response = NextResponse.redirect(new URL('/plmhrauth', request.url));
      } else {
         response = NextResponse.next();
      }

      // Allow them to proceed, but if they used the URL parameter, we need to set the cookie
      // so they don't have to keep passing ?key=open_sesame
      // Note: We MUST set the cookie on the final response object we are returning (whether redirect or next)
      if (secretKey === 'open_sesame' && !hasSecretCookie) {
        response.cookies.set('admin_access_granted', 'true', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          path: '/',
        });
      }

      return response;
    } else {
      // If no key and no cookie, pretend the page doesn't exist by rewriting to a non-existent path
      // This triggers Next.js's built-in not-found.tsx instead of returning an unstyled raw text response
      return NextResponse.rewrite(new URL('/_not-found-trigger', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/plmhrauth/:path*'],
};
