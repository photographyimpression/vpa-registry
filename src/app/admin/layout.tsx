import { redirect } from 'next/navigation';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const session = await auth();
    const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();

    if (!session?.user?.email || !adminEmail || session.user.email.toLowerCase() !== adminEmail) {
        redirect('/dashboard');
    }

    return <>{children}</>;
}
