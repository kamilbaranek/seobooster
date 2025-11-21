import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { getToken } from '../../lib/auth-storage';
import DashboardLayout from '../../components/dashboard/layout/DashboardLayout';
import DashboardContent from '../../components/dashboard/DashboardContent';

const DashboardPage = () => {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      router.replace('/login');
      return;
    }
    setAuthorized(true);
  }, [router]);

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
