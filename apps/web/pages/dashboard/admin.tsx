import Head from 'next/head';
import DashboardLayout from '../../components/dashboard/layout/DashboardLayout';
import AdminDashboardContent from '../../components/dashboard/admin/AdminDashboardContent';
import withAdminAuth from '../../components/auth/withAdminAuth';

const AdminPage = () => {
    return (
        <>
            <Head>
                <title>Budliki – Admin Dashboard</title>
            </Head>
            <DashboardLayout>
                <div id="kt_app_content" className="app-content flex-column-fluid">
                    <div id="kt_app_content_container" className="app-container container-fluid">
                        <AdminDashboardContent />
                    </div>
                </div>
            </DashboardLayout>
        </>
    );
};

export default withAdminAuth(AdminPage);
