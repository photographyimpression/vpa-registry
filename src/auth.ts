import NextAuth, { type DefaultSession } from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { createHash } from "crypto"
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

/**
 * Validate email/password credentials against the PARTNER_CREDENTIALS env var.
 * Format: "email1:sha256hex1,email2:sha256hex2"
 *
 * To generate a SHA-256 hash for a password (Mac/Linux):
 *   echo -n "MyPassword123" | sha256sum
 *
 * Example env var:
 *   PARTNER_CREDENTIALS="partner@company.com:5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8"
 */
function validateCredentials(email: string, password: string): boolean {
    const raw = process.env.PARTNER_CREDENTIALS ?? ''
    if (!raw.trim()) return false
    const pairs = raw.split(',').map(p => {
        const colonIdx = p.indexOf(':')
        if (colonIdx === -1) return { email: '', hash: '' }
        return {
            email: p.slice(0, colonIdx).trim().toLowerCase(),
            hash:  p.slice(colonIdx + 1).trim(),
        }
    }).filter(p => p.email && p.hash)

    const partner = pairs.find(p => p.email === email.toLowerCase().trim())
    if (!partner) return false

    const hash = createHash('sha256').update(password).digest('hex')
    return hash === partner.hash
}

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Google,
        Credentials({
            name: 'Email',
            credentials: {
                email:    { label: 'Email',    type: 'email'    },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                const email    = (credentials?.email    as string) ?? ''
                const password = (credentials?.password as string) ?? ''
                if (!email || !password) return null
                if (!validateCredentials(email, password)) return null
                return { id: email, email, name: email.split('@')[0] }
            },
        }),
    ],
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
