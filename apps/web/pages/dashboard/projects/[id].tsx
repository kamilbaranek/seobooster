import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { getToken } from '../../../lib/auth-storage';
import DashboardLayout from '../../../components/dashboard/layout/DashboardLayout';
import ProjectDetailContent from '../../../components/dashboard/ProjectDetailContent';

const ProjectDetailPage = () => {
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);
    const { id } = router.query;

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
                <title>Project Details - Metronic</title>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>
            <DashboardLayout>
                <ProjectDetailContent projectId={id as string} />
            </DashboardLayout>
        </>
    );
};

export default ProjectDetailPage;
