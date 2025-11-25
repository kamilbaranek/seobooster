import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { getToken } from '../../../lib/auth-storage';
import { apiFetch } from '../../../lib/api-client';
import DashboardLayout from '../../../components/dashboard/layout/DashboardLayout';
import AdminDashboard from '../../../components/dashboard/admin/AdminDashboard';

interface UserProfile {
    id: string;
    email: string;
    role: string;
}

interface MeResponse {
    user: UserProfile;
}

const AdminDashboardPage = () => {
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            const token = getToken();

            if (!token) {
                router.replace('/login');
                return;
            }

            try {
                const data = await apiFetch<MeResponse>('/me');
                if (data.user.role !== 'SUPERADMIN') {
                    router.replace('/dashboard');
                    return;
                }
                setAuthorized(true);
            } catch (error) {
                console.error('Auth check failed', error);
                router.replace('/login');
            }
        };

        checkAuth();
    }, [router]);

    if (!authorized) {
        return null;
    }

    return (
        <>
            <Head>
                <title>Budliki – Admin Analytics</title>
            </Head>
            <DashboardLayout>
                <AdminDashboard />
            </DashboardLayout>
        </>
    );
};

export default AdminDashboardPage;
