import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { saveToken } from '../../lib/auth-storage';
import { apiFetch } from '../../lib/api-client';

interface AuthResponse {
    accessToken: string;
    user: {
        id: string;
        email: string;
        webs: Array<{ id: string; url: string; status: string; onboardingStep?: number }>;
    };
}

const AuthCallback = () => {
    const router = useRouter();

    useEffect(() => {
        const { token } = router.query;

        if (!router.isReady) return;

        if (typeof token === 'string') {
            saveToken(token);

            // Fetch user details to decide where to redirect
            apiFetch<AuthResponse['user']>('/auth/me')
                .then((user) => {
                    const webs = user.webs;
                    if (webs.length === 0) {
                        router.push('/onboarding/wizard');
                    } else {
                        const incompleteWeb = webs.find(w => (w.onboardingStep || 0) < 7);
                        if (incompleteWeb) {
                            router.push(`/onboarding/wizard?webId=${incompleteWeb.id}`);
                        } else {
                            router.push('/dashboard');
                        }
                    }
                })
                .catch((err) => {
                    console.error('Failed to fetch user details', err);
                    router.push('/login?error=auth_failed');
                });
        } else {
            // No token found, redirect to login
            router.push('/login?error=no_token');
        }
    }, [router.isReady, router.query]);

    return (
        <div className="d-flex flex-column flex-root h-100">
            <div className="d-flex flex-column flex-center flex-column-fluid">
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <div className="mt-4 fw-semibold fs-6 text-gray-500">
                        Completing sign in...
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthCallback;
