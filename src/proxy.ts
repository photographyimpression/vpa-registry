/**
 * Next.js Proxy — Auth Protection
 *
 * Uses the edge-safe auth config (no Node.js-only packages like Stripe).
 * Protects all /dashboard routes — unauthenticated users are redirected to /login.
 */
import NextAuth from "next-auth"
import { authConfig } from "@/auth.config"

const { auth } = NextAuth(authConfig)

export const proxy = auth

export const config = {
    matcher: ["/dashboard/:path*"],
}
