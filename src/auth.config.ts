/**
 * Edge-compatible auth configuration.
 *
 * This file is imported by proxy.ts (Next.js Edge proxy/middleware) and must
 * NOT import any Node.js-only packages (stripe, sharp, etc.).
 *
 * It handles route protection only. The full auth configuration (with Stripe
 * plan lookup) lives in auth.ts and runs on the Node.js server.
 */
import type { NextAuthConfig } from "next-auth"

export const authConfig: NextAuthConfig = {
    providers: [], // providers are fully declared in auth.ts
    pages: {
        signIn: '/login',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard')
            if (isOnDashboard) {
                if (isLoggedIn) return true
                return false // redirect unauthenticated users to /login
            } else if (isLoggedIn && (nextUrl.pathname === '/login' || nextUrl.pathname === '/register')) {
                return Response.redirect(new URL('/dashboard', nextUrl))
            }
            return true
        },
    },
}
