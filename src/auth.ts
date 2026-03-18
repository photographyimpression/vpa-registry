import NextAuth, { type DefaultSession } from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { getUserByEmail, verifyPassword } from "@/lib/users"
import { getSubscriptionPlan, type PlanTier } from "@/lib/stripe"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            plan: PlanTier
        } & DefaultSession["user"]
    }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Google,
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;
                const user = await getUserByEmail(credentials.email as string);
                if (!user) return null;
                const valid = verifyPassword(credentials.password as string, user.hashedPassword);
                if (!valid) return null;
                return { id: user.email, email: user.email, name: user.name };
            },
        }),
    ],
    secret: process.env.AUTH_SECRET,
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60,
    },
    callbacks: {
        async jwt({ token, trigger }) {
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
                return false
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
