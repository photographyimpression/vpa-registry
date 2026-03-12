import NextAuth, { type DefaultSession } from "next-auth"
import Google from "next-auth/providers/google"
import { getSubscriptionPlan, type PlanTier } from "@/lib/stripe"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            plan: PlanTier
        } & DefaultSession["user"]
    }
}

// next-auth/jwt augmentation — handled via next-auth module above

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [Google],
    secret: process.env.AUTH_SECRET,
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    callbacks: {
        async jwt({ token, trigger }) {
            // Refresh Stripe plan on sign-in or explicit session update
            if (trigger === 'signIn' || trigger === 'update') {
                token.plan = await getSubscriptionPlan(token.email)
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id   = token.sub!
                session.user.plan = (token.plan as PlanTier | undefined) ?? 'free'
            }
            return session
        },
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
