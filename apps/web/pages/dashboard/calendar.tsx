import React, { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import DashboardLayout from '../../components/dashboard/layout/DashboardLayout';
import UnifiedCalendar from '../../components/dashboard/calendar/UnifiedCalendar';
import { apiFetch } from '../../lib/api-client';
import { getToken } from '../../lib/auth-storage';

const CalendarPage = () => {
    const router = useRouter();
    const [plans, setPlans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        if (!getToken()) {
            router.replace('/login');
            return;
        }
        setAuthorized(true);
    }, [router]);

    const loadPlans = useCallback(async () => {
        if (!authorized) return;
        setLoading(true);
        setError(null);
        try {
            const data = await apiFetch<any[]>('/articles');
            setPlans(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load calendar data.');
        } finally {
            setLoading(false);
        }
    }, [authorized]);

    useEffect(() => {
        loadPlans();
    }, [loadPlans]);

    if (!authorized) {
        return null;
    }

    return (
        <>
            <Head>
                <title>SEO Booster – Calendar</title>
            </Head>
            <DashboardLayout>
                <div id="kt_app_content" className="app-content flex-column-fluid">
                    <div id="kt_app_content_container" className="app-container container-fluid">
                        {loading && <p>Loading calendar...</p>}
                        {error && <div className="alert alert-danger">{error}</div>}
                        {!loading && !error && (
                            <UnifiedCalendar plans={plans} onUpdate={loadPlans} />
                        )}
                    </div>
                </div>
            </DashboardLayout>
        </>
    );
};

export default CalendarPage;
