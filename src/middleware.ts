/**
 * Next.js Middleware — Auth Protection
 *
 * Protects all /dashboard routes via NextAuth v5.
 * Unauthenticated users are redirected to /login.
 */
export { auth as middleware } from "@/auth";

export const config = {
    matcher: ["/dashboard/:path*"],
};
