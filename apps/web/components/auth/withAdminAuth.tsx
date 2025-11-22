import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { apiFetch } from '../../lib/api-client';
import { getToken } from '../../lib/auth-storage';

interface MeResponse {
    user: {
        id: string;
        email: string;
        role?: string;
    };
}

const withAdminAuth = <P extends object>(WrappedComponent: React.ComponentType<P>) => {
    const WithAdminAuth: React.FC<P> = (props) => {
        const router = useRouter();
        const [authorized, setAuthorized] = useState(false);
        const [checking, setChecking] = useState(true);

        useEffect(() => {
            let isMounted = true;

            if (!getToken()) {
                router.replace('/login');
                return;
            }

            const checkRole = async () => {
                try {
                    const me = await apiFetch<MeResponse>('/me');
                    if (!isMounted) return;

                    if (me.user.role !== 'SUPERADMIN') {
                        router.replace('/dashboard');
                        return;
                    }

                    setAuthorized(true);
                } catch (err) {
                    console.error('Admin auth check failed:', err);
                    if (isMounted) {
                        router.replace('/dashboard');
                    }
                } finally {
                    if (isMounted) {
                        setChecking(false);
                    }
                }
            };

            checkRole();

            return () => {
                isMounted = false;
            };
        }, [router]);

        if (checking) {
            return (
                <div className="d-flex justify-content-center align-items-center min-h-screen">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            );
        }

        if (!authorized) {
            return null;
        }

        return <WrappedComponent {...props} />;
    };

    return WithAdminAuth;
};

export default withAdminAuth;
