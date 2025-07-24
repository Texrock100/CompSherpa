// import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
// import { NextResponse } from "next/server"

// // Define which routes are public (don't require authentication)
// const isPublic = createRouteMatcher([
//   '/',
//   '/privacy',
//   '/terms',
//   '/api/signup',
//   '/api/report',
//   '/api/profile',
//   '/api/jobs',
//   '/api/admin'
// ])

// export default clerkMiddleware((auth, req) => {
//   if (isPublic(req)) {
//     return NextResponse.next()
//   }
//   return auth.protect()
// })

// export const config = {
//   matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
// }

// Temporary middleware - just pass through all requests
export function middleware() {
  return
}

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}