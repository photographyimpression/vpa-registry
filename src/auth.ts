import NextAuth, { type DefaultSession } from "next-auth"
import Google from "next-auth/providers/google"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
        } & DefaultSession["user"]
    }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [Google],
    secret: process.env.AUTH_SECRET,
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    callbacks: {
        async authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard')
            if (isOnDashboard) {
                if (isLoggedIn) return true
                return false // Redirect to login
            } else if (isLoggedIn && (nextUrl.pathname === '/login' || nextUrl.pathname === '/register')) {
                return Response.redirect(new URL('/dashboard', nextUrl))
            }
            return true
        },
    },
    pages: {
        signIn: '/login',
    },
})
