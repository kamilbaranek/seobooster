import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { getToken } from '../../lib/auth-storage';
import { apiFetch } from '../../lib/api-client';
import DashboardLayout from '../../components/dashboard/layout/DashboardLayout';
import DashboardContent from '../../components/dashboard/DashboardContent';

interface UserProfile {
  user: {
    id: string;
    email: string;
    role: string;
    planName?: string;
  };
  webs: Array<{
    id: string;
    url: string;
    status: string;
    onboardingStep?: number;
  }>;
}

const DashboardPage = () => {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (!getToken()) {
        router.replace('/login');
        return;
      }

      try {
        const profile = await apiFetch<UserProfile>('/me');
        const webs = profile.webs;

        if (webs.length === 0) {
          router.push('/onboarding/wizard');
          return;
        }

        const incompleteWeb = webs.find(w => (w.onboardingStep || 0) < 7);
        if (incompleteWeb) {
          router.push(`/onboarding/wizard?webId=${incompleteWeb.id}`);
          return;
        }

        setAuthorized(true);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        router.replace('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="d-flex flex-center flex-column flex-column-fluid p-10 h-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Budliki – Dashboard</title>
      </Head>
      <DashboardLayout>
        <DashboardContent />
      </DashboardLayout>
    </>
  );
};

export default DashboardPage;
